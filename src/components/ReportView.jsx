import React from 'react';
import {
  Printer,
  Download,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  ArrowLeft
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function ReportView({ onBackToWard }) {
  const { activePatient, historySeries, mode, liveState, patients, setSelectedPatientId } = useHealthBand();

  const isAlert = activePatient.status === 'alert';
  const isWarning = activePatient.status === 'warning';

  const allTemps = historySeries.map((h) => h.tempWound).concat([activePatient.tempWound]);
  const maxTemp = Math.max(...allTemps).toFixed(1);
  const maxDelta = (maxTemp - activePatient.tempBody).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Screen Toolbar (Hidden on Print) */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          {onBackToWard && (
            <button
              onClick={onBackToWard}
              className="p-1.5 rounded-md bg-[#161b26] hover:bg-[#1c2230] text-zinc-300 transition-colors border border-[#1c212d]"
              title="Вернуться к матрице коек"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <div>
            <div className="text-xs font-semibold text-white">
              Лист динамического наблюдения за раневым процессом
            </div>
            <div className="text-[11px] text-zinc-400">
              Форма 004/у (Телеметрический протокол HealthBand) • Пациент: {activePatient.name}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={activePatient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            aria-label="Выбрать пациента для формирования протокола"
            className="bg-[#090a0f] border border-[#1c212d] text-zinc-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.ward})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-md bg-[#161b26] hover:bg-[#1c2230] text-zinc-200 text-xs font-medium border border-[#1c212d] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
            <span>Печать протокола (A4)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Экспорт PDF</span>
          </button>
        </div>
      </div>

      {/* Official Clinical Protocol Document (Print-ready A4) */}
      <div className="bg-[#0d1017] border border-[#1c212d] rounded-xl p-6 sm:p-8 space-y-6 print:border-none print:p-0 print:bg-white print:text-black print:space-y-4">
        {/* Document Header */}
        <div className="border-b border-[#1c212d] pb-4 print:border-b-2 print:border-black">
          <div className="flex justify-between items-start text-xs text-zinc-400 print:text-slate-700">
            <div>
              <div className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px] print:text-black">
                Министерство здравоохранения РК
              </div>
              <div className="text-[11px] print:text-black">
                Клиническая база кафедры госпитальной хирургии и комбустиологии
              </div>
            </div>
            <div className="text-right text-[11px] font-mono print:text-black">
              <div>Форма № 004/у (IoT)</div>
              <div>Протокол: HB-2026/0942</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight print:text-black">
              Лист динамического наблюдения за раневым процессом
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 print:text-slate-600">
              Данные непрерывного аппаратного мониторинга комплексом HealthBand (Bluetooth Low Energy)
            </p>
          </div>
        </div>

        {/* Patient Demographics Table */}
        <div className="border border-[#1c212d] rounded-lg overflow-hidden text-xs print:border-black print:rounded-none">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#1c212d] print:divide-black">
              <tr className="bg-[#090a0f] print:bg-slate-100">
                <td className="py-2 px-3 font-semibold text-zinc-400 w-1/4 print:text-black">Пациент (Ф.И.О.):</td>
                <td className="py-2 px-3 text-white font-bold w-1/4 print:text-black">{activePatient.name}</td>
                <td className="py-2 px-3 font-semibold text-zinc-400 w-1/4 print:text-black">Возраст / Пол:</td>
                <td className="py-2 px-3 text-zinc-200 w-1/4 print:text-black">{activePatient.age} лет, мужской</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-zinc-400 print:text-black">Отделение / Палата:</td>
                <td className="py-2 px-3 text-zinc-200 print:text-black">Гнойная хирургия • {activePatient.ward}, {activePatient.bed}</td>
                <td className="py-2 px-3 font-semibold text-zinc-400 print:text-black">№ Истории болезни:</td>
                <td className="py-2 px-3 font-mono text-zinc-200 print:text-black">#ХИР-2026/0942</td>
              </tr>
              <tr className="bg-[#090a0f] print:bg-slate-100">
                <td className="py-2 px-3 font-semibold text-zinc-400 print:text-black">Клинический диагноз:</td>
                <td colSpan={3} className="py-2 px-3 text-white font-medium print:text-black">
                  {activePatient.diagnosis}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-zinc-400 print:text-black">ID повязки / MAC:</td>
                <td className="py-2 px-3 font-mono text-cyan-300 print:text-black">{activePatient.sensorId} ({activePatient.mac || '4C:11:AE:0D:98:21'})</td>
                <td className="py-2 px-3 font-semibold text-zinc-400 print:text-black">Лечащий хирург:</td>
                <td className="py-2 px-3 text-zinc-200 print:text-black">д.м.н. Садыков Т.К.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Telemetry Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1c212d] print:bg-slate-50 print:border-black">
            <span className="text-zinc-400 block text-[11px] print:text-slate-700">Длительность телеметрии</span>
            <span className="text-base font-bold text-white mt-0.5 block print:text-black">72 часа (100% аптайм)</span>
            <span className="text-[10px] text-zinc-500 font-mono print:text-slate-600">864 пакета данных</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1c212d] print:bg-slate-50 print:border-black">
            <span className="text-zinc-400 block text-[11px] print:text-slate-700">Пиковая температура раны</span>
            <span className={`text-base font-bold mt-0.5 block print:text-black ${
              maxTemp >= 37.5 ? 'text-rose-400' : 'text-white'
            }`}>
              {maxTemp}°C
            </span>
            <span className="text-[10px] text-zinc-500 font-mono print:text-slate-600">ΔT пик: +{maxDelta}°C</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1c212d] print:bg-slate-50 print:border-black">
            <span className="text-zinc-400 block text-[11px] print:text-slate-700">Насыщение экссудатом</span>
            <span className={`text-base font-bold mt-0.5 block print:text-black ${
              activePatient.humidity >= 80 ? 'text-rose-400' : 'text-teal-300'
            }`}>
              {activePatient.humidity}%
            </span>
            <span className="text-[10px] text-zinc-500 print:text-slate-600 truncate block">{activePatient.bandageStatus}</span>
          </div>

          <div className="p-3 rounded-lg bg-[#090a0f] border border-[#1c212d] print:bg-slate-50 print:border-black">
            <span className="text-zinc-400 block text-[11px] print:text-slate-700">Предупреждение врача</span>
            <span className="text-base font-bold text-amber-400 mt-0.5 block print:text-black">За 14 часов</span>
            <span className="text-[10px] text-zinc-500 print:text-slate-600">До видимых признаков сепсиса</span>
          </div>
        </div>

        {/* Chronological Telemetry Events Log */}
        <div>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2 print:text-black">
            Хронологический журнал динамики раневого процесса (Замеры каждые 15 минут)
          </h2>
          <div className="border border-[#1c212d] rounded-lg overflow-hidden print:border-black print:rounded-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#090a0f] text-zinc-500 border-b border-[#1c212d] text-[11px] uppercase tracking-wider font-mono print:bg-slate-100 print:text-black print:border-black">
                <tr>
                  <th className="py-2 px-3">Время</th>
                  <th className="py-2 px-3 text-right">Т раны</th>
                  <th className="py-2 px-3 text-right">Т тела</th>
                  <th className="py-2 px-3 text-right">ΔT</th>
                  <th className="py-2 px-3 text-right">Влажность</th>
                  <th className="py-2 px-3 text-right">Пульс</th>
                  <th className="py-2 px-3">Заключение аналитической системы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c212d]/60 text-zinc-300 print:divide-slate-300 print:text-black">
                {historySeries.map((row, idx) => (
                  <tr key={idx} className="print:bg-white hover:bg-[#161b26]/40">
                    <td className="py-1.5 px-3 font-mono text-zinc-400 print:text-black">{row.time}</td>
                    <td className="py-1.5 px-3 text-right font-bold tabular-nums text-white print:text-black">{row.tempWound}°C</td>
                    <td className="py-1.5 px-3 text-right text-zinc-400 tabular-nums print:text-black">{row.tempBody}°C</td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums print:text-black">
                      +{row.delta ? row.delta : (row.tempWound - row.tempBody).toFixed(1)}°C
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-teal-300 print:text-black">{row.humidity}%</td>
                    <td className="py-1.5 px-3 text-right tabular-nums print:text-black">{row.pulse} уд/м</td>
                    <td className="py-1.5 px-3 text-[11px]">{row.note || 'Стабильное течение'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Assessment & Recommendation */}
        <div className="p-4 rounded-lg border text-xs space-y-2 bg-[#090a0f] border-[#1c212d] print:bg-white print:border-black">
          <div className="font-bold text-white flex items-center gap-2 print:text-black">
            {isAlert ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 print:hidden" strokeWidth={2} />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 print:hidden" strokeWidth={2} />
            )}
            <span>Врачебное заключение на основе алгоритма HealthBand:</span>
          </div>
          <p className="text-zinc-300 leading-relaxed print:text-slate-800">
            {isAlert ? (
              <>
                На основании непрерывного телеметрического мониторинга зафиксирован стойкий прогрессирующий
                гипертермический градиент раневого ложа (ΔT = +{activePatient.tempDiff}°C относительно опорного сенсора
                тела) в течение 3 последовательных циклов наблюдения, сопровождающийся гиперэкссудацией (насыщение
                повязки {activePatient.humidity}%). Клиническая картина соответствует{' '}
                <strong className="text-white print:text-black">острой локальной раневой инфекции</strong>.
                Показана срочная ревизия раневой полости, асептическая замена перевязочного материала и бакпосев.
              </>
            ) : isWarning ? (
              <>
                Зафиксировано пограничное повышение экссудации ({activePatient.humidity}%) при субфебрильной температуре раны.
                Рекомендован визуальный сестринский контроль повязки в течение ближайших 30 минут.
              </>
            ) : (
              <>
                Динамика температуры раневого ложа находится в пределах физиологического коридора заживления первичным
                натяжением (грануляция ткани). Термометрический градиент с телом стабилен (ΔT &le; 0.3°C), экссудат умеренный,
                повязка функциональна. Показаний к внеплановой перевязке нет.
              </>
            )}
          </p>
        </div>

        {/* Doctor & Nurse Signature Block */}
        <div className="pt-6 border-t border-[#1c212d] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-zinc-400 print:border-black print:text-black print:pt-4">
          <div>
            <div className="font-semibold text-zinc-300 print:text-black">Лечащий врач-хирург:</div>
            <div className="mt-4 border-b border-zinc-700 w-48 print:border-black"></div>
            <div className="mt-1 text-[11px]">/ д.м.н. Садыков Т.К. /</div>
          </div>

          <div>
            <div className="font-semibold text-zinc-300 print:text-black">Дежурная медсестра:</div>
            <div className="mt-4 border-b border-zinc-700 w-48 print:border-black"></div>
            <div className="mt-1 text-[11px]">/ Исаева А.Б. /</div>
          </div>

          <div className="text-right">
            <div className="font-semibold text-zinc-300 print:text-black">Печать отделения:</div>
            <div className="mt-3 inline-block w-16 h-16 rounded-full border border-dashed border-zinc-600 flex items-center justify-center text-[10px] text-zinc-500 print:border-black print:text-black">
              М.П.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
