import React, { useState } from 'react';
import { HealthBandProvider } from './context/HealthBandContext.jsx';
import Header from './components/Header.jsx';
import WardView from './components/WardView.jsx';
import TelemetryView from './components/TelemetryView.jsx';
import SimulatorView from './components/SimulatorView.jsx';
import ReportView from './components/ReportView.jsx';
import AboutView from './components/AboutView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('ward');

  const handleSelectPatient = () => {
    setActiveTab('telemetry');
  };

  return (
    <HealthBandProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
        {/* Top Header with Medical Status Bar, Live Sync Indicator & Controls */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Clinical Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'ward' && <WardView onSelectPatient={handleSelectPatient} />}
          {activeTab === 'telemetry' && <TelemetryView />}
          {activeTab === 'simulator' && <SimulatorView />}
          {activeTab === 'report' && <ReportView />}
          {activeTab === 'about' && <AboutView />}
        </main>

        {/* Clinical Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400 font-medium">HealthBand IoT MedTech Platform</span>
              <span>•</span>
              <span>Постовой терминал медсестры v1.1.0 (Live Connector Active)</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Научно-исследовательский проект медицинской телеметрии • 2026
            </div>
          </div>
        </footer>
      </div>
    </HealthBandProvider>
  );
}
