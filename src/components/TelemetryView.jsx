import React from 'react';
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
  ShieldCheck
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

  const isAlert = activePatient.status === 'alert';
  const isWarning = activePatient.status === 'warning';

  // SVG Chart Dimensions & Computations
  const chartWidth = 720;
  const chartHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };
  const graphW = chartWidth - padding.left - padding.right;
  const graphH = chartHeight - padding.top - padding.bottom;

  // Temperature domain: 35.0 to 40.0°C
  const minTemp = 35.0;
  const maxTemp = 40.0;
  const getTempY = (t) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, t));
    return padding.top + graphH - ((clamped - minTemp) / (maxTemp - minTemp)) * graphH;
  };

  const getX = (idx, total) => {
    if (total <= 1) return padding.left + graphW / 2;
    return padding.left + (idx / (total - 1)) * graphW;
  };

  // Generate SVG path for wound temp and body temp
  const count = historySeries.length;
  const woundPoints = historySeries.map((d, i) => `${getX(i, count)},${getTempY(d.tempWound)}`);
  const woundPath = woundPoints.length > 0 ? `M ${woundPoints.join(' L ')}` : '';

  const bodyPoints = historySeries.map((d, i) => `${getX(i, count)},${getTempY(d.tempBody)}`);
  const bodyPath = bodyPoints.length > 0 ? `M ${bodyPoints.join(' L ')}` : '';

  // Critical threshold lines Y coordinates
  const yThresholdAlarm = getTempY(37.5);
  const yBaselineBody = getTempY(36.6);

  // 3-Point timeline analysis data
  const p1 = historySeries[Math.max(0, count - 3)] || { time: '21:45', tempWound: 37.4, tempBody: 36.8, delta: 0.6 };
  const p2 = historySeries[Math.max(0, count - 2)] || { time: '22:00', tempWound: 38.0, tempBody: 36.9, delta: 1.1 };
  const p3 = historySeries[Math.max(0, count - 1)] || { time: '22:15', tempWound: activePatient.tempWound, tempBody: activePatient.tempBody, delta: activePatient.tempDiff };

  return (
    <div className="space-y-5">
      {/* Patient Header & Hardware Metadata Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white">
                {activePatient.name}
              </span>
              <span className="text-xs text-slate-400">({activePatient.age} лет)</span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {activePatient.ward}, {activePatient.bed}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-cyan-400">
                {activePatient.sensorId}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono text-slate-400">
                MAC: {activePatient.mac || '4C:11:AE:0D:98:21'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              {activePatient.diagnosis}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              aria-label="Выбрать пациента"
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ward}, {p.bed})
                </option>
              ))}
            </select>

            <div className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
              <span>{activePatient.lastUpdate}</span>
            </div>

            {mode === 'live' && activePatient.id === 'hb-01' && (
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-slate-700 transition-colors disabled:opacity-50"
                title="Обновить поток данных Google Sheets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
                <span>Синхронизировать</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabular Sensor Specs */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 text-[10px] block">Микроконтроллер & Радио</span>
            <span className="text-slate-200 font-mono text-[11px]">ESP32-S3 / BLE 5.0</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Энергетический профиль</span>
            <span className="text-slate-200 text-[11px]">Deep Sleep (5 мин / 12 с Wake)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Заряд аккумулятора</span>
            <span className="text-slate-200 font-mono text-[11px] tabular-nums">{activePatient.battery}% (Li-Po 3.7V)</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] block">Канал передачи данных</span>
            <span className="text-slate-200 text-[11px] flex items-center gap-1">
              {mode === 'live' && activePatient.id === 'hb-01' ? (
                <>
                  <Radio className="w-3 h-3 text-cyan-400" strokeWidth={2} /> Google Sheets (Live Stream)
                </>
              ) : (
                <>
                  <FlaskConical className="w-3 h-3 text-amber-400" strokeWidth={2} /> Калибровочный тестбенч
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Diagnostic Alert Box if Active */}
      {activePatient.alertDetails && (
        <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-3.5 text-xs text-rose-200 flex items-start gap-3">
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

      {/* Clinical Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Т раны (ложе)</span>
            <Thermometer className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.tempWound}°C
          </div>
          <div className="text-[11px] font-mono mt-0.5 text-slate-400">
            Порог: 37.5°C ({activePatient.tempWound >= 37.5 ? 'Превышен' : 'В норме'})
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Т тела & Градиент ΔT</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.tempBody}°C
          </div>
          <div className={`text-[11px] font-mono mt-0.5 tabular-nums ${
            activePatient.tempDiff >= 1.0 ? 'text-rose-400 font-semibold' : 'text-slate-400'
          }`}>
            ΔT = {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C относительно тела
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Влажность повязки</span>
            <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.humidity}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {activePatient.bandageStatus}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Пульс пациента</span>
            <Heart className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
          </div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {activePatient.heartRate} <span className="text-xs font-normal text-slate-400">уд/м</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Датчик MAX30102 PPG
          </div>
        </div>
      </div>

      {/* High-Fidelity Synchronized Clinical Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" strokeWidth={2} />
              Синхронизированный термометрический тренд
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Непрерывная фиксация температурного градиента и порога гипертермии
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span> Т раны (°C)
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span> Т тела (°C)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400/80">
              <span className="w-2.5 h-0 border-t border-dashed border-rose-400 inline-block"></span> Порог 37.5°C
            </span>
          </div>
        </div>

        {/* SVG Curve Container */}
        <div className="w-full overflow-x-auto py-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[620px] text-xs select-none"
          >
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
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
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
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text
              x={chartWidth - padding.right}
              y={yThresholdAlarm - 5}
              textAnchor="end"
              fill="#f43f5e"
              fontSize="10"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              Критический порог 37.5°C
            </text>

            {/* Body Temp Curve */}
            <path
              d={bodyPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.75"
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
              const x = getX(i, count);
              const yWound = getTempY(d.tempWound);
              const yBody = getTempY(d.tempBody);
              const isHigh = d.tempWound >= 37.5;

              return (
                <g key={i}>
                  {/* Vertical guideline */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />

                  {/* Body temp point */}
                  <circle cx={x} cy={yBody} r="3" fill="#06b6d4" />

                  {/* Wound temp point */}
                  <circle
                    cx={x}
                    cy={yWound}
                    r={isHigh ? '4.5' : '3.5'}
                    fill={isHigh ? '#f43f5e' : '#38bdf8'}
                    stroke="#090d16"
                    strokeWidth="1.5"
                  />

                  {/* Value label */}
                  <text
                    x={x}
                    y={yWound - 8}
                    textAnchor="middle"
                    fill={isHigh ? '#fca5a5' : '#e2e8f0'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {d.tempWound}°
                  </text>

                  {/* Timestamp label */}
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 15}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {d.time}
                  </text>

                  {/* Humidity label at bottom */}
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 27}
                    textAnchor="middle"
                    fill={d.humidity >= 80 ? '#fb7185' : '#2dd4bf'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {d.humidity}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Moisture Strip Below Graph with 80% Threshold Marker */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
            <span>Насыщение повязки экссудатом:</span>
            <span className="font-semibold text-slate-200 tabular-nums">{activePatient.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-amber-400">Порог смены повязки: 80%</span>
            <span>•</span>
            <span className={activePatient.humidity >= 80 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              {activePatient.humidity >= 80 ? 'ТРЕБУЕТСЯ АСЕПТИЧЕСКАЯ ЗАМЕНА' : 'ВЛАГОЕМКОСТЬ В ПРЕДЕЛАХ НОРМЫ'}
            </span>
          </div>
        </div>
      </div>

      {/* Explicit 3-Point Algorithmic Verification Step Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="border-b border-slate-800 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" strokeWidth={2} />
              Динамическая 3-точечная верификация алгоритма HealthBand
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Аналитический протокол дифференциации бактериального воспаления от теплового артефакта (одеяло / ОРВИ)
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded text-xs font-semibold self-start sm:self-center ${
            isAlert
              ? 'bg-rose-950 text-rose-300 border border-rose-800'
              : isWarning
              ? 'bg-amber-950 text-amber-300 border border-amber-800'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
          }`}>
            {isAlert ? 'ПОДТВЕРЖДЕНО: 3/3 ЦИКЛА' : isWarning ? 'ПРОВЕРКА: 2/3 ЦИКЛА' : 'СТАБИЛЬНО: 0/3'}
          </span>
        </div>

        {/* 3 Step Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Cycle 1 */}
          <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Цикл 1: Первичная девиация</span>
              <span className="font-mono text-slate-400 text-[11px]">{p1.time}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
              <div>Т раны: <span className="font-bold text-white">{p1.tempWound}°C</span></div>
              <div>Градиент: <span className="text-cyan-400">ΔT = +{(p1.tempWound - p1.tempBody).toFixed(1)}°C</span></div>
              <div>Влажность: <span className="text-teal-400">{p1.humidity}%</span></div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <strong>Анализ наклона:</strong> Вектор роста зафиксирован, но порог 37.5°C не достигнут. Система регистрирует базовое отклонение без подачи сигнала тревоги.
            </div>
          </div>

          {/* Cycle 2 */}
          <div className="bg-slate-950 p-3.5 rounded border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Цикл 2: Фильтрация артефакта</span>
              <span className="font-mono text-slate-400 text-[11px]">{p2.time}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
              <div>Т раны: <span className="font-bold text-white">{p2.tempWound}°C</span></div>
              <div>Градиент: <span className="text-amber-400">ΔT = +{(p2.tempWound - p2.tempBody).toFixed(1)}°C</span></div>
              <div>Наклон: <span className="text-slate-300">{(p2.tempWound - p1.tempWound) > 0 ? `+${(p2.tempWound - p1.tempWound).toFixed(1)}` : '0.0'}°C / 15 мин</span></div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <strong>Исключение одеяла:</strong> Превышен порог 37.5°C. Если пациент просто укрылся, Т раны растет синхронно с Т тела (ΔT &le; 0.3°C). Алгоритм ожидает 3-го подтверждения.
            </div>
          </div>

          {/* Cycle 3 */}
          <div className={`p-3.5 rounded border space-y-2 ${
            isAlert ? 'bg-rose-950/30 border-rose-800/80' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Цикл 3: Решение триажа</span>
              <span className="font-mono text-slate-400 text-[11px]">{p3.time}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
              <div>Т раны: <span className="font-bold text-white">{p3.tempWound}°C</span></div>
              <div>Градиент: <span className={isAlert ? 'text-rose-400 font-bold' : 'text-cyan-400'}>ΔT = +{(p3.tempWound - p3.tempBody).toFixed(1)}°C</span></div>
              <div>Статус: <span className={isAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{isAlert ? '3/3 ПОДТВЕРЖДЕНО' : 'НОРМА'}</span></div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <strong>Клинический вердикт:</strong> {isAlert ? 'Стойкий рост 3 цикла подряд с градиентом ΔT ≥ 1.0°C. Ложный нагрев одеялом исключен. Активирована тревога «Локальная инфекция».' : 'Показатели стабильны. Бактериальной колонизации не зафиксировано.'}
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Measurements Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-800 text-xs text-slate-300 font-semibold">
          Хронологический журнал телеметрических пакетов (ADC & Калибровка)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {historySeries.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono text-slate-400">{row.time}</td>
                  <td className="py-2 px-3 text-right font-bold text-white tabular-nums">
                    {row.tempWound}°C
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400 tabular-nums">
                    {row.tempBody}°C
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    +{row.delta ? row.delta : (row.tempWound - row.tempBody).toFixed(1)}°C
                  </td>
                  <td className="py-2 px-3 text-right text-teal-300 font-semibold tabular-nums">
                    {row.humidity}%
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    {row.pulse} уд/м
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        row.note && row.note.includes('ТРЕВОГА')
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : row.note && (row.note.includes('Тренд') || row.note.includes('ВНИМАНИЕ'))
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
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
