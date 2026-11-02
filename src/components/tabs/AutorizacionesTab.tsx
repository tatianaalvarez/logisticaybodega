import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MachineType, UrgencyLevel, CategoryABC } from '../../types';
import {
  FileCheck2,
  Check,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  UserCheck,
  Info,
} from 'lucide-react';

export const AutorizacionesTab: React.FC = () => {
  const { requests, kardex, createRequest, approveRequest, rejectRequest } = useApp();

  // Form state
  const [opNumber, setOpNumber] = useState('');
  const [costCenter, setCostCenter] = useState('Litografía Prensa Offset');
  const [requestingOperator, setRequestingOperator] = useState('Carlos Restrepo (Prensista)');
  const [targetMachine, setTargetMachine] = useState<MachineType>('Roland 700');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [deadlineTime, setDeadlineTime] = useState('14:30');
  const [notes, setNotes] = useState('');

  // Selected items in form
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number }[]>([
    { itemId: kardex[0]?.id || '', quantity: 500 },
  ]);

  // Reject modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Código o cantidad no coincide con orden técnica de tiro y retiro.');

  // Form error
  const [formError, setFormError] = useState<string | null>(null);

  // Filter requests into Pending vs Processed
  const pendingRequests = requests.filter((r) => r.approvalStatus === 'Pendiente');
  const processedRequests = requests.filter((r) => r.approvalStatus !== 'Pendiente');

  // Handle adding an item row
  const handleAddItemRow = () => {
    const available = kardex.find((k) => !selectedItems.some((s) => s.itemId === k.id));
    if (available) {
      setSelectedItems([...selectedItems, { itemId: available.id, quantity: 10 }]);
    }
  };

  // Handle removing an item row
  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  // Handle item change
  const handleItemChange = (index: number, itemId: string) => {
    const updated = [...selectedItems];
    updated[index].itemId = itemId;
    setSelectedItems(updated);
  };

  // Handle quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    setSelectedItems(updated);
  };

  // Submit new request
  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const result = createRequest({
      opNumber,
      costCenter,
      requestingOperator,
      targetMachine,
      urgency,
      deadlineTime,
      items: selectedItems,
      notes,
    });

    if (!result.success) {
      setFormError(result.error || 'Error al validar la solicitud.');
      return;
    }

    // Reset form
    setOpNumber('');
    setNotes('');
    setSelectedItems([{ itemId: kardex[0]?.id || '', quantity: 500 }]);
  };

  const handleConfirmReject = () => {
    if (!rejectingRequestId) return;
    rejectRequest(rejectingRequestId, rejectionReason);
    setRejectingRequestId(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Módulo de Autorizaciones y Cero Solicitudes Informales
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estandarización estricta: Se prohíben requerimientos verbales, llamadas o notas de papel. Toda salida debe vincularse a una OP y contar con aprobación del Jefe de Bodega.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-mono">
              {pendingRequests.length} pendientes de validación
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Requisition Form (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Nueva Solicitud Digital Estructurada
              </h3>
            </div>
            <span className="text-[10px] text-slate-300 font-mono">FOR-LOG-01</span>
          </div>

          <form onSubmit={handleSubmitNewRequest} className="p-5 space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  N° Orden Producción (OP) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. OP-90425"
                  value={opNumber}
                  onChange={(e) => setOpNumber(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Máquina de Destino *
                </label>
                <select
                  value={targetMachine}
                  onChange={(e) => setTargetMachine(e.target.value as MachineType)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-slate-900 focus:bg-white"
                >
                  <option value="Roland 700">Roland 700 (Offset Pliego)</option>
                  <option value="Komori">Komori (Offset Pliego)</option>
                  <option value="Guillotina Polar 115">Guillotina Polar 115</option>
                  <option value="Pegadora Automática">Pegadora Automática</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Centro de Costo *
                </label>
                <select
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Litografía Prensa Offset">Litografía Prensa Offset</option>
                  <option value="Pre-prensa CTP">Pre-prensa CTP</option>
                  <option value="Acabados y Troquelado">Acabados y Troquelado</option>
                  <option value="Pegado y Empaque">Pegado y Empaque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operario Solicitante *
                </label>
                <select
                  value={requestingOperator}
                  onChange={(e) => setRequestingOperator(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Carlos Restrepo (Prensista)">Carlos Restrepo (Prensista)</option>
                  <option value="Andrés Jaramillo (Maquinista)">Andrés Jaramillo (Maquinista)</option>
                  <option value="Mateo Henao (Operario Prensa)">Mateo Henao (Operario Prensa)</option>
                  <option value="Sebastián Gómez (Operario Prensa)">Sebastián Gómez (Operario Prensa)</option>
                  <option value="Julián Pérez (Operador Guillotina)">Julián Pérez (Operador Guillotina)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hora Límite de Entrega *
                </label>
                <input
                  type="time"
                  required
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nivel de Urgencia *
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Normal">Normal (Siguiente ruta)</option>
                  <option value="Prioritaria">Prioritaria (Arreglo en curso)</option>
                  <option value="Parada Inminente">Parada Inminente (Riesgo Paro)</option>
                </select>
              </div>
            </div>

            {/* Insumos Exactos con Stock Visible en Tiempo Real */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900">
                  Ítems e Insumos Requeridos
                </label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar ítem
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedItems.map((selItem, idx) => {
                  const currentKardexItem = kardex.find((k) => k.id === selItem.itemId);
                  const isOverStock = currentKardexItem && selItem.quantity > currentKardexItem.currentStock;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                        isOverStock ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={selItem.itemId}
                          onChange={(e) => handleItemChange(idx, e.target.value)}
                          className="flex-1 text-xs bg-white border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 font-medium truncate"
                        >
                          {kardex.map((k) => (
                            <option key={k.id} value={k.id}>
                              [{k.code}] {k.description} (Disp: {k.currentStock} {k.unit})
                            </option>
                          ))}
                        </select>

                        {selectedItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 font-medium">Cantidad:</span>
                          <input
                            type="number"
                            min={1}
                            required
                            value={selItem.quantity}
                            onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                            className="w-24 text-xs bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                          />
                          <span className="text-[11px] text-slate-500 font-medium">
                            {currentKardexItem?.unit}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-500 font-mono">
                          Stock disp: {currentKardexItem?.currentStock.toLocaleString('es-CO')}
                        </span>
                      </div>

                      {isOverStock && (
                        <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          ¡Excede el stock disponible en bodega!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especificaciones / Notas de Tiraje
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indicar si requiere aclimatación previa, gramaje específico o condiciones especiales..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Radicar Requerimiento Digital (Cero Papel)
            </button>
          </form>
        </div>

        {/* Right Column: Approval Queue & Supervisor Review (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bandeja de Autorización de Jefatura de Bodega
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono">
                {pendingRequests.length} pendientes
              </span>
            </div>

            <div className="p-4 space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{req.id}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-mono text-xs font-semibold text-slate-700">{req.opNumber}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
                          Destino: {req.targetMachine}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Solicitado por: <span className="font-semibold text-slate-800">{req.requestingOperator}</span> ({req.costCenter})
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-slate-500 font-mono">Límite: {req.deadlineTime}</span>
                      <div className="font-semibold text-amber-700">{req.urgency}</div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <p className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                      Insumos a autorizar:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {req.items.map((i, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700 font-mono text-[11px] bg-slate-50 p-1.5 rounded">
                          <span className="font-bold truncate mr-2">{i.itemCode}</span>
                          <span className="shrink-0">{i.quantity} {i.unit}</span>
                        </div>
                      ))}
                    </div>
                    {req.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions for supervisor */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRejectingRequestId(req.id);
                        setRejectionReason('Código o cantidad no coincide con orden técnica de tiro y retiro.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>

                    <button
                      onClick={() => approveRequest(req.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprobar y Asignar a Bodega</span>
                    </button>
                  </div>
                </div>
              ))}

              {pendingRequests.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700">No hay solicitudes pendientes de autorización.</p>
                  <p className="text-slate-500 mt-0.5">Todas las requisiciones activas han sido procesadas.</p>
                </div>
              )}
            </div>
          </div>

          {/* Processed requests log */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Historial de Aprobaciones Recientes
              </span>
              <span className="text-slate-500 font-mono">
                {processedRequests.length} tramitadas
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {processedRequests.map((req) => (
                <div key={req.id} className="p-3 hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{req.id}</span>
                      <span className="font-mono text-slate-500">{req.opNumber}</span>
                      <span className="text-slate-600 font-medium">({req.targetMachine})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {req.approvalStatus === 'Aprobada' ? (
                        <span className="text-emerald-700">Aprobado por {req.approvedBy}</span>
                      ) : (
                        <span className="text-rose-700">Rechazado: "{req.rejectionReason}"</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      req.approvalStatus === 'Aprobada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.approvalStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-200">
              <h3 className="text-sm font-bold text-rose-900">
                Rechazar Requerimiento por No Conformidad
              </h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Solicitud {rejectingRequestId}. Se notificará al operario para corrección.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Rechazo Formal *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-slate-900 mb-2"
                >
                  <option value="Código o cantidad no coincide con orden técnica de tiro y retiro.">
                    Código o cantidad no coincide con orden técnica de tiro y retiro.
                  </option>
                  <option value="Falta validación de pliegos útiles de sobrante anterior.">
                    Falta validación de pliegos útiles de sobrante anterior.
                  </option>
                  <option value="Cantidad excede el lote autorizado en OP sin justificación de merma.">
                    Cantidad excede el lote autorizado en OP sin justificación de merma.
                  </option>
                  <option value="Incompatibilidad técnica con el sustrato (Gramaje / Calibre).">
                    Incompatibilidad técnica con el sustrato (Gramaje / Calibre).
                  </option>
                </select>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Detalle adicional..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
