import React from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  ShieldAlert,
  ArrowRight,
  Volume2,
  Radio,
  Share2
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

  const handlePresetClick = (id) => {
    // Automatically switch to simulator mode if in live mode
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                Interactive Jury Sandbox
              </span>
              <span className="text-xs text-slate-400">Симуляция датчиков HealthBand</span>
              {mode === 'simulator' ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Активен в общем контексте
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" /> Сейчас активен Google Sheets Live
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Demo Lab: Стресс-тестирование алгоритмов обнаружения
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Интерактивный стенд для демонстрации жюри: проверка устойчивости к артефактам и мгновенная реакция на инфекцию
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mode !== 'simulator' && (
              <button
                onClick={() => setMode('simulator')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Включить симулятор для всех вкладок</span>
              </button>
            )}

            <button
              onClick={playAlarmSound}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors"
              title="Проиграть звуковой сигнал тревоги через Web Audio API"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Тест звуковой тревоги</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cross-View Synchronization Banner */}
      <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-teal-950/60 border border-cyan-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-900/80 flex items-center justify-center text-cyan-300 border border-cyan-700/60 shrink-0">
            <Share2 className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">
              Данные синхронизированы с постом медсестры
            </div>
            <p className="text-slate-300 mt-0.5">
              Любое изменение пресета или ползунков ниже моментально пересчитывает койку Ахметова Н.С. в Палате 101 (WardView), графики тренда (TelemetryView) и Клинический аудит (ReportView).
            </p>
          </div>
        </div>

        {mode === 'simulator' ? (
          <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800 font-medium shrink-0 self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Синхронизация активна
          </span>
        ) : (
          <button
            onClick={() => setMode('simulator')}
            className="text-cyan-300 hover:text-cyan-200 underline font-semibold shrink-0 self-start sm:self-center"
          >
            Синхронизировать сейчас &rarr;
          </button>
        )}
      </div>

      {/* Preset Selector Grid */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Клинические сценарии для быстрой демонстрации жюри:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SIMULATOR_PRESETS.map((preset) => {
            const isSelected = presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{preset.title}</span>
                  {preset.expectedAlarm ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{preset.desc}</p>
                <div className="mt-3 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <span>Т: {preset.tempWound}°C</span> • <span>Вл: {preset.humidity}%</span> •{' '}
                  <span>{preset.consecutiveSpikes} сп.</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Live Algorithm Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-semibold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Ручная регулировка параметров датчиков
            </h3>
            <button
              onClick={() => handlePresetClick('infection')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Сброс
            </button>
          </div>

          {/* Slider 1: Wound Temp */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Температура раны (под повязкой):</span>
              <span className="font-mono font-bold text-white">{tempWound}°C</span>
            </div>
            <input
              type="range"
              min="35.0"
              max="41.0"
              step="0.1"
              value={tempWound}
              onChange={(e) => handleSliderChange('tempWound', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35.0°C</span>
              <span className="text-rose-400">Порог 37.5°C</span>
              <span>41.0°C</span>
            </div>
          </div>

          {/* Slider 2: Body Temp */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Базовая температура тела (контроль):</span>
              <span className="font-mono font-bold text-white">{tempBody}°C</span>
            </div>
            <input
              type="range"
              min="35.5"
              max="39.5"
              step="0.1"
              value={tempBody}
              onChange={(e) => handleSliderChange('tempBody', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>35.5°C</span>
              <span>Норма 36.6°C</span>
              <span>39.5°C</span>
            </div>
          </div>

          {/* Slider 3: Wound Humidity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Влажность повязки (экссудат):</span>
              <span className="font-mono font-bold text-white">{humidity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => handleSliderChange('humidity', parseInt(e.target.value, 10))}
              className="w-full accent-teal-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% (Сухо)</span>
              <span className="text-amber-400">Порог промокания 80%</span>
              <span>100% (Насыщение)</span>
            </div>
          </div>

          {/* Consecutive cycles selector */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Число последовательных замеров с ростом Т:</span>
              <span className="font-mono font-bold text-cyan-400">{consecutiveSpikes} из 3 циклов</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((val) => (
                <button
                  key={val}
                  onClick={() => handleSliderChange('consecutiveSpikes', val)}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                    consecutiveSpikes === val
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {val === 3 ? '3 (Тревога)' : `${val} цикл`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Algorithm Decision Evaluation */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Вывод аналитического алгоритма
              </h3>
              <span className="text-[11px] font-mono text-slate-400">HealthBand Rules Engine</span>
            </div>

            {/* Overall Verdict Banner */}
            <div
              className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
                hasAnyAlarm
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                  : isWarning
                  ? 'bg-amber-950/60 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
              }`}
            >
              {hasAnyAlarm ? (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {hasAnyAlarm
                    ? 'СИГНАЛ ТРЕВОГИ: ВНИМАНИЕ МЕДПЕРСОНАЛУ'
                    : isWarning
                    ? 'ПРЕДУПРЕЖДЕНИЕ: ТРЕБУЕТСЯ КОНТРОЛЬ'
                    : 'СОСТОЯНИЕ СТАБИЛЬНО: НОРМА'}
                </div>
                <div className="text-xs mt-1 leading-relaxed opacity-90">
                  {alertDetails ? (
                    <p>{alertDetails}</p>
                  ) : (
                    <p className="text-emerald-200">
                      Все параметры в норме. Ложных тревог нет.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist of mathematical conditions */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Проверка критериев решения:
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">1. Т раны &gt; 37.5°C ({tempWound}°C):</span>
                <span className={`font-mono font-bold ${isHighTemp ? 'text-rose-400' : 'text-slate-500'}`}>
                  {isHighTemp ? 'ДА (Выше нормы)' : 'НЕТ'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">2. Градиент Δ(Т_раны - Т_тела) &ge; +1.0°C ({deltaT}°C):</span>
                <span className={`font-mono font-bold ${isHighDelta ? 'text-rose-400' : 'text-slate-500'}`}>
                  {isHighDelta ? 'ДА (Локальный очаг)' : 'НЕТ (Равномерно)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">3. Подтверждение тренда 3 замеров ({consecutiveSpikes}/3):</span>
                <span className={`font-mono font-bold ${isTrendConfirmed ? 'text-rose-400' : 'text-slate-500'}`}>
                  {isTrendConfirmed ? 'ДА (Не шум)' : 'НЕТ (Фильтрация)'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-300">4. Намокание повязки &ge; 80% ({humidity}%):</span>
                <span className={`font-mono font-bold ${isMoisture ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isMoisture ? 'ДА (Промокла)' : 'НЕТ (Сухо)'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">Пояснение для жюри:</span> {explanation}
          </div>
        </div>
      </div>
    </div>
  );
}
