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
    { id: 'ward', label: 'Клинический пост', sublabel: 'Палаты и мониторинг', icon: Layers },
    { id: 'telemetry', label: 'Телеметрия', sublabel: 'Показатели датчиков', icon: LineChart },
    { id: 'simulator', label: 'Demo Lab (Жюри)', sublabel: 'Стресс-тесты сценариев', icon: FlaskConical },
    { id: 'report', label: 'Клинический отчет', sublabel: 'Анализ заживления', icon: FileText },
    { id: 'about', label: 'О проекте', sublabel: 'Сравнение со Стэнфордом', icon: Info },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Clinical & System Status Bar */}
      <div className="bg-slate-950/90 px-3 sm:px-6 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Medical System Badge & Mode Toggle */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            IoT MedTech
          </span>

          {/* Mode Switcher: Live Google Sheets vs Simulator */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setMode('live')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                mode === 'live'
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Режим реального потока данных из Google Sheets"
            >
              <Radio className={`w-3 h-3 ${mode === 'live' ? 'animate-pulse text-cyan-200' : ''}`} />
              <span>Google Sheets (Live)</span>
            </button>
            <button
              onClick={() => setMode('simulator')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                mode === 'simulator'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Интерактивный симулятор сценариев для жюри"
            >
              <FlaskConical className="w-3 h-3 text-amber-200" />
              <span>Demo Lab (Симулятор)</span>
            </button>
          </div>
        </div>

        {/* Right: Live Sync, Rows count, Active Alerts, Audio Toggle */}
        <div className="flex items-center flex-wrap gap-2.5 ml-auto">
          {/* Live Stream / Sync Status */}
          {mode === 'live' ? (
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800">
              <span className="relative flex h-2 w-2">
                {liveState.isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveState.isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-[11px]">
                {liveState.isConnected ? 'Онлайн' : 'Офлайн'}
              </span>
              {liveState.totalRows > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono">
                  {liveState.totalRows} строк
                </span>
              )}
              <span className="text-slate-500 text-[10px] hidden md:inline">
                ({liveState.lastSyncTime})
              </span>
              <button
                onClick={syncNow}
                disabled={liveState.isLoading}
                title="Обновить данные из Google Sheets прямо сейчас"
                className="text-slate-400 hover:text-cyan-300 p-0.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${liveState.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/50 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Синхронизировано с постом</span>
            </div>
          )}

          {/* Active Alerts Counter */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
              alertCount > 0
                ? 'bg-rose-950/80 border border-rose-700 text-rose-200'
                : 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
            }`}
          >
            <ShieldAlert
              className={`w-3.5 h-3.5 ${alertCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}
            />
            <span>
              {alertCount > 0 ? `${alertCount} активных тревог` : 'Тревог нет'}
            </span>
          </div>

          {/* Web Audio Hospital Monitor Chime Toggle */}
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
              isSoundEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700 shadow-sm'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-500 border-slate-800'
            }`}
            title={isSoundEnabled ? 'Звуковая сигнализация включена' : 'Звук отключен'}
          >
            {isSoundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Звук: ВКЛ</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Звук: ВЫКЛ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('ward')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold ring-1 ring-cyan-400/30">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  HealthBand
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                  Smart Dressing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Мониторинг заживления ран & раннее обнаружение инфекций
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold">{tab.label}</div>
                  <div className="text-xs text-slate-400">{tab.sublabel}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
