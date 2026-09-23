import React, { useState } from 'react';
import {
  X,
  Cpu,
  Radio,
  Battery,
  Clock,
  Database,
  Layers,
  Sliders,
  Copy,
  Check,
  Download,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function InspectorDrawer() {
  const {
    inspectorOpen,
    setInspectorOpen,
    displayPatient,
    activePatient,
    activeScrubbedPoint,
    mode,
    liveState,
    syncNow,
    playAlarmSound
  } = useHealthBand();

  const [copied, setCopied] = useState(false);

  if (!inspectorOpen) return null;

  const current = activeScrubbedPoint || {
    time: '22:15',
    tempWound: displayPatient.tempWound,
    tempBody: displayPatient.tempBody,
    delta: displayPatient.tempDiff,
    humidity: displayPatient.humidity,
    pulse: displayPatient.heartRate
  };

  const handleCopyJSON = () => {
    const data = {
      patientId: displayPatient.id,
      patientName: displayPatient.name,
      sensorId: displayPatient.sensorId,
      mac: displayPatient.mac || '4C:11:AE:0D:98:21',
      timestamp: current.time,
      tempWound: current.tempWound,
      tempBody: current.tempBody,
      deltaT: current.delta || (current.tempWound - current.tempBody).toFixed(1),
      humidity: current.humidity,
      pulse: current.pulse,
      status: displayPatient.status,
      battery: displayPatient.battery
    };
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Time,TempWound,TempBody,DeltaT,Humidity,Pulse,Status\n' +
      `${current.time},${current.tempWound},${current.tempBody},${current.delta},${current.humidity},${current.pulse},${displayPatient.status}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `telemetry_${displayPatient.sensorId}_${current.time}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hardware calculations
  const rThermistor = Math.round(10000 * Math.exp(3950 * (1 / (current.tempWound + 273.15) - 1 / 298.15)));
  const adcThermistor = Math.round((rThermistor / (rThermistor + 10000)) * 1023);
  const adcMoisture = Math.max(480, Math.min(1024, Math.round(1024 - (current.humidity / 100) * 544)));
  const voltMoisture = ((adcMoisture / 1023) * 3.3).toFixed(2);

  return (
    <aside className="w-80 shrink-0 bg-[#F6F6F9] border-l border-[#E5E5EA] flex flex-col h-full overflow-hidden text-xs z-20 print:hidden shadow-xs">
      {/* Drawer Titlebar */}
      <div className="h-11 px-3.5 border-b border-[#E5E5EA] bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-semibold text-[#1D1D1F]">
          <Cpu className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
          <span>Инспектор оборудования</span>
        </div>
        <button
          onClick={() => setInspectorOpen(false)}
          className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F2F2F7] transition-colors"
          title="Скрыть инспектор"
          aria-label="Закрыть панель инспектора"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Section 1: Active Sensor & Patient Card */}
        <div className="bg-white border border-[#E5E5EA] rounded-xl p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-[#007AFF] bg-[#E5F1FF] px-2 py-0.5 rounded text-[11px] border border-[#007AFF]/20">
              {displayPatient.sensorId}
            </span>
            <span className="text-[11px] font-mono text-[#86868B]">
              MAC: {displayPatient.mac || '4C:11:AE:0D:98:21'}
            </span>
          </div>

          <div>
            <div className="font-semibold text-[#1D1D1F] truncate">
              {displayPatient.name}
            </div>
            <div className="text-[11px] text-[#6E6E73] truncate">
              {displayPatient.ward} • {displayPatient.bed}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E5E5EA] flex items-center justify-between text-[11px]">
            <span className="text-[#86868B]">Заряд аккумулятора:</span>
            <span className="font-mono font-semibold text-[#34C759] flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
              {displayPatient.battery}% (Li-Po 3.7V)
            </span>
          </div>
        </div>

        {/* Section 2: Sensor Calibration Matrix (ADC) */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] px-1">
            Калибровки сенсоров (ADC)
          </div>
          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3 shadow-2xs space-y-2.5">
            {/* Sensor 1 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#1D1D1F] font-medium block">NTC 10K Рана (ADC0)</span>
                <span className="text-[10px] font-mono text-[#86868B]">
                  ADC: {adcThermistor} ({rThermistor} Ω)
                </span>
              </div>
              <span className="font-mono font-bold text-[#FF3B30] text-sm tabular-nums">
                {current.tempWound}°C
              </span>
            </div>

            {/* Sensor 2 */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#F2F2F7]">
              <div>
                <span className="text-[#1D1D1F] font-medium block">Опорный тела (ADC1)</span>
                <span className="text-[10px] font-mono text-[#86868B]">
                  ADC: 698 (10,000 Ω)
                </span>
              </div>
              <span className="font-mono font-medium text-[#007AFF] text-sm tabular-nums">
                {current.tempBody}°C
              </span>
            </div>

            {/* Gradient Delta T */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#F2F2F7]">
              <div>
                <span className="text-[#1D1D1F] font-medium block">Градиент ΔT</span>
                <span className="text-[10px] text-[#86868B]">Порог тревоги ≥ 1.0°C</span>
              </div>
              <span
                className={`font-mono font-bold text-sm tabular-nums ${
                  current.tempWound - current.tempBody >= 1.0
                    ? 'text-[#FF3B30]'
                    : 'text-[#1D1D1F]'
                }`}
              >
                +{current.delta || (current.tempWound - current.tempBody).toFixed(1)}°C
              </span>
            </div>

            {/* Moisture Sensor */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#F2F2F7]">
              <div>
                <span className="text-[#1D1D1F] font-medium block">Экссудат текстиль (ADC2)</span>
                <span className="text-[10px] font-mono text-[#86868B]">
                  ADC: {adcMoisture} ({voltMoisture} V)
                </span>
              </div>
              <span
                className={`font-mono font-bold text-sm tabular-nums ${
                  current.humidity >= 80 ? 'text-[#FF3B30]' : 'text-[#34C759]'
                }`}
              >
                {current.humidity}%
              </span>
            </div>

            {/* PPG Pulse */}
            <div className="flex items-center justify-between pt-1.5 border-t border-[#F2F2F7]">
              <div>
                <span className="text-[#1D1D1F] font-medium block">MAX30102 PPG (I2C)</span>
                <span className="text-[10px] text-[#86868B]">IR 880nm / Red 660nm</span>
              </div>
              <span className="font-mono font-semibold text-[#1D1D1F] text-sm tabular-nums">
                {current.pulse} уд/м
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: ESP32 Energy & Firmware Specifications */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] px-1">
            Прошивка & Deep Sleep
          </div>
          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3 shadow-2xs space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Чип:</span>
              <span className="font-mono text-[#1D1D1F] font-medium">ESP32-S3 (240MHz)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Беспроводной стек:</span>
              <span className="font-mono text-[#1D1D1F] font-medium">BLE 5.0 Long Range</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Шифрование пакета:</span>
              <span className="font-mono text-[#007AFF] font-medium">AES-128-GCM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Профиль сна:</span>
              <span className="text-[#1D1D1F] font-medium">288с сон / 12с опрос</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Ток в Deep Sleep:</span>
              <span className="font-mono text-[#34C759] font-medium">&lt; 15 мкА</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Автономность:</span>
              <span className="text-[#1D1D1F] font-medium">~14 суток от 180 mAh</span>
            </div>
          </div>
        </div>

        {/* Section 4: Cloud Gateway Live Status */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B] px-1">
            Шлюз данных
          </div>
          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3 shadow-2xs space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#6E6E73]">Канал:</span>
              <span className="font-medium text-[#1D1D1F] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
                {mode === 'live' ? 'Google Sheets CSV' : 'Demo Lab Стенд'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Всего записей:</span>
              <span className="font-mono text-[#1D1D1F]">{liveState.totalRows} строк</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Поллинг:</span>
              <span className="font-mono text-[#1D1D1F]">30 сек авто</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6E73]">Синхронизация:</span>
              <span className="font-mono text-[#86868B]">{liveState.lastSyncTime}</span>
            </div>
          </div>
        </div>

        {/* Section 5: Diagnostic Actions & Export */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleCopyJSON}
            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] border border-[#E5E5EA] transition-colors flex items-center justify-center gap-2 font-medium shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
                <span className="text-[#34C759]">JSON скопирован!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
                <span>Скопировать JSON пакета</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] border border-[#E5E5EA] transition-colors flex items-center justify-center gap-2 font-medium shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
            <span>Экспорт сырого CSV</span>
          </button>

          <button
            onClick={playAlarmSound}
            className="w-full py-1.5 px-3 rounded-lg bg-[#E5F1FF] hover:bg-[#d0e5ff] text-[#007AFF] border border-[#007AFF]/30 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
            <span>Тест зуммера (Web Audio)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
