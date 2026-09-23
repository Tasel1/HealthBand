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
import InspectorDrawer from './components/InspectorDrawer.jsx';

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
      {/* Outer macOS Desktop Wallpaper Canvas */}
      <div className="min-h-screen bg-[#E8E8ED] text-[#1D1D1F] p-0 sm:p-2.5 md:p-3.5 flex flex-col justify-center font-sans antialiased selection:bg-[#007AFF]/20 selection:text-[#007AFF] print:p-0 print:bg-white">
        {/* Global Command Palette (⌘K Spotlight) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          setIsOpen={setCommandPaletteOpen}
          setActiveTab={setActiveTab}
        />

        {/* MacWhisper macOS Centered Window Container */}
        <div className="w-full max-w-[1720px] mx-auto min-h-[96vh] bg-white rounded-none sm:rounded-2xl border-0 sm:border border-[#D1D1D6] shadow-none sm:shadow-macos-window flex flex-col overflow-hidden print:border-none print:shadow-none print:rounded-none">
          {/* macOS Unified Titlebar / Toolbar */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          {/* Window Body: Sidebar + Main Canvas + Inspector Drawer */}
          <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
            {/* macOS Source List Sidebar */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            />

            {/* Main Content Workspace Canvas */}
            <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto bg-[#F5F5F7] min-w-0 print:p-0 print:bg-white">
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

            {/* macOS Right Inspector Drawer */}
            <InspectorDrawer />
          </div>
        </div>
      </div>
    </HealthBandProvider>
  );
}
