import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Printer, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenNewRequest: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewRequest }) => {
  const { metrics } = {
    metrics: useApp().getMetrics(),
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Printer className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                Impresos El Día S.A.S.
              </span>
              <span className="text-xs text-slate-500 block">
                LogiPrint · Abastecimiento Bodega a Prensa
              </span>
            </div>
          </div>

          {/* Zone 2: Plant telemetry & normativity indicators (Clean unboxed text) */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Roland 700: Operando
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Komori: Operando
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              ISO 12647 (54% HR · 21.2°C)
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono tabular-nums text-slate-700">
              OTIF: {metrics.otifPercentage}%
            </span>
          </div>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewRequest}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Solicitar Insumos</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
