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
  const { displayPatient, historySeries, mode, liveState, patients, setSelectedPatientId } = useHealthBand();

  const isAlert = displayPatient.status === 'alert';
  const isWarning = displayPatient.status === 'warning';

  const allTemps = historySeries.map((h) => h.tempWound).concat([displayPatient.tempWound]);
  const maxTemp = Math.max(...allTemps).toFixed(1);
  const maxDelta = (maxTemp - displayPatient.tempBody).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Screen Toolbar (Hidden on Print) */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs print:hidden">
        <div className="flex items-center gap-3">
          {onBackToWard && (
            <button
              onClick={onBackToWard}
              className="p-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] transition-colors border border-[#E5E5EA] shadow-2xs"
              title="Вернуться к матрице коек"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <div>
            <div className="text-xs font-bold text-[#1D1D1F]">
              Лист динамического наблюдения за раневым процессом
            </div>
            <div className="text-[11px] text-[#6E6E73]">
              Форма 004/у (Телеметрический протокол HealthBand) • Пациент: {displayPatient.name}
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={displayPatient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            aria-label="Выбрать пациента для формирования протокола"
            className="bg-white border border-[#E5E5EA] text-[#1D1D1F] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#007AFF] shadow-2xs cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.ward})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] text-xs font-medium border border-[#E5E5EA] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
            <span>Печать протокола (A4)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Экспорт PDF</span>
          </button>
        </div>
      </div>

      {/* Official Clinical Protocol Document (Print-ready A4) */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs print:border-none print:p-0 print:shadow-none print:space-y-4">
        {/* Document Header */}
        <div className="border-b border-[#E5E5EA] pb-4 print:border-b-2 print:border-black">
          <div className="flex justify-between items-start text-xs text-[#6E6E73] print:text-black">
            <div>
              <div className="font-bold text-[#1D1D1F] uppercase tracking-wider text-[10px] print:text-black">
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
            <h1 className="text-base sm:text-lg font-bold text-[#1D1D1F] uppercase tracking-tight print:text-black">
              Лист динамического наблюдения за раневым процессом
            </h1>
            <p className="text-xs text-[#6E6E73] mt-0.5 print:text-slate-700">
              Данные непрерывного аппаратного мониторинга комплексом HealthBand (Bluetooth Low Energy)
            </p>
          </div>
        </div>

        {/* Patient Demographics Table */}
        <div className="border border-[#E5E5EA] rounded-xl overflow-hidden text-xs print:border-black print:rounded-none">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-[#E5E5EA] print:divide-black">
              <tr className="bg-[#F9F9FB] print:bg-slate-100">
                <td className="py-2 px-3 font-semibold text-[#6E6E73] w-1/4 print:text-black">Пациент (Ф.И.О.):</td>
                <td className="py-2 px-3 text-[#1D1D1F] font-bold w-1/4 print:text-black">{displayPatient.name}</td>
                <td className="py-2 px-3 font-semibold text-[#6E6E73] w-1/4 print:text-black">Возраст / Пол:</td>
                <td className="py-2 px-3 text-[#1D1D1F] w-1/4 print:text-black">{displayPatient.age} лет, мужской</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#6E6E73] print:text-black">Отделение / Палата:</td>
                <td className="py-2 px-3 text-[#1D1D1F] print:text-black">Гнойная хирургия • {displayPatient.ward}, {displayPatient.bed}</td>
                <td className="py-2 px-3 font-semibold text-[#6E6E73] print:text-black">№ Истории болезни:</td>
                <td className="py-2 px-3 font-mono text-[#1D1D1F] print:text-black">#ХИР-2026/0942</td>
              </tr>
              <tr className="bg-[#F9F9FB] print:bg-slate-100">
                <td className="py-2 px-3 font-semibold text-[#6E6E73] print:text-black">Клинический диагноз:</td>
                <td colSpan={3} className="py-2 px-3 text-[#1D1D1F] font-medium print:text-black">
                  {displayPatient.diagnosis}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#6E6E73] print:text-black">ID повязки / MAC:</td>
                <td className="py-2 px-3 font-mono text-[#007AFF] print:text-black">{displayPatient.sensorId} ({displayPatient.mac || '4C:11:AE:0D:98:21'})</td>
                <td className="py-2 px-3 font-semibold text-[#6E6E73] print:text-black">Лечащий хирург:</td>
                <td className="py-2 px-3 text-[#1D1D1F] print:text-black">д.м.н. Садыков Т.К.</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Telemetry Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E5E5EA] print:bg-slate-50 print:border-black">
            <span className="text-[#6E6E73] block text-[11px] print:text-black">Длительность телеметрии</span>
            <span className="text-base font-bold text-[#1D1D1F] mt-0.5 block print:text-black">72 часа (100% аптайм)</span>
            <span className="text-[10px] text-[#86868B] font-mono print:text-slate-600">864 пакета данных</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E5E5EA] print:bg-slate-50 print:border-black">
            <span className="text-[#6E6E73] block text-[11px] print:text-black">Пиковая температура раны</span>
            <span className={`text-base font-bold mt-0.5 block print:text-black ${
              maxTemp >= 37.5 ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'
            }`}>
              {maxTemp}°C
            </span>
            <span className="text-[10px] text-[#86868B] font-mono print:text-slate-600">ΔT пик: +{maxDelta}°C</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E5E5EA] print:bg-slate-50 print:border-black">
            <span className="text-[#6E6E73] block text-[11px] print:text-black">Насыщение экссудатом</span>
            <span className={`text-base font-bold mt-0.5 block print:text-black ${
              displayPatient.humidity >= 80 ? 'text-[#FF3B30]' : 'text-[#34C759]'
            }`}>
              {displayPatient.humidity}%
            </span>
            <span className="text-[10px] text-[#86868B] print:text-slate-600 truncate block">{displayPatient.bandageStatus}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#F9F9FB] border border-[#E5E5EA] print:bg-slate-50 print:border-black">
            <span className="text-[#6E6E73] block text-[11px] print:text-black">Предупреждение врача</span>
            <span className="text-base font-bold text-[#FF9500] mt-0.5 block print:text-black">За 14 часов</span>
            <span className="text-[10px] text-[#86868B] print:text-slate-600">До видимых признаков сепсиса</span>
          </div>
        </div>

        {/* Chronological Telemetry Events Log */}
        <div>
          <h2 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider mb-2 print:text-black">
            Хронологический журнал динамики раневого процесса (Замеры каждые 15 минут)
          </h2>
          <div className="border border-[#E5E5EA] rounded-xl overflow-hidden print:border-black print:rounded-none">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F9F9FB] text-[#86868B] border-b border-[#E5E5EA] text-[11px] uppercase tracking-wider font-mono print:bg-slate-100 print:text-black print:border-black">
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
              <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F] print:divide-slate-300 print:text-black">
                {historySeries.map((row, idx) => (
                  <tr key={idx} className="print:bg-white hover:bg-[#F9F9FB]">
                    <td className="py-1.5 px-3 font-mono text-[#6E6E73] print:text-black">{row.time}</td>
                    <td className="py-1.5 px-3 text-right font-bold tabular-nums text-[#1D1D1F] print:text-black">{row.tempWound}°C</td>
                    <td className="py-1.5 px-3 text-right text-[#6E6E73] tabular-nums print:text-black">{row.tempBody}°C</td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums text-[#007AFF] print:text-black">
                      +{row.delta ? row.delta : (row.tempWound - row.tempBody).toFixed(1)}°C
                    </td>
                    <td className="py-1.5 px-3 text-right tabular-nums text-[#34C759] print:text-black">{row.humidity}%</td>
                    <td className="py-1.5 px-3 text-right tabular-nums print:text-black">{row.pulse} уд/м</td>
                    <td className="py-1.5 px-3 text-[11px]">{row.note || 'Стабильное течение'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Assessment & Recommendation */}
        <div className="p-4 rounded-xl border text-xs space-y-2 bg-[#F9F9FB] border-[#E5E5EA] print:bg-white print:border-black">
          <div className="font-bold text-[#1D1D1F] flex items-center gap-2 print:text-black">
            {isAlert ? (
              <AlertTriangle className="w-4 h-4 text-[#FF3B30] shrink-0 print:hidden" strokeWidth={2} />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#007AFF] shrink-0 print:hidden" strokeWidth={2} />
            )}
            <span>Врачебное заключение на основе алгоритма HealthBand:</span>
          </div>
          <p className="text-[#1D1D1F] leading-relaxed print:text-slate-800">
            {isAlert ? (
              <>
                На основании непрерывного телеметрического мониторинга зафиксирован стойкий прогрессирующий
                гипертермический градиент раневого ложа (ΔT = +{displayPatient.tempDiff}°C относительно опорного сенсора
                тела) в течение 3 последовательных циклов наблюдения, сопровождающийся гиперэкссудацией (насыщение
                повязки {displayPatient.humidity}%). Клиническая картина соответствует{' '}
                <strong className="text-[#D70015] print:text-black">острой локальной раневой инфекции</strong>.
                Показана срочная ревизия раневой полости, асептическая замена перевязочного материала и бакпосев.
              </>
            ) : isWarning ? (
              <>
                Зафиксировано пограничное повышение экссудации ({displayPatient.humidity}%) при субфебрильной температуре раны.
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
        <div className="pt-6 border-t border-[#E5E5EA] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#6E6E73] print:border-black print:text-black print:pt-4">
          <div>
            <div className="font-bold text-[#1D1D1F] print:text-black">Лечащий врач-хирург:</div>
            <div className="mt-4 border-b border-[#D1D1D6] w-48 print:border-black"></div>
            <div className="mt-1 text-[11px]">/ д.м.н. Садыков Т.К. /</div>
          </div>

          <div>
            <div className="font-bold text-[#1D1D1F] print:text-black">Дежурная медсестра:</div>
            <div className="mt-4 border-b border-[#D1D1D6] w-48 print:border-black"></div>
            <div className="mt-1 text-[11px]">/ Исаева А.Б. /</div>
          </div>

          <div className="text-right">
            <div className="font-bold text-[#1D1D1F] print:text-black">Печать отделения:</div>
            <div className="mt-3 inline-block w-16 h-16 rounded-full border border-dashed border-[#86868B] flex items-center justify-center text-[10px] text-[#86868B] print:border-black print:text-black">
              М.П.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
