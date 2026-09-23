import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  Droplets,
  Heart,
  ChevronRight,
  BatteryCharging,
  Wifi,
  Search,
  Filter,
  Radio,
  FlaskConical,
  Gauge
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function WardView({ onSelectPatient }) {
  const {
    patients,
    alertCount,
    warningCount,
    normalCount,
    setSelectedPatientId,
    mode
  } = useHealthBand();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

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
      p.sensorId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenTelemetry = (patientId) => {
    setSelectedPatientId(patientId);
    if (onSelectPatient) {
      onSelectPatient(patientId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Клинический пост мониторинга
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Отделение гнойной хирургии и комбустиологии
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Непрерывный дистанционный контроль повязок HealthBand по BLE/Wi-Fi шлюзу
            {mode === 'live' ? (
              <span className="ml-2 inline-flex items-center gap-1 text-cyan-400 font-medium text-xs">
                <Radio className="w-3 h-3 animate-pulse" /> Поток данных: Google Sheets Live
              </span>
            ) : (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-400 font-medium text-xs">
                <FlaskConical className="w-3 h-3" /> Режим: Demo Lab (Синхронизированный симулятор)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Всего пациентов</p>
            <p className="text-3xl font-extrabold text-white mt-1">{patients.length}</p>
            <p className="text-xs text-slate-500 mt-1">4 активных повязки</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center text-cyan-400 border border-slate-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-rose-900/40 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-rose-500"></div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-rose-400">Критические тревоги</p>
            <p className="text-3xl font-extrabold text-rose-300 mt-1">{alertCount}</p>
            <p className="text-xs text-rose-400/80 mt-1">Требуется немедленный осмотр</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-950/60 flex items-center justify-center text-rose-400 border border-rose-800/50">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-400">Повышенное внимание</p>
            <p className="text-3xl font-extrabold text-amber-300 mt-1">{warningCount}</p>
            <p className="text-xs text-amber-400/80 mt-1">Экссудация / Контроль</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 flex items-center justify-center text-amber-400 border border-amber-800/50">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Стабильное заживление</p>
            <p className="text-3xl font-extrabold text-emerald-300 mt-1">{normalCount}</p>
            <p className="text-xs text-emerald-400/80 mt-1">Без воспалений и промокания</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 flex items-center justify-center text-emerald-400 border border-emerald-800/50">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по ФИО, палате или ID повязки..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Фильтр:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Все ({patients.length})
          </button>
          <button
            onClick={() => setFilter('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              filter === 'alert'
                ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                : 'bg-slate-950 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            Критические ({alertCount})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              filter === 'warning'
                ? 'bg-amber-900/80 text-amber-200 border border-amber-700'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            Внимание ({warningCount})
          </button>
          <button
            onClick={() => setFilter('normal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              filter === 'normal'
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                : 'bg-slate-950 text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            Норма ({normalCount})
          </button>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPatients.map((patient) => {
          const isAlert = patient.status === 'alert';
          const isWarning = patient.status === 'warning';
          const isLiveTarget = patient.id === 'hb-01';

          return (
            <div
              key={patient.id}
              className={`bg-slate-900 rounded-xl border transition-all hover:border-slate-600 shadow-md ${
                isAlert
                  ? 'border-rose-800/80 ring-1 ring-rose-500/20'
                  : isWarning
                  ? 'border-amber-800/70'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-base">{patient.name}</span>
                    <span className="text-xs text-slate-400">({patient.age} лет)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                      {patient.ward} • {patient.bed}
                    </span>
                    {isLiveTarget && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                          mode === 'live'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {mode === 'live' ? (
                          <>
                            <Radio className="w-2.5 h-2.5 animate-pulse" /> Google Sheets
                          </>
                        ) : (
                          <>
                            <FlaskConical className="w-2.5 h-2.5" /> Demo Lab
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{patient.diagnosis}</p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      isAlert
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : isWarning
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {isAlert ? 'ТРЕВОГА' : isWarning ? 'ВНИМАНИЕ' : 'В НОРМЕ'}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {patient.lastUpdate}
                  </div>
                </div>
              </div>

              {/* Alert notification banner if present */}
              {patient.alertDetails && (
                <div
                  className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b ${
                    isAlert
                      ? 'bg-rose-950/40 text-rose-200 border-rose-900/50'
                      : 'bg-amber-950/40 text-amber-200 border-amber-900/50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{patient.alertDetails}</span>
                </div>
              )}

              {/* Vital Metrics Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40">
                {/* Wound Temp */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Т раны</span>
                    <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {patient.tempWound}°C
                  </div>
                  <div
                    className={`text-[10px] font-mono mt-0.5 ${
                      patient.tempDiff >= 1.0 ? 'text-rose-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Δ {patient.tempDiff > 0 ? `+${patient.tempDiff}` : patient.tempDiff}°C от тела
                  </div>
                </div>

                {/* Wound Humidity */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Влажность</span>
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {patient.humidity}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {patient.bandageStatus}
                  </div>
                </div>

                {/* System Pulse */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Пульс</span>
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {patient.heartRate} <span className="text-xs font-normal text-slate-400">уд/м</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Т тела: {patient.tempBody}°C
                  </div>
                </div>

                {/* IoT Hardware Status */}
                <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Повязка</span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-mono text-cyan-300 font-semibold mt-1">
                    {patient.sensorId}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <BatteryCharging className="w-3 h-3 text-emerald-400" /> {patient.battery}% • BLE
                  </div>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 truncate max-w-[240px]">
                  Статус: <span className="text-slate-200">{patient.statusText}</span>
                </span>
                <button
                  onClick={() => handleOpenTelemetry(patient.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-colors"
                >
                  <span>Открыть телеметрию</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
