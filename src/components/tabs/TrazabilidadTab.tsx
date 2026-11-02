import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplyRequest, RequestStatus, MachineType } from '../../types';
import {
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  Truck,
  BoxSelect,
  Layers,
  Filter,
  AlertCircle,
  CheckCheck,
  Building,
  Timer,
  LayoutGrid,
  List,
} from 'lucide-react';

export const TrazabilidadTab: React.FC = () => {
  const { requests, advanceRequestStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<'TODOS' | RequestStatus>('TODOS');
  const [machineFilter, setMachineFilter] = useState<'TODAS' | MachineType>('TODAS');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchStatus = statusFilter === 'TODOS' || req.status === statusFilter;
      const matchMachine = machineFilter === 'TODAS' || req.targetMachine === machineFilter;
      return matchStatus && matchMachine;
    });
  }, [requests, statusFilter, machineFilter]);

  const columns: { status: RequestStatus; title: string; subtitle: string; icon: any; color: string }[] = [
    {
      status: 'Solicitada',
      title: 'Solicitada',
      subtitle: 'En espera de inicio de surtido',
      icon: Clock,
      color: 'border-slate-300 text-slate-800',
    },
    {
      status: 'En preparación',
      title: 'En Preparación (Picking)',
      subtitle: 'Bodeguero alistando en almacén',
      icon: BoxSelect,
      color: 'border-amber-300 text-amber-900',
    },
    {
      status: 'En tránsito',
      title: 'En Tránsito',
      subtitle: 'Transporte hacia pie de prensa',
      icon: Truck,
      color: 'border-indigo-300 text-indigo-900',
    },
    {
      status: 'Entregada',
      title: 'Entregada en Prensa',
      subtitle: 'Recibido conforme y stock sincronizado',
      icon: CheckCircle,
      color: 'border-emerald-300 text-emerald-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Panel de Trazabilidad en Tiempo Real (WMS Bodega - Planta)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoreo del ciclo de vida del suministro: desde el requerimiento digital hasta la entrega en prensa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista en Vivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filtrar por Prensa:
          </div>
          <div className="flex items-center gap-1">
            {(['TODAS', 'Roland 700', 'Komori'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMachineFilter(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  machineFilter === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m === 'TODAS' ? 'Todas las Máquinas' : m}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            Estado:
          </div>
          <div className="flex items-center gap-1">
            {(['TODOS', 'Solicitada', 'En preparación', 'En tránsito', 'Entregada'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const itemsInCol = filteredRequests.filter((r) => r.status === col.status);
            const Icon = col.icon;

            return (
              <div
                key={col.status}
                className="bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col h-full min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-700" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                      <p className="text-[10px] text-slate-500">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                    {itemsInCol.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {itemsInCol.map((req) => (
                    <RequestCard key={req.id} req={req} onAdvance={() => advanceRequestStatus(req.id)} />
                  ))}

                  {itemsInCol.length === 0 && (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No hay solicitudes en esta fase.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Solicitud / OP</th>
                  <th className="py-3 px-4">Destino (Prensa)</th>
                  <th className="py-3 px-4">Centro de Costo</th>
                  <th className="py-3 px-4">Operario Solicitante</th>
                  <th className="py-3 px-4">Hora Creación</th>
                  <th className="py-3 px-4">Bodeguero Asignado</th>
                  <th className="py-3 px-4">Insumos Solicitados</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">{req.id}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{req.opNumber}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-800">
                      {req.targetMachine}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {req.costCenter}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {req.requestingOperator}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {req.requestTime}
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {req.assignedBodeguero || 'Sin asignar'}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 text-[11px]">
                      {req.items.map((i) => `${i.itemCode} (${i.quantity} ${i.unit})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          req.status === 'Entregada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'En tránsito'
                            ? 'bg-indigo-100 text-indigo-800'
                            : req.status === 'En preparación'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {req.status !== 'Entregada' && req.status !== 'Rechazada' && (
                        <button
                          onClick={() => advanceRequestStatus(req.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          {req.status === 'Solicitada'
                            ? 'Iniciar Picking'
                            : req.status === 'En preparación'
                            ? 'Despachar'
                            : 'Confirmar Entrega'}
                        </button>
                      )}
                      {req.status === 'Entregada' && (
                        <span className="text-[11px] font-mono text-emerald-700 flex items-center justify-end gap-1">
                          <CheckCheck className="w-3.5 h-3.5" /> Sincronizado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for Kanban card
const RequestCard: React.FC<{ req: SupplyRequest; onAdvance: () => void }> = ({ req, onAdvance }) => {
  const isUrgent = req.urgency === 'Parada Inminente';
  const isPriority = req.urgency === 'Prioritaria';

  return (
    <div
      className={`bg-white border rounded-xl p-3.5 shadow-xs transition-all space-y-3 ${
        isUrgent
          ? 'border-rose-300 ring-1 ring-rose-200'
          : isPriority
          ? 'border-amber-300'
          : 'border-slate-200'
      }`}
    >
      {/* Top Header of Card */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs text-slate-900">{req.id}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-mono text-[11px] text-slate-500">{req.opNumber}</span>
          </div>
          <span className="inline-block mt-1 text-[11px] font-semibold text-slate-900">
            Destino: {req.targetMachine}
          </span>
        </div>

        {isUrgent ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 whitespace-nowrap">
            Parada Inminente
          </span>
        ) : isPriority ? (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 whitespace-nowrap">
            Prioritaria
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
            Normal
          </span>
        )}
      </div>

      {/* Details: Cost center & Operator */}
      <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <div className="flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{req.costCenter}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">Sol: {req.requestingOperator}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Hora: {req.requestTime.slice(11)} (Límite: {req.deadlineTime})</span>
        </div>
        {req.assignedBodeguero && (
          <div className="flex items-center gap-1.5 text-indigo-700 font-medium pt-0.5 border-t border-slate-200/60">
            <Truck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Bodeguero: {req.assignedBodeguero}</span>
          </div>
        )}
      </div>

      {/* Insumos Requested List */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Insumos a Surtir ({req.items.length})
        </p>
        <ul className="text-xs space-y-1 text-slate-700">
          {req.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between font-mono text-[11px] bg-white p-1 rounded border border-slate-100">
              <span className="font-semibold text-slate-800 truncate mr-2">{item.itemCode}</span>
              <span className="text-slate-600 shrink-0 tabular-nums">
                {item.quantity.toLocaleString('es-CO')} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action button to advance status */}
      <div className="pt-2 border-t border-slate-100">
        {req.status === 'Solicitada' && (
          <button
            onClick={onAdvance}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <span>Iniciar Picking en Bodega</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {req.status === 'En preparación' && (
          <button
            onClick={onAdvance}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Despachar a {req.targetMachine}</span>
          </button>
        )}

        {req.status === 'En tránsito' && (
          <button
            onClick={onAdvance}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Confirmar Entrega en Pie de Prensa</span>
          </button>
        )}

        {req.status === 'Entregada' && (
          <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Entregado ({req.leadTimeMinutes || 15} min)
            </span>
            <span className="font-mono text-[10px] text-emerald-600">Kardex Sincronizado</span>
          </div>
        )}
      </div>
    </div>
  );
};
