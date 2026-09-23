import React, { useState } from 'react';
import { HealthBandProvider } from './context/HealthBandContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import WardView from './components/WardView.jsx';
import TelemetryView from './components/TelemetryView.jsx';
import SimulatorView from './components/SimulatorView.jsx';
import ReportView from './components/ReportView.jsx';
import AboutView from './components/AboutView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('ward');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleSelectPatient = (patientId) => {
    setActiveTab('telemetry');
  };

  const handleNavigateToReport = (patientId) => {
    setActiveTab('report');
  };

  return (
    <HealthBandProvider>
      <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex font-sans antialiased print:bg-white print:text-black">
        {/* Linear Sidebar (Fixed left) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Command Palette (Global ⌘K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          setIsOpen={setCommandPaletteOpen}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Workspace (Offset by sidebar width on lg) */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 print:pl-0">
          {/* Workstation Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          {/* Clinical Workstation Canvas */}
          <main className="flex-1 p-4 sm:p-5 print:p-0">
            {activeTab === 'ward' && (
              <WardView
                onSelectPatient={handleSelectPatient}
                onNavigateToReport={handleNavigateToReport}
              />
            )}
            {activeTab === 'telemetry' && <TelemetryView />}
            {activeTab === 'simulator' && <SimulatorView />}
            {activeTab === 'report' && (
              <ReportView onBackToWard={() => setActiveTab('ward')} />
            )}
            {activeTab === 'about' && <AboutView />}
          </main>

          {/* Minimalist Linear Status Strip */}
          <footer className="border-t border-[#1c212d] bg-[#090a0f] py-2 px-4 sm:px-6 text-xs text-zinc-500 print:hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                <span className="text-zinc-300 font-medium">HealthBand Clinical Workstation</span>
                <span className="text-zinc-600">/</span>
                <span>Линейный телеметрический терминал отделения хирургии</span>
              </div>
              <div className="text-zinc-500 font-mono">
                BLE 5.0 • AES-128 • 2026
              </div>
            </div>
          </footer>
        </div>
      </div>
    </HealthBandProvider>
  );
}
