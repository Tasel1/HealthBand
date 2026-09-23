/**
 * Google Sheets Live Connector Service for HealthBand IoT
 * Sheet URL: https://docs.google.com/spreadsheets/d/1gJFRBfnuguZckFmnd3Q6ieCeM7JHZh3lDQXVPe24wQo/export?format=csv&gid=2066397202
 * Columns: Timestamp, Temperature, Pulse, Humidity, Pressure
 */

export const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1gJFRBfnuguZckFmnd3Q6ieCeM7JHZh3lDQXVPe24wQo/export?format=csv&gid=2066397202';

// Baseline physiological body temperature for calculating Delta-T
export const BASELINE_BODY_TEMP = 36.6;

// Fallback dataset in case of network unavailability / offline demonstration
const FALLBACK_ROWS = [
  { timestamp: '23.09 21:00', tempWound: 37.1, tempBody: 36.8, pulse: 74, humidity: 48, pressure: 2 },
  { timestamp: '23.09 21:15', tempWound: 37.2, tempBody: 36.8, pulse: 76, humidity: 52, pressure: 2 },
  { timestamp: '23.09 21:30', tempWound: 37.4, tempBody: 36.8, pulse: 80, humidity: 62, pressure: 2 },
  { timestamp: '23.09 21:45', tempWound: 37.8, tempBody: 36.9, pulse: 86, humidity: 74, pressure: 3 },
  { timestamp: '23.09 22:00', tempWound: 38.2, tempBody: 36.9, pulse: 92, humidity: 82, pressure: 3 },
  { timestamp: '23.09 22:15', tempWound: 38.6, tempBody: 37.0, pulse: 98, humidity: 88, pressure: 3 },
];

/**
 * Normalizes raw sensor readings (Arduino analogRead 500-1024 or direct 0-100%)
 * Calibrated against test data: 1024 (dry) = ~20%, 500 (saturated) = ~85%
 */
export function normalizeHumidity(raw) {
  if (raw === null || raw === undefined || isNaN(raw)) return 50;
  if (raw <= 100) return Math.min(100, Math.max(0, Math.round(raw)));
  // Raw 10-bit ADC conversion
  const percent = 20 + ((1024 - raw) / (1024 - 500)) * 65;
  return Math.min(100, Math.max(10, Math.round(percent)));
}

/**
 * Extracts short HH:mm time string from timestamp
 */
export function formatTimeShort(timestampStr) {
  if (!timestampStr) return '--:--';
  const parts = timestampStr.split(' ');
  if (parts.length > 1) {
    const timeParts = parts[1].split(':');
    return `${timeParts[0]}:${timeParts[1] || '00'}`;
  }
  return timestampStr.slice(-5);
}

/**
 * Evaluates the 3-point trend algorithm & clinical criteria:
 * Rule 1: T > 37.5°C AND 3 consecutive measurements increasing (+1°C higher than baseline) = INFECTION ALERT
 * Rule 2: Humidity >= 80% = CRITICAL MOISTURE ALERT
 * Rule 3: T >= 37.2°C or Humidity >= 65% = WARNING
 */
export function evaluateClinicalAlgorithm(points, baselineBody = BASELINE_BODY_TEMP) {
  if (!points || points.length === 0) {
    return {
      status: 'normal',
      statusText: 'Ожидание телеметрии',
      alertDetails: null,
      consecutiveSpikes: 0,
      deltaT: 0,
      isInfection: false,
      isMoisture: false,
      isWarning: false
    };
  }

  const latest = points[points.length - 1];
  const latestTemp = latest.tempWound;
  const deltaT = Number((latestTemp - baselineBody).toFixed(1));

  // Count consecutive increasing spikes backwards from the latest point
  let consecutiveSpikes = 0;
  for (let i = points.length - 1; i > 0; i--) {
    if (points[i].tempWound > points[i - 1].tempWound) {
      consecutiveSpikes++;
    } else {
      break;
    }
  }

  const isHighTemp = latestTemp >= 37.5;
  const isHighDelta = deltaT >= 1.0;
  const isTrendConfirmed = consecutiveSpikes >= 3;

  const isInfection = isHighTemp && (isTrendConfirmed || isHighDelta);
  const isMoisture = latest.humidity >= 80;
  const isWarning =
    !isInfection &&
    !isMoisture &&
    (latestTemp >= 37.2 || latest.humidity >= 65 || consecutiveSpikes >= 2);

  let status = 'normal';
  let statusText = 'Стабильное заживление / В целевом диапазоне';
  let alertDetails = null;

  if (isInfection) {
    status = 'alert';
    statusText = 'Подозрение на инфекцию / Локальный гипертермический очаг';
    alertDetails = `Критический тренд: Т раны (${latestTemp}°C) растет ${consecutiveSpikes} цикла подряд (+${deltaT}°C относительно тела). Высокий риск бактериального воспаления.`;
  } else if (isMoisture) {
    status = 'alert';
    statusText = 'Критическое промокание повязки экссудатом';
    alertDetails = `Влажность ${latest.humidity}% превысила порог 80%. Риск мацерации тканей — требуется асептическая замена.`;
  } else if (isWarning) {
    status = 'warning';
    statusText = 'Повышенное внимание / Динамический контроль';
    alertDetails = `Зафиксировано повышение показателей (Т: ${latestTemp}°C, Вл: ${latest.humidity}%). Контроль через 15-30 минут.`;
  }

  return {
    status,
    statusText,
    alertDetails,
    consecutiveSpikes,
    deltaT,
    isInfection,
    isMoisture,
    isWarning,
    isHighTemp,
    isHighDelta,
    isTrendConfirmed
  };
}

