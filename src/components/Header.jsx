import React from 'react';
import {
  Menu,
  Radio,
  FlaskConical,
  RotateCw,
  Volume2,
  VolumeX,
  Search,
  ChevronRight,
  ShieldAlert,
  PanelRight,
  Layers,
  LineChart,
  FileText,
  Info,
  Activity
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
    displayPatient,
    inspectorOpen,
    toggleInspector
  } = useHealthBand();

  const navTabs = [
    { id: 'ward', label: 'Палаты', icon: Layers },
    { id: 'telemetry', label: 'Телеметрия', icon: LineChart },
    { id: 'simulator', label: 'Demo Lab', icon: FlaskConical },
    { id: 'report', label: 'Протокол', icon: FileText },
    { id: 'about', label: 'Досье', icon: Info },
  ];

  return (
    <header className="shrink-0 h-[52px] bg-[#F6F6F9]/95 border-b border-[#E5E5EA] backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-3 select-none z-30 print:hidden">
      {/* Left: Application Mark & Department Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Application Brand Mark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-[#007AFF] flex items-center justify-center text-white shadow-2xs">
            <Activity className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-xs text-[#1D1D1F] tracking-tight">
            HealthBand
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA] lg:hidden transition-colors"
          aria-label="Открыть боковую панель"
        >
          <Menu className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Minimalist macOS Window Title / Breadcrumb */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#86868B] font-medium min-w-0">
          <span className="text-[#D1D1D6]">/</span>
          <span className="truncate">{displayPatient.ward}</span>
          <span className="text-[#D1D1D6]">/</span>
          <span className="text-[#6E6E73] truncate max-w-[120px]">
            {displayPatient.name}
          </span>
        </div>
      </div>

      {/* Center: MacWhisper Native Segmented Control Pill */}
      <nav
        aria-label="Навигация по разделам"
        className="flex items-center bg-[#E5E5EA] p-0.5 rounded-lg shadow-inner text-xs font-medium"
      >
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md transition-all ${
                isActive
                  ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-[#007AFF]' : 'text-[#86868B]'
                }`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Source pill, Search pill, Sound alarm toggle, Inspector toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Source Switcher Pill */}
        <div className="flex items-center bg-[#E5E5EA] rounded-md p-0.5 text-xs font-medium">
          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
              mode === 'live'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-2xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
            title="Поток данных через Google Sheets"
          >
            <Radio
              className={`w-3 h-3 ${mode === 'live' ? 'text-[#34C759]' : 'text-[#86868B]'}`}
              strokeWidth={2}
            />
            <span className="hidden sm:inline">Sheets</span>
          </button>

          <button
            onClick={() => setMode('simulator')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
              mode === 'simulator'
                ? 'bg-white text-[#1D1D1F] font-semibold shadow-2xs'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            }`}
            title="Интерактивный стенд Demo Lab"
          >
            <FlaskConical
              className={`w-3 h-3 ${mode === 'simulator' ? 'text-[#FF9500]' : 'text-[#86868B]'}`}
              strokeWidth={2}
            />
            <span className="hidden sm:inline">Lab</span>
          </button>
        </div>

        {/* Quick Sync Button for Live Mode */}
        {mode === 'live' && (
          <button
            onClick={syncNow}
            disabled={liveState.isLoading}
            title="Обновить поток Google Sheets"
            aria-label="Синхронизировать Google Sheets"
            className="p-1.5 rounded-md hover:bg-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors disabled:opacity-40"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin text-[#007AFF]' : ''}`}
              strokeWidth={2}
            />
          </button>
        )}

        {/* Alarm status badge */}
        {alertCount > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFEBEA] border border-[#FF3B30]/30 text-[#D70015] text-[11px] font-semibold animate-pulse"
            title="Активные тревоги отделения"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#FF3B30]" strokeWidth={2} />
            <span>{alertCount}</span>
          </div>
        )}

        {/* Search Input Pill (Command Palette Trigger) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] hover:border-[#D1D1D6] transition-all text-xs shadow-2xs"
          title="Открыть командную строку (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
          <span className="hidden md:inline font-mono text-[11px] text-[#86868B]">⌘K</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className={`p-1.5 rounded-md transition-colors ${
            isSoundEnabled
              ? 'text-[#007AFF] hover:bg-[#E5F1FF]'
              : 'text-[#86868B] hover:bg-[#E5E5EA]'
          }`}
          title={isSoundEnabled ? 'Звуковые тревоги включены' : 'Звук отключен'}
          aria-label="Переключить звук"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-4 h-4" strokeWidth={2} />
          ) : (
            <VolumeX className="w-4 h-4" strokeWidth={2} />
          )}
        </button>

        {/* Right Inspector Drawer Toggle */}
        <button
          onClick={toggleInspector}
          className={`p-1.5 rounded-md transition-colors ${
            inspectorOpen
              ? 'bg-[#E5F1FF] text-[#007AFF]'
              : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]'
          }`}
          title={inspectorOpen ? 'Скрыть панель инспектора' : 'Показать инспектор оборудования'}
          aria-label="Переключить инспектор"
        >
          <PanelRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
