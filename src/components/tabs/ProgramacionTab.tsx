import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MachineType, ProductionKit } from '../../types';
import {
  Printer,
  PackageCheck,
  Clock,
  Truck,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
} from 'lucide-react';

export const ProgramacionTab: React.FC = () => {
  const {
    productionKits,
    milkRuns,
    requests,
    dispatchProductionKit,
    updateMilkRunStatus,
    advanceRequestStatus,
  } = useApp();

  // Selector for machine focus: 'Roland 700' | 'Komori' | 'TODAS'
  const [selectedMachine, setSelectedMachine] = useState<'Roland 700' | 'Komori' | 'TODAS'>('Roland 700');
  const [quickKitOpNumber, setQuickKitOpNumber] = useState('');
  const [selectedKitToDispatch, setSelectedKitToDispatch] = useState<ProductionKit | null>(null);

  // Filter requests by machine
  const machineRequests = requests.filter((r) => {
    if (selectedMachine === 'TODAS') return true;
    return r.targetMachine === selectedMachine;
  });

  const activeMachineDeliveries = machineRequests.filter(
    (r) => r.status === 'En preparación' || r.status === 'En tránsito'
  );

  const deliveredToMachine = machineRequests.filter((r) => r.status === 'Entregada');

  // Filter kits for the selected machine
  const relevantKits = productionKits.filter((k) => {
    if (selectedMachine === 'TODAS') return true;
    return k.targetMachine === selectedMachine;
  });

  const handleTriggerKit = (kit: ProductionKit) => {
    setSelectedKitToDispatch(kit);
    setQuickKitOpNumber(`OP-${Math.floor(90430 + Math.random() * 80)}`);
  };

  const handleConfirmDispatchKit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitToDispatch) return;
    dispatchProductionKit(
      selectedKitToDispatch.id,
      quickKitOpNumber,
      selectedKitToDispatch.targetMachine === 'Roland 700'
        ? 'Andrés Jaramillo (Maquinista Roland)'
        : 'Carlos Restrepo (Prensista Komori)'
    );
    setSelectedKitToDispatch(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Machine Focus Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Programación de Entregas a Prensa (Roland 700 / Komori)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de abastecimiento continuo: Kits de Producción (Kitting) y Rutas Lecheras (Milk Runs) para cero paradas de máquina.
            </p>
          </div>

          {/* Machine Destination Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['Roland 700', 'Komori', 'TODAS'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMachine(m)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedMachine === m
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className={`w-3.5 h-3.5 ${selectedMachine === m ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{m === 'TODAS' ? 'Línea Completa' : `Prensa ${m}`}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Machine Real-Time Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div
            onClick={() => setSelectedMachine('Roland 700')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedMachine === 'Roland 700'
                ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Printer className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Prensa Offset Roland 700</h3>
                  <p className="text-[11px] text-slate-500">6 Cuerpos + Torre de Barniz · Pliego 745×605 mm</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operando
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60 font-mono">
              <span>Suministros en tránsito: {requests.filter((r) => r.targetMachine === 'Roland 700' && (r.status === 'En preparación' || r.status === 'En tránsito')).length}</span>
              <span aria-hidden="true">·</span>
              <span>Entregas turno: {requests.filter((r) => r.targetMachine === 'Roland 700' && r.status === 'Entregada').length}</span>
            </div>
          </div>

          <div
            onClick={() => setSelectedMachine('Komori')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedMachine === 'Komori'
                ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-200'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Printer className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Prensa Offset Komori Lithrone</h3>
                  <p className="text-[11px] text-slate-500">5 Cuerpos + UV In-line · Pliego 1030×790 mm</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Operando
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60 font-mono">
              <span>Suministros en tránsito: {requests.filter((r) => r.targetMachine === 'Komori' && (r.status === 'En preparación' || r.status === 'En tránsito')).length}</span>
              <span aria-hidden="true">·</span>
              <span>Entregas turno: {requests.filter((r) => r.targetMachine === 'Komori' && r.status === 'Entregada').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Kits de Producción (Kitting) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Kits de Producción Litográfica Pre-configurados (Kitting)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agrupación estandarizada de todos los insumos (sustrato, planchas CTP, tintas y barniz) para arrancar la tirada sin viajes repetitivos.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {relevantKits.length} kits disponibles para {selectedMachine}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relevantKits.map((kit) => (
            <div
              key={kit.id}
              className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {kit.targetMachine}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{kit.name}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{kit.productionType}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{kit.description}</p>

                {/* Items in the kit */}
                <div className="mt-3 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Contenido del Kit ({kit.items.length} insumos):
                  </p>
                  <ul className="text-xs space-y-1">
                    {kit.items.map((i, idx) => (
                      <li key={idx} className="flex items-center justify-between font-mono text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-800 truncate mr-2">{i.description}</span>
                        <span className="shrink-0 text-slate-600">
                          {i.defaultQuantity} {i.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Alistamiento en 1 solo viaje</span>
                <button
                  onClick={() => handleTriggerKit(kit)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Despachar Kit a {kit.targetMachine}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Milk Runs / Rutas Lecheras Programadas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Programación de Rutas Lecheras (Milk Runs)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Horarios fijos y recurrentes para abastecer las prensas sin detener la producción litográfica.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Frecuencia cada 2.5 a 3 horas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {milkRuns.map((run) => (
            <div
              key={run.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                run.status === 'Completada'
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : run.status === 'En ruta'
                  ? 'border-indigo-300 bg-indigo-50/40 ring-1 ring-indigo-200'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {run.scheduledTime}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      run.status === 'Completada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : run.status === 'En ruta'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {run.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 mt-2 space-y-1">
                  <p className="font-semibold text-slate-800">{run.shift} · {run.id}</p>
                  <p className="text-[11px] text-slate-500">
                    Transporte: <span className="text-slate-700">{run.carrierEquipment}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Responsable: <span className="text-slate-700">{run.assignedOperator}</span>
                  </p>
                </div>

                {/* Stops */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <p className="font-semibold text-[10px] uppercase tracking-wider text-slate-400">
                    Paradas de la Ruta:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {run.stops.map((stop, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80">
                {run.status === 'Programada' && (
                  <button
                    onClick={() => updateMilkRunStatus(run.id, 'En ruta')}
                    className="w-full py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Iniciar Ruta Lechera
                  </button>
                )}
                {run.status === 'En ruta' && (
                  <button
                    onClick={() => updateMilkRunStatus(run.id, 'Completada')}
                    className="w-full py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Marcar Completada
                  </button>
                )}
                {run.status === 'Completada' && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1 py-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ruta Finalizada Conforme
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for 1-Click Kit Dispatch */}
      {selectedKitToDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Despacho de Kit de Producción</h3>
                <p className="text-xs text-slate-300 font-mono">
                  Destino: {selectedKitToDispatch.targetMachine}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded font-semibold">
                Kitting
              </span>
            </div>

            <form onSubmit={handleConfirmDispatchKit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kit Seleccionado
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-900">{selectedKitToDispatch.name}</p>
                  <p className="text-slate-600">{selectedKitToDispatch.description}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número de OP a Vincular *
                </label>
                <input
                  type="text"
                  required
                  value={quickKitOpNumber}
                  onChange={(e) => setQuickKitOpNumber(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <p className="font-semibold">Validación Automática:</p>
                <p className="mt-0.5 text-[11px]">
                  Al confirmar, se generará la solicitud aprobada y se asignará al auxiliar logístico para alistamiento inmediato con estibador hidráulico.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedKitToDispatch(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Confirmar y Despachar Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
