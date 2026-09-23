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
  TrendingUp,
  Activity,
  Layers,
  Cpu,
  User,
  Sliders,
  Share2
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
    selectedPatientId,
    setSelectedPatientId,
    displayPatient,
    historySeries,
    mode,
    liveState,
    syncNow,
    playbackIndex,
    setPlaybackIndex,
    alertCount,
    warningCount,
    normalCount
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
  const chartWidth = 680;
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

  const activeIndex =
    playbackIndex !== null
      ? Math.max(0, Math.min(count - 1, playbackIndex))
      : count - 1;

  const latestPoint = historySeries[activeIndex] || {
    time: '22:15',
    tempWound: displayPatient.tempWound,
    tempBody: displayPatient.tempBody,
    delta: displayPatient.tempDiff,
    humidity: displayPatient.humidity,
    pulse: displayPatient.heartRate,
    note: displayPatient.statusText
  };

  const activeReadout = hoveredDataPoint || {
    ...latestPoint,
    idx: activeIndex,
    x: getX(activeIndex),
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
  const p3 = historySeries[Math.max(0, count - 1)] || { time: '22:15', tempWound: displayPatient.tempWound, tempBody: displayPatient.tempBody, delta: displayPatient.tempDiff };

  // MacWhisper Transcript Data Model: Chronological events with speaker badges
  const transcriptEvents = [
    {
      id: 'tr-01',
      timecode: '22:15:00',
      historyIndex: count - 1,
      speaker: 'Алгоритм HealthBand',
      speakerType: 'algorithm',
      avatarBg: 'bg-purple-100 text-[#AF52DE]',
      text: 'ВЕРИФИЦИРОВАНА ТРЕВОГА: 3-й цикл прогрессирующей гипертермии раны (38.6°C). Градиент с интактной кожей ΔT = +1.6°C подтверждает бактериальное воспаление. Насыщение экссудатом 88% превысило порог замены повязки (80%). На пост медсестры передан акустический вызов.',
      metrics: { temp: '38.6°C', delta: '+1.6°C', humidity: '88%', status: 'alert' }
    },
    {
      id: 'tr-02',
      timecode: '22:00:00',
      historyIndex: count - 2,
      speaker: 'Датчик раны NTC',
      speakerType: 'sensor',
      avatarBg: 'bg-rose-100 text-[#FF3B30]',
      text: 'Фиксация 2-го шага тренда: температура раневого ложа поднялась до 38.0°C. Опорный датчик тела зафиксировал 36.9°C. Исключена гипотеза согревания под одеялом (градиент ΔT > 1.0°C). Система накапливает 3-й цикл для верификации.',
      metrics: { temp: '38.0°C', delta: '+1.1°C', humidity: '78%', status: 'warning' }
    },
    {
      id: 'tr-03',
      timecode: '21:45:00',
      historyIndex: count - 3,
      speaker: 'Опорный сенсор тела',
      speakerType: 'reference',
      avatarBg: 'bg-blue-100 text-[#007AFF]',
      text: 'Базовая температура тела стабильна на уровне 36.8°C. Температура раны демонстрирует первичное отклонение до 37.4°C (градиент ΔT +0.6°C). Зуммер заблокирован для предотвращения ложной тревоги.',
      metrics: { temp: '37.4°C', delta: '+0.6°C', humidity: '64%', status: 'normal' }
    },
    {
      id: 'tr-04',
      timecode: '18:00:00',
      historyIndex: 0,
      speaker: 'Медсестра Исаева А.Б.',
      speakerType: 'nurse',
      avatarBg: 'bg-emerald-100 text-[#34C759]',
      text: 'Выполнена плановая асептическая перевязка. Установлен новый стерильный шлейф HealthBand HB-BAND-041A. Сопротивление NTC 10.4 кОм, кондуктометрия 48%. Запущен непрерывный телеметрический протокол.',
      metrics: { temp: '36.8°C', delta: '+0.2°C', humidity: '45%', status: 'normal' }
    }
  ];

  const isAlert = displayPatient.status === 'alert';
  const isWarning = displayPatient.status === 'warning';

  return (
    <div className="space-y-4">
      {/* Triage Notice Banner */}
      {triageNotice && (
        <div className="bg-[#E5F1FF] border border-[#007AFF]/30 text-[#007AFF] rounded-xl p-3 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#007AFF] shrink-0" strokeWidth={2} />
            <span className="font-medium text-[#1D1D1F]">{triageNotice.text}</span>
          </div>
          <button
            onClick={() => setTriageNotice(null)}
            className="text-[#86868B] hover:text-[#1D1D1F] p-1"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* macOS Master-Detail Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Clean Bed List (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden flex flex-col shadow-xs max-h-[calc(100vh-10rem)] sticky top-16">
          {/* Header with Search and Filter Pills */}
          <div className="p-3 border-b border-[#E5E5EA] bg-[#F6F6F9] space-y-2.5">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Фильтр по койкам, ФИО..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-[#E5E5EA] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#007AFF] transition-colors shadow-2xs"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold border border-[#E5E5EA]'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                Все ({patients.length})
              </button>
              <button
                onClick={() => setFilter('alert')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filter === 'alert'
                    ? 'bg-[#FFEBEA] text-[#D70015] font-semibold border border-[#FF3B30]/30'
                    : 'text-[#FF3B30] hover:bg-[#FFEBEA]/50'
                }`}
              >
                Тревоги ({alertCount})
              </button>
              <button
                onClick={() => setFilter('warning')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filter === 'warning'
                    ? 'bg-[#FFF5E5] text-[#C93400] font-semibold border border-[#FF9500]/30'
                    : 'text-[#FF9500] hover:bg-[#FFF5E5]/50'
                }`}
              >
                Контроль ({warningCount})
              </button>
              <button
                onClick={() => setFilter('normal')}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filter === 'normal'
                    ? 'bg-[#EBF9EE] text-[#248A3D] font-semibold border border-[#34C759]/30'
                    : 'text-[#34C759] hover:bg-[#EBF9EE]/50'
                }`}
              >
                Норма ({normalCount})
              </button>
            </div>
          </div>

          {/* Bed Cards List */}
          <div className="overflow-y-auto divide-y divide-[#E5E5EA]/70 flex-1">
            {filteredPatients.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#86868B]">
                Койки не найдены
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                const pAlert = patient.status === 'alert';
                const pWarn = patient.status === 'warning';

                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-3 cursor-pointer transition-all border-l-3 ${
                      isSelected
                        ? 'bg-[#E5F1FF]/60 border-[#007AFF]'
                        : 'border-transparent hover:bg-[#F9F9FB] bg-white'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Micro status indicator */}
                        <span className="relative flex h-2 w-2 shrink-0">
                          {pAlert && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75"></span>
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${
                              pAlert
                                ? 'bg-[#FF3B30]'
                                : pWarn
                                ? 'bg-[#FF9500]'
                                : 'bg-[#34C759]'
                            }`}
                          />
                        </span>

                        <span className="font-mono text-xs font-bold text-[#1D1D1F]">
                          {patient.bed}
                        </span>
                        <span className="text-[#D1D1D6] text-xs">•</span>
                        <span className="text-[11px] text-[#6E6E73] truncate">
                          {patient.ward}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#86868B] shrink-0">
                        <Battery className="w-3 h-3 text-[#86868B]" strokeWidth={1.5} />
                        <span>{patient.battery}%</span>
                      </div>
                    </div>

                    {/* Patient Name & Diagnosis */}
                    <div className="mt-1">
                      <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-[#6E6E73] truncate" title={patient.diagnosis}>
                        {patient.diagnosis}
                      </div>
                    </div>

                    {/* Telemetry Metric Chips */}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-[#E5E5EA]">
                      <span className={`font-bold ${pAlert ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'}`}>
                        {patient.tempWound}°C
                      </span>
                      <span className="text-[#007AFF]">
                        ΔT {patient.tempDiff > 0 ? `+${patient.tempDiff}` : patient.tempDiff}°
                      </span>
                      <span className={patient.humidity >= 80 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759]'}>
                        {patient.humidity}% вл.
                      </span>
                      <span className="text-[#86868B]">
                        {patient.heartRate} уд/м
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Master Detail & Transcript Canvas (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Patient Meta Header Card */}
          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5EA]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#007AFF] bg-[#E5F1FF] px-2 py-0.5 rounded border border-[#007AFF]/20">
                    {displayPatient.sensorId}
                  </span>
                  <span className="text-[#D1D1D6]">•</span>
                  <span className="text-xs text-[#6E6E73] font-medium">
                    {displayPatient.ward}, {displayPatient.bed}
                  </span>
                  <span className="text-[#D1D1D6]">•</span>
                  <span className="text-[11px] font-mono text-[#86868B]">
                    Повязка: {BANDAGE_AGE_MAP[displayPatient.id] || '18 ч'}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-[#1D1D1F] mt-1 tracking-tight">
                  {displayPatient.name}
                </h1>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  {displayPatient.diagnosis} • {displayPatient.age} лет
                </p>
              </div>

              {/* Triage Action Buttons */}
              <div className="flex items-center flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => handleAcceptAlarm(displayPatient.name)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] text-xs font-medium border border-[#E5E5EA] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                  <span>Принять вызов</span>
                </button>

                <button
                  onClick={() => handleChangeBandage(displayPatient.name)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] text-xs font-medium border border-[#E5E5EA] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Droplets className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
                  <span>Сменить повязку</span>
                </button>

                {onNavigateToReport && (
                  <button
                    onClick={() => onNavigateToReport(displayPatient.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Протокол 004/у</span>
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Alert Callout if Active */}
            {displayPatient.alertDetails && (
              <div className="mt-3 p-3 rounded-xl bg-[#FFEBEA] border border-[#FF3B30]/30 text-xs text-[#D70015] flex items-start gap-2.5 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-[#FF3B30] shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <div className="font-bold text-[#D70015] flex items-center gap-2">
                    <span>Критический диагностический сигнал</span>
                    <span className="font-mono text-[10px] text-[#FF3B30]">
                      (ΔT = +{displayPatient.tempDiff}°C)
                    </span>
                  </div>
                  <p className="mt-0.5 text-[#D70015]/90 leading-relaxed text-[11px]">
                    {displayPatient.alertDetails}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4 Apple Health Style Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: Wound Temp */}
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6E6E73]">
                <span>Т раны (ложе)</span>
                <Thermometer className="w-3.5 h-3.5 text-[#FF3B30]" strokeWidth={2} />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
                  {displayPatient.tempWound}°<span className="text-sm font-normal text-[#86868B]">C</span>
                </div>
                {/* Mini SVG Sparkline */}
                <svg className="w-16 h-6 overflow-visible" viewBox={`0 0 ${miniSparkW} ${miniSparkH}`}>
                  <path
                    d={miniSparkPath}
                    fill="none"
                    stroke={displayPatient.tempWound >= 37.5 ? '#FF3B30' : '#007AFF'}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="text-[10px] font-mono text-[#86868B] flex items-center justify-between pt-1 border-t border-[#E5E5EA]">
                <span>Порог 37.5°C</span>
                <span className={displayPatient.tempWound >= 37.5 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759] font-medium'}>
                  {displayPatient.tempWound >= 37.5 ? 'Превышен' : 'В норме'}
                </span>
              </div>
            </div>

            {/* Metric 2: Delta T */}
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6E6E73]">
                <span>Градиент ΔT</span>
                <span className="text-[10px] font-mono text-[#86868B]">Т_тела {displayPatient.tempBody}°</span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums tracking-tight">
                <span className={displayPatient.tempDiff >= 1.0 ? 'text-[#FF3B30]' : 'text-[#007AFF]'}>
                  +{displayPatient.tempDiff}°<span className="text-sm font-normal text-[#86868B]">C</span>
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#86868B] flex items-center justify-between pt-1 border-t border-[#E5E5EA]">
                <span>Порог ≥ +1.0°C</span>
                <span className={displayPatient.tempDiff >= 1.0 ? 'text-[#FF3B30] font-bold' : 'text-[#6E6E73]'}>
                  {displayPatient.tempDiff >= 1.0 ? 'Воспаление' : 'Норма'}
                </span>
              </div>
            </div>

            {/* Metric 3: Moisture */}
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6E6E73]">
                <span>Влажность повязки</span>
                <Droplets className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
                <span className={displayPatient.humidity >= 80 ? 'text-[#FF3B30]' : 'text-[#34C759]'}>
                  {displayPatient.humidity}%
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#86868B] flex items-center justify-between pt-1 border-t border-[#E5E5EA]">
                <span>Порог 80%</span>
                <span className={displayPatient.humidity >= 80 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759] font-medium'}>
                  {displayPatient.humidity >= 80 ? 'Замена' : 'Сухая'}
                </span>
              </div>
            </div>

            {/* Metric 4: Pulse */}
            <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#6E6E73]">
                <span>Пульс пациента</span>
                <Heart className="w-3.5 h-3.5 text-[#FF2D55]" strokeWidth={2} />
              </div>
              <div className="text-2xl font-bold text-[#1D1D1F] tabular-nums tracking-tight">
                {displayPatient.heartRate}{' '}
                <span className="text-xs font-normal text-[#86868B]">уд/м</span>
              </div>
              <div className="text-[10px] font-mono text-[#86868B] flex items-center justify-between pt-1 border-t border-[#E5E5EA]">
                <span>MAX30102 PPG</span>
                <span className="text-[#34C759] font-medium">Ритм norm</span>
              </div>
            </div>
          </div>

          {/* Apple Health Style Interactive SVG Telemetry Chart with Hairline Scrubber */}
          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E5E5EA]">
              <div>
                <h2 className="text-sm font-semibold text-[#1D1D1F] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
                  <span>Синхронизированная телеметрическая кривая (Apple Health Scrubber)</span>
                </h2>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Наведите курсор на график для считывания точных замеров в каждой точке
                </p>
              </div>

              {/* Scrubber Readout Badge */}
              <div className="flex items-center gap-2 text-xs bg-[#F2F2F7] px-3 py-1.5 rounded-lg border border-[#E5E5EA] font-mono">
                <Clock className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={1.5} />
                <span className="text-[#1D1D1F] font-bold">{activeReadout.time}</span>
                <span className="text-[#D1D1D6]">|</span>
                <span className="text-[#FF3B30] font-bold">{activeReadout.tempWound}°C</span>
                <span className="text-[#D1D1D6]">|</span>
                <span className="text-[#007AFF]">
                  ΔT +{activeReadout.delta || (activeReadout.tempWound - activeReadout.tempBody).toFixed(1)}°
                </span>
                <span className="text-[#D1D1D6]">|</span>
                <span className="text-[#34C759]">{activeReadout.humidity}% вл.</span>
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
                  <linearGradient id="woundAreaGradLight" x1="0" y1="0" x2="0" y2="1">
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
                  Базовая норма 36.6°C
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
                  Порог гипертермии 37.5°C
                </text>

                {/* Wound Area Glow */}
                <path d={woundAreaPath} fill="url(#woundAreaGradLight)" />

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

                {/* Nodes on Wound Temp Curve */}
                {historySeries.map((d, i) => {
                  const x = getX(i);
                  const yWound = getTempY(d.tempWound);
                  const isHovered = hoveredDataPoint && hoveredDataPoint.idx === i;
                  const isScrubbed = activeIndex === i;
                  const isHigh = d.tempWound >= 37.5;

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
                      {/* X-axis time label */}
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

                {/* Apple Health Hairline Vertical Scrubber */}
                {(hoveredDataPoint || activeReadout) && (
                  <g className="chart-scrubber-line">
                    <line
                      x1={activeReadout.x}
                      y1={padding.top}
                      x2={activeReadout.x}
                      y2={chartHeight - padding.bottom}
                      stroke="#007AFF"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    {/* Ring highlight on wound node */}
                    <circle
                      cx={activeReadout.x}
                      cy={activeReadout.yWound}
                      r="8"
                      fill="none"
                      stroke="#FF3B30"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* 3-Point Algorithmic Dynamic Verification Steps */}
          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
              <div>
                <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                  <span>3-Точечная верификация алгоритма HealthBand</span>
                </h3>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  Исключение ложных тревог: нагрев одеялом исключается при синхронном росте Т тела
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  displayPatient.status === 'alert'
                    ? 'bg-[#FFEBEA] text-[#D70015] border border-[#FF3B30]/30'
                    : 'bg-[#EBF9EE] text-[#248A3D] border border-[#34C759]/30'
                }`}
              >
                {displayPatient.status === 'alert' ? '3/3 ПОДТВЕРЖДЕНО' : 'ГОМЕОСТАЗ'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {/* Step 1 */}
              <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1D1D1F]">1. Первичная девиация</span>
                  <span className="font-mono text-[#86868B] text-[10px]">{p1.time}</span>
                </div>
                <div className="text-[11px] font-mono text-[#6E6E73]">
                  Т раны: <span className="text-[#1D1D1F] font-bold">{p1.tempWound}°C</span> • ΔT: +{(p1.tempWound - p1.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-[#86868B] leading-tight pt-1">
                  Начало температурного отклонения. Зуммер заблокирован для накопления выборки.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1D1D1F]">2. Фильтр артефакта</span>
                  <span className="font-mono text-[#86868B] text-[10px]">{p2.time}</span>
                </div>
                <div className="text-[11px] font-mono text-[#6E6E73]">
                  Т раны: <span className="text-[#1D1D1F] font-bold">{p2.tempWound}°C</span> • ΔT: +{(p2.tempWound - p2.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-[#86868B] leading-tight pt-1">
                  Проверка одеяла: ΔT &gt; 1.0°C подтверждает локальный очаг, а не прогрев тела.
                </p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  displayPatient.status === 'alert'
                    ? 'bg-[#FFEBEA]/60 border-[#FF3B30]/40'
                    : 'bg-[#F9F9FB] border-[#E5E5EA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1D1D1F]">3. Решение триажа</span>
                  <span className="font-mono text-[#86868B] text-[10px]">{p3.time}</span>
                </div>
                <div className="text-[11px] font-mono text-[#6E6E73]">
                  Т раны: <span className="text-[#1D1D1F] font-bold">{p3.tempWound}°C</span> • ΔT: +{(p3.tempWound - p3.tempBody).toFixed(1)}°
                </div>
                <p className="text-[10px] text-[#86868B] leading-tight pt-1">
                  {displayPatient.status === 'alert'
                    ? 'Стойкий тренд 3 цикла. Активирован вызов дежурной медсестры.'
                    : 'Гомеостаз стабилен. Бактериального воспаления не выявлено.'}
                </p>
              </div>
            </div>
          </div>

          {/* MacWhisper Transcript-Style Chronological Event Stream */}
          <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5EA]">
              <div>
                <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                  <span>MacWhisper Хронологический транскрипт телеметрии</span>
                </h3>
                <p className="text-[11px] text-[#6E6E73] mt-0.5">
                  Таймкоды и маркеры источников: синхронизировано с нижним плеером скраббера
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#86868B]">
                {transcriptEvents.length} сегментов
              </span>
            </div>

            {/* Transcript Bubbles Stream */}
            <div className="space-y-3">
              {transcriptEvents.map((evt, idx) => {
                const isSelected = activeIndex === evt.historyIndex;
                const isEvtAlert = evt.metrics.status === 'alert';

                return (
                  <div
                    key={evt.id}
                    onClick={() => setPlaybackIndex(evt.historyIndex)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E5F1FF]/60 border-[#007AFF] shadow-xs'
                        : 'bg-[#F9F9FB] border-[#E5E5EA] hover:border-[#D1D1D6]'
                    }`}
                  >
                    {/* Header: Timestamp pill, speaker badge, metric badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-1.5 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        {/* Timecode Pill */}
                        <span className="font-mono text-[11px] font-bold text-[#6E6E73] bg-white px-2 py-0.5 rounded border border-[#E5E5EA] shadow-2xs">
                          [{evt.timecode}]
                        </span>

                        {/* Speaker Badge */}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${evt.avatarBg}`}
                        >
                          <span>{evt.speaker}</span>
                        </span>
                      </div>

                      {/* Right Telemetry Badge */}
                      <div className="flex items-center gap-2 text-[11px] font-mono">
                        <span className={isEvtAlert ? 'text-[#FF3B30] font-bold' : 'text-[#1D1D1F]'}>
                          {evt.metrics.temp}
                        </span>
                        <span className="text-[#007AFF]">ΔT {evt.metrics.delta}</span>
                        <span className="text-[#34C759]">{evt.metrics.humidity}</span>
                      </div>
                    </div>

                    {/* Speech / Telemetry Transcript Text */}
                    <p className="text-xs text-[#1D1D1F] leading-relaxed mt-2 font-normal">
                      {evt.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
