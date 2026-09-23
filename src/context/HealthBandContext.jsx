import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchSheetData,
  BASELINE_BODY_TEMP,
  evaluateClinicalAlgorithm
} from '../services/sheetsService.js';
import { audioService } from '../services/audioService.js';

// Predefined Simulator Scenarios for Demo Lab (Jury Presentation)
export const SIMULATOR_PRESETS = [
  {
    id: 'infection',
    title: '1. Развитие бактериального воспаления',
    desc: 'Локальное нагноение/инфекция раны. 3 замера подряд температура раны растет выше 37.5°C.',
    tempWound: 38.6,
    tempBody: 37.0,
    humidity: 86,
    pulse: 98,
    trend: 'infection',
    consecutiveSpikes: 3,
    expectedAlarm: true,
    explanation:
      'Сработало двойное условие тревоги: Т раны > 37.5°C и стабильный рост в течение 3 циклов (+1.6°C выше температуры тела).'
  },
  {
    id: 'normal',
    title: '2. Нормальное заживление',
    desc: 'Рана чистая, повязка сухая, температура в пределах физиологической нормы.',
    tempWound: 36.7,
    tempBody: 36.6,
    humidity: 45,
    pulse: 72,
    trend: 'stable',
    consecutiveSpikes: 0,
    expectedAlarm: false,
    explanation:
      'Температура раны не превышает порог 37.5°C, промокания нет. Система фиксирует стабильный статус.'
  },
  {
    id: 'exudate',
    title: '3. Критическое промокание повязки',
    desc: 'Активное выделение раневого экссудата. Повязка пропитана насквозь.',
    tempWound: 36.9,
    tempBody: 36.6,
    humidity: 92,
    pulse: 75,
    trend: 'moist',
    consecutiveSpikes: 0,
    expectedAlarm: true,
    explanation:
      'Влажность 92% превысила критический порог 80%. Сигнал медсестре: «Необходима внеплановая смена повязки».'
  },
  {
    id: 'blanket',
    title: '4. Защита от ложного срабатывания (Одеяло)',
    desc: 'Пациент укрылся теплым одеялом. Кратковременный прогрев без инфекции.',
    tempWound: 37.8,
    tempBody: 37.6,
    humidity: 50,
    pulse: 78,
    trend: 'blanket_spike',
    consecutiveSpikes: 1,
    expectedAlarm: false,
    explanation:
      'Хотя Т раны поднялась до 37.8°C, Т тела также повысилась (ΔT всего 0.2°C). Нет трех циклов роста — алгоритм HealthBand фильтрует ложное срабатывание!'
  }
];

// Secondary hospital patients for WardView bed grid
const SECONDARY_PATIENTS = [
  {
    id: 'hb-02',
    name: 'Сидорова Елена Васильевна',
    age: 71,
    ward: 'Палата 102',
    bed: 'Койка 2',
    diagnosis: 'Диабетическая трофическая язва стопы',
    sensorId: 'HB-BAND-088B',
    tempWound: 36.8,
    tempBody: 36.6,
    tempDiff: 0.2,
    humidity: 45,
    heartRate: 74,
    status: 'normal',
    statusText: 'Стабильная грануляция ткани',
    lastUpdate: '4 мин назад',
    battery: 94,
    bandageStatus: 'Сухая / В норме',
    alertDetails: null
  },
  {
    id: 'hb-03',
    name: 'Касымов Даурен Маратович',
    age: 49,
    ward: 'Палата 104',
    bed: 'Койка 1',
    diagnosis: 'Термический ожог предплечья II-III степени',
    sensorId: 'HB-BAND-103C',
    tempWound: 37.4,
    tempBody: 36.8,
    tempDiff: 0.6,
    humidity: 74,
    heartRate: 82,
    status: 'warning',
    statusText: 'Повышенная экссудация / Контроль через 30 мин',
    lastUpdate: '1 мин назад',
    battery: 76,
    bandageStatus: 'Умеренное промокание',
    alertDetails: 'Влажность приближается к порогу 75%. Требуется визуальный контроль повязки.'
  },
  {
    id: 'hb-04',
    name: 'Иванова Мария Григорьевна',
    age: 83,
    ward: 'Палата 105',
    bed: 'Койка 3',
    diagnosis: 'Пролежень крестцовой области (хосписный уход)',
    sensorId: 'HB-BAND-019E',
    tempWound: 36.7,
    tempBody: 36.5,
    tempDiff: 0.2,
    humidity: 40,
    heartRate: 68,
    status: 'normal',
    statusText: 'Показатели в целевом диапазоне',
    lastUpdate: '5 мин назад',
    battery: 98,
    bandageStatus: 'Сухая / В норме',
    alertDetails: null
  }
];

