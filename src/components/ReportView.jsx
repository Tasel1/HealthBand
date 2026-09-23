import React from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Share2,
  Radio,
  FlaskConical
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function ReportView() {
  const { activePatient, historySeries, mode, liveState } = useHealthBand();

  const isAlert = activePatient.status === 'alert';
  const isWarning = activePatient.status === 'warning';

  // Compute peak temperature across history and current telemetry
  const allTemps = historySeries.map((h) => h.tempWound).concat([activePatient.tempWound]);
  const maxTemp = Math.max(...allTemps).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              Clinical Discharge & Audit
            </span>
            <span className="text-xs text-slate-400">Форма № 027/у (IoT Дополнение)</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                mode === 'live'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {mode === 'live' ? (
                <>
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Google Sheets Live
                </>
              ) : (
                <>
                  <FlaskConical className="w-3 h-3 text-amber-400" /> Demo Lab Симулятор
                </>
              )}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            Клинический отчет динамики заживления раны
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Сформировано на основе объективных телеметрических данных повязки HealthBand
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Печать отчета</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт PDF</span>
          </button>
        </div>
      </div>

      {/* Main Medical Report Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        {/* Patient Identity Strip */}
        <div className="border-b border-slate-800 pb-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Пациент:
            </span>
            <span className="text-base font-bold text-white block mt-0.5">
              {activePatient.name}
            </span>
            <span className="text-slate-400">
              Возраст: {activePatient.age || 62} года • ИИН: 640312300189
            </span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Локализация:
            </span>
            <span className="text-slate-200 font-medium block mt-0.5">
              Отделение гнойной хирургии • {activePatient.ward}, {activePatient.bed}
            </span>
            <span className="text-slate-400">История болезни: #ХИР-2026/0942</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold">
              Лечащий врач & Датчик:
            </span>
            <span className="text-slate-200 font-medium block mt-0.5">
              д.м.н. Садыков Т.К.
            </span>
            <span className="font-mono text-cyan-400">
              {activePatient.sensorId} • {activePatient.lastUpdate}
            </span>
          </div>
        </div>

        {/* Diagnosis & Summary Metrics */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Клинический диагноз:
            </span>
            <p className="text-sm text-slate-100 font-medium mt-0.5">
              {activePatient.diagnosis}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Длительность мониторинга</span>
              <span className="text-lg font-bold text-white mt-1 block">72 часа</span>
              <span className="text-[10px] text-emerald-400">
                {mode === 'live' ? `${liveState.totalRows} зафиксированных точек` : '864 замера (100% аптайм)'}
              </span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Макс. температура раны</span>
              <span className="text-lg font-bold text-rose-400 mt-1 block">{maxTemp}°C</span>
              <span className="text-[10px] text-slate-400">
                ΔT пик: +{(maxTemp - activePatient.tempBody).toFixed(1)}°C от тела
              </span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Состояние повязки</span>
              <span
                className={`text-lg font-bold mt-1 block ${
                  activePatient.humidity >= 80 ? 'text-rose-400' : 'text-cyan-400'
                }`}
              >
                {activePatient.humidity}%
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {activePatient.bandageStatus}
              </span>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Раннее предупреждение</span>
              <span className="text-lg font-bold text-amber-400 mt-1 block">за 14 часов</span>
              <span className="text-[10px] text-slate-400">До видимых признаков сепсиса</span>
            </div>
          </div>
        </div>

        {/* Clinical Chronology Log */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Хронологический журнал телеметрических событий и реакции системы
          </h3>
          <div className="space-y-2.5 text-xs">
            {historySeries
              .slice()
              .reverse()
              .map((row, idx) => {
                const isCrit = row.tempWound >= 38.0 || (row.note && row.note.includes('ТРЕВОГА'));
                const isWarn =
                  !isCrit && (row.tempWound >= 37.4 || (row.note && row.note.includes('Тренд')));

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 ${
                      isCrit
                        ? 'bg-rose-950/30 border-rose-900/60'
                        : isWarn
                        ? 'bg-amber-950/30 border-amber-900/60'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <span
                      className={`font-mono shrink-0 mt-0.5 ${
                        isCrit ? 'text-rose-400 font-bold' : isWarn ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {row.time}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-bold ${
                            isCrit ? 'text-rose-200' : isWarn ? 'text-amber-200' : 'text-slate-200'
                          }`}
                        >
                          {row.note} — Т раны: {row.tempWound}°C
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          Вл: {row.humidity}% • Пульс: {row.pulse} уд/м
                        </span>
                      </div>
                      <p className="text-slate-300 mt-0.5">
                        {isCrit
                          ? `Зафиксирован гипертермический очаг. Градиент относительно тела (+${(row.tempWound - row.tempBody).toFixed(1)}°C). Сигнал отправлен на сестринский пост.`
                          : isWarn
                          ? `Начальный рост показателей. Насыщение датчика экссудатом (${row.humidity}%). Фиксация тренда.`
                          : `Показатели находятся в пределах физиологической нормы. Ложных тревог нет.`}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Medical Conclusion & Recommendation */}
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            isAlert
              ? 'bg-rose-950/30 border-rose-800/60'
              : isWarning
              ? 'bg-amber-950/30 border-amber-800/60'
              : 'bg-cyan-950/20 border-cyan-800/40'
          }`}
        >
          <div
            className={`flex items-center gap-2 font-bold ${
              isAlert ? 'text-rose-300' : isWarning ? 'text-amber-300' : 'text-cyan-300'
            }`}
          >
            {isAlert ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            Автоматическое экспертное заключение HealthBand IoT:
          </div>
          <p className="text-slate-300 leading-relaxed">
            {isAlert ? (
              <>
                По совокупности признаков (прогрессирующий гипертермический градиент раны &gt;
                {activePatient.tempDiff}°C относительно тела, влажность {activePatient.humidity}% и пульс{' '}
                {activePatient.heartRate} уд/мин) состояние классифицируется как{' '}
                <strong className="text-rose-400">острая локальная раневая инфекция</strong>. Рекомендуется
                ревизия раневого канала, бактериологический посев отделяемого и назначение таргетной
                антибактериальной терапии.
              </>
            ) : isWarning ? (
              <>
                Зафиксировано пограничное повышение влажности повязки ({activePatient.humidity}%) или
                температуры ({activePatient.tempWound}°C). Рекомендуется визуальный осмотр повязки в течение
                30 минут для исключения промокания.
              </>
            ) : (
              <>
                Температурный профиль раны ({activePatient.tempWound}°C) соответствует нормальному течению
                грануляции ткани без признаков бактериальной колонизации. Повязка сухая ({activePatient.humidity}
                %), замена не требуется.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
