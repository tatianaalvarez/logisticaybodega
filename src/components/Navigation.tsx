import React from 'react';
import { useApp, TabId } from '../context/AppContext';
import {
  Boxes,
  Kanban,
  FileCheck,
  CalendarClock,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, kardex, requests } = useApp();

  const criticalKardexCount = kardex.filter((k) => k.status === 'Crítico' || k.status === 'Agotado').length;
  const pendingApprovalsCount = requests.filter((r) => r.approvalStatus === 'Pendiente').length;
  const inTransitCount = requests.filter((r) => r.status === 'En preparación' || r.status === 'En tránsito').length;

  const tabs: {
    id: TabId;
    label: string;
    number: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'kardex',
      label: 'Kardex de Insumos',
      number: '1',
      icon: Boxes,
      badge: criticalKardexCount > 0 ? criticalKardexCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    {
      id: 'trazabilidad',
      label: 'Trazabilidad en Tiempo Real',
      number: '2',
      icon: Kanban,
      badge: inTransitCount > 0 ? inTransitCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'autorizaciones',
      label: 'Autorizaciones & Solicitudes',
      number: '3',
      icon: FileCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    },
    {
      id: 'programacion',
      label: 'Programación de Entregas',
      number: '4',
      icon: CalendarClock,
    },
    {
      id: 'sincronizacion',
      label: 'Sincronización Instantánea',
      number: '5',
      icon: RefreshCw,
    },
    {
      id: 'desempeno',
      label: 'Desempeño & Mejora (KPIs)',
      number: '6',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 font-mono text-[11px] font-bold rounded ${
                      isActive ? 'bg-white/20 text-white' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
