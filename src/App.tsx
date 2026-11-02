import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { KardexTab } from './components/tabs/KardexTab';
import { TrazabilidadTab } from './components/tabs/TrazabilidadTab';
import { AutorizacionesTab } from './components/tabs/AutorizacionesTab';
import { ProgramacionTab } from './components/tabs/ProgramacionTab';
import { SincronizacionTab } from './components/tabs/SincronizacionTab';
import { DesempenoTab } from './components/tabs/DesempenoTab';
import { NewRequestModal } from './components/modals/NewRequestModal';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, notification, setNotification } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header onOpenNewRequest={() => setIsModalOpen(true)} />

      {/* 6 Tabs Navigation Bar */}
      <Navigation />

      {/* Real-time Notification Banner / Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-start justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : notification.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-medium leading-relaxed">
                {notification.message}
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'kardex' && <KardexTab />}
        {activeTab === 'trazabilidad' && <TrazabilidadTab />}
        {activeTab === 'autorizaciones' && <AutorizacionesTab />}
        {activeTab === 'programacion' && <ProgramacionTab />}
        {activeTab === 'sincronizacion' && <SincronizacionTab />}
        {activeTab === 'desempeno' && <DesempenoTab />}
      </main>

      {/* Quiet Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Impresos El Día S.A.S.</span>
            <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
            <span>NIT: 890.903.512-1</span>
            <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
            <span>Medellín, Colombia</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Normas Técnicas: ISO 9001:2015 · ISO 14001:2015 · ISO 45001:2018 · ISO 12647</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 font-medium">Sincronización Activa</span>
          </div>
        </div>
      </footer>

      {/* Quick Request Modal */}
      <NewRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
