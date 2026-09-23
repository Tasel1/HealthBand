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
  Check
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

  // Approximate physical ADC values for Hardware Testbench inspector
  // NTC Thermistor B=3950, R25=10000 Ohm, Voltage divider with 10k resistor, 10-bit ADC
  const rThermistor = Math.round(10000 * Math.exp(3950 * (1 / (tempWound + 273.15) - 1 / 298.15)));
  const adcThermistor = Math.round((rThermistor / (rThermistor + 10000)) * 1023);

  // Conductometric moisture textile sensor: 1024 (dry) -> ~500 (saturated)
  const adcMoisture = Math.max(480, Math.min(1024, Math.round(1024 - (humidity / 100) * 544)));
  const voltMoisture = ((adcMoisture / 1023) * 3.3).toFixed(2);

  return (
    <div className="space-y-5">
      {/* Testbench Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-white">
                Аппаратно-программный испытательный стенд (Testbench & Calibration Lab)
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Стресс-тестирование алгоритмов фильтрации артефактов
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Интерактивная верификация для экспертной комиссии: динамическое моделирование сигналов термометрии, кондуктометрии и фотоплетизмографии с мгновенной трансляцией во все разделы терминала.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {mode !== 'simulator' ? (
              <button
                onClick={() => setMode('simulator')}
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <FlaskConical className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Активировать симулятор</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 border border-emerald-800/60 text-emerald-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2} />
                <span>Синхронизировано с постом</span>
              </div>
            )}

            <button
              onClick={handleTriggerTestAlarm}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                testTriggerActive
                  ? 'bg-rose-950 border-rose-600 text-rose-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Проверка работы зуммера оповещения медсестры"
            >
              <Volume2 className={`w-3.5 h-3.5 ${testTriggerActive ? 'text-rose-400' : 'text-cyan-400'}`} strokeWidth={2} />
              <span>{testTriggerActive ? 'Зуммер активен!' : 'Тест тревоги (Web Audio)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Scenario Selector (Segmented Console) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
        <div className="text-xs text-slate-400 font-semibold mb-2.5">
          Клинические сценарии для быстрой демонстрации:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SIMULATOR_PRESETS.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`text-left p-3 rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 text-white'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {preset.title.replace(/^\d+\.\s*/, '')}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      preset.expectedAlarm ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {preset.desc}
                </p>
                <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Tactile Calibration Sliders (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
            <span className="font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" strokeWidth={2} />
              Калибровка входных физических параметров
            </span>
            <button
              onClick={() => handlePresetSelect('infection')}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={2} /> Сбросить
            </button>
          </div>

          {/* Slider 1: Wound Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Температура раневого ложа (под повязкой):</span>
              <span className="font-mono font-bold text-white tabular-nums">{tempWound}°C</span>
            </div>
            <input
              type="range"
              min="35.0"
              max="41.0"
              step="0.1"
              value={tempWound}
              onChange={(e) => handleSliderChange('tempWound', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35.0°C</span>
              <span className="text-rose-400">Порог тревоги 37.5°C</span>
              <span>41.0°C</span>
            </div>
          </div>

          {/* Slider 2: Body Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Базовая температура тела (опорный сенсор):</span>
              <span className="font-mono font-bold text-white tabular-nums">{tempBody}°C</span>
            </div>
            <input
              type="range"
              min="35.5"
              max="39.5"
              step="0.1"
              value={tempBody}
              onChange={(e) => handleSliderChange('tempBody', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35.5°C</span>
              <span>Физиологическая норма 36.6°C</span>
              <span>39.5°C</span>
            </div>
          </div>

          {/* Slider 3: Wound Humidity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Влажность повязки (насыщение экссудатом):</span>
              <span className="font-mono font-bold text-white tabular-nums">{humidity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => handleSliderChange('humidity', parseInt(e.target.value, 10))}
              className="w-full accent-teal-500 bg-slate-950 h-2 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% (Сухая)</span>
              <span className="text-amber-400">Порог замены 80%</span>
              <span>100% (Насыщение)</span>
            </div>
          </div>

          {/* Stepper: Consecutive Spikes */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Число последовательных циклов роста Т:</span>
              <span className="font-mono font-bold text-cyan-400">{consecutiveSpikes} из 3 циклов</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSliderChange('consecutiveSpikes', val)}
                  className={`py-1.5 text-xs font-mono rounded border transition-colors ${
                    consecutiveSpikes === val
                      ? 'bg-slate-800 text-cyan-300 border-cyan-500 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {val === 3 ? '3 (Тревога)' : `${val} цикл`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry Inspector & Decision Tree (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
            <span className="font-semibold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" strokeWidth={2} />
              Аппаратный инспектор ADC & Матрица решений
            </span>
            <span className="font-mono text-[10px] text-slate-400">ESP32 Firmware Pipeline</span>
          </div>

          {/* Decision Verdict Banner */}
          <div
            className={`p-3.5 rounded border flex items-start gap-3 ${
              hasAnyAlarm
                ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                : isWarning
                ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
            }`}
          >
            {hasAnyAlarm ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" strokeWidth={2} />
            ) : isWarning ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
            )}
            <div>
              <div className="font-bold text-xs uppercase tracking-wide">
                {hasAnyAlarm
                  ? 'СИГНАЛ ТРЕВОГИ: ОСТРАЯ ЛОКАЛЬНАЯ РАНЕВАЯ ИНФЕКЦИЯ'
                  : isWarning
                  ? 'ВНИМАНИЕ: ПОГРАНИЧНЫЕ ПОКАЗАТЕЛИ'
                  : 'СТАТУС: ФИЗИОЛОГИЧЕСКИЙ ГОМЕОСТАЗ В НОРМЕ'}
              </div>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                {alertDetails || 'Температурный градиент и влажность находятся в целевом диапазоне заживления.'}
              </p>
            </div>
          </div>

          {/* Raw ADC to Medical Units Inspector Table */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 text-xs space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Трансляция сигналов АЦП в медицинские единицы:
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">ADC A0 (NTC 10K Рана)</span>
                <span className="text-slate-200">ADC: {adcThermistor} ({rThermistor} Ω)</span>
                <span className="text-cyan-400 block font-bold mt-0.5">{tempWound}°C (Медицинская)</span>
              </div>

              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 block text-[10px]">ADC A1 (Текстиль Влажность)</span>
                <span className="text-slate-200">ADC: {adcMoisture} ({voltMoisture} V)</span>
                <span className="text-teal-400 block font-bold mt-0.5">{humidity}% RH (Экссудат)</span>
              </div>
            </div>
          </div>

          {/* Decision Criteria Checklist */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">1. Т раны &gt; 37.5°C ({tempWound}°C):</span>
              <span className={`font-mono font-bold ${isHighTemp ? 'text-rose-400' : 'text-slate-500'}`}>
                {isHighTemp ? 'ВЫПОЛНЕНО (Гипертермия)' : 'НЕТ'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">2. Градиент Δ(Т_раны - Т_тела) &ge; +1.0°C (+{deltaT}°C):</span>
              <span className={`font-mono font-bold ${isHighDelta ? 'text-rose-400' : 'text-slate-500'}`}>
                {isHighDelta ? 'ВЫПОЛНЕНО (Локальный очаг)' : 'НЕТ'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">3. Подтверждение 3 последовательных циклов ({consecutiveSpikes}/3):</span>
              <span className={`font-mono font-bold ${isTrendConfirmed ? 'text-rose-400' : 'text-slate-500'}`}>
                {isTrendConfirmed ? 'ВЫПОЛНЕНО (Стойкий тренд)' : 'НЕТ (Фильтрация шума)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-300">4. Намокание повязки &ge; 80% ({humidity}%):</span>
              <span className={`font-mono font-bold ${isMoisture ? 'text-amber-400' : 'text-slate-500'}`}>
                {isMoisture ? 'ВЫПОЛНЕНО (Требуется замена)' : 'НЕТ'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">Пояснение для жюри:</span> {explanation}
          </div>
        </div>
      </div>
    </div>
  );
}
