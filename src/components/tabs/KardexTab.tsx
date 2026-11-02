import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { KardexItem, CategoryABC } from '../../types';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  History,
  ShieldAlert,
} from 'lucide-react';

export const KardexTab: React.FC = () => {
  const { kardex, adjustKardexStock } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'TODAS' | CategoryABC>('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'Normal' | 'Crítico' | 'Agotado'>('TODOS');
  const [selectedItemForAdjustment, setSelectedItemForAdjustment] = useState<KardexItem | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Conteo Cíclico Semanal');
  const [adjusterName, setAdjusterName] = useState('Mariana Sinitave (Auditor)');

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return kardex.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.costCenter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = categoryFilter === 'TODAS' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'TODOS' || item.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [kardex, searchTerm, categoryFilter, statusFilter]);

  // Summary counts
  const totalItems = kardex.length;
  const criticalItems = kardex.filter((k) => k.status === 'Crítico');
  const classACount = kardex.filter((k) => k.category === 'A').length;
  const classBCount = kardex.filter((k) => k.category === 'B').length;
  const classCCount = kardex.filter((k) => k.category === 'C').length;

  const handleOpenAdjustment = (item: KardexItem) => {
    setSelectedItemForAdjustment(item);
    setNewStockValue(item.currentStock);
    setAdjustmentReason('Conteo Cíclico Semanal (ISO 12647)');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjustment) return;
    adjustKardexStock(selectedItemForAdjustment.id, Number(newStockValue), adjustmentReason, adjusterName);
    setSelectedItemForAdjustment(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Items exist */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-900">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Alerta de Stock Crítico: {criticalItems.length} insumos por debajo del stock de seguridad
              </p>
              <p className="text-xs text-rose-700 mt-0.5">
                Riesgo de paro en línea de prensa Roland 700 / Komori. Se requiere generar orden de compra o reposición inmediata.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => {
                setStatusFilter('Crítico');
                setCategoryFilter('TODAS');
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors cursor-pointer"
            >
              Ver Críticos ({criticalItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Referencias</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalItems}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Almacén Central</span>
            <span aria-hidden="true">·</span>
            <span>Impresos El Día</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Clase A (Alta Criticidad)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {classACount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Sustratos & Tintas CMYK (±1.0%)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Clase B (Rotación Media)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {classBCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Barnices, CTP & Adhesivos (±2.5%)</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Clase C (Especiales / MRO)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {classCCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pantones, Mantillas, Flejes (Exacto)</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ej. MAT-A01, CTP-A01), descripción o ubicación..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['TODAS', 'A', 'B', 'C'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'TODAS' ? 'Todas las Clases' : `Clase ${cat}`}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Estado:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Normal">Normal</option>
              <option value="Crítico">Crítico (Bajo Stock)</option>
              <option value="Agotado">Agotado (0)</option>
            </select>
          </div>
        </div>

        {/* Results summary unboxed text */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Mostrando {filteredItems.length} de {kardex.length} materias primas</span>
            <span aria-hidden="true">·</span>
            <span>Clasificación ABC y Conteo Cíclico Activo</span>
          </div>
          <span className="text-slate-400">Normativa ISO 12647 & ISO 9001:2015</span>
        </div>
      </div>

      {/* Kardex Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descripción del Insumo</th>
                <th className="py-3 px-3 text-center">Clase ABC</th>
                <th className="py-3 px-4">Ubicación Bodega</th>
                <th className="py-3 px-4 text-right">Stock Actual</th>
                <th className="py-3 px-4 text-right">Stock Seguridad</th>
                <th className="py-3 px-3 text-center">Tolerancia</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredItems.map((item) => {
                const isCritical = item.status === 'Crítico';
                const isDepleted = item.status === 'Agotado';
                const deficit = item.minStock - item.currentStock;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isDepleted
                        ? 'bg-rose-100/40'
                        : ''
                    }`}
                  >
                    {/* Código del ítem */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.code}
                    </td>

                    {/* Descripción */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {item.classificationDetail}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span>Prensas: {item.suitableMachines.join(', ')}</span>
                        {item.humidityTempControl && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-indigo-600 font-medium">Climatizado ISO 12647</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Categoría A/B/C */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                          item.category === 'A'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.category === 'B'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Ubicación física */}
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap font-mono text-[11px]">
                      {item.location}
                    </td>

                    {/* Stock actual */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-mono text-sm font-bold tabular-nums ${
                          isCritical || isDepleted ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {item.currentStock.toLocaleString('es-CO')}
                      </span>{' '}
                      <span className="text-[11px] text-slate-500">{item.unit}</span>
                      {isCritical && (
                        <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                          Faltan {deficit.toLocaleString('es-CO')} {item.unit}
                        </div>
                      )}
                    </td>

                    {/* Stock mínimo / seguridad */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-600 tabular-nums">
                      {item.minStock.toLocaleString('es-CO')}{' '}
                      <span className="text-[11px] text-slate-400">{item.unit}</span>
                    </td>

                    {/* Tolerancia */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap font-mono text-slate-500 text-[11px]">
                      {item.targetTolerance}
                    </td>

                    {/* Estado con alertas visuales automáticas en rojo */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-semibold text-[11px] border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Stock Crítico
                        </span>
                      ) : isDepleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-900 text-white font-semibold text-[11px]">
                          Agotado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-emerald-700 font-medium text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Normal
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenAdjustment(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        title="Registrar conteo físico o ajuste cíclico"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="font-medium">No se encontraron insumos con los filtros seleccionados.</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('TODAS');
                        setStatusFilter('TODOS');
                      }}
                      className="mt-2 text-xs text-indigo-600 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for stock adjustment / cyclic count */}
      {selectedItemForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Conteo Cíclico / Ajuste de Kardex
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedItemForAdjustment.code} · {selectedItemForAdjustment.description}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-800 rounded">
                Clase {selectedItemForAdjustment.category}
              </span>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ubicación Física Actual
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedItemForAdjustment.location}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock en Sistema
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedItemForAdjustment.currentStock.toLocaleString('es-CO')} ${selectedItemForAdjustment.unit}`}
                    className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Conteo Físico Real ({selectedItemForAdjustment.unit})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de Ajuste / Protocolo
                </label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
                >
                  <option value="Conteo Cíclico Semanal (ISO 12647)">Conteo Cíclico Semanal (ISO 12647)</option>
                  <option value="Devolución de Sobrantes / Merma Descontada">Devolución de Sobrantes / Merma Descontada</option>
                  <option value="Ingreso de Compra Nueva de Proveedor">Ingreso de Compra Nueva de Proveedor</option>
                  <option value="Conciliación por Báscula Gramera (Tintas)">Conciliación por Báscula Gramera (Tintas)</option>
                  <option value="Ajuste por Daño Físico / Humedad">Ajuste por Daño Físico / Humedad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable del Conteo
                </label>
                <input
                  type="text"
                  required
                  value={adjusterName}
                  onChange={(e) => setAdjusterName(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItemForAdjustment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Guardar y Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
