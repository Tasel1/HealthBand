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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans print:bg-white print:text-black">
        {/* Workstation Header */}
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Clinical Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 print:p-0 print:max-w-none">
          {activeTab === 'ward' && <WardView onSelectPatient={handleSelectPatient} />}
          {activeTab === 'telemetry' && <TelemetryView />}
          {activeTab === 'simulator' && <SimulatorView />}
          {activeTab === 'report' && <ReportView onBackToWard={() => setActiveTab('ward')} />}
          {activeTab === 'about' && <AboutView />}
        </main>

        {/* Clinical Post Status Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-3 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
              <span className="text-slate-400 font-medium">HealthBand Клинический терминал</span>
              <span>/</span>
              <span>Постовой мониторинг отделения хирургии v1.2</span>
            </div>
            <div className="text-slate-500 text-[11px] tabular-nums">
              Протокол BLE 5.0 • Канал передачи шифрован (AES-128) • 2026
            </div>
          </div>
        </footer>
      </div>
    </HealthBandProvider>
  );
}
