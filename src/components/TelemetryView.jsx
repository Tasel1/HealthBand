import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Heart,
  TrendingUp,
  Cpu,
  Clock,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FlaskConical,
  Activity,
  Layers,
  ShieldCheck,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function TelemetryView() {
  const {
    displayPatient,
    activePatient,
    selectedPatientId,
    setSelectedPatientId,
    patients,
    historySeries,
    mode,
    liveState,
    syncNow,
    playbackIndex,
    setPlaybackIndex
  } = useHealthBand();

  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isAlert = displayPatient.status === 'alert';
  const isWarning = displayPatient.status === 'warning';

  // SVG Chart Dimensions
  const chartWidth = 740;
  const chartHeight = 230;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const graphW = chartWidth - padding.left - padding.right;
  const graphH = chartHeight - padding.top - padding.bottom;

  const minTemp = 35.0;
  const maxTemp = 40.0;
  const getTempY = (t) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, t));
    return padding.top + graphH - ((clamped - minTemp) / (maxTemp - minTemp)) * graphH;
  };

  const count = historySeries.length;
  const getX = (idx) => {
    if (count <= 1) return padding.left + graphW / 2;
    return padding.left + (idx / (count - 1)) * graphW;
  };

  const woundPoints = historySeries.map((d, i) => `${getX(i)},${getTempY(d.tempWound)}`);
  const woundPath = woundPoints.length > 0 ? `M ${woundPoints.join(' L ')}` : '';

  const woundAreaPath =
    woundPoints.length > 0
      ? `M ${getX(0)},${chartHeight - padding.bottom} L ${woundPoints.join(
          ' L '
        )} L ${getX(count - 1)},${chartHeight - padding.bottom} Z`
      : '';

  const bodyPoints = historySeries.map((d, i) => `${getX(i)},${getTempY(d.tempBody)}`);
  const bodyPath = bodyPoints.length > 0 ? `M ${bodyPoints.join(' L ')}` : '';

  const yThresholdAlarm = getTempY(37.5);
  const yBaselineBody = getTempY(36.6);

  // Scrubber mouse events
  const handleChartMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const svgX = (mouseX / svgRect.width) * chartWidth;

    if (svgX < padding.left || svgX > chartWidth - padding.right || count === 0) {
      return;
    }

    const ratio = (svgX - padding.left) / graphW;
    const closestIdx = Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))));
    setHoveredPoint({
      ...historySeries[closestIdx],
      idx: closestIdx,
      x: getX(closestIdx),
      yWound: getTempY(historySeries[closestIdx].tempWound)
    });
  };

  const handleChartMouseLeave = () => {
    setHoveredPoint(null);
  };

  const activeIndex =
    playbackIndex !== null
      ? Math.max(0, Math.min(count - 1, playbackIndex))
      : count - 1;

  const currentPoint = historySeries[activeIndex] || {
    time: '22:15',
    tempWound: displayPatient.tempWound,
    tempBody: displayPatient.tempBody,
    delta: displayPatient.tempDiff,
    humidity: displayPatient.humidity,
    pulse: displayPatient.heartRate
  };

  const readout = hoveredPoint || {
    ...currentPoint,
    x: getX(activeIndex),
    yWound: getTempY(currentPoint.tempWound)
  };

  const p1 = historySeries[Math.max(0, count - 3)] || { time: '21:45', tempWound: 37.4, tempBody: 36.8, delta: 0.6 };
  const p2 = historySeries[Math.max(0, count - 2)] || { time: '22:00', tempWound: 38.0, tempBody: 36.9, delta: 1.1 };
  const p3 = historySeries[Math.max(0, count - 1)] || { time: '22:15', tempWound: displayPatient.tempWound, tempBody: displayPatient.tempBody, delta: displayPatient.tempDiff };

  return (
    <div className="space-y-4">
      {/* Patient Header & Hardware Metadata Strip */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1D1D1F]">
                {displayPatient.name}
              </span>
              <span className="text-xs text-[#86868B]">({displayPatient.age} лет)</span>
              <span className="text-[#D1D1D6]">•</span>
              <span className="text-xs text-[#6E6E73] font-medium">
                {displayPatient.ward}, {displayPatient.bed}
              </span>
              <span className="text-[#D1D1D6]">•</span>
              <span className="text-xs font-mono font-semibold text-[#007AFF] bg-[#E5F1FF] px-2 py-0.5 rounded border border-[#007AFF]/20">
                {displayPatient.sensorId}
              </span>
              <span className="text-[#D1D1D6]">•</span>
              <span className="text-[11px] font-mono text-[#86868B]">
                MAC: {displayPatient.mac || '4C:11:AE:0D:98:21'}
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 max-w-2xl">
              {displayPatient.diagnosis}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              aria-label="Выбрать пациента"
              className="bg-white border border-[#E5E5EA] text-[#1D1D1F] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ward}, {p.bed})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-[#6E6E73] bg-[#F2F2F7] px-2.5 py-1.5 rounded-lg border border-[#E5E5EA] flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
              <span>{displayPatient.lastUpdate}</span>
            </div>

            {mode === 'live' && displayPatient.id === 'hb-01' && (
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#007AFF] text-xs border border-[#E5E5EA] transition-colors disabled:opacity-50 shadow-2xs font-medium"
                title="Обновить поток данных Google Sheets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>Синхронизировать</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabular Sensor Specs */}
        <div className="mt-3 pt-3 border-t border-[#E5E5EA] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#6E6E73]">
          <div>
            <span className="text-[#86868B] text-[10px] block">Микроконтроллер & Радио</span>
            <span className="text-[#1D1D1F] font-mono text-[11px] font-medium">ESP32-S3 / BLE 5.0</span>
          </div>
          <div>
            <span className="text-[#86868B] text-[10px] block">Энергетический профиль</span>
            <span className="text-[#1D1D1F] text-[11px]">Deep Sleep (5 мин / 12 с Wake)</span>
          </div>
          <div>
            <span className="text-[#86868B] text-[10px] block">Заряд аккумулятора</span>
            <span className="text-[#34C759] font-mono text-[11px] font-semibold tabular-nums">
              {displayPatient.battery}% (Li-Po 3.7V)
            </span>
          </div>
          <div>
            <span className="text-[#86868B] text-[10px] block">Канал передачи данных</span>
            <span className="text-[#1D1D1F] text-[11px] flex items-center gap-1 font-medium">
              {mode === 'live' && displayPatient.id === 'hb-01' ? (
                <>
                  <Radio className="w-3 h-3 text-[#34C759]" strokeWidth={2} /> Google Sheets (Live)
                </>
              ) : (
                <>
                  <FlaskConical className="w-3 h-3 text-[#FF9500]" strokeWidth={2} /> Demo Lab Стенд
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostic Alert Box if Active */}
      {displayPatient.alertDetails && (
        <div className="bg-[#FFEBEA] border border-[#FF3B30]/30 rounded-2xl p-3.5 text-xs text-[#D70015] flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <div className="font-bold text-[#D70015] flex items-center gap-2">
              <span>КЛИНИЧЕСКИЙ СИГНАЛ: ОБНАРУЖЕН РАННИЙ МАРКЕР ВОСПАЛЕНИЯ</span>
              <span className="font-mono text-[11px] text-[#FF3B30]">
                (ΔT = {displayPatient.tempDiff > 0 ? `+${displayPatient.tempDiff}` : displayPatient.tempDiff}°C)
              </span>
            </div>
            <p className="mt-0.5 text-[#D70015]/90 leading-relaxed">
              {displayPatient.alertDetails}
            </p>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xs text-[#6E6E73] flex items-center justify-between">
            <span>Т раны (ложе)</span>
            <Thermometer className="w-3.5 h-3.5 text-[#FF3B30]" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F] mt-1 tabular-nums">
            {displayPatient.tempWound}°C
          </div>
          <div className="text-[11px] font-mono mt-0.5 text-[#86868B]">
            Порог: 37.5°C ({displayPatient.tempWound >= 37.5 ? 'Превышен' : 'В норме'})
          </div>
        </div>

        <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xs text-[#6E6E73] flex items-center justify-between">
            <span>Т тела & Градиент ΔT</span>
            <Thermometer className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F] mt-1 tabular-nums">
            {displayPatient.tempBody}°C
          </div>
          <div className={`text-[11px] font-mono mt-0.5 tabular-nums ${
            displayPatient.tempDiff >= 1.0 ? 'text-[#FF3B30] font-bold' : 'text-[#007AFF]'
          }`}>
            ΔT = {displayPatient.tempDiff > 0 ? `+${displayPatient.tempDiff}` : displayPatient.tempDiff}°C
          </div>
        </div>

        <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xs text-[#6E6E73] flex items-center justify-between">
            <span>Влажность повязки</span>
            <Droplets className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F] mt-1 tabular-nums">
            {displayPatient.humidity}%
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-0.5 truncate">
            {displayPatient.bandageStatus}
          </div>
        </div>

        <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 shadow-xs">
          <div className="text-xs text-[#6E6E73] flex items-center justify-between">
            <span>Пульс пациента</span>
            <Heart className="w-3.5 h-3.5 text-[#FF2D55]" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F] mt-1 tabular-nums">
            {displayPatient.heartRate} <span className="text-xs font-normal text-[#86868B]">уд/м</span>
          </div>
          <div className="text-[11px] text-[#6E6E73] mt-0.5">
            MAX30102 PPG
          </div>
        </div>
      </div>

      {/* High-Fidelity Apple Health Style Telemetry Graph with Scrubber */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E5EA]">
          <div>
            <h2 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
              <span>Синхронизированный термометрический тренд</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Интерактивный скраббер: наведите курсор для отображения измерений
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#F2F2F7] px-3 py-1.5 rounded-lg border border-[#E5E5EA] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={1.5} />
            <span className="text-[#1D1D1F] font-bold">{readout.time}</span>
            <span className="text-[#D1D1D6]">|</span>
            <span className="text-[#FF3B30] font-bold">{readout.tempWound}°C</span>
            <span className="text-[#D1D1D6]">|</span>
            <span className="text-[#007AFF]">
              ΔT +{readout.delta || (readout.tempWound - readout.tempBody).toFixed(1)}°C
            </span>
            <span className="text-[#D1D1D6]">|</span>
            <span className="text-[#34C759]">{readout.humidity}% вл.</span>
          </div>
        </div>

        {/* SVG Curve Container */}
        <div className="w-full overflow-x-auto py-1">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[620px] text-xs select-none cursor-crosshair"
            onMouseMove={handleChartMouseMove}
            onMouseLeave={handleChartMouseLeave}
          >
            <defs>
              <linearGradient id="telemetryWoundGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF3B30" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[35.0, 36.0, 37.0, 38.0, 39.0, 40.0].map((t) => {
              const y = getTempY(t);
              return (
                <g key={t}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#F2F2F7"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#86868B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {t.toFixed(1)}°
                  </text>
                </g>
              );
            })}

            {/* Baseline body temp threshold line (36.6°C) */}
            <line
              x1={padding.left}
              y1={yBaselineBody}
              x2={chartWidth - padding.right}
              y2={yBaselineBody}
              stroke="#007AFF"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <text
              x={chartWidth - padding.right}
              y={yBaselineBody - 5}
              textAnchor="end"
              fill="#007AFF"
              fontSize="9"
              fontFamily="sans-serif"
            >
              Норма тела 36.6°C
            </text>

            {/* Hyperthermia threshold alarm line (37.5°C) */}
            <line
              x1={padding.left}
              y1={yThresholdAlarm}
              x2={chartWidth - padding.right}
              y2={yThresholdAlarm}
              stroke="#FF3B30"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <text
              x={chartWidth - padding.right}
              y={yThresholdAlarm - 5}
              textAnchor="end"
              fill="#FF3B30"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Критический порог 37.5°C
            </text>

            {/* Glow Area */}
            <path d={woundAreaPath} fill="url(#telemetryWoundGradLight)" />

            {/* Body Temp Curve */}
            <path
              d={bodyPath}
              fill="none"
              stroke="#007AFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Wound Temp Curve */}
            <path
              d={woundPath}
              fill="none"
              stroke="#FF3B30"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Nodes and values for Wound Temp */}
            {historySeries.map((d, i) => {
              const x = getX(i);
              const yWound = getTempY(d.tempWound);
              const isHigh = d.tempWound >= 37.5;
              const isHovered = hoveredPoint && hoveredPoint.idx === i;
              const isScrubbed = activeIndex === i;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={yWound}
                    r={isHovered || isScrubbed ? 6 : isHigh ? 4 : 3}
                    fill={isHigh ? '#FF3B30' : '#007AFF'}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered || isScrubbed ? 2.5 : 1.5}
                  />

                  {/* Timestamp label */}
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 16}
                    textAnchor="middle"
                    fill={isScrubbed ? '#007AFF' : '#86868B'}
                    fontWeight={isScrubbed ? 'bold' : 'normal'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.time}
                  </text>
                </g>
              );
            })}

            {/* Hairline scrubber */}
            {(hoveredPoint || readout) && (
              <g className="chart-scrubber-line">
                <line
                  x1={readout.x}
                  y1={padding.top}
                  x2={readout.x}
                  y2={chartHeight - padding.bottom}
                  stroke="#007AFF"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={readout.x}
                  cy={readout.yWound}
                  r="8"
                  fill="none"
                  stroke="#FF3B30"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Moisture Strip Below Graph with 80% Threshold Marker */}
        <div className="mt-2 pt-2.5 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
            <span>Насыщение повязки экссудатом:</span>
            <span className="font-bold text-[#1D1D1F] tabular-nums">{displayPatient.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-[#FF9500] font-medium">Порог смены: 80%</span>
            <span>•</span>
            <span className={displayPatient.humidity >= 80 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759]'}>
              {displayPatient.humidity >= 80 ? 'ТРЕБУЕТСЯ ЗАМЕНА' : 'В НОРМЕ'}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Point Algorithmic Verification Step Timeline */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="border-b border-[#E5E5EA] pb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
            <span>Динамическая 3-точечная верификация алгоритма HealthBand</span>
          </h2>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isAlert
              ? 'bg-[#FFEBEA] text-[#D70015] border border-[#FF3B30]/30'
              : 'bg-[#EBF9EE] text-[#248A3D] border border-[#34C759]/30'
          }`}>
            {isAlert ? 'ПОДТВЕРЖДЕНО: 3/3 ЦИКЛА' : 'СТАБИЛЬНО: 0/3'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1D1D1F]">Цикл 1: Первичная девиация</span>
              <span className="font-mono text-[#86868B] text-[10px]">{p1.time}</span>
            </div>
            <div className="text-[11px] font-mono text-[#6E6E73]">
              Т раны: <span className="font-bold text-[#1D1D1F]">{p1.tempWound}°C</span> • ΔT: +{(p1.tempWound - p1.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-[#86868B] pt-1 leading-relaxed">
              Вектор роста зафиксирован, но порог 37.5°C не достигнут. Система накапливает выборку без тревоги.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1D1D1F]">Цикл 2: Фильтрация артефакта</span>
              <span className="font-mono text-[#86868B] text-[10px]">{p2.time}</span>
            </div>
            <div className="text-[11px] font-mono text-[#6E6E73]">
              Т раны: <span className="font-bold text-[#1D1D1F]">{p2.tempWound}°C</span> • ΔT: +{(p2.tempWound - p2.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-[#86868B] pt-1 leading-relaxed">
              Исключение одеяла: градиент ΔT &gt; 1.0°C доказывает локальный очаг, а не прогрев тела.
            </p>
          </div>

          <div className={`p-3 rounded-xl border space-y-1 ${
            isAlert ? 'bg-[#FFEBEA]/60 border-[#FF3B30]/40' : 'bg-[#F9F9FB] border-[#E5E5EA]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1D1D1F]">Цикл 3: Решение триажа</span>
              <span className="font-mono text-[#86868B] text-[10px]">{p3.time}</span>
            </div>
            <div className="text-[11px] font-mono text-[#6E6E73]">
              Т раны: <span className="font-bold text-[#1D1D1F]">{p3.tempWound}°C</span> • ΔT: +{(p3.tempWound - p3.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-[#86868B] pt-1 leading-relaxed">
              {isAlert
                ? 'Стойкий тренд 3 цикла подряд с градиентом ΔT ≥ 1.0°C. Включен протокол раневой инфекции.'
                : 'Показатели стабильны. Бактериального воспаления не обнаружено.'}
            </p>
          </div>
        </div>
      </div>

      {/* Chronological Measurements Table */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-[#E5E5EA] text-xs text-[#1D1D1F] font-semibold bg-[#F6F6F9] flex items-center justify-between">
          <span>Хронологический журнал телеметрических пакетов (ADC & Калибровка)</span>
          <span className="font-mono text-[11px] text-[#86868B]">{historySeries.length} записей</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F6F9] text-[#86868B] border-b border-[#E5E5EA] text-[11px] uppercase tracking-wider font-mono">
              <tr>
                <th className="py-2.5 px-3">Время</th>
                <th className="py-2.5 px-3 text-right">Т раны</th>
                <th className="py-2.5 px-3 text-right">Т тела</th>
                <th className="py-2.5 px-3 text-right">ΔT Градиент</th>
                <th className="py-2.5 px-3 text-right">Влажность</th>
                <th className="py-2.5 px-3 text-right">Пульс</th>
                <th className="py-2.5 px-3">Клинический статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
              {historySeries.map((row, i) => {
                const isSelected = activeIndex === i;
                return (
                  <tr
                    key={i}
                    onClick={() => setPlaybackIndex(i)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#E5F1FF]/60 font-medium'
                        : 'hover:bg-[#F9F9FB]'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono text-[#6E6E73]">{row.time}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#1D1D1F] tabular-nums">
                      {row.tempWound}°C
                    </td>
                    <td className="py-2 px-3 text-right text-[#6E6E73] tabular-nums">
                      {row.tempBody}°C
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-[#007AFF]">
                      +{row.delta ? row.delta : (row.tempWound - row.tempBody).toFixed(1)}°C
                    </td>
                    <td className="py-2 px-3 text-right text-[#34C759] font-semibold tabular-nums">
                      {row.humidity}%
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-[#6E6E73]">
                      {row.pulse} уд/м
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          row.note && row.note.includes('ТРЕВОГА')
                            ? 'bg-[#FFEBEA] text-[#D70015] border border-[#FF3B30]/30 font-bold'
                            : row.note && (row.note.includes('Тренд') || row.note.includes('ВНИМАНИЕ'))
                            ? 'bg-[#FFF5E5] text-[#C93400] border border-[#FF9500]/30 font-semibold'
                            : 'bg-[#F2F2F7] text-[#6E6E73]'
                        }`}
                      >
                        {row.note || 'Норма'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
