import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';
import { audioService } from '../services/audioService.js';

export default function BottomPlayerBar() {
  const {
    historySeries,
    isPlaying,
    togglePlay,
    playbackIndex,
    setPlaybackIndex,
    stepPlayback,
    playbackSpeed,
    setPlaybackSpeed,
    activeScrubbedPoint,
    displayPatient,
    isSoundEnabled,
    toggleSound
  } = useHealthBand();

  const trackRef = useRef(null);

  const count = historySeries.length;
  const currentIndex =
    playbackIndex !== null
      ? Math.max(0, Math.min(count - 1, playbackIndex))
      : count - 1;

  const currentPoint = activeScrubbedPoint || historySeries[count - 1] || {
    time: '22:15',
    tempWound: 38.6,
    tempBody: 37.0,
    humidity: 88,
    pulse: 98
  };

  const progressPercent = count > 1 ? (currentIndex / (count - 1)) * 100 : 100;

  // Handle click on waveform scrubber track
  const handleTrackClick = (e) => {
    if (!trackRef.current || count <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newIdx = Math.round(ratio * (count - 1));
    setPlaybackIndex(newIdx);
  };

  // Simulated waveform amplitudes based on temperatures
  const waveformHeights = [
    30, 42, 38, 55, 48, 62, 70, 65, 80, 75, 88, 95, 90, 85, 98, 100, 92, 86, 78,
    84, 90, 96, 92, 88, 76, 68, 60, 52, 45, 38, 32, 28
  ];

  const isAlert = displayPatient.status === 'alert';
  const isWarning = displayPatient.status === 'warning';

  return (
    <footer className="shrink-0 bg-white/95 border-t border-[#E5E5EA] backdrop-blur-md px-4 py-2 sm:py-2.5 z-30 shadow-xs print:hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-full">
        {/* Left: Playback transport controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Step Back button */}
          <button
            onClick={() => stepPlayback(-1)}
            disabled={currentIndex <= 0}
            className="p-1.5 rounded-md hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Предыдущий цикл телеметрии (-15 мин)"
            aria-label="Шаг назад"
          >
            <SkipBack className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Main Play / Pause button (Apple System Blue) */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
            title={isPlaying ? 'Приостановить воспроизведение' : 'Запустить симуляцию динамики во времени'}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" strokeWidth={0} />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" strokeWidth={0} />
            )}
          </button>

          {/* Step Forward button */}
          <button
            onClick={() => stepPlayback(1)}
            disabled={currentIndex >= count - 1}
            className="p-1.5 rounded-md hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            title="Следующий цикл телеметрии (+15 мин)"
            aria-label="Шаг вперед"
          >
            <SkipForward className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Speed Toggle Segmented Pill (1x, 2x, 5x) */}
          <div className="flex items-center bg-[#E5E5EA] rounded-md p-0.5 ml-1 text-[11px] font-medium font-mono">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  playbackSpeed === spd
                    ? 'bg-white text-[#1D1D1F] font-bold shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
                title={`Скорость воспроизведения ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <span className="text-xs text-[#86868B] hidden sm:inline ml-1 font-mono">
            [{currentIndex + 1}/{count}]
          </span>
        </div>

        {/* Center: Interactive Waveform / Timeline Scrubber */}
        <div className="flex-1 w-full flex items-center gap-3 min-w-0 px-1 sm:px-3">
          <span className="text-[11px] font-mono text-[#86868B] shrink-0">
            {historySeries[0]?.time || '21:00'}
          </span>

          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="flex-1 h-7 bg-[#F2F2F7] border border-[#E5E5EA] rounded-lg relative cursor-pointer flex items-center px-2 select-none group"
            title="Интерактивный скраббер MacWhisper: кликните для перехода в точку времени"
          >
            {/* Simulated waveform bars */}
            <div className="absolute inset-x-2 inset-y-1 flex items-center justify-between pointer-events-none opacity-85">
              {waveformHeights.map((h, i) => {
                const barRatio = i / (waveformHeights.length - 1);
                const isPassed = barRatio <= progressPercent / 100;
                return (
                  <div
                    key={i}
                    style={{ height: `${Math.max(15, h)}%` }}
                    className={`w-[2px] rounded-full transition-colors ${
                      isPassed
                        ? isAlert
                          ? 'bg-[#FF3B30]'
                          : 'bg-[#007AFF]'
                        : 'bg-[#D1D1D6]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Scrubber Playhead Handle */}
            <div
              style={{ left: `${progressPercent}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#007AFF] shadow-md transition-all pointer-events-none group-hover:scale-110 flex items-center justify-center"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#1D1D1F] font-semibold shrink-0">
            {currentPoint.time}
          </span>
        </div>

        {/* Right: Live Telemetry Readout & Triage Quick Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Telemetry metrics pill */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F2F2F7] border border-[#E5E5EA] text-xs font-mono">
            <span className="text-[#86868B]">Т:</span>
            <span
              className={`font-bold ${
                currentPoint.tempWound >= 37.5 ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'
              }`}
            >
              {currentPoint.tempWound}°C
            </span>
            <span className="text-[#D1D1D6]">|</span>
            <span className="text-[#86868B]">ΔT:</span>
            <span className="text-[#007AFF]">
              +{currentPoint.delta || (currentPoint.tempWound - currentPoint.tempBody).toFixed(1)}°
            </span>
            <span className="text-[#D1D1D6]">|</span>
            <span className="text-[#86868B]">Вл:</span>
            <span
              className={
                currentPoint.humidity >= 80 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759]'
              }
            >
              {currentPoint.humidity}%
            </span>
          </div>

          {/* Status badge */}
          <div
            className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 ${
              isAlert
                ? 'bg-[#FFEBEA] border-[#FF3B30]/30 text-[#D70015]'
                : isWarning
                ? 'bg-[#FFF5E5] border-[#FF9500]/30 text-[#C93400]'
                : 'bg-[#EBF9EE] border-[#34C759]/30 text-[#248A3D]'
            }`}
          >
            {isAlert ? (
              <ShieldAlert className="w-3.5 h-3.5 text-[#FF3B30]" strokeWidth={2} />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={2} />
            )}
            <span className="truncate max-w-[130px] sm:max-w-none">
              {isAlert ? 'Тревога' : isWarning ? 'Контроль' : 'Норма'}
            </span>
          </div>

          {/* Sound Alarm Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-md hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors border border-[#E5E5EA]"
            title={isSoundEnabled ? 'Звук тревог включен' : 'Звук отключен'}
            aria-label="Переключить звук"
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#007AFF]" strokeWidth={2} />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
