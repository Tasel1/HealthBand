import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Award,
  Globe,
  DollarSign,
  BatteryCharging,
  Zap,
  HelpCircle
} from 'lucide-react';

export default function AboutView() {
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 mb-4">
            <Award className="w-3.5 h-3.5" /> Научно-исследовательский проект HealthBand
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HealthBand — доступная умная повязка для раннего обнаружения раневой инфекции
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Инновационная система непрерывного мониторинга заживления ран, язв и ожогов на базе доступных IoT-технологий. Система предупреждает врача о воспалении на 10–14 часов раньше появления видимых симптомов, предотвращая сепсис и ампутации.
          </p>
        </div>
      </div>

      {/* Stanford Comparison Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950 inline-block px-2.5 py-1 rounded border border-cyan-800 mb-2">
            Бенчмарк & Международные аналоги
          </div>
          <h2 className="text-xl font-bold text-white">
            Сравнение HealthBand с разработкой Стэнфордского университета (Nature Biotechnology)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Анализ преимуществ практической применимости и экономической целесообразности в клинической практике
          </p>
        </div>

        {/* Detailed Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-slate-300 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-1/4">Критерий оценки</th>
                <th className="py-3 px-4 w-3/8 text-cyan-300 bg-cyan-950/20 border-r border-slate-800">
                  HealthBand (Наше решение)
                </th>
                <th className="py-3 px-4 w-3/8 text-slate-400">
                  Стэнфорд (Nature Biotech, 2022/2023)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {/* Row 1: Cost */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Стоимость одного комплекта
                </td>
                <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ~26 000 тенге (~$55)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Доступно для массового применения в стационарах Казахстана, хосписах и на дому.
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    &gt; $1 500 – $3 000+
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Крайне дорогостоящие гидрогели с золотыми наноэлектродами и сложной электростимуляцией.
                  </p>
                </td>
              </tr>

              {/* Row 2: Target Focus */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Клиническая концепция
                </td>
                <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-slate-800">
                  <span className="font-semibold text-cyan-300">
                    Ранняя диагностика & своевременная замена повязки
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Фиксация локального гипертермического очага и уровня промокания экссудатом.
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-slate-300">
                    Электростимуляция заживления
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Активная стимуляция током, требующая строгого контроля безопасности и риска раздражения тканей.
                  </p>
                </td>
              </tr>

              {/* Row 3: Deployment */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Инфраструктура палаты
                </td>
                <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-slate-800">
                  <div className="flex items-center gap-2 text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    1 смартфон/планшет медсестры на всю палату
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Шлюз BLE-to-Cloud агрегирует данные от десятков повязок одновременно без закупки доп. оборудования.
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-400">
                    Требуется специализированный ридер или персональное радиоустройство на койку.
                  </div>
                </td>
              </tr>

              {/* Row 4: Power Management */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Энергоэффективность
                </td>
                <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-slate-800">
                  <div className="text-emerald-300 font-semibold">
                    Режим Deep Sleep (95% времени сна)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Пробуждение на 10-15 секунд раз в 5 минут обеспечивает недели работы от компактного источника.
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-400">
                    Высокое энергопотребление контуров электростимуляции требует регулярной подзарядки.
                  </div>
                </td>
              </tr>

              {/* Row 5: Noise & False Positives */}
              <tr className="hover:bg-slate-800/30">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Защита от ложных тревог
                </td>
                <td className="py-3.5 px-4 bg-cyan-950/10 border-r border-slate-800">
                  <div className="text-cyan-300 font-semibold">
                    Алгоритм дифференциального тренда (3 замера подряд)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Фильтрует случайный нагрев под одеялом и ОРВИ за счет постоянного сравнения с температурой тела.
                  </p>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-slate-400">
                    Прямая калибровка импеданса, подверженная дрейфу при высыхании гидрогеля.
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Answers to Jury Questions Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Ключевые инженерные решения проекта HealthBand (FAQ для Жюри)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-cyan-300">
              1. Как исключить ложное срабатывание, если пациент укрылся одеялом?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              В прошивке и аналитике заложен алгоритм двойного контроля: пороговое значение (&gt;37.5°C) и проверка тренда. Тревога срабатывает <em>только если температура раны стабильно растет 3 замера подряд</em> (15 минут) и превышает базовую температуру тела на &ge;1.0°C. Кратковременное тепло от одеяла фильтруется.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-cyan-300">
              2. Почему Google Таблицы на этапе прототипа и как масштабировать?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Google Sheets — наглядный и быстрый прототип для демонстрации непрерывного сквозного цикла «Датчик &rarr; Шлюз &rarr; Облако &rarr; Аналитика». В промышленной архитектуре HealthBand Google Sheets заменяется на защищенную БД (MySQL/PostgreSQL) на сервере PythonAnywhere без изменения логики датчиков.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-cyan-300">
              3. Почему стоимость 26 000 ₸ реалистична?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              26 000 тенге — себестоимость аппаратного модуля одного пациента (высокоточные медицинские термисторы, влагозащищенный текстильный сенсор экссудата, BLE-микроконтроллер в защищенном силиконовом корпусе). При серийном производстве себестоимость снижается до 12 000–15 000 ₸.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
            <h3 className="font-bold text-sm text-cyan-300">
              4. Автономность и режим Deep Sleep
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Микроконтроллер не работает непрерывно. 95% времени чип находится в глубоком сне с микроамперным потреблением. Пробуждение происходит раз в 5 минут на 10-15 секунд для снятия показаний и отправки BLE-пакета на пост.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