const HealthBandContext = createContext(null);

export function HealthBandProvider({ children }) {
  // Operational Mode: 'live' (Google Sheets Stream) or 'simulator' (Jury Demo Lab)
  const [mode, setMode] = useState('live');

  // Active Selected Patient across all tabs
  const [selectedPatientId, setSelectedPatientId] = useState('hb-01');

  // Sound Alarm Settings
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Live Data State
  const [liveState, setLiveState] = useState({
    isConnected: true,
    isLoading: true,
    totalRows: 0,
    lastSyncTime: 'Загрузка...',
    latestRow: null,
    historySeries: [],
    clinicalEval: null,
    error: null,
    isFallback: false
  });

  // Simulator State
  const [simulatorState, setSimulatorState] = useState({
    presetId: 'infection',
    tempWound: 38.6,
    tempBody: 37.0,
    humidity: 86,
    pulse: 98,
    consecutiveSpikes: 3,
    explanation: SIMULATOR_PRESETS[0].explanation
  });

  const prevAlertCountRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // Sync with audioService mute state
  useEffect(() => {
    audioService.setMuted(!isSoundEnabled);
  }, [isSoundEnabled]);

  // Fetch Live Google Sheets data
  const syncNow = useCallback(async () => {
    setLiveState((prev) => ({ ...prev, isLoading: true }));
    try {
      const result = await fetchSheetData();
      setLiveState({
        isConnected: !result.isFallback,
        isLoading: false,
        totalRows: result.totalRows,
        lastSyncTime: result.lastSyncTimestamp,
        latestRow: result.latest,
        historySeries: result.historySeries,
        clinicalEval: result.clinicalEval,
        error: result.error,
        isFallback: result.isFallback
      });
    } catch (err) {
      setLiveState((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        error: err.message
      }));
    }
  }, []);

  // Initial load and periodic 30s auto-refresh
  useEffect(() => {
    syncNow();
    const interval = setInterval(() => {
      syncNow();
    }, 30000);
    return () => clearInterval(interval);
  }, [syncNow]);

  // Simulator controls
  const applyPreset = useCallback((presetId) => {
    const preset = SIMULATOR_PRESETS.find((p) => p.id === presetId) || SIMULATOR_PRESETS[0];
    setSimulatorState({
      presetId: preset.id,
      tempWound: preset.tempWound,
      tempBody: preset.tempBody,
      humidity: preset.humidity,
      pulse: preset.pulse,
      consecutiveSpikes: preset.consecutiveSpikes,
      explanation: preset.explanation
    });
  }, []);

  const updateSimulator = useCallback((updates) => {
    setSimulatorState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Compute Simulator Clinical Decision
  const simulatorEval = useCallback(() => {
    const { tempWound, tempBody, humidity, consecutiveSpikes } = simulatorState;
    const deltaT = Number((tempWound - tempBody).toFixed(1));
    const isHighTemp = tempWound >= 37.5;
    const isHighDelta = deltaT >= 1.0;
    const isTrendConfirmed = consecutiveSpikes >= 3;

    const isInfection = isHighTemp && isHighDelta && isTrendConfirmed;
    const isMoisture = humidity >= 80;
    const isWarning =
      !isInfection &&
      !isMoisture &&
      (tempWound >= 37.2 || humidity >= 65 || consecutiveSpikes >= 2);

    let status = 'normal';
    let statusText = 'Стабильное заживление / Без признаков воспаления';
    let alertDetails = null;

    if (isInfection) {
      status = 'alert';
      statusText = 'Подозрение на инфекцию / Локальный гипертермический очаг';
      alertDetails = `Критический тренд: Т раны (${tempWound}°C) растет ${consecutiveSpikes} цикла подряд (+${deltaT}°C относительно тела). Высокий риск бактериального воспаления.`;
    } else if (isMoisture) {
      status = 'alert';
      statusText = 'Критическое промокание повязки экссудатом';
      alertDetails = `Влажность ${humidity}% превысила критический порог 80%. Риск мацерации кожи — требуется асептическая замена.`;
    } else if (isWarning) {
      status = 'warning';
      statusText = 'Повышенное внимание / Динамический контроль';
      alertDetails = `Повышение температуры раны или экссудации (Т: ${tempWound}°C, Вл: ${humidity}%). Контроль через 15-30 минут.`;
    }

    return {
      status,
      statusText,
      alertDetails,
      deltaT,
      isHighTemp,
      isHighDelta,
      isTrendConfirmed,
      isInfection,
      isMoisture,
      isWarning
    };
  }, [simulatorState]);

  // Synthesize history series for Simulator mode
  const getSimulatorHistorySeries = useCallback(() => {
    const { tempWound, tempBody, humidity, pulse, consecutiveSpikes } = simulatorState;
    const evalResult = simulatorEval();

    // Generate 6 progressive points leading to current values
    const points = [
      {
        time: '21:00',
        tempWound: Number((tempWound - 1.5).toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Math.max(30, humidity - 30),
        pulse: Math.max(60, pulse - 20),
        note: 'Плановая перевязка'
      },
      {
        time: '21:15',
        tempWound: Number((tempWound - 1.3).toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Math.max(35, humidity - 25),
        pulse: Math.max(62, pulse - 18),
        note: 'Норма'
      },
      {
        time: '21:30',
        tempWound: Number((tempWound - 1.0).toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Math.max(40, humidity - 20),
        pulse: Math.max(65, pulse - 14),
        note: 'Базовый мониторинг'
      },
      {
        time: '21:45',
        tempWound: consecutiveSpikes >= 2 ? Number((tempWound - 0.7).toFixed(1)) : Number((tempWound - 0.2).toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Math.max(45, humidity - 12),
        pulse: Math.max(68, pulse - 10),
        note: consecutiveSpikes >= 2 ? 'Тренд 1 (+0.4°C)' : 'Норма'
      },
      {
        time: '22:00',
        tempWound: consecutiveSpikes >= 1 ? Number((tempWound - 0.3).toFixed(1)) : Number((tempWound - 0.1).toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Math.max(50, humidity - 6),
        pulse: Math.max(70, pulse - 4),
        note: consecutiveSpikes >= 2 ? 'Тренд 2 (+0.8°C)' : 'Норма'
      },
      {
        time: '22:15',
        tempWound: Number(tempWound.toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        humidity: Number(humidity),
        pulse: Number(pulse),
        note: evalResult.status === 'alert' ? 'Тренд 3 (КРИТИЧЕСКАЯ ТРЕВОГА)' : evalResult.status === 'warning' ? 'ВНИМАНИЕ' : 'В норме'
      }
    ];

    return points.map((p) => ({
      ...p,
      delta: Number((p.tempWound - p.tempBody).toFixed(1)),
      pressure: 2
    }));
  }, [simulatorState, simulatorEval]);

  // Construct Active HB-01 Patient object depending on Mode
  const hb01Patient = useCallback(() => {
    if (mode === 'live') {
      const latest = liveState.latestRow || {
        tempWound: 37.1,
        pulse: 75,
        humidity: 50,
        pressure: 2,
        timestamp: 'Недавно'
      };
      const clinical = liveState.clinicalEval || {
        status: 'normal',
        statusText: 'Стабильное заживление',
        alertDetails: null,
        deltaT: 0.5
      };

      return {
        id: 'hb-01',
        name: 'Ахметов Нурлан Серикович',
        age: 62,
        ward: 'Палата 101',
        bed: 'Койка 1',
        diagnosis: 'Послеоперационная рана брюшной полости (3-е сутки)',
        sensorId: 'HB-BAND-041A',
        modeSource: 'Google Sheets (Live)',
        tempWound: latest.tempWound,
        tempBody: BASELINE_BODY_TEMP,
        tempDiff: Number((latest.tempWound - BASELINE_BODY_TEMP).toFixed(1)),
        humidity: latest.humidity,
        heartRate: latest.pulse,
        pressure: latest.pressure,
        status: clinical.status,
        statusText: clinical.statusText,
        lastUpdate: liveState.lastSyncTime,
        battery: 89,
        bandageStatus:
          latest.humidity >= 80
            ? 'Критическое промокание (замена)'
            : latest.humidity >= 65
            ? 'Умеренное промокание'
            : 'Сухая / В норме',
        alertDetails: clinical.alertDetails,
        mac: '4C:11:AE:0D:98:21',
        sleepInterval: '5 мин (Wake 12 сек)'
      };
    } else {
      // Simulator mode
      const { tempWound, tempBody, humidity, pulse } = simulatorState;
      const clinical = simulatorEval();

      return {
        id: 'hb-01',
        name: 'Ахметов Нурлан Серикович',
        age: 62,
        ward: 'Палата 101',
        bed: 'Койка 1',
        diagnosis: 'Послеоперационная рана брюшной полости (3-е сутки)',
        sensorId: 'HB-BAND-041A',
        modeSource: 'Demo Lab (Симулятор)',
        tempWound: Number(tempWound.toFixed(1)),
        tempBody: Number(tempBody.toFixed(1)),
        tempDiff: clinical.deltaT,
        humidity: Number(humidity),
        heartRate: Number(pulse),
        pressure: 2,
        status: clinical.status,
        statusText: clinical.statusText,
        lastUpdate: 'Синхронизировано с Demo Lab',
        battery: 92,
        bandageStatus:
          humidity >= 80
            ? 'Критическое промокание (замена)'
            : humidity >= 65
            ? 'Умеренное промокание'
            : 'Сухая / В норме',
        alertDetails: clinical.alertDetails,
        mac: '4C:11:AE:0D:98:21',
        sleepInterval: '5 мин (Wake 12 сек)'
      };
    }
  }, [mode, liveState, simulatorState, simulatorEval]);

  // Full patients array combining active HB-01 with secondary patients
  const currentHb01 = hb01Patient();
  const patients = [currentHb01, ...SECONDARY_PATIENTS];

  // Aggregated alerts counts
  const alertCount = patients.filter((p) => p.status === 'alert').length;
  const warningCount = patients.filter((p) => p.status === 'warning').length;
  const normalCount = patients.filter((p) => p.status === 'normal').length;

  // Active Patient for Telemetry / Report
  const activePatient = patients.find((p) => p.id === selectedPatientId) || currentHb01;

  // Active History Series for Telemetry / Report charts
  const historySeries =
    selectedPatientId === 'hb-01'
      ? mode === 'live'
        ? liveState.historySeries.length > 0
          ? liveState.historySeries
          : getSimulatorHistorySeries()
        : getSimulatorHistorySeries()
      : [
          { time: '21:00', tempWound: 36.7, tempBody: 36.6, delta: 0.1, humidity: 44, pulse: 72, note: 'Норма' },
          { time: '21:15', tempWound: 36.8, tempBody: 36.6, delta: 0.2, humidity: 45, pulse: 73, note: 'Норма' },
          { time: '21:30', tempWound: 36.7, tempBody: 36.5, delta: 0.2, humidity: 44, pulse: 74, note: 'Норма' },
          { time: '21:45', tempWound: 36.9, tempBody: 36.6, delta: 0.3, humidity: 46, pulse: 75, note: 'Норма' },
          { time: '22:00', tempWound: 36.8, tempBody: 36.6, delta: 0.2, humidity: 45, pulse: 74, note: 'Норма' },
          { time: '22:15', tempWound: 36.8, tempBody: 36.6, delta: 0.2, humidity: 45, pulse: 74, note: 'Норма' },
        ];

  // Sound triggering logic: when alertCount increases, play audio chime
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      prevAlertCountRef.current = alertCount;
      return;
    }

    if (alertCount > prevAlertCountRef.current && isSoundEnabled) {
      audioService.playAlarm();
    }
    prevAlertCountRef.current = alertCount;
  }, [alertCount, isSoundEnabled]);

  // Audio test trigger
  const playAlarmSound = useCallback(() => {
    audioService.unlock();
    audioService.playAlarm();
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        audioService.unlock();
        audioService.playConfirmBlip();
      }
      return next;
    });
  }, []);

  const value = {
    // Mode
    mode,
    setMode,

    // Patient Selection
    selectedPatientId,
    setSelectedPatientId,
    activePatient,
    patients,

    // Statistics
    alertCount,
    warningCount,
    normalCount,

    // Live Google Sheets Data
    liveState,
    syncNow,

    // Simulator State & Actions
    simulatorState,
    applyPreset,
    updateSimulator,
    simulatorEval: simulatorEval(),

    // History Series for Charts
    historySeries,

    // Audio System
    isSoundEnabled,
    setIsSoundEnabled,
    toggleSound,
    playAlarmSound
  };

  return <HealthBandContext.Provider value={value}>{children}</HealthBandContext.Provider>;
}

export function useHealthBand() {
  const context = useContext(HealthBandContext);
  if (!context) {
    throw new Error('useHealthBand must be used within a HealthBandProvider');
  }
  return context;
}

export default HealthBandContext;
