import React, { useState } from 'react';
import {
  FlaskConical,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Radio,
  Share2,
  Cpu,
  Activity,
  Check,
  ShieldAlert,
  Flame,
  Droplets,
  Layers
} from 'lucide-react';
import { useHealthBand, SIMULATOR_PRESETS } from '../context/HealthBandContext.jsx';

export default function SimulatorView() {
  const {
    simulatorState,
    applyPreset,
    updateSimulator,
    simulatorEval,
    mode,
    setMode,
    playAlarmSound,
    isSoundEnabled
  } = useHealthBand();

  const [testTriggerActive, setTestTriggerActive] = useState(false);

  const {
    presetId,
    tempWound,
    tempBody,
    humidity,
    pulse,
    consecutiveSpikes,
    explanation
  } = simulatorState;

  const {
    status,
    statusText,
    alertDetails,
    deltaT,
    isHighTemp,
    isHighDelta,
    isTrendConfirmed,
    isInfection,
    isMoisture,
    isWarning
  } = simulatorEval;

  const hasAnyAlarm = status === 'alert';

  const handlePresetSelect = (id) => {
    if (mode !== 'simulator') {
      setMode('simulator');
    }
    applyPreset(id);
  };

  const handleSliderChange = (key, val) => {
    if (mode !== 'simulator') {
      setMode('simulator');
    }
    updateSimulator({ [key]: val });
  };

  const handleTriggerTestAlarm = () => {
    setTestTriggerActive(true);
    playAlarmSound();
    setTimeout(() => {
      setTestTriggerActive(false);
    }, 2500);
  };

  // Hardware ADC calculations
  const rThermistor = Math.round(10000 * Math.exp(3950 * (1 / (tempWound + 273.15) - 1 / 298.15)));
  const adcThermistor = Math.round((rThermistor / (rThermistor + 10000)) * 1023);

  const adcMoisture = Math.max(480, Math.min(1024, Math.round(1024 - (humidity / 100) * 544)));
  const voltMoisture = ((adcMoisture / 1023) * 3.3).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Testbench Header */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#1D1D1F]">
                Аппаратно-программный испытательный стенд (Demo Lab & Testbench)
              </span>
              <span className="text-[#D1D1D6]">•</span>
              <span className="text-xs text-[#6E6E73]">
                Стресс-тестирование алгоритмов фильтрации артефактов
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 max-w-3xl leading-relaxed">
              Интерактивная верификация для экспертной комиссии: динамическое моделирование сигналов термометрии, кондуктометрии и фотоплетизмографии с мгновенной трансляцией во все разделы терминала.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {mode !== 'simulator' ? (
              <button
                onClick={() => setMode('simulator')}
                className="px-3 py-1.5 rounded-lg bg-[#FF9500] hover:bg-[#E08500] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FlaskConical className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Активировать стенд</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#EBF9EE] border border-[#34C759]/30 text-[#248A3D] text-xs font-mono font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
                <span>Синхронизировано со стендом</span>
              </div>
            )}

            <button
              onClick={handleTriggerTestAlarm}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                testTriggerActive
                  ? 'bg-[#FFEBEA] border-[#FF3B30] text-[#D70015]'
                  : 'bg-white hover:bg-[#F2F2F7] text-[#1D1D1F] border-[#E5E5EA] shadow-2xs'
              }`}
              title="Проверка работы зуммера оповещения медсестры"
            >
              <Volume2 className={`w-3.5 h-3.5 ${testTriggerActive ? 'text-[#FF3B30]' : 'text-[#007AFF]'}`} strokeWidth={2} />
              <span>{testTriggerActive ? 'Зуммер активен!' : 'Тест тревоги (Web Audio)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Scenario Selector */}
      <div className="bg-white border border-[#E5E5EA] rounded-2xl p-4 shadow-xs">
        <div className="text-xs text-[#1D1D1F] font-semibold mb-2.5">
          Клинические сценарии для быстрой демонстрации жюри:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SIMULATOR_PRESETS.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#E5F1FF]/60 border-[#007AFF] text-[#1D1D1F] shadow-xs'
                    : 'bg-[#F9F9FB] border-[#E5E5EA] hover:border-[#D1D1D6] text-[#1D1D1F]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D1D1F]">
                    {preset.title.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      preset.expectedAlarm ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-[#6E6E73] mt-1 line-clamp-2 leading-tight">
                  {preset.desc}
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#007AFF] flex items-center gap-1.5 pt-1.5 border-t border-[#E5E5EA]">
                  <span>Т: {preset.tempWound}°C</span>
                  <span>•</span>
                  <span>Вл: {preset.humidity}%</span>
                  <span>•</span>
                  <span>{preset.consecutiveSpikes} сп.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Calibration Sliders & Live ADC Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Tactile Calibration Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5EA] text-xs">
            <span className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
              <span>Калибровка физических параметров сенсоров</span>
            </span>
            <button
              onClick={() => handlePresetSelect('infection')}
              className="text-[#86868B] hover:text-[#1D1D1F] flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2} /> Сбросить
            </button>
          </div>

          {/* Slider 1: Wound Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#1D1D1F] font-medium">Температура раневого ложа (под повязкой):</span>
              <span className="font-mono font-bold text-[#FF3B30] text-sm tabular-nums">{tempWound}°C</span>
            </div>
            <input
              type="range"
              min="35.0"
              max="41.0"
              step="0.1"
              value={tempWound}
              onChange={(e) => handleSliderChange('tempWound', parseFloat(e.target.value))}
              className="w-full accent-[#007AFF] bg-[#F2F2F7] h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#86868B] font-mono">
              <span>35.0°C</span>
              <span className="text-[#FF3B30] font-semibold">Порог тревоги 37.5°C</span>
              <span>41.0°C</span>
            </div>
          </div>

          {/* Slider 2: Body Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#1D1D1F] font-medium">Базовая температура тела (опорный сенсор):</span>
              <span className="font-mono font-bold text-[#007AFF] text-sm tabular-nums">{tempBody}°C</span>
            </div>
            <input
              type="range"
              min="35.5"
              max="39.5"
              step="0.1"
              value={tempBody}
              onChange={(e) => handleSliderChange('tempBody', parseFloat(e.target.value))}
              className="w-full accent-[#007AFF] bg-[#F2F2F7] h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#86868B] font-mono">
              <span>35.5°C</span>
              <span>Физиологическая норма 36.6°C</span>
              <span>39.5°C</span>
            </div>
          </div>

          {/* Slider 3: Wound Humidity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-[#1D1D1F] font-medium">Влажность повязки (насыщение экссудатом):</span>
              <span className="font-mono font-bold text-[#34C759] text-sm tabular-nums">{humidity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => handleSliderChange('humidity', parseInt(e.target.value, 10))}
              className="w-full accent-[#34C759] bg-[#F2F2F7] h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#86868B] font-mono">
              <span>10% (Сухая)</span>
              <span className="text-[#FF9500] font-semibold">Порог замены 80%</span>
              <span>100% (Насыщение)</span>
            </div>
          </div>

          {/* Stepper: Consecutive Spikes */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#1D1D1F] font-medium">Число последовательных циклов роста Т:</span>
              <span className="font-mono font-bold text-[#007AFF]">{consecutiveSpikes} из 3 циклов</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSliderChange('consecutiveSpikes', val)}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                    consecutiveSpikes === val
                      ? 'bg-[#007AFF] text-white border-[#007AFF] font-bold shadow-xs'
                      : 'bg-[#F9F9FB] text-[#6E6E73] border-[#E5E5EA] hover:text-[#1D1D1F]'
                  }`}
                >
                  {val === 3 ? '3 (Тревога)' : `${val} цикл`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Inspector & Decision Tree (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-[#E5E5EA] rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5EA] text-xs">
            <span className="font-bold text-[#1D1D1F] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#007AFF]" strokeWidth={2} />
              <span>Аппаратный инспектор ADC & Матрица решений</span>
            </span>
            <span className="font-mono text-[10px] text-[#86868B]">ESP32 Firmware Pipeline</span>
          </div>

          {/* Decision Verdict Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              hasAnyAlarm
                ? 'bg-[#FFEBEA] border-[#FF3B30]/40 text-[#D70015]'
                : isWarning
                ? 'bg-[#FFF5E5] border-[#FF9500]/40 text-[#C93400]'
                : 'bg-[#EBF9EE] border-[#34C759]/40 text-[#248A3D]'
            }`}
          >
            {hasAnyAlarm ? (
              <AlertTriangle className="w-5 h-5 text-[#FF3B30] shrink-0 mt-0.5" strokeWidth={2} />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5 text-[#FF9500] shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0 mt-0.5" strokeWidth={2} />
            )}
            <div>
              <div className="font-bold text-xs uppercase tracking-wide">
                {hasAnyAlarm
                  ? 'СИГНАЛ ТРЕВОГИ: ОСТРАЯ РАНЕВАЯ ИНФЕКЦИЯ'
                  : isWarning
                  ? 'ВНИМАНИЕ: ПОГРАНИЧНЫЕ ПОКАЗАТЕЛИ'
                  : 'СТАТУС: ФИЗИОЛОГИЧЕСКИЙ ГОМЕОСТАЗ'}
              </div>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                {alertDetails || 'Температурный градиент и влажность находятся в целевом диапазоне заживления.'}
              </p>
            </div>
          </div>

          {/* Raw ADC to Medical Units Inspector Table */}
          <div className="bg-[#F9F9FB] border border-[#E5E5EA] rounded-xl p-3 text-xs space-y-2">
            <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
              Трансляция сигналов АЦП в медицинские единицы:
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[10px]">ADC A0 (NTC 10K Рана)</span>
                <span className="text-[#6E6E73]">ADC: {adcThermistor} ({rThermistor} Ω)</span>
                <span className="text-[#FF3B30] block font-bold mt-0.5">{tempWound}°C</span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-[#E5E5EA]">
                <span className="text-[#86868B] block text-[10px]">ADC A1 (Текстиль Влажность)</span>
                <span className="text-[#6E6E73]">ADC: {adcMoisture} ({voltMoisture} V)</span>
                <span className="text-[#34C759] block font-bold mt-0.5">{humidity}% RH</span>
              </div>
            </div>
          </div>

          {/* Decision Criteria Checklist */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] border border-[#E5E5EA]">
              <span className="text-[#1D1D1F]">1. Т раны &gt; 37.5°C ({tempWound}°C):</span>
              <span className={`font-mono font-bold ${isHighTemp ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}>
                {isHighTemp ? 'ВЫПОЛНЕНО (Гипертермия)' : 'НЕТ'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] border border-[#E5E5EA]">
              <span className="text-[#1D1D1F]">2. Градиент ΔT &ge; +1.0°C (+{deltaT}°C):</span>
              <span className={`font-mono font-bold ${isHighDelta ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}>
                {isHighDelta ? 'ВЫПОЛНЕНО (Локальный очаг)' : 'НЕТ'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] border border-[#E5E5EA]">
              <span className="text-[#1D1D1F]">3. Подтверждение 3 циклов ({consecutiveSpikes}/3):</span>
              <span className={`font-mono font-bold ${isTrendConfirmed ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}>
                {isTrendConfirmed ? 'ВЫПОЛНЕНО (Стойкий тренд)' : 'НЕТ (Фильтрация)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#F9F9FB] border border-[#E5E5EA]">
              <span className="text-[#1D1D1F]">4. Намокание повязки &ge; 80% ({humidity}%):</span>
              <span className={`font-mono font-bold ${isMoisture ? 'text-[#FF9500]' : 'text-[#86868B]'}`}>
                {isMoisture ? 'ВЫПОЛНЕНО (Замена повязки)' : 'НЕТ'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#E5F1FF] border border-[#007AFF]/20 text-[11px] text-[#1D1D1F]">
            <span className="text-[#007AFF] font-bold">Пояснение:</span> {explanation}
          </div>
        </div>
      </div>
    </div>
  );
}