/**
 * Formats points into history series with diagnostic annotations for charts & tables
 */
export function formatHistorySeries(points, baselineBody = BASELINE_BODY_TEMP) {
  return points.map((p, idx) => {
    const prev = idx > 0 ? points[idx - 1] : null;
    const isRising = prev && p.tempWound > prev.tempWound;
    const delta = Number((p.tempWound - baselineBody).toFixed(1));

    let note = 'Норма';
    if (p.tempWound >= 38.5) {
      note = 'Тренд 3 (КРИТИЧЕСКАЯ ТРЕВОГА)';
    } else if (p.tempWound >= 38.0) {
      note = 'Тренд 2 (+0.8°C к норме)';
    } else if (p.tempWound >= 37.5 && isRising) {
      note = 'Тренд 1 (Начало роста Т)';
    } else if (p.humidity >= 80) {
      note = 'Критическое промокание';
    } else if (isRising) {
      note = 'Незначительное колебание';
    }

    return {
      time: formatTimeShort(p.timestamp),
      fullTimestamp: p.timestamp,
      tempWound: p.tempWound,
      tempBody: baselineBody,
      delta: delta > 0 ? `+${delta}` : `${delta}`,
      humidity: p.humidity,
      pulse: p.pulse,
      pressure: p.pressure,
      note
    };
  });
}

/**
 * Parses raw CSV content into typed point objects
 */
export function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const rows = [];
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 5) continue;

    const timestamp = cols[0];
    const tempWound = parseFloat(cols[1]);
    const pulse = Math.round(parseFloat(cols[2])) || 75;
    const rawHum = parseFloat(cols[3]);
    const pressure = parseFloat(cols[4]) || 1;

    if (!isNaN(tempWound)) {
      rows.push({
        id: `pt-${i}`,
        index: i,
        timestamp,
        tempWound,
        pulse,
        humidityRaw: rawHum,
        humidity: normalizeHumidity(rawHum),
        pressure
      });
    }
  }

  return rows;
}

/**
 * Main function: fetches live CSV from Google Sheets and calculates telemetry state
 */
export async function fetchSheetData() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL, {
      method: 'GET',
      headers: {
        Accept: 'text/csv,text/plain,*/*'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      throw new Error('CSV file contains no valid data rows');
    }

    const latest = rows[rows.length - 1];
    // Select last 6 to 10 points for the clinical trend series
    const recentPoints = rows.slice(-6);
    const clinicalEval = evaluateClinicalAlgorithm(rows, BASELINE_BODY_TEMP);
    const historySeries = formatHistorySeries(recentPoints, BASELINE_BODY_TEMP);

    return {
      success: true,
      isFallback: false,
      totalRows: rows.length,
      latest,
      recentPoints,
      historySeries,
      clinicalEval,
      lastSyncTimestamp: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      error: null
    };
  } catch (error) {
    console.warn('Google Sheets live fetch error, using clinical fallback:', error.message);

    const fallbackPoints = FALLBACK_ROWS.map((r, i) => ({
      id: `fallback-${i}`,
      index: i + 1,
      ...r,
      humidityRaw: r.humidity
    }));

    const latest = fallbackPoints[fallbackPoints.length - 1];
    const clinicalEval = evaluateClinicalAlgorithm(fallbackPoints, BASELINE_BODY_TEMP);
    const historySeries = formatHistorySeries(fallbackPoints, BASELINE_BODY_TEMP);

    return {
      success: false,
      isFallback: true,
      totalRows: fallbackPoints.length,
      latest,
      recentPoints: fallbackPoints,
      historySeries,
      clinicalEval,
      lastSyncTimestamp: 'Офлайн (резерв)',
      error: error.message
    };
  }
}
