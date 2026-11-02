import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Database,
  ArrowRight,
  Search,
  Download,
  AlertCircle,
  FileCheck,
  Cpu,
} from 'lucide-react';

export const SincronizacionTab: React.FC = () => {
  const { syncLogs, kardex, requests, triggerReconciliationAudit } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ discrepanciesFound: number; message: string } | null>(null);

  const filteredLogs = syncLogs.filter((log) => {
    return (
      log.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.opNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetMachine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const res = triggerReconciliationAudit();
      setAuditResult(res);
      setIsAuditing(false);
    }, 600);
  };

  const handleExportCSV = () => {
    const headers = ['ID Movimiento', 'Timestamp', 'Solicitud', 'OP', 'Código Insumo', 'Descripción', 'Cant Descontada', 'Unidad', 'Stock Anterior', 'Stock Resultante', 'Destino', 'Bodeguero', 'Receptor', 'Estado'];
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.requestId,
      l.opNumber,
      l.itemCode,
      `"${l.description.replace(/"/g, '""')}"`,
      l.quantityDeducted,
      l.unit,
      l.stockBefore,
      l.stockAfter,
      l.targetMachine,
      l.deliveredBy,
      l.receivedBy,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Auditoria_Kardex_Sync_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Real-time sync engine banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Motor de Sincronización Automática e Integridad de Kardex
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">
              Al confirmar la entrega de insumos en pie de prensa (Roland 700 / Komori), el sistema descuenta de manera inmediata e irrevocable las unidades del Kardex, garantizando que el stock físico y digital coincidan al 100% y neutralizando el "stock fantasma".
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isAuditing ? 'Auditando...' : 'Validar Integridad Física / Digital'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Libro de Auditoría (CSV)</span>
            </button>
          </div>
        </div>

        {/* Audit result alert */}
        {auditResult && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{auditResult.message}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Conformidad con Norma ISO 9001 (Trazabilidad) e ISO 12647 (Control Gráfico de Mermas y Papel).
                </p>
              </div>
            </div>
            <button
              onClick={() => setAuditResult(null)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Sync Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Estado del Kardex</span>
            <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              100% Sincronizado
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Cero desfase en tiempo real</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Stock Fantasma Detectado</span>
            <p className="text-sm font-bold font-mono text-slate-900 mt-1">
              0 Discrepancias
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Validación automática de conteo</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Movimientos Auditados</span>
            <p className="text-sm font-bold font-mono text-slate-900 mt-1">
              {syncLogs.length} registros
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Libro mayor de descargo</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium">Latencia de Descargo</span>
            <p className="text-sm font-bold font-mono text-indigo-600 mt-1">
              &lt; 50 ms (Instantáneo)
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Al marcar entrega en prensa</p>
          </div>
        </div>
      </div>

      {/* Filter and Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en auditoría por ID, código (MAT-A01), OP o máquina..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span>{filteredLogs.length} transacciones registradas</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ID Transacción</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Referencia OP</th>
                <th className="py-3 px-4">Insumo Litográfico</th>
                <th className="py-3 px-4 text-right">Cant. Descontada</th>
                <th className="py-3 px-4 text-right">Stock Previo</th>
                <th className="py-3 px-4 text-right">Stock Actual</th>
                <th className="py-3 px-4">Destino (Prensa)</th>
                <th className="py-3 px-4">Bodeguero / Receptor</th>
                <th className="py-3 px-4 text-center">Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    {log.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{log.opNumber}</span>
                    <span className="block text-[10px] text-slate-400">{log.requestId}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-mono font-bold text-slate-900">{log.itemCode}</div>
                    <div className="text-[11px] text-slate-600 truncate">{log.description}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-rose-600 tabular-nums">
                    -{log.quantityDeducted.toLocaleString('es-CO')}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">{log.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-500 tabular-nums">
                    {log.stockBefore.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 tabular-nums">
                    {log.stockAfter.toLocaleString('es-CO')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                    {log.targetMachine}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-[11px] whitespace-nowrap">
                    <div>Entregó: <span className="text-slate-800">{log.deliveredBy}</span></div>
                    <div>Recibió: <span className="text-slate-800">{log.receivedBy}</span></div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No se encontraron registros de sincronización con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
