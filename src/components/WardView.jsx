import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Droplets,
  Heart,
  ChevronRight,
  Search,
  Check,
  X,
  ShieldAlert,
  Battery,
  Flame,
  Radio,
  Printer,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  Cpu
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';
import { audioService } from '../services/audioService.js';

// Bandage age metadata mapped to patient IDs
const BANDAGE_AGE_MAP = {
  'hb-01': '18 ч',
  'hb-02': '24 ч',
  'hb-03': '6 ч',
  'hb-04': '42 ч'
};

export default function WardView({ onSelectPatient, onNavigateToReport }) {
  const {
    patients,
    alertCount,
    warningCount,
    normalCount,
    selectedPatientId,
    setSelectedPatientId,
    activePatient,
    historySeries,
    mode,
    liveState,
    syncNow
  } = useHealthBand();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [triageNotice, setTriageNotice] = useState(null);
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  // Filter patients list
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'alert'
          ? p.status === 'alert'
          : filter === 'warning'
          ? p.status === 'warning'
          : p.status === 'normal';
      const q = search.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q) ||
        p.sensorId.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [patients, filter, search]);

  const handleAcceptAlarm = (patientName) => {
    audioService.unlock();
    audioService.playConfirmBlip();
    setTriageNotice({
      type: 'accept',
      text: `Вызов по койке ${patientName} принят дежурной медсестрой. Оповещение переведено в режим обработки.`
    });
    setTimeout(() => setTriageNotice(null), 5000);
  };

  const handleChangeBandage = (patientName) => {
    audioService.unlock();
    audioService.playConfirmBlip();
    setTriageNotice({
      type: 'bandage',
      text: `Назначена внеплановая смена повязки для пациента ${patientName}. На пост передан протокол подготовки.`
    });
    setTimeout(() => setTriageNotice(null), 5000);
  };

  // Apple Health SVG Chart Coordinates & Computations
  const chartWidth = 660;
  const chartHeight = 220;
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

  // Area under wound curve for Apple Health glow
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

  // Handle interactive SVG scrubber hover
  const handleChartMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const svgX = (mouseX / svgRect.width) * chartWidth;

    if (svgX < padding.left || svgX > chartWidth - padding.right || count === 0) {
      return;
    }

    const ratio = (svgX - padding.left) / graphW;
    const closestIdx = Math.max(0, Math.min(count - 1, Math.round(ratio * (count - 1))));
    setHoveredDataPoint({
      ...historySeries[closestIdx],
      idx: closestIdx,
      x: getX(closestIdx),
      yWound: getTempY(historySeries[closestIdx].tempWound),
      yBody: getTempY(historySeries[closestIdx].tempBody)
    });
  };

  const handleChartMouseLeave = () => {
    setHoveredDataPoint(null);
  };

  // Active or hovered data readout
  const latestPoint = historySeries[historySeries.length - 1] || {
    time: '22:15',
    tempWound: activePatient.tempWound,
    tempBody: activePatient.tempBody,
    delta: activePatient.tempDiff,
    humidity: activePatient.humidity,
    pulse: activePatient.heartRate,
    note: activePatient.statusText
  };

  const activeReadout = hoveredDataPoint || {
    ...latestPoint,
    idx: count - 1,
    x: getX(count - 1),
    yWound: getTempY(latestPoint.tempWound),
    yBody: getTempY(latestPoint.tempBody)
  };

  // Mini sparkline for metric cards
  const miniSparkW = 90;
  const miniSparkH = 26;
  const miniSparkPoints = historySeries.map((d, i) => {
    const x = (i / Math.max(1, count - 1)) * miniSparkW;
    const y = miniSparkH - ((d.tempWound - minTemp) / (maxTemp - minTemp)) * miniSparkH;
    return `${x},${Math.max(2, Math.min(miniSparkH - 2, y))}`;
  });
  const miniSparkPath = miniSparkPoints.length > 0 ? `M ${miniSparkPoints.join(' L ')}` : '';

  // 3-point cycle steps
  const p1 = historySeries[Math.max(0, count - 3)] || { time: '21:45', tempWound: 37.4, tempBody: 36.8, delta: 0.6 };
  const p2 = historySeries[Math.max(0, count - 2)] || { time: '22:00', tempWound: 38.0, tempBody: 36.9, delta: 1.1 };
  const p3 = historySeries[Math.max(0, count - 1)] || { time: '22:15', tempWound: activePatient.tempWound, tempBody: activePatient.tempBody, delta: activePatient.tempDiff };

  return (
    <div className="space-y-4">
      {/* Triage Notice Banner */}
      {triageNotice && (
        <div className="bg-[#11141d] border border-cyan-800/80 text-cyan-200 rounded-lg p-3 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" strokeWidth={2} />
            <span>{triageNotice.text}</span>
          </div>
          <button
            onClick={() => setTriageNotice(null)}
            className="text-zinc-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Linear Master-Detail Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Dense Bed List (4 cols on lg) */}
        <div className="lg:col-span-4 bg-[#0d1017] border border-[#1c212d] rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-5.5rem)] sticky top-16">
          {/* Left Pane Header: Search & Filter Tabs */}
          <div className="p-3 border-b border-[#1c212d] bg-[#090a0f] space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" strokeWidth={2} />
              <input
                type="text"
                placeholder="Фильтр по койкам, ФИО..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#11141d] border border-[#1c212d] rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                Все ({patients.length})
              </button>
              <button
                onClick={() => setFilter('alert')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  filter === 'alert'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800 font-semibold'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Тревоги ({alertCount})
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  filter === 'warning'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                Контроль ({warningCount})
              </button>
              <button
                onClick={() => setFilter('normal')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  filter === 'normal'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Норма ({normalCount})
              </button>
            </div>
          </div>

          {/* Dense Bed Cards List */}
          <div className="overflow-y-auto divide-y divide-[#1c212d]/60 flex-1">
            {filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Койки не найдены
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                const isAlert = patient.status === 'alert';
                const isWarning = patient.status === 'warning';
                const bandageAge = BANDAGE_AGE_MAP[patient.id] || '12 ч';

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-3 cursor-pointer transition-all border-l-2 ${
                      isSelected
                        ? 'bg-[#161b26] border-cyan-400'
                        : 'border-transparent hover:bg-[#11141d] bg-[#0d1017]'
                    }`}
                  >
                    {/* Top row: Bed badge, status dot & sync time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Micro status indicator */}
                        <span className="relative flex h-2 w-2 shrink-0">
                          {isAlert && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              isAlert
                                ? 'bg-rose-500'
                                : isWarning
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            }`}
                          ></span>
                        </span>

                        <span className="font-mono text-xs font-semibold text-zinc-200">
                          {patient.bed}
                        </span>
                        <span className="text-zinc-600 text-xs">•</span>
                        <span className="text-[11px] text-zinc-400 truncate">
                          {patient.ward}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 shrink-0">
                        <Battery className="w-3 h-3 text-zinc-500" strokeWidth={1.5} />
                        <span>{patient.battery}%</span>
                      </div>
                    </div>

                    {/* Patient Name & Diagnosis */}
                    <div className="mt-1">
                      <div className="text-xs font-medium text-white truncate">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate" title={patient.diagnosis}>
                        {patient.diagnosis}
                      </div>
                    </div>

                    {/* Dense Telemetry Metric Chips */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[#1c212d]/60">
                      <span className={`font-semibold ${isAlert ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {patient.tempWound}°C
                      </span>
                      <span className="text-zinc-400">
                        ΔT {patient.tempDiff > 0 ? `+${patient.tempDiff}` : patient.tempDiff}°
                      </span>
                      <span className={patient.humidity >= 80 ? 'text-rose-400 font-semibold' : 'text-teal-400'}>
                        {patient.humidity}% вл.
                      </span>
                      <span className="text-zinc-400">
                        {patient.heartRate} уд/м
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Master Detail & Telemetry Workspace (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Patient Meta Header Card */}
          <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1c212d]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {activePatient.sensorId}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs text-zinc-300">
                    {activePatient.ward}, {activePatient.bed}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    Повязка: {BANDAGE_AGE_MAP[activePatient.id] || '18 ч'}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white mt-1">
                  {activePatient.name}
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {activePatient.diagnosis} • {activePatient.age} лет
                </p>
              </div>

              {/* Triage Action Buttons */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => handleAcceptAlarm(activePatient.name)}
                  className="px-2.5 py-1.5 rounded-md bg-[#161b26] hover:bg-[#1c2230] text-zinc-200 text-xs font-medium border border-[#1c212d] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
                  <span>Принять</span>
                </button>

                <button
                  onClick={() => handleChangeBandage(activePatient.name)}
                  className="px-2.5 py-1.5 rounded-md bg-[#161b26] hover:bg-[#1c2230] text-zinc-200 text-xs font-medium border border-[#1c212d] transition-colors flex items-center gap-1.5"
                >
                  <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
                  <span>Сменить повязку</span>
                </button>

                {onNavigateToReport && (
                  <button
                    onClick={() => onNavigateToReport(activePatient.id)}
                    className="px-2.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Протокол</span>
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Alert Callout if Active */}
            {activePatient.alertDetails && (
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-900/80 text-xs text-rose-200 flex items-start gap-2.5 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <div className="font-semibold text-rose-200 flex items-center gap-2">
                    <span>Критический диагностический сигнал</span>
                    <span className="font-mono text-[10px] text-rose-300">
                      (ΔT = +{activePatient.tempDiff}°C)
                    </span>
                  </div>
                  <p className="mt-0.5 text-rose-300/90 leading-relaxed text-[11px]">
                    {activePatient.alertDetails}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4 Apple Health Style Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: Wound Temp */}
            <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Т раны (ложе)</span>
                <Thermometer className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                  {activePatient.tempWound}°<span className="text-sm font-normal text-zinc-400">C</span>
                </div>
                {/* Mini SVG Sparkline */}
                <svg className="w-16 h-6 overflow-visible" viewBox={`0 0 ${miniSparkW} ${miniSparkH}`}>
                  <path
                    d={miniSparkPath}
                    fill="none"
                    stroke={activePatient.tempWound >= 37.5 ? '#f43f5e' : '#38bdf8'}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1c212d]">
                <span>Порог 37.5°C</span>
                <span className={activePatient.tempWound >= 37.5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {activePatient.tempWound >= 37.5 ? 'Превышен' : 'В норме'}
                </span>
              </div>
            </div>

            {/* Metric 2: Delta T */}
            <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Градиент ΔT</span>
                <span className="text-[10px] font-mono text-zinc-500">Т_тела {activePatient.tempBody}°</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums tracking-tight">
                <span className={activePatient.tempDiff >= 1.0 ? 'text-rose-400' : 'text-zinc-200'}>
                  +{activePatient.tempDiff}°<span className="text-sm font-normal text-zinc-400">C</span>
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1c212d]">
                <span>Порог ≥ +1.0°C</span>
                <span className={activePatient.tempDiff >= 1.0 ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                  {activePatient.tempDiff >= 1.0 ? 'Воспаление' : 'Норма'}
                </span>
              </div>
            </div>

            {/* Metric 3: Moisture */}
            <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Влажность повязки</span>
                <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                <span className={activePatient.humidity >= 80 ? 'text-rose-400' : 'text-teal-300'}>
                  {activePatient.humidity}%
                </span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1c212d]">
                <span>Порог 80%</span>
                <span className={activePatient.humidity >= 80 ? 'text-rose-400 font-bold' : 'text-teal-400'}>
                  {activePatient.humidity >= 80 ? 'Замена' : 'Сухая'}
                </span>
              </div>
            </div>

            {/* Metric 4: Pulse */}
            <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Пульс пациента</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                {activePatient.heartRate}{' '}
                <span className="text-xs font-normal text-zinc-400">уд/м</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-[#1c212d]">
                <span>MAX30102 PPG</span>
                <span className="text-emerald-400">Ритм norm</span>
              </div>
            </div>
          </div>

          {/* Apple Health Style Interactive SVG Telemetry Chart with Hairline Scrubber */}
          <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1c212d]">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" strokeWidth={2} />
                  <span>Интерактивная термометрическая кривая (Apple Health Scrubber)</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Наведите курсор на график для считывания точных замеров в каждой точке
                </p>
              </div>

              {/* Scrubber Real-time Floating / Fixed Readout Badge */}
              <div className="flex items-center gap-2 text-xs bg-[#090a0f] px-3 py-1.5 rounded-lg border border-[#1c212d] font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
                <span className="text-zinc-300 font-semibold">{activeReadout.time}</span>
                <span className="text-zinc-600">|</span>
                <span className="text-rose-400 font-bold">{activeReadout.tempWound}°C</span>
                <span className="text-zinc-600">|</span>
                <span className="text-cyan-400">ΔT +{activeReadout.delta || (activeReadout.tempWound - activeReadout.tempBody).toFixed(1)}°C</span>
                <span className="text-zinc-600">|</span>
                <span className="text-teal-400">{activeReadout.humidity}% вл.</span>
              </div>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="relative w-full overflow-x-auto py-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[580px] text-xs select-none cursor-crosshair"
                onMouseMove={handleChartMouseMove}
                onMouseLeave={handleChartMouseLeave}
              >
                <defs>
                  {/* Subtle Apple Health linear gradient for wound curve fill */}
                  <linearGradient id="woundAreaGradient" x1="0" y1="0" x2="0" y2="1">
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
                  opacity="0.5"
                />
                <text
                  x={chartWidth - padding.right}
                  y={yBaselineBody - 5}
                  textAnchor="end"
                  fill="#06b6d4"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  Базовая норма 36.6°C
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
                  Порог гипертермии 37.5°C
                </text>

                {/* Wound Area Glow */}
                <path d={woundAreaPath} fill="url(#woundAreaGradient)" />

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

                {/* Nodes on Wound Temp Curve */}
                {historySeries.map((d, i) => {
                  const x = getX(i);
                  const yWound = getTempY(d.tempWound);
                  const isHovered = hoveredDataPoint && hoveredDataPoint.idx === i;
                  const isHigh = d.tempWound >= 37.5;

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={yWound}
                        r={isHovered ? 5.5 : isHigh ? 4 : 3}
                        fill={isHigh ? '#f43f5e' : '#38bdf8'}
                        stroke="#0d1017"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                      />
                      {/* X-axis time label */}
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

                {/* Apple Health Hairline Vertical Scrubber */}
                {hoveredDataPoint && (
                  <g className="chart-scrubber-line">
                    <line
                      x1={hoveredDataPoint.x}
                      y1={padding.top}
                      x2={hoveredDataPoint.x}
                      y2={chartHeight - padding.bottom}
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    {/* Ring highlight on wound node */}
                    <circle
                      cx={hoveredDataPoint.x}
                      cy={hoveredDataPoint.yWound}
                      r="7"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Algorithm Status Card: 3-Cycle Dynamic Verification */}
          <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c212d]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
                  <span>3-Точечная верификация алгоритма HealthBand</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Исключение ложных тревог: нагрев одеялом исключается при синхронном росте Т тела
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activePatient.status === 'alert'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                }`}
              >
                {activePatient.status === 'alert' ? '3/3 ПОДТВЕРЖДЕНО' : 'ГОМЕОСТАЗ'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Step 1 */}
              <div className="bg-[#090a0f] p-3 rounded-lg border border-[#1c212d] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">1. Первичная девиация</span>
                  <span className="font-mono text-zinc-500 text-[10px]">{p1.time}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Т раны: <span className="text-white font-bold">{p1.tempWound}°C</span> • ΔT: +{(p1.tempWound - p1.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight pt-1">
                  Начало температурного отклонения. Зуммер заблокирован для накопления выборки.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#090a0f] p-3 rounded-lg border border-[#1c212d] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">2. Фильтр артефакта</span>
                  <span className="font-mono text-zinc-500 text-[10px]">{p2.time}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Т раны: <span className="text-white font-bold">{p2.tempWound}°C</span> • ΔT: +{(p2.tempWound - p2.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight pt-1">
                  Проверка одеяла: ΔT &gt; 1.0°C подтверждает локальный очаг, а не прогрев тела.
                </p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-lg border space-y-1 ${
                  activePatient.status === 'alert'
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : 'bg-[#090a0f] border-[#1c212d]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">3. Решение триажа</span>
                  <span className="font-mono text-zinc-500 text-[10px]">{p3.time}</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Т раны: <span className="text-white font-bold">{p3.tempWound}°C</span> • ΔT: +{(p3.tempWound - p3.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight pt-1">
                  {activePatient.status === 'alert'
                    ? 'Стойкий тренд 3 цикла. Активирован вызов дежурной медсестры.'
                    : 'Гомеостаз стабилен. Бактериального воспаления не выявлено.'}
                </p>
              </div>
            </div>
          </div>

          {/* Linear-Style Chronological Event Timeline */}
          <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#1c212d]">
              <Clock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
              <span>Хронологический журнал событий (Linear Timeline)</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#1c212d]">
              {/* Event 1 */}
              <div className="relative flex items-start gap-3.5 pl-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                  activePatient.status === 'alert'
                    ? 'bg-rose-950 border-rose-600 text-rose-400'
                    : 'bg-emerald-950 border-emerald-600 text-emerald-400'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                </div>
                <div className="min-w-0 flex-1 bg-[#090a0f] p-2.5 rounded-lg border border-[#1c212d] text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-white">
                      {activePatient.status === 'alert' ? 'Критическая тревога HealthBand' : 'Штатный замер телеметрии'}
                    </span>
                    <span className="font-mono">22:15</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    {activePatient.status === 'alert'
                      ? `Зафиксирован стойкий рост Т раны до ${activePatient.tempWound}°C с насыщением экссудатом ${activePatient.humidity}%. Рекомендован осмотр.`
                      : 'Все параметры находятся в целевом терапевтическом коридоре.'}
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start gap-3.5 pl-1">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                </div>
                <div className="min-w-0 flex-1 bg-[#090a0f] p-2.5 rounded-lg border border-[#1c212d] text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-white">Верификация алгоритма (2/3)</span>
                    <span className="font-mono">22:00</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Подтвержден градиент ΔT +1.1°C относительно опорного сенсора интактной кожи.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start gap-3.5 pl-1">
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                </div>
                <div className="min-w-0 flex-1 bg-[#090a0f] p-2.5 rounded-lg border border-[#1c212d] text-xs">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-semibold text-white">Плановая смена повязки</span>
                    <span className="font-mono">18:00</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5">
                    Наложена свежая антибактериальная сорбирующая повязка со стерильным шлейфом HealthBand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
