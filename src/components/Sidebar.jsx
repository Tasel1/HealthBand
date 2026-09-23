import React, { useState } from 'react';
import {
  Activity,
  Layers,
  LineChart,
  FlaskConical,
  FileText,
  Info,
  Search,
  ChevronDown,
  Building2,
  Database,
  Radio,
  RotateCw,
  Volume2,
  VolumeX,
  X,
  ShieldAlert,
  Bandage,
  Clock,
  Battery,
  CheckCircle2,
  User
} from 'lucide-react';
import { useHealthBand } from '../context/HealthBandContext.jsx';

export default function Sidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onOpenCommandPalette
}) {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    alertCount,
    warningCount,
    normalCount,
    mode,
    setMode,
    liveState,
    syncNow,
    isSoundEnabled,
    toggleSound
  } = useHealthBand();

  const [department, setDepartment] = useState('Хирургическое отд. №1 • Хоспис Семей');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const departments = [
    'Хирургическое отд. №1 • Хоспис Семей',
    'Паллиативное отд. №2',
    'Отделение комбустиологии (Ожоги)',
    'Реанимация и ИТ'
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* macOS Source List Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#F6F6F9] border-r border-[#E5E5EA] flex flex-col shrink-0 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        {/* Department Switcher & Workspace Branding */}
        <div className="p-3 border-b border-[#E5E5EA] bg-white/70">
          <div className="relative">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-white hover:bg-[#F2F2F7] border border-[#E5E5EA] transition-colors text-left shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-[#007AFF] flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <Activity className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1D1D1F] tracking-tight flex items-center gap-1.5">
                    <span>HealthBand</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#E5F1FF] text-[#007AFF] font-bold">
                      macOS
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6E6E73] truncate">
                    {department}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#86868B] shrink-0 ml-1" />
            </button>

            {/* Department Dropdown Menu */}
            {showDeptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5EA] rounded-xl shadow-lg py-1 z-30 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#86868B]">
                  Выберите отделение:
                </div>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setDepartment(dept);
                      setShowDeptDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#F2F2F7] transition-colors ${
                      department === dept
                        ? 'text-[#007AFF] font-semibold bg-[#E5F1FF]/60'
                        : 'text-[#1D1D1F]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Search & Command Bar Trigger */}
          <button
            onClick={() => {
              if (onOpenCommandPalette) onOpenCommandPalette();
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F2F2F7] border border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors text-xs shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={2} />
              <span>Быстрый поиск...</span>
            </div>
            <kbd className="text-[10px] font-mono text-[#86868B] bg-[#F2F2F7] px-1.5 py-0.5 rounded border border-[#E5E5EA]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation & Patient Source List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5">
          {/* Section 1: Filters */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868B] select-none">
              Палаты & Койки
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('ward')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'ward'
                    ? 'bg-[#E5E5EA] text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers
                    className={`w-4 h-4 ${activeTab === 'ward' ? 'text-[#007AFF]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Все койки (4)</span>
                </div>
                <span className="text-[11px] font-mono text-[#6E6E73] bg-white px-1.5 py-0.2 rounded border border-[#E5E5EA]">
                  {patients.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('ward')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  alertCount > 0 ? 'text-[#D70015] hover:bg-[#FFEBEA]' : 'text-[#6E6E73] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert
                    className={`w-4 h-4 ${alertCount > 0 ? 'text-[#FF3B30]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Острый мониторинг</span>
                </div>
                {alertCount > 0 ? (
                  <span className="text-[10px] font-bold font-mono text-white bg-[#FF3B30] px-1.5 py-0.2 rounded-full shadow-2xs">
                    {alertCount}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-[#86868B]">0</span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('ward')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bandage className="w-4 h-4 text-[#86868B]" strokeWidth={1.75} />
                  <span>Плановая смена</span>
                </div>
                <span className="text-[11px] font-mono text-[#FF9500] bg-[#FFF5E5] px-1.5 py-0.2 rounded border border-[#FF9500]/20 font-semibold">
                  {warningCount > 0 ? warningCount : 1}
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Patient List with Apple Blue Selection Pill */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868B] select-none flex items-center justify-between">
              <span>Пациенты отделения</span>
              <span className="font-mono text-[10px]">{patients.length}</span>
            </div>
            <div className="space-y-1 mt-1">
              {patients.map((p) => {
                const isSelected = p.id === selectedPatientId;
                const isAlert = p.status === 'alert';
                const isWarning = p.status === 'warning';

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className={`px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs'
                        : 'hover:bg-[#E5E5EA]/70 text-[#1D1D1F]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* Micro-dot indicator */}
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-white'
                              : isAlert
                              ? 'bg-[#FF3B30]'
                              : isWarning
                              ? 'bg-[#FF9500]'
                              : 'bg-[#34C759]'
                          }`}
                        />
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-[#1D1D1F]'}`}>
                          {p.name.split(' ')[0]} {p.name.split(' ')[1]?.[0]}.
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-1 py-0.2 rounded shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-[#6E6E73] border border-[#E5E5EA]'
                        }`}
                      >
                        {p.bed}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono mt-1 pt-1 border-t border-black/5 opacity-90">
                      <span className={isSelected ? 'text-white font-bold' : isAlert ? 'text-[#FF3B30] font-bold' : 'text-[#1D1D1F]'}>
                        {p.tempWound}°C
                      </span>
                      <span className={isSelected ? 'text-white/80' : 'text-[#6E6E73]'}>
                        ΔT +{p.tempDiff}°
                      </span>
                      <span className={isSelected ? 'text-white/90' : p.humidity >= 80 ? 'text-[#FF3B30] font-bold' : 'text-[#34C759]'}>
                        {p.humidity}% вл.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Navigation Views */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868B] select-none">
              Мониторинг & Стенд
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('telemetry')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'telemetry'
                    ? 'bg-[#E5E5EA] text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LineChart
                    className={`w-4 h-4 ${activeTab === 'telemetry' ? 'text-[#007AFF]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Интерактивная телеметрия</span>
                </div>
              </button>

              <button
                onClick={() => handleNavClick('simulator')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-[#E5E5EA] text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FlaskConical
                    className={`w-4 h-4 ${activeTab === 'simulator' ? 'text-[#FF9500]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Demo Lab (Симулятор)</span>
                </div>
                <span className="text-[10px] font-mono text-[#FF9500] bg-[#FFF5E5] px-1 py-0.2 rounded font-bold">
                  Жюри
                </span>
              </button>

              <button
                onClick={() => handleNavClick('report')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-[#E5E5EA] text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText
                    className={`w-4 h-4 ${activeTab === 'report' ? 'text-[#007AFF]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Клинический протокол</span>
                </div>
                <span className="text-[10px] font-mono text-[#86868B]">004/у</span>
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-[#E5E5EA] text-[#1D1D1F] font-semibold'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#E5E5EA]/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Info
                    className={`w-4 h-4 ${activeTab === 'about' ? 'text-[#007AFF]' : 'text-[#86868B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>Досье комплекса (FAQ)</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Gateway Status & Nurse Profile */}
        <div className="p-3 border-t border-[#E5E5EA] bg-white/70 space-y-2.5 shrink-0">
          {/* Cloud Gateway Indicator */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E5E5EA] text-xs shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                {liveState.isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveState.isConnected ? 'bg-[#34C759]' : 'bg-[#FF3B30]'
                  }`}
                />
              </span>
              <div className="truncate">
                <div className="text-[11px] font-medium text-[#1D1D1F] truncate">
                  {mode === 'live' ? 'Шлюз Google Sheets' : 'Demo Lab Стенд'}
                </div>
                <div className="text-[10px] text-[#86868B] font-mono truncate">
                  {liveState.totalRows > 0 ? `${liveState.totalRows} строк • 30с авто` : 'Активен'}
                </div>
              </div>
            </div>

            <button
              onClick={syncNow}
              disabled={liveState.isLoading}
              title="Синхронизировать данные"
              className="p-1 rounded hover:bg-[#F2F2F7] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${liveState.isLoading ? 'animate-spin text-[#007AFF]' : ''}`}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Nurse Staff Profile */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#E5F1FF] border border-[#007AFF]/30 flex items-center justify-center text-[#007AFF] text-[11px] font-bold shrink-0">
                ИА
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                  Исаева А.Б.
                </div>
                <div className="text-[10px] text-[#6E6E73] truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] inline-block"></span>
                  <span>Дежурная медсестра • Пост №1</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#86868B]">v2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
