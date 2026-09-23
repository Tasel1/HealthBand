import React from 'react';
import {
  Menu,
  Radio,
  FlaskConical,
  RotateCw,
  Database,
  ShieldAlert,
  Volume2,
  VolumeX,
  Search,
  ChevronRight,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function Header({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onOpenCommandPalette
}) {
  const {
    mode,
    setMode,
    liveState,
    syncNow,
    alertCount,
    isSoundEnabled,
    toggleSound,
    activePatient
  } = useHealthBand();

  // Dynamic Linear-style breadcrumbs
  const getTabLabel = () => {
    switch (activeTab) {
      case 'ward':
        return 'Клинический пост';
      case 'telemetry':
        return 'Телеметрия';
      case 'simulator':
        return 'Demo Lab';
      case 'report':
        return 'Протокол 004/у';
      case 'about':
        return 'Досье комплекса';
      default:
        return 'Пост';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#090a0f]/95 border-b border-[#1c212d] backdrop-blur-md print:hidden">
      <div className="px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Sleek Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 -ml-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[#161b26] lg:hidden transition-colors"
            aria-label="Открыть боковую панель"
          >
            <Menu className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400 min-w-0 font-medium">
            <span className="hidden sm:inline-block hover:text-zinc-200 transition-colors">
              Хирургия
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0 hidden sm:inline-block" />

            <span className="text-zinc-400 hover:text-zinc-200 transition-colors truncate">
              {activePatient.ward}
            </span>
            <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />

            <span className="text-zinc-100 font-semibold truncate max-w-[140px] sm:max-w-none">
              {activePatient.name}
            </span>

            {activeTab !== 'ward' && (
              <>
                <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0 hidden md:inline-block" />
                <span className="hidden md:inline-block text-cyan-400 font-mono text-[11px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                  {getTabLabel()}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Mode Switcher & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center bg-[#0d1017] rounded-md p-0.5 border border-[#1c212d]">
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'live'
                  ? 'bg-[#161b26] text-cyan-300 font-semibold border border-cyan-800/50 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Поток данных с датчика через Google Sheets"
            >
              <Radio
                className={`w-3 h-3 ${mode === 'live' ? 'text-cyan-400' : 'text-zinc-500'}`}
                strokeWidth={2}
              />
              <span className="hidden sm:inline">Google Sheets</span>
              <span className="sm:hidden">Live</span>
            </button>

            <button
              onClick={() => setMode('simulator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'simulator'
                  ? 'bg-[#161b26] text-amber-300 font-semibold border border-amber-800/50 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Интерактивный симулятор для жюри"
            >
              <FlaskConical
                className={`w-3 h-3 ${mode === 'simulator' ? 'text-amber-400' : 'text-zinc-500'}`}
                strokeWidth={2}
              />
              <span className="hidden sm:inline">Demo Lab</span>
              <span className="sm:hidden">Lab</span>
            </button>
          </div>

          {/* Quick sync button for Live mode */}
          {mode === 'live' && (
            <button
              onClick={syncNow}
              disabled={liveState.isLoading}
              title="Принудительная синхронизация Google Sheets"
              className="p-1.5 rounded-md bg-[#0d1017] hover:bg-[#161b26] border border-[#1c212d] text-zinc-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin text-cyan-400' : ''}`}
                strokeWidth={2}
              />
            </button>
          )}

          {/* Alarm status badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              alertCount > 0
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-[#0d1017] border-[#1c212d] text-zinc-400'
            }`}
          >
            <ShieldAlert
              className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`}
              strokeWidth={2}
            />
            <span className="tabular-nums">
              {alertCount > 0 ? `${alertCount} тревог` : 'Тревог нет'}
            </span>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-md border transition-colors ${
              isSoundEnabled
                ? 'bg-[#0d1017] hover:bg-[#161b26] text-cyan-400 border-[#1c212d]'
                : 'bg-[#0d1017] hover:bg-[#161b26] text-zinc-500 border-[#1c212d]'
            }`}
            title={isSoundEnabled ? 'Акустический монитор ВКЛ' : 'Звук отключен'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />
            )}
          </button>

          {/* Command Palette Trigger Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0d1017] hover:bg-[#161b26] border border-[#1c212d] text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-mono"
            title="Открыть командную строку (⌘K или Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
            <span className="hidden md:inline">⌘K</span>
          </button>
        </div>
      </div>
    </header>
  );
}
