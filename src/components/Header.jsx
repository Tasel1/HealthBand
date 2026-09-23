import React, { useState } from 'react';
import {
  Activity,
  Layers,
  LineChart,
  FlaskConical,
  FileText,
  Info,
  Database,
  ShieldAlert,
  Volume2,
  VolumeX,
  Menu,
  X,
  RotateCw,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function Header({ activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    mode,
    setMode,
    liveState,
    syncNow,
    alertCount,
    isSoundEnabled,
    toggleSound
  } = useHealthBand();

  const tabs = [
    { id: 'ward', label: 'Клинический пост', icon: Layers },
    { id: 'telemetry', label: 'Телеметрия', icon: LineChart },
    { id: 'simulator', label: 'Demo Lab', icon: FlaskConical },
    { id: 'report', label: 'Клинический протокол', icon: FileText },
    { id: 'about', label: 'Досье комплекса', icon: Info },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-sm print:hidden">
      {/* Top Clinical System Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Selection (Segmented Control) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-md p-0.5 border border-slate-800">
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'live'
                  ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Поток объективных данных с датчика через Google Sheets"
            >
              <Radio className={`w-3 h-3 ${mode === 'live' ? 'text-cyan-400' : 'text-slate-500'}`} strokeWidth={2} />
              <span>Google Sheets (Live)</span>
            </button>
            <button
              onClick={() => setMode('simulator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'simulator'
                  ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-800/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Интерактивный стенд для жюри: симуляция клинических сценариев"
            >
              <FlaskConical className={`w-3 h-3 ${mode === 'simulator' ? 'text-amber-400' : 'text-slate-500'}`} strokeWidth={2} />
              <span>Demo Lab (Симулятор)</span>
            </button>
          </div>
        </div>

        {/* Right: Telemetry Gateway Status, Alarm Counter, Audio Toggle */}
        <div className="flex items-center flex-wrap gap-2.5 ml-auto">
          {/* Live Data / Gateway Status */}
          {mode === 'live' ? (
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="relative flex h-2 w-2">
                {liveState.isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveState.isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <Database className="w-3.5 h-3.5 text-cyan-400" strokeWidth={1.75} />
              <span className="text-[11px] font-medium">
                {liveState.isConnected ? 'Шлюз активен' : 'Офлайн'}
              </span>
              {liveState.totalRows > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 tabular-nums">
                  {liveState.totalRows} строк
                </span>
              )}
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                title="Принудительное обновление потока данных"
                className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors disabled:opacity-50"
              >
                <RotateCw
                  className={`w-3 h-3 ${liveState.isLoading ? 'animate-spin text-cyan-400' : ''}`}
                  strokeWidth={2}
                />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/40 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
              <span className="font-medium">Калибровочный стенд синхронизирован</span>
            </div>
          )}

          {/* Alarm Counter Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              alertCount > 0
                ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert
              className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}
              strokeWidth={2}
            />
            <span className="tabular-nums">
              {alertCount > 0 ? `${alertCount} активных тревог` : 'Тревог нет'}
            </span>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              isSoundEnabled
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                : 'bg-slate-900/40 hover:bg-slate-800 text-slate-500 border-slate-800'
            }`}
            title={isSoundEnabled ? 'Акустический монитор включен' : 'Звук отключен'}
          >
            {isSoundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
                <span className="hidden sm:inline">Звук: ВКЛ</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                <span className="hidden sm:inline">Звук: ВЫКЛ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Workstation Designation */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('ward')}
          >
            <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center text-white shrink-0">
              <Activity className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white">
                  HealthBand
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs text-slate-300 font-medium">
                  Клинический терминал мониторинга
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Segmented Navigation Tabs */}
          <nav className="hidden lg:flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-none'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
                    strokeWidth={1.75}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}
                  strokeWidth={2}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
