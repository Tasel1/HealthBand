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
  ShieldAlert
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function TelemetryView() {
  const {
    activePatient,
    selectedPatientId,
    setSelectedPatientId,
    patients,
    historySeries,
    mode,
    liveState,
    syncNow
  } = useHealthBand();

  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isAlert = activePatient.status === 'alert';
  const isWarning = activePatient.status === 'warning';

  // SVG Chart Dimensions
  const chartWidth = 720;
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

  const currentPoint = historySeries[historySeries.length - 1] || {
    time: '22:15',
    tempWound: activePatient.tempWound,
    tempBody: activePatient.tempBody,
    delta: activePatient.tempDiff,
    humidity: activePatient.humidity,
    pulse: activePatient.heartRate
  };

  const readout = hoveredPoint || {
    ...currentPoint,
    x: getX(count - 1),
    yWound: getTempY(currentPoint.tempWound)
  };

  const p1 = historySeries[Math.max(0, count - 3)] || { time: '21:45', tempWound: 37.4, tempBody: 36.8, delta: 0.6 };
  const p2 = historySeries[Math.max(0, count - 2)] || { time: '22:00', tempWound: 38.0, tempBody: 36.9, delta: 1.1 };
  const p3 = historySeries[Math.max(0, count - 1)] || { time: '22:15', tempWound: activePatient.tempWound, tempBody: activePatient.tempBody, delta: activePatient.tempDiff };

  return (
    <div className="space-y-4">
      {/* Patient Header & Hardware Metadata Strip */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white">
                {activePatient.name}
              </span>
              <span className="text-xs text-zinc-400">({activePatient.age} лет)</span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-300 font-medium">
                {activePatient.ward}, {activePatient.bed}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs font-mono text-cyan-400">
                {activePatient.sensorId}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[11px] font-mono text-zinc-400">
                MAC: {activePatient.mac || '4C:11:AE:0D:98:21'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              {activePatient.diagnosis}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              aria-label="Выбрать пациента"
              className="bg-[#090a0f] border border-[#1c212d] text-zinc-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ward}, {p.bed})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-zinc-400 bg-[#090a0f] px-2.5 py-1.5 rounded border border-[#1c212d] flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
              <span>{activePatient.lastUpdate}</span>
            </div>

            {mode === 'live' && activePatient.id === 'hb-01' && (
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#161b26] hover:bg-[#1c2230] text-cyan-300 text-xs border border-[#1c212d] transition-colors disabled:opacity-50"
                title="Обновить поток данных Google Sheets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>Синхронизировать</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabular Sensor Specs */}
        <div className="mt-3 pt-3 border-t border-[#1c212d] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-400">
          <div>
            <span className="text-zinc-500 text-[10px] block">Микроконтроллер & Радио</span>
            <span className="text-zinc-200 font-mono text-[11px]">ESP32-S3 / BLE 5.0</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">Энергетический профиль</span>
            <span className="text-zinc-200 text-[11px]">Deep Sleep (5 мин / 12 с Wake)</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">Заряд аккумулятора</span>
            <span className="text-zinc-200 font-mono text-[11px] tabular-nums">{activePatient.battery}% (Li-Po 3.7V)</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[10px] block">Канал передачи данных</span>
            <span className="text-zinc-200 text-[11px] flex items-center gap-1">
              {mode === 'live' && activePatient.id === 'hb-01' ? (
                <>
                  <Radio className="w-3 h-3 text-cyan-400" strokeWidth={2} /> Google Sheets (Live)
                </>
              ) : (
                <>
                  <FlaskConical className="w-3 h-3 text-amber-400" strokeWidth={2} /> Demo Lab Стенд
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostic Alert Box if Active */}
      {activePatient.alertDetails && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-xl p-3.5 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <div className="font-semibold text-rose-100 flex items-center gap-2">
              <span>КЛИНИЧЕСКИЙ СИГНАЛ: ОБНАРУЖЕН РАННИЙ МАРКЕР ВОСПАЛЕНИЯ</span>
              <span className="font-mono text-[11px] text-rose-300">
                (ΔT = {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C)
              </span>
            </div>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">
              {activePatient.alertDetails}
            </p>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Т раны (ложе)</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.tempWound}°C
          </div>
          <div className="text-[11px] font-mono mt-0.5 text-zinc-400">
            Порог: 37.5°C ({activePatient.tempWound >= 37.5 ? 'Превышен' : 'В норме'})
          </div>
        </div>

        <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Т тела & Градиент ΔT</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.tempBody}°C
          </div>
          <div className={`text-[11px] font-mono mt-0.5 tabular-nums ${
            activePatient.tempDiff >= 1.0 ? 'text-rose-400 font-semibold' : 'text-zinc-400'
          }`}>
            ΔT = {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C
          </div>
        </div>

        <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Влажность повязки</span>
            <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.humidity}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5 truncate">
            {activePatient.bandageStatus}
          </div>
        </div>

        <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5">
          <div className="text-xs text-zinc-400 flex items-center justify-between">
            <span>Пульс пациента</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.heartRate} <span className="text-xs font-normal text-zinc-400">уд/м</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            MAX30102 PPG
          </div>
        </div>
      </div>

      {/* High-Fidelity Apple Health Style Telemetry Graph with Scrubber */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1c212d]">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" strokeWidth={2} />
              <span>Синхронизированный термометрический тренд</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Интерактивный скраббер: наведите курсор для отображения измерений
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-[#090a0f] px-3 py-1.5 rounded-lg border border-[#1c212d] font-mono">
            <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
            <span className="text-zinc-300 font-semibold">{readout.time}</span>
            <span className="text-zinc-600">|</span>
            <span className="text-rose-400 font-bold">{readout.tempWound}°C</span>
            <span className="text-zinc-600">|</span>
            <span className="text-cyan-400">ΔT +{readout.delta || (readout.tempWound - readout.tempBody).toFixed(1)}°C</span>
            <span className="text-zinc-600">|</span>
            <span className="text-teal-400">{readout.humidity}% вл.</span>
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
              <linearGradient id="telemetryWoundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
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
                    stroke="#1c212d"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#52525b"
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
              stroke="#06b6d4"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <text
              x={chartWidth - padding.right}
              y={yBaselineBody - 5}
              textAnchor="end"
              fill="#06b6d4"
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
              stroke="#f43f5e"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <text
              x={chartWidth - padding.right}
              y={yThresholdAlarm - 5}
              textAnchor="end"
              fill="#f43f5e"
              fontSize="9"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Критический порог 37.5°C
            </text>

            {/* Glow Area */}
            <path d={woundAreaPath} fill="url(#telemetryWoundGrad)" />

            {/* Body Temp Curve */}
            <path
              d={bodyPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Wound Temp Curve */}
            <path
              d={woundPath}
              fill="none"
              stroke="#f43f5e"
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

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={yWound}
                    r={isHovered ? '5.5' : isHigh ? '4' : '3'}
                    fill={isHigh ? '#f43f5e' : '#38bdf8'}
                    stroke="#0d1017"
                    strokeWidth={isHovered ? '2' : '1.5'}
                  />

                  {/* Timestamp label */}
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 16}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.time}
                  </text>
                </g>
              );
            })}

            {/* Hairline scrubber */}
            {hoveredPoint && (
              <g className="chart-scrubber-line">
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding.bottom}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.yWound}
                  r="7"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Moisture Strip Below Graph with 80% Threshold Marker */}
        <div className="mt-2 pt-2.5 border-t border-[#1c212d] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
            <span>Насыщение повязки экссудатом:</span>
            <span className="font-semibold text-zinc-200 tabular-nums">{activePatient.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-amber-400/90">Порог смены: 80%</span>
            <span>•</span>
            <span className={activePatient.humidity >= 80 ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
              {activePatient.humidity >= 80 ? 'ТРЕБУЕТСЯ ЗАМЕНА' : 'В НОРМЕ'}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Point Algorithmic Verification Step Timeline */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4 space-y-3">
        <div className="border-b border-[#1c212d] pb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" strokeWidth={2} />
            <span>Динамическая 3-точечная верификация алгоритма HealthBand</span>
          </h2>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isAlert
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
          }`}>
            {isAlert ? 'ПОДТВЕРЖДЕНО: 3/3 ЦИКЛА' : 'СТАБИЛЬНО: 0/3'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#090a0f] p-3 rounded-lg border border-[#1c212d] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Цикл 1: Первичная девиация</span>
              <span className="font-mono text-zinc-500 text-[10px]">{p1.time}</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Т раны: <span className="font-bold text-white">{p1.tempWound}°C</span> • ΔT: +{(p1.tempWound - p1.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-relaxed">
              Вектор роста зафиксирован, но порог 37.5°C не достигнут. Система накапливает выборку без тревоги.
            </p>
          </div>

          <div className="bg-[#090a0f] p-3 rounded-lg border border-[#1c212d] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Цикл 2: Фильтрация артефакта</span>
              <span className="font-mono text-zinc-500 text-[10px]">{p2.time}</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Т раны: <span className="font-bold text-white">{p2.tempWound}°C</span> • ΔT: +{(p2.tempWound - p2.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-relaxed">
              Исключение одеяла: градиент ΔT &gt; 1.0°C доказывает локальный очаг, а не прогрев тела.
            </p>
          </div>

          <div className={`p-3 rounded-lg border space-y-1 ${
            isAlert ? 'bg-rose-950/20 border-rose-800/80' : 'bg-[#090a0f] border-[#1c212d]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Цикл 3: Решение триажа</span>
              <span className="font-mono text-zinc-500 text-[10px]">{p3.time}</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Т раны: <span className="font-bold text-white">{p3.tempWound}°C</span> • ΔT: +{(p3.tempWound - p3.tempBody).toFixed(1)}°
            </div>
            <p className="text-[10px] text-zinc-500 pt-1 leading-relaxed">
              {isAlert
                ? 'Стойкий тренд 3 цикла подряд с градиентом ΔT ≥ 1.0°C. Включен протокол раневой инфекции.'
                : 'Показатели стабильны. Бактериального воспаления не обнаружено.'}
            </p>
          </div>
        </div>
      </div>

      {/* Chronological Measurements Table */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1c212d] text-xs text-zinc-300 font-semibold bg-[#090a0f]">
          Хронологический журнал телеметрических пакетов (ADC & Калибровка)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#090a0f] text-zinc-500 border-b border-[#1c212d] text-[11px] uppercase tracking-wider font-mono">
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
            <tbody className="divide-y divide-[#1c212d]/60 text-zinc-300">
              {historySeries.map((row, i) => (
                <tr key={i} className="hover:bg-[#161b26]/50">
                  <td className="py-2 px-3 font-mono text-zinc-400">{row.time}</td>
                  <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                    {row.tempWound}°C
                  </td>
                  <td className="py-2 px-3 text-right text-zinc-400 tabular-nums">
                    {row.tempBody}°C
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    +{row.delta ? row.delta : (row.tempWound - row.tempBody).toFixed(1)}°C
                  </td>
                  <td className="py-2 px-3 text-right text-teal-300 font-semibold tabular-nums">
                    {row.humidity}%
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-zinc-400">
                    {row.pulse} уд/м
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        row.note && row.note.includes('ТРЕВОГА')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : row.note && (row.note.includes('Тренд') || row.note.includes('ВНИМАНИЕ'))
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-[#161b26] text-zinc-400'
                      }`}
                    >
                      {row.note || 'Норма'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
