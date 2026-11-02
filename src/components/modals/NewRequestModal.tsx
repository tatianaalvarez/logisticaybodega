import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MachineType, UrgencyLevel } from '../../types';
import { X, Plus, Trash2, AlertTriangle, Send } from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose }) => {
  const { kardex, createRequest } = useApp();

  const [opNumber, setOpNumber] = useState(`OP-${Math.floor(90430 + Math.random() * 50)}`);
  const [costCenter, setCostCenter] = useState('Litografía Prensa Offset');
  const [requestingOperator, setRequestingOperator] = useState('Carlos Restrepo (Prensista)');
  const [targetMachine, setTargetMachine] = useState<MachineType>('Roland 700');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [deadlineTime, setDeadlineTime] = useState('14:30');
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number }[]>([
    { itemId: kardex[0]?.id || '', quantity: 1000 },
  ]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    const available = kardex.find((k) => !selectedItems.some((s) => s.itemId === k.id));
    if (available) {
      setSelectedItems([...selectedItems, { itemId: available.id, quantity: 10 }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, itemId: string) => {
    const updated = [...selectedItems];
    updated[index].itemId = itemId;
    setSelectedItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedItems];
    updated[index].quantity = quantity;
    setSelectedItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = createRequest({
      opNumber,
      costCenter,
      requestingOperator,
      targetMachine,
      urgency,
      deadlineTime,
      items: selectedItems,
      notes,
    });

    if (!res.success) {
      setError(res.error || 'Error al validar.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">Solicitud Digital de Suministros Litográficos</h3>
            <p className="text-xs text-slate-300 font-mono">Impresos El Día S.A.S. · Requerimiento Formal</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Orden de Producción (OP) *
              </label>
              <input
                type="text"
                required
                value={opNumber}
                onChange={(e) => setOpNumber(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prensa de Destino *
              </label>
              <select
                value={targetMachine}
                onChange={(e) => setTargetMachine(e.target.value as MachineType)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-slate-900"
              >
                <option value="Roland 700">Roland 700 (Offset Pliego)</option>
                <option value="Komori">Komori Lithrone (Offset Pliego)</option>
                <option value="Guillotina Polar 115">Guillotina Polar 115</option>
                <option value="Pegadora Automática">Pegadora Automática</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgencia *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
              >
                <option value="Normal">Normal</option>
                <option value="Prioritaria">Prioritaria</option>
                <option value="Parada Inminente">Parada Inminente</option>
              </select>
            </div>
          </div>

          {/* Insumos selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                Insumos a Surtir
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar otro ítem
              </button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((selItem, idx) => {
                const currentKardexItem = kardex.find((k) => k.id === selItem.itemId);
                const isOverStock = currentKardexItem && selItem.quantity > currentKardexItem.currentStock;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                      isOverStock ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
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
                            [{k.code}] {k.description} (Stock: {k.currentStock} {k.unit})
                          </option>
                        ))}
                      </select>

                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
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
                        Disp: {currentKardexItem?.currentStock.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalle o requerimiento especial..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Registrar Solicitud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
