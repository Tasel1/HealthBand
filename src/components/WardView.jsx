import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Droplets,
  Heart,
  ChevronRight,
  Wifi,
  Search,
  Check,
  X,
  ArrowUpRight,
  ShieldAlert,
  Battery
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

export default function WardView({ onSelectPatient }) {
  const {
    patients,
    alertCount,
    warningCount,
    normalCount,
    selectedPatientId,
    setSelectedPatientId,
    mode
  } = useHealthBand();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [triageNotice, setTriageNotice] = useState(null);

  // Active patient for instantaneous detail preview drawer
  const activeDetailPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  const filteredPatients = patients.filter((p) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'alert'
        ? p.status === 'alert'
        : filter === 'warning'
        ? p.status === 'warning'
        : p.status === 'normal';
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ward.toLowerCase().includes(search.toLowerCase()) ||
      p.sensorId.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRowClick = (patientId) => {
    setSelectedPatientId(patientId);
  };

  const handleOpenTelemetry = (patientId) => {
    setSelectedPatientId(patientId);
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
  };

  const handleAcceptAlarm = (patientName) => {
    audioService.unlock();
    audioService.playConfirmBlip();
    setTriageNotice({
      type: 'accept',
      text: `Вызов по койке ${patientName} принят дежурной медсестрой. Оповещение переведено в режим обработки.`
    });
    setTimeout(() => setTriageNotice(null), 6000);
  };

  const handleChangeBandage = (patientName) => {
    audioService.unlock();
    audioService.playConfirmBlip();
    setTriageNotice({
      type: 'bandage',
      text: `Назначена внеплановая смена повязки для пациента ${patientName}. На пост передан протокол подготовки.`
    });
    setTimeout(() => setTriageNotice(null), 6000);
  };

  // Find most critical patient for urgent triage banner
  const urgentPatient = patients.find((p) => p.status === 'alert');

  return (
    <div className="space-y-5">
      {/* Top Clinical Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Всего коек на посту</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {patients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">4 активных сенсорных модуля</div>
        </div>

        <div className={`rounded-lg p-3.5 border ${
          alertCount > 0
            ? 'bg-rose-950/30 border-rose-800/80 text-rose-200'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="text-xs font-medium flex items-center justify-between">
            <span>Критические тревоги</span>
            {alertCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
          </div>
          <div className={`text-2xl font-bold mt-1 tabular-nums ${alertCount > 0 ? 'text-rose-300' : 'text-white'}`}>
            {alertCount}
          </div>
          <div className="text-[11px] mt-0.5 opacity-80">
            {alertCount > 0 ? 'Требуется осмотр хирурга' : 'Патологий не выявлено'}
          </div>
        </div>

        <div className={`rounded-lg p-3.5 border ${
          warningCount > 0
            ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
            : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          <div className="text-xs font-medium">Повышенное внимание</div>
          <div className={`text-2xl font-bold mt-1 tabular-nums ${warningCount > 0 ? 'text-amber-300' : 'text-white'}`}>
            {warningCount}
          </div>
          <div className="text-[11px] mt-0.5 opacity-80">Пограничная влажность / субфебрилитет</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400 font-medium">Стабильное заживление</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {normalCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Температурный гомеостаз в норме</div>
        </div>
      </div>

      {/* Urgent Action Bar for Active Alarms */}
      {urgentPatient && (
        <div className="bg-rose-950/50 border border-rose-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-rose-900 border border-rose-700 flex items-center justify-center text-rose-200 shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-rose-300" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-200 uppercase tracking-wide">
                  Неотложный сигнал тревоги: {urgentPatient.ward}, {urgentPatient.bed}
                </span>
                <span className="text-xs text-rose-300 font-medium">({urgentPatient.name})</span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5 max-w-3xl">
                {urgentPatient.alertDetails || 'Обнаружен прогрессирующий рост температуры раны и критическое промокание повязки.'}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0 self-start md:self-center">
            <button
              onClick={() => handleAcceptAlarm(urgentPatient.name)}
              className="px-3 py-1.5 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-xs font-medium border border-rose-700 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Принять вызов</span>
            </button>
            <button
              onClick={() => handleChangeBandage(urgentPatient.name)}
              className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
              <span>Сменить повязку</span>
            </button>
            <button
              onClick={() => handleOpenTelemetry(urgentPatient.id)}
              className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <span>Телеметрия</span>
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* Triage feedback banner if action executed */}
      {triageNotice && (
        <div className="bg-slate-900 border border-cyan-800/80 text-cyan-200 rounded-lg p-3 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" strokeWidth={2} />
            <span>{triageNotice.text}</span>
          </div>
          <button
            onClick={() => setTriageNotice(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-lg p-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" strokeWidth={2} />
          <input
            type="text"
            placeholder="Поиск по ФИО, койке, диагнозу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Все ({patients.length})
          </button>
          <button
            onClick={() => setFilter('alert')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'alert'
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800 font-semibold'
                : 'text-rose-400 hover:text-rose-200'
            }`}
          >
            Тревоги ({alertCount})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'warning'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800 font-semibold'
                : 'text-amber-400 hover:text-amber-200'
            }`}
          >
            Контроль ({warningCount})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === 'normal'
                ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-800 font-semibold'
                : 'text-emerald-400 hover:text-emerald-200'
            }`}
          >
            Норма ({normalCount})
          </button>
        </div>
      </div>

      {/* Main Clinical Console: Bed Matrix Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Dense Bed Matrix Table (7 cols on lg, 12 on full) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Матрица коек хирургического отделения</span>
            <span>Кликните по строке для быстрого анализа</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider select-none">
                <tr>
                  <th className="py-2.5 px-3">Койка</th>
                  <th className="py-2.5 px-3">Пациент</th>
                  <th className="py-2.5 px-3 text-right">Повязка</th>
                  <th className="py-2.5 px-3 text-right">Т раны</th>
                  <th className="py-2.5 px-3 text-right">Т тела</th>
                  <th className="py-2.5 px-3 text-right">ΔT</th>
                  <th className="py-2.5 px-3 text-right">Влажность</th>
                  <th className="py-2.5 px-3 text-right">Пульс</th>
                  <th className="py-2.5 px-3 text-center">Статус</th>
                  <th className="py-2.5 px-3 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPatients.map((patient) => {
                  const isSelected = patient.id === selectedPatientId;
                  const isAlert = patient.status === 'alert';
                  const isWarning = patient.status === 'warning';
                  const bandageAge = BANDAGE_AGE_MAP[patient.id] || '12 ч';

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => handleRowClick(patient.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-800/80'
                          : 'hover:bg-slate-800/40 bg-slate-900/60'
                      }`}
                    >
                      {/* Bed info */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-white">{patient.bed}</div>
                        <div className="text-[11px] text-slate-400">{patient.ward}</div>
                      </td>

                      {/* Patient Name & Diagnosis */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200 whitespace-nowrap">
                          {patient.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]" title={patient.diagnosis}>
                          {patient.diagnosis}
                        </div>
                      </td>

                      {/* Bandage age & state */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="font-mono text-slate-300 text-[11px]">{bandageAge}</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[90px]">
                          {patient.humidity >= 80 ? 'Промокла' : patient.humidity >= 65 ? 'Влажная' : 'Сухая'}
                        </div>
                      </td>

                      {/* Wound Temp */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold tabular-nums text-sm ${
                            patient.tempWound >= 37.5 ? 'text-rose-400 font-bold' : 'text-slate-100'
                          }`}
                        >
                          {patient.tempWound}°C
                        </span>
                      </td>

                      {/* Body Temp */}
                      <td className="py-3 px-3 text-right whitespace-nowrap tabular-nums text-slate-400">
                        {patient.tempBody}°C
                      </td>

                      {/* Delta T */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-mono text-xs tabular-nums ${
                            patient.tempDiff >= 1.0
                              ? 'text-rose-400 font-bold'
                              : patient.tempDiff >= 0.5
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {patient.tempDiff > 0 ? `+${patient.tempDiff}` : patient.tempDiff}°C
                        </span>
                      </td>

                      {/* Humidity */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span
                          className={`font-semibold tabular-nums ${
                            patient.humidity >= 80
                              ? 'text-rose-400'
                              : patient.humidity >= 65
                              ? 'text-amber-400'
                              : 'text-teal-300'
                          }`}
                        >
                          {patient.humidity}%
                        </span>
                      </td>

                      {/* Heart rate */}
                      <td className="py-3 px-3 text-right whitespace-nowrap tabular-nums text-slate-300">
                        {patient.heartRate}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAlert
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isWarning
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {isAlert ? 'ТРЕВОГА' : isWarning ? 'КОНТРОЛЬ' : 'НОРМА'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenTelemetry(patient.id)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-300 text-slate-300 text-xs transition-colors"
                          title="Открыть детальные графики телеметрии"
                        >
                          Телеметрия
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Instantaneous Bed Detail Drawer / Clinical Inspector */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-cyan-400 font-mono">
                  {activeDetailPatient.sensorId}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300">
                  {activeDetailPatient.ward}, {activeDetailPatient.bed}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {activeDetailPatient.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeDetailPatient.diagnosis} ({activeDetailPatient.age} лет)
              </p>
            </div>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activeDetailPatient.status === 'alert'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : activeDetailPatient.status === 'warning'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {activeDetailPatient.status === 'alert'
                ? 'ТРЕВОГА'
                : activeDetailPatient.status === 'warning'
                ? 'КОНТРОЛЬ'
                : 'НОРМА'}
            </span>
          </div>

          {/* Alert Callout if present */}
          {activeDetailPatient.alertDetails && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-900/80 text-xs text-rose-200">
              <div className="font-semibold flex items-center gap-1.5 text-rose-300 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                Диагностическое оповещение HealthBand
              </div>
              <p className="text-[11px] leading-relaxed">{activeDetailPatient.alertDetails}</p>
            </div>
          )}

          {/* Vitals Matrix */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Т раны</span>
                <Thermometer className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
              </span>
              <div className="text-lg font-bold text-white mt-1 tabular-nums">
                {activeDetailPatient.tempWound}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Порог: 37.5°C
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Градиент ΔT</span>
                <span className="font-mono text-[10px] text-slate-500">Т_тела {activeDetailPatient.tempBody}°C</span>
              </span>
              <div className={`text-lg font-bold mt-1 tabular-nums font-mono ${
                activeDetailPatient.tempDiff >= 1.0 ? 'text-rose-400' : 'text-slate-200'
              }`}>
                {activeDetailPatient.tempDiff > 0 ? `+${activeDetailPatient.tempDiff}` : activeDetailPatient.tempDiff}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Порог: &ge; +1.0°C
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Влажность</span>
                <Droplets className="w-3.5 h-3.5 text-teal-400" strokeWidth={2} />
              </span>
              <div className={`text-lg font-bold mt-1 tabular-nums ${
                activeDetailPatient.humidity >= 80 ? 'text-rose-400' : 'text-white'
              }`}>
                {activeDetailPatient.humidity}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                {activeDetailPatient.bandageStatus}
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400 text-[11px] flex items-center justify-between">
                <span>Пульс</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
              </span>
              <div className="text-lg font-bold text-white mt-1 tabular-nums">
                {activeDetailPatient.heartRate}{' '}
                <span className="text-xs font-normal text-slate-400">уд/м</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                MAX30102 PPG
              </div>
            </div>
          </div>

          {/* Sensor Hardware Health */}
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Питание сенсора:</span>
              <span className="text-slate-200 font-mono flex items-center gap-1">
                <Battery className="w-3 h-3 text-emerald-400" strokeWidth={2} />
                {activeDetailPatient.battery}% (Li-Po 3.7V)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Режим энергосбережения:</span>
              <span className="text-slate-200">Deep Sleep 95% (Wake 12 с)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MAC-адрес модуля:</span>
              <span className="font-mono text-cyan-400 text-[10px]">
                {activeDetailPatient.mac || '4C:11:AE:0D:98:21'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Синхронизация:</span>
              <span className="text-slate-300 font-mono text-[10px]">
                {activeDetailPatient.lastUpdate}
              </span>
            </div>
          </div>

          {/* Quick Triage Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => handleOpenTelemetry(activeDetailPatient.id)}
              className="w-full py-2 px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Открыть полный поток телеметрии</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAcceptAlarm(activeDetailPatient.name)}
                className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Принять вызов
              </button>
              <button
                onClick={() => handleChangeBandage(activeDetailPatient.name)}
                className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Сменить повязку
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
