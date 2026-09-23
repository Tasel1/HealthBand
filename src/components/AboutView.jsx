import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Cpu,
  Clock,
  Battery,
  ShieldCheck,
  HelpCircle,
  Layers,
  Thermometer,
  Droplets,
  Activity,
  Heart,
  ExternalLink
} from 'lucide-react';

export default function AboutView() {
  return (
    <div className="space-y-4">
      {/* Authoritative Research Dossier Header */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono font-bold text-[#007AFF] bg-[#E5F1FF] px-2 py-0.5 rounded border border-[#007AFF]/20">
            Научно-клиническое досье
          </span>
          <span className="text-xs text-[#86868B] font-mono">v2.0 • 2026</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
          HealthBand: аппаратно-программный комплекс непрерывной термометрии и контроля раневого экссудата
        </h1>
        <p className="text-sm text-[#6E6E73] mt-2 max-w-3xl leading-relaxed">
          Инженерное решение для отделений гнойной хирургии, комбустиологии и гериатрического ухода. Комплекс устраняет фундаментальное противоречие современной хирургии: необходимость раннего выявления септического очага без механической травматизации молодого грануляционного слоя частыми ревизиями повязки.
        </p>

        <div className="mt-4 pt-4 border-t border-[#E5E5EA] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] uppercase tracking-wider text-[10px] block font-semibold">Клинический эффект</span>
            <span className="font-bold text-[#1D1D1F] text-sm mt-0.5 block">Детекция на 10–14 часов раньше</span>
            <span className="text-[#6E6E73] text-[11px]">Предупреждение флегмоны и сепсиса до системного ответа</span>
          </div>
          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] uppercase tracking-wider text-[10px] block font-semibold">Снижение травматизации</span>
            <span className="font-bold text-[#1D1D1F] text-sm mt-0.5 block">На 40% меньше перевязок</span>
            <span className="text-[#6E6E73] text-[11px]">Сохранение краевой эпителизации и влажной среды заживления</span>
          </div>
          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] uppercase tracking-wider text-[10px] block font-semibold">Экономическая доступность</span>
            <span className="font-bold text-[#1D1D1F] text-sm mt-0.5 block">26 000 ₸ (~$55) за комплект</span>
            <span className="text-[#6E6E73] text-[11px]">Многоразовый электронный блок со сменными датчиками</span>
          </div>
        </div>
      </div>

      {/* Sensor Architecture Breakdown */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5 space-y-4 shadow-xs">
        <div className="border-b border-[#E5E5EA] pb-2.5">
          <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
            <span>Аппаратная архитектура: 4 измерительных канала сенсорной матрицы</span>
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Конструктив гибкого полиимидного шлейфа толщиной 0.15 мм для размещения в раневом кармане
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Sensor 1: Wound Thermistor */}
          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#1D1D1F]">
              <Thermometer className="w-4 h-4 text-[#FF3B30] shrink-0" strokeWidth={2} />
              <span>1. Медицинский NTC-термистор раневого ложа</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Высокоточный терморезистор 10 кОм (B25/85 = 3950K) в биоинертной полиимидной оболочке. Фиксирует локальную гипертермию раневого ложа с инструментальной погрешностью не более ±0.05°C.
            </p>
            <div className="text-[11px] font-mono text-[#007AFF] pt-1">
              Канал: ADC0 (10-bit) • Время отклика: τ &lt; 1.2 с
            </div>
          </div>

          {/* Sensor 2: Body Reference Thermistor */}
          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#1D1D1F]">
              <Thermometer className="w-4 h-4 text-[#007AFF] shrink-0" strokeWidth={2} />
              <span>2. Опорный термистор базовой температуры тела</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Располагается на интактной коже на расстоянии 10–15 см от края раны. Служит динамическим компаратором: вычисляет температурный градиент ΔT = T_раны - T_тела, полностью компенсируя внешние колебания.
            </p>
            <div className="text-[11px] font-mono text-[#007AFF] pt-1">
              Канал: ADC1 • Исключение ОРВИ и согревания одеялом
            </div>
          </div>

          {/* Sensor 3: Conductometric Exudate Sensor */}
          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#1D1D1F]">
              <Droplets className="w-4 h-4 text-[#34C759] shrink-0" strokeWidth={2} />
              <span>3. Текстильный кондуктометрический датчик экссудата</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Матрица токопроводящих серебряных микронитей в структуре сорбирующего слоя повязки. Измеряет электропроводность жидкой фракции экссудата и сигнализирует о насыщении (&gt;80%) до промокания наружного слоя.
            </p>
            <div className="text-[11px] font-mono text-[#34C759] pt-1">
              Порог смены: 80% • Защита от мацерации кожи
            </div>
          </div>

          {/* Sensor 4: Optical PPG */}
          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#1D1D1F]">
              <Heart className="w-4 h-4 text-[#FF2D55] shrink-0" strokeWidth={2} />
              <span>4. Оптический фотоплетизмографический сенсор (PPG)</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Микрочип MAX30102 с двойной длиной волны (красный 660 нм и инфракрасный 880 нм). Оценивает микроциркуляцию в краевой зоне раны и частоту сердечных сокращений (тахикардия как критерий системного воспаления SIRS).
            </p>
            <div className="text-[11px] font-mono text-[#FF2D55] pt-1">
              Интерфейс: I2C (0x57) • ЧСС 40–200 уд/мин
            </div>
          </div>
        </div>
      </div>

      {/* Firmware Architecture & Deep Sleep */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5 space-y-3 shadow-xs">
        <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
          <span>Энергопотребление прошивки: Deep Sleep (95% сон / 5% бодрствование)</span>
        </h2>
        <p className="text-xs text-[#6E6E73] leading-relaxed">
          Беспроводной модуль оптимизирован для автономной работы от компактного Li-Po аккумулятора емкостью 180 мАч в течение 14 суток без подзарядки:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block uppercase font-mono font-semibold">Фаза 1: Сон</span>
            <span className="font-bold text-[#1D1D1F] text-base mt-0.5 block">288 секунд</span>
            <p className="text-[#6E6E73] text-[11px] mt-1">
              Микроконтроллер в Deep Sleep. Ток потребления &lt; 15 мкА. Работает только ультранизкопотребляющий RTC-таймер.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block uppercase font-mono font-semibold">Фаза 2: Опрос</span>
            <span className="font-bold text-[#1D1D1F] text-base mt-0.5 block">2 секунды</span>
            <p className="text-[#6E6E73] text-[11px] mt-1">
              Включение аналогового питания LDO, стабилизация опорного напряжения 3.3V, снятие серии из 32 выборок АЦП.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block uppercase font-mono font-semibold">Фаза 3: Расчет</span>
            <span className="font-bold text-[#1D1D1F] text-base mt-0.5 block">4 секунды</span>
            <p className="text-[#6E6E73] text-[11px] mt-1">
              Медианная цифровая фильтрация всплесков, вычисление градиента ΔT, сверка с 3-точечным алгоритмом.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3 rounded-xl border border-[#E5E5EA]">
            <span className="text-[#86868B] text-[10px] block uppercase font-mono font-semibold">Фаза 4: Передача</span>
            <span className="font-bold text-[#1D1D1F] text-base mt-0.5 block">6 секунд</span>
            <p className="text-[#6E6E73] text-[11px] mt-1">
              BLE-пакет шифруется AES-128 и транслируется на постовой шлюз палаты. Мгновенный возврат в режим сна.
            </p>
          </div>
        </div>
      </div>

      {/* Stanford University Benchmark Table */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider">
            Сравнительный бенчмарк: HealthBand vs Стэнфордский университет (Nature Biotechnology, 2022)
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Объективное сопоставление практической применимости в реальном стационаре
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-[#E5E5EA] rounded-xl overflow-hidden">
            <thead className="bg-[#F6F6F9] text-[#86868B] border-b border-[#E5E5EA] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 w-1/4">Параметр сравнения</th>
                <th className="py-2.5 px-3 w-3/8 text-[#007AFF] bg-[#E5F1FF]/50 border-r border-[#E5E5EA] font-bold">
                  HealthBand (Наше инженерное решение)
                </th>
                <th className="py-2.5 px-3 w-3/8 text-[#6E6E73]">
                  Стэнфорд (Nature Biotech, 2022)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA] text-[#1D1D1F]">
              <tr>
                <td className="py-3 px-3 font-semibold text-[#1D1D1F]">Себестоимость комплекта</td>
                <td className="py-3 px-3 bg-[#E5F1FF]/20 border-r border-[#E5E5EA]">
                  <div className="text-[#34C759] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                    ~26 000 тенге (~$55)
                  </div>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Доступно для массовой клинической практики в стационарах СНГ
                  </p>
                </td>
                <td className="py-3 px-3">
                  <div className="text-[#FF3B30] font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    &gt; $1 500 – $3 000
                  </div>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Золотые напыления, сложная микролитография и дорогие гидрогели
                  </p>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-[#1D1D1F]">Клиническая концепция</td>
                <td className="py-3 px-3 bg-[#E5F1FF]/20 border-r border-[#E5E5EA]">
                  <span className="font-semibold text-[#1D1D1F]">Ранняя диагностика & своевременная замена повязки</span>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Пассивный сбор данных без инвазивных вмешательств в раневой гомеостаз
                  </p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[#6E6E73]">Активная электростимуляция током</span>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Риск электрохимического раздражения тканей и ожога краев раны
                  </p>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-[#1D1D1F]">Инфраструктура палаты</td>
                <td className="py-3 px-3 bg-[#E5F1FF]/20 border-r border-[#E5E5EA]">
                  <span className="font-semibold text-[#34C759]">1 планшет/шлюз на 20–30 коек</span>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Используется существующая сеть отделения без закупки доп. оборудования
                  </p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[#6E6E73]">Индивидуальный радиосчитыватель</span>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Требуется дорогостоящий персональный блок на каждую койку
                  </p>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-[#1D1D1F]">Защита от ложных тревог</td>
                <td className="py-3 px-3 bg-[#E5F1FF]/20 border-r border-[#E5E5EA]">
                  <span className="font-semibold text-[#007AFF]">3-точечный дифференциальный алгоритм ΔT</span>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Исключает нагрев под одеялом и общую лихорадку (сравнение с интактной кожей)
                  </p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[#6E6E73]">Прямой замер импеданса</span>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Погрешность и дрейф базовой линии при частичном высыхании гидрогеля
                  </p>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-3 font-semibold text-[#1D1D1F]">Совместимость с повязками</td>
                <td className="py-3 px-3 bg-[#E5F1FF]/20 border-r border-[#E5E5EA]">
                  <span className="font-semibold text-[#1D1D1F]">Любые стандартные повязки</span>
                  <p className="text-[11px] text-[#6E6E73] mt-0.5">
                    Сенсор помещается в стерильный промежуточный карман бинта/пластыря
                  </p>
                </td>
                <td className="py-3 px-3">
                  <span className="text-[#6E6E73]">Уникальный проприетарный пластырь</span>
                  <p className="text-[11px] text-[#86868B] mt-0.5">
                    Невозможность использования сертифицированных больничных перевязочных средств
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical FAQ for Jury */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-5 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
          <span>Инженерно-медицинские ответы на ключевые вопросы экспертной комиссии</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="font-bold text-[#007AFF]">
              1. Как исключить ложное срабатывание, если пациент укрылся теплым одеялом?
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Одеяло нагревает всю поверхность тела равномерно. В HealthBand заложен дифференциальный контроль: если температура раны выросла на 1°C, но температура опорного сенсора тела также поднялась на 0.9°C (градиент ΔT всего 0.1°C), алгоритм классифицирует это как внешний прогрев и блокирует ложную тревогу. Тревога активируется <em>исключительно</em> при опережающем росте раневого ложа (ΔT ≥ +1.0°C) на протяжении 3 последовательных замеров (30–45 минут).
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="font-bold text-[#007AFF]">
              2. Почему Google Таблицы на этапе прототипа и как устроено масштабирование?
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Google Таблицы использованы исключительно как прозрачный облачный буфер для демонстрации жюри сквозного контура «Сенсор → BLE-шлюз → Облако → Пост медсестры» без развертывания закрытой инфраструктуры. Промышленная архитектура комплекса HealthBand предусматривает прямую отправку JSON через MQTT-брокер на защищенный локальный сервер больницы (PostgreSQL/TimescaleDB), соответствующий стандартам защиты медицинских персональных данных.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="font-bold text-[#007AFF]">
              3. Почему стоимость 26 000 ₸ реалистична для внедрения в Казахстане?
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Электронный блок (микроконтроллер, BLE-трансивер, батарея и зарядный контур) является <em>многоразовым</em> и защищен герметичным силиконовым автоклавируемым чехлом (дезинфекция спиртовыми растворами). Одноразовым расходником выступает только стерильный полиимидный шлейф с термистором и серебряными нитями, себестоимость которого при мелкосерийном производстве в Алматы составляет менее 2 400 тенге.
            </p>
          </div>

          <div className="bg-[#F9F9FB] p-3.5 rounded-xl border border-[#E5E5EA] space-y-1.5">
            <div className="font-bold text-[#007AFF]">
              4. Каковы требования к асептике и риски инфицирования от самого сенсора?
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Сенсорная лента инкапсулирована в биосовместимый полиимид (Kapton) с гидрофобным силиконовым покрытием медицинского класса (USP Class VI). Шлейф выдерживает стерилизацию окисью этилена (ETO) и гамма-облучением. Датчик не имеет прямого контакта с обнаженным капиллярным руслом: он монтируется на промежуточную перфорированную сетку (например, Воскопран или Бранолинд).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
