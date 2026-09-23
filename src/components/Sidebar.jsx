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
  AlertCircle,
  Clock,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Bandage,
  Stethoscope
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

  const [department, setDepartment] = useState('Хирургическое отд. №1');
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const departments = [
    'Хирургическое отд. №1',
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

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d1017] border-r border-[#1c212d] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Department Switcher & Workspace Branding */}
        <div className="p-3 border-b border-[#1c212d]">
          <div className="relative">
            <button
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-[#090a0f] hover:bg-[#161b26] border border-[#1c212d] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-cyan-600/90 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Activity className="w-4 h-4" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                    <span>HealthBand</span>
                    <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                      PRO
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1">
                    <span className="truncate">{department}</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
            </button>

            {/* Department Dropdown Menu */}
            {showDeptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#11141d] border border-[#1c212d] rounded-lg shadow-xl py-1 z-30 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-semibold text-zinc-500">
                  Выберите отделение:
                </div>
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setDepartment(dept);
                      setShowDeptDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-[#1c2230] transition-colors ${
                      department === dept ? 'text-cyan-400 font-semibold bg-[#161b26]' : 'text-zinc-300'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Search & Command Bar Trigger Button */}
          <button
            onClick={() => {
              if (onOpenCommandPalette) onOpenCommandPalette();
              if (window.innerWidth < 1024) setSidebarOpen(false);
            }}
            className="w-full mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-md bg-[#090a0f] hover:bg-[#161b26] border border-[#1c212d] text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
              <span className="text-zinc-400">Быстрый поиск...</span>
            </div>
            <kbd className="text-[10px] font-mono text-zinc-500 bg-[#161b26] px-1.5 py-0.5 rounded border border-[#1c212d]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Groups (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Group 1: Пациенты & Койки */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
              Пациенты & Койки
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('ward')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'ward'
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${activeTab === 'ward' ? 'text-cyan-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Все койки отделения</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 bg-[#090a0f] px-1.5 py-0.2 rounded border border-[#1c212d]">
                  {patients.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('ward')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  alertCount > 0 ? 'text-rose-300 hover:bg-rose-950/30' : 'text-zinc-400 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className={`w-4 h-4 ${alertCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Острый мониторинг</span>
                </div>
                {alertCount > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-[10px] font-bold font-mono text-rose-300 bg-rose-950 px-1.5 py-0.2 rounded border border-rose-800">
                      {alertCount}
                    </span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-600">0</span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('ward')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Bandage className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
                  <span>Плановые перевязки</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400/80 bg-[#090a0f] px-1.5 py-0.2 rounded border border-[#1c212d]">
                  {warningCount > 0 ? warningCount : 1}
                </span>
              </button>
            </div>
          </div>

          {/* Group 2: Аналитика */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
              Аналитика & Телеметрия
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('telemetry')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'telemetry'
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LineChart className={`w-4 h-4 ${activeTab === 'telemetry' ? 'text-cyan-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Интерактивная телеметрия</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-800/40">
                  SVG
                </span>
              </button>

              <button
                onClick={() => handleNavClick('telemetry')}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
                  <span>Журнал динамики (ADC)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Group 3: Инженерия & Стенд */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
              Инженерия & Симулятор
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('simulator')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'simulator'
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FlaskConical className={`w-4 h-4 ${activeTab === 'simulator' ? 'text-amber-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Demo Lab (Симулятор)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/40">
                  Жюри
                </span>
              </button>

              {/* Google Sheets Quick Sync Trigger Item */}
              <button
                onClick={() => {
                  setMode('live');
                  syncNow();
                }}
                disabled={liveState.isLoading}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26] transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />
                  <span>Google Sheets Шлюз</span>
                </div>
                <RotateCw
                  className={`w-3 h-3 text-zinc-400 ${liveState.isLoading ? 'animate-spin text-cyan-400' : ''}`}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Group 4: Документы */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 select-none">
              Документация & Досье
            </div>
            <div className="space-y-0.5 mt-0.5">
              <button
                onClick={() => handleNavClick('report')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className={`w-4 h-4 ${activeTab === 'report' ? 'text-cyan-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Клинический протокол</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">004/у</span>
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'bg-zinc-800/80 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161b26]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-cyan-400' : 'text-zinc-500'}`} strokeWidth={1.75} />
                  <span>Досье комплекса (FAQ)</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Telemetry Gateway Indicator, Sound Alarm & Staff Profile */}
        <div className="p-3 border-t border-[#1c212d] bg-[#090a0f] space-y-2.5">
          {/* Live Cloud Gateway Indicator */}
          <div className="flex items-center justify-between p-2 rounded-md bg-[#0d1017] border border-[#1c212d] text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                {liveState.isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveState.isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <div className="truncate">
                <div className="text-[11px] font-medium text-zinc-300 truncate">
                  {mode === 'live' ? 'Шлюз Google Sheets' : 'Demo Lab Стенд'}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  {liveState.totalRows > 0 ? `${liveState.totalRows} строк • 30с авто` : 'Активен'}
                </div>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className="p-1 rounded hover:bg-[#1c2230] text-zinc-400 hover:text-white transition-colors"
              title={isSoundEnabled ? 'Звуковые тревоги включены' : 'Звук отключен'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" strokeWidth={2} />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Nurse Staff Profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                ИА
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-200 truncate">
                  Исаева А.Б.
                </div>
                <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Дежурная медсестра • Пост №1</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-600">v1.2</span>
          </div>
        </div>
      </aside>
    </>
  );
}
