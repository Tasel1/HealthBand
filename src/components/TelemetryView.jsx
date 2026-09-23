import React from 'react';
import {
  Activity,
  Thermometer,
  Droplets,
  Heart,
  TrendingUp,
  AlertCircle,
  Battery,
  Wifi,
  Cpu,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FlaskConical,
  RotateCw
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

  return (
    <div className="space-y-6">
      {/* Top Patient Selector & Sensor Metadata */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                IoT Telemetry Stream
              </span>
              <span className="text-xs text-slate-400">MAC: {activePatient.mac || '4C:11:AE:0D:98:21'}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                  mode === 'live' && activePatient.id === 'hb-01'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {mode === 'live' && activePatient.id === 'hb-01' ? (
                  <>
                    <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>Google Sheets Live ({liveState.totalRows} записей)</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-3 h-3 text-amber-400" />
                    <span>Demo Lab (Симулятор)</span>
                  </>
                )}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              {activePatient.name} ({activePatient.ward}, {activePatient.bed})
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{activePatient.diagnosis}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              aria-label="Выберите пациента для телеметрии"
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ward}) — {p.status === 'alert' ? 'ТРЕВОГА' : p.status === 'warning' ? 'ВНИМАНИЕ' : 'НОРМА'}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Обновлено: {activePatient.lastUpdate}</span>
            </div>

            {mode === 'live' && activePatient.id === 'hb-01' && (
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-slate-700 transition-colors disabled:opacity-50"
                title="Синхронизировать с Google Sheets"
              >
                <RotateCw className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Обновить</span>
              </button>
            )}
          </div>
        </div>

        {/* Sensor hardware health pill strip */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Контроллер: ATmega / ESP32 BLE</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Режим: {activePatient.sleepInterval || 'Deep Sleep 5 мин'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>Заряд батареи: {activePatient.battery}%</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>Шлюз BLE: Активен (RSSI -64 dBm)</span>
          </div>
        </div>
      </div>

      {/* Clinical Diagnostic Alert Card if Alert */}
      {activePatient.alertDetails && (
        <div
          className={`border rounded-xl p-4 sm:p-5 text-rose-200 flex items-start gap-4 shadow-lg ${
            isAlert
              ? 'bg-rose-950/50 border-rose-800/90 shadow-rose-950/20'
              : 'bg-amber-950/50 border-amber-800/90 shadow-amber-950/20'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isAlert ? 'bg-rose-900/80 border-rose-700 text-rose-300' : 'bg-amber-900/80 border-amber-700 text-amber-300'
            }`}
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3
              className={`font-bold text-sm sm:text-base flex items-center gap-2 ${
                isAlert ? 'text-rose-100' : 'text-amber-100'
              }`}
            >
              АЛГОРИТМ HEALTHBAND: {isAlert ? 'ОБНАРУЖЕН РАННИЙ МАРКЕР ВОСПАЛЕНИЯ' : 'ТРЕБУЕТСЯ ВНИМАНИЕ'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200/90 mt-1 leading-relaxed">
              {activePatient.alertDetails}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-slate-900/80 px-2 py-0.5 rounded text-cyan-300 border border-slate-700 font-mono">
                Правило: 3 замера подряд &gt; 37.5°C
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded text-rose-300 border border-slate-700 font-mono">
                Δ(Т_раны - Т_тела) = {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C
              </span>
              <span className="bg-slate-900/80 px-2 py-0.5 rounded text-teal-300 border border-slate-700 font-mono">
                Влажность = {activePatient.humidity}% ({activePatient.bandageStatus})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic 3-Point Trend Clinical Indicator Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Динамический 3-точечный алгоритм фильтрации артефактов
              </h2>
              <p className="text-xs text-slate-400">
                Клиническое правило: тревога активируется только при стойком 3-кратном росте температуры
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-md text-xs font-bold font-mono self-start md:self-center ${
              isAlert
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : isWarning
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {isAlert ? 'КРИТИЧЕСКИЙ ТРЕНД' : isWarning ? 'ПРЕДУПРЕЖДЕНИЕ' : 'ТРЕНД СТАБИЛЕН'}
          </span>
        </div>

        {/* 3-Point Checklist Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Критерий 1: Порог гипертермии</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white font-bold text-sm">Т раны &gt; 37.5°C</span>
              <span className={`font-mono font-bold ${activePatient.tempWound >= 37.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {activePatient.tempWound >= 37.5 ? 'ДА' : 'НЕТ'} ({activePatient.tempWound}°C)
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Критерий 2: Дифференциал с телом</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white font-bold text-sm">ΔT &ge; +1.0°C</span>
              <span className={`font-mono font-bold ${activePatient.tempDiff >= 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {activePatient.tempDiff >= 1.0 ? 'ДА' : 'НЕТ'} (+{activePatient.tempDiff}°C)
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Критерий 3: Насыщение экссудатом</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white font-bold text-sm">Влажность &ge; 80%</span>
              <span className={`font-mono font-bold ${activePatient.humidity >= 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {activePatient.humidity >= 80 ? 'ДА (Промокла)' : 'НЕТ (Норма)'} ({activePatient.humidity}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Wound Temp */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Температура раны</span>
            <Thermometer className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{activePatient.tempWound}°C</span>
            <span
              className={`text-xs font-semibold flex items-center ${
                activePatient.tempDiff >= 1.0 ? 'text-rose-400' : 'text-cyan-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full ${activePatient.tempWound > 37.5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, Math.max(10, ((activePatient.tempWound - 35) / 5) * 100))}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Порог тревоги: &gt; 37.5°C (текущее: {activePatient.tempWound}°C)
          </p>
        </div>

        {/* Metric 2: Body Temp & Gradient */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Температура тела</span>
            <Thermometer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{activePatient.tempBody}°C</span>
            <span className="text-xs font-medium text-slate-400 font-mono">
              Δ {activePatient.tempDiff > 0 ? `+${activePatient.tempDiff}` : activePatient.tempDiff}°C
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${Math.min(100, Math.max(10, ((activePatient.tempBody - 35) / 5) * 100))}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Базовый контроль исключает ложные тревоги
          </p>
        </div>

        {/* Metric 3: Wound Moisture / Exudate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Влажность повязки</span>
            <Droplets className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{activePatient.humidity}%</span>
            <span
              className={`text-xs font-semibold ${
                activePatient.humidity >= 80
                  ? 'text-rose-400'
                  : activePatient.humidity >= 65
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {activePatient.humidity >= 80 ? 'Промокание' : 'Норма'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full ${
                activePatient.humidity >= 80
                  ? 'bg-rose-500'
                  : activePatient.humidity >= 65
                  ? 'bg-amber-500'
                  : 'bg-teal-500'
              }`}
              style={{ width: `${activePatient.humidity}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Порог смены повязки: &gt; 80% (насыщение)
          </p>
        </div>

        {/* Metric 4: System Heart Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Пульс пациента</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{activePatient.heartRate}</span>
            <span className="text-xs text-slate-400 font-mono">уд/мин</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className={`h-full ${activePatient.heartRate > 95 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, (activePatient.heartRate / 140) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Тахикардия при воспалительном ответе
          </p>
        </div>
      </div>

      {/* Historical Trend Table & Chart Representation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Временной ряд: Динамика показателей раны
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Аналитический скрипт сравнивает каждые 3 последовательных замера
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {mode === 'live' && activePatient.id === 'hb-01' ? 'Источник: Google Sheets Live' : 'Источник: Demo Lab'}
          </span>
        </div>

        {/* Trend Bar Visualization */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 py-4 px-2 bg-slate-950 rounded-xl border border-slate-800/80 mb-5">
          {historySeries.map((step, idx) => {
            const isHigh = step.tempWound >= 38.0;
            const isRising = idx > 0 && step.tempWound > historySeries[idx - 1].tempWound;
            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[11px] font-mono font-semibold text-slate-300">
                  {step.tempWound}°C
                </span>
                <div className="w-full max-w-[36px] bg-slate-800 rounded-md h-24 my-2 flex items-end p-1">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      isHigh
                        ? 'bg-rose-500 shadow-md shadow-rose-500/30'
                        : isRising
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                    style={{ height: `${Math.max(20, Math.min(100, ((step.tempWound - 35) / 4) * 100))}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{step.time}</span>
                <span className="text-[10px] text-teal-400 mt-0.5">{step.humidity}%</span>
              </div>
            );
          })}
        </div>

        {/* Detailed Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Время</th>
                <th className="py-2.5 px-3">Т раны (°C)</th>
                <th className="py-2.5 px-3">Т тела (°C)</th>
                <th className="py-2.5 px-3">Разница ΔT</th>
                <th className="py-2.5 px-3">Влажность</th>
                <th className="py-2.5 px-3">Пульс</th>
                <th className="py-2.5 px-3">Заключение аналитика</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {historySeries.map((row, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-mono text-slate-400">{row.time}</td>
                  <td className="py-2 px-3 font-bold text-white">{row.tempWound}°C</td>
                  <td className="py-2 px-3">{row.tempBody}°C</td>
                  <td className="py-2 px-3 font-mono">
                    {row.delta ? (row.delta > 0 ? `+${row.delta}` : row.delta) : `+${(row.tempWound - row.tempBody).toFixed(1)}`}°C
                  </td>
                  <td className="py-2 px-3 text-teal-300 font-semibold">{row.humidity}%</td>
                  <td className="py-2 px-3">{row.pulse} уд/мин</td>
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
