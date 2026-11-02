import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Filter,
  Printer,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Award,
  BarChart3,
  Flame,
} from 'lucide-react';

export const DesempenoTab: React.FC = () => {
  const { getMetrics, machineDowntimes, requests } = useApp();

  const [selectedShift, setSelectedShift] = useState<string>('Todos');
  const [selectedOperator, setSelectedOperator] = useState<string>('Todos');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Esta Semana');

  const metrics = getMetrics(selectedShift, selectedOperator);

  // Downtimes filtered
  const filteredDowntimes = machineDowntimes.filter((d) => {
    if (selectedShift === 'Todos') return true;
    return d.shift === selectedShift;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Context Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Dashboard de Medición de Desempeño Logístico (PHVA & KPIs)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control estadístico de entregas a pie de máquina, reducción de tiempos muertos y cumplimiento de metas operativas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Shift */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Turno:</span>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-slate-900"
              >
                <option value="Todos">Todos los Turnos</option>
                <option value="Turno 1">Turno 1 (06:00 - 14:00)</option>
                <option value="Turno 2">Turno 2 (14:00 - 22:00)</option>
                <option value="Turno 3">Turno 3 (22:00 - 06:00)</option>
              </select>
            </div>

            {/* Filter by Operator */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Bodeguero:</span>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-slate-900"
              >
                <option value="Todos">Todos</option>
                <option value="Miguel Palacio">Miguel Palacio</option>
                <option value="Juan Valencia">Juan Valencia</option>
                <option value="Mariana Sinitave">Mariana Sinitave</option>
              </select>
            </div>

            {/* Filter by Period */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-2 focus:ring-slate-900"
              >
                <option value="Hoy">Hoy</option>
                <option value="Esta Semana">Esta Semana</option>
                <option value="Mes de Octubre/Noviembre">Mes en Curso</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: OTIF */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>OTIF (On-Time In-Full)</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {metrics.otifPercentage}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">Meta: &gt; 95%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.otifPercentage)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {metrics.totalDelivered} solicitudes entregadas a tiempo y completas.
          </p>
        </div>

        {/* KPI 2: Picking Lead Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tiempo de Ciclo (Picking Lead Time)</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {metrics.avgLeadTimeMinutes}
            </span>
            <span className="text-xs text-slate-500 font-semibold">minutos</span>
            <span className="text-xs font-semibold text-indigo-700 ml-auto">Meta: &lt; 20m</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.avgLeadTimeMinutes / 25) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Desde la solicitud digital hasta la descarga en pie de máquina.
          </p>
        </div>

        {/* KPI 3: Error Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tasa de Errores de Despacho</span>
            <AlertOctagon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
              {metrics.errorRatePercentage}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">Meta: &lt; 1.5%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.errorRatePercentage * 25)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Rechazos o no conformidades por código/cantidad errónea.
          </p>
        </div>

        {/* KPI 4: Stoppages per machine */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Paradas por Falta de Material</span>
            <Printer className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-3 mt-2">
            <div>
              <span className="text-xl font-bold font-mono text-slate-900">
                {metrics.rolandDowntimeCount}
              </span>
              <span className="text-[10px] text-slate-500 block">Roland 700</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-xl font-bold font-mono text-emerald-600">
                {metrics.komoriDowntimeCount}
              </span>
              <span className="text-[10px] text-slate-500 block">Komori (0)</span>
            </div>
            <span className="text-xs font-semibold text-rose-600 ml-auto font-mono">
              {metrics.rolandDowntimeHours} h perdidas
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-2 rounded-full"
              style={{ width: `${Math.min(100, metrics.rolandDowntimeCount * 30)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Impacto directo de abastecimiento sobre tiempo improductivo.
          </p>
        </div>
      </div>

      {/* Visual Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Picking Lead Time by Shift (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Tiempo de Ciclo de Surtido Promedio por Turno (Minutos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa operativa respecto a la meta máxima de 20 minutos por entrega.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Objetivo: 20 min</span>
          </div>

          {/* Bar chart representation */}
          <div className="space-y-4 pt-2">
            {[
              { shift: 'Turno 1 (06:00 - 14:00)', leadTime: 14.8, count: 18, color: 'bg-emerald-500' },
              { shift: 'Turno 2 (14:00 - 22:00)', leadTime: 16.5, count: 12, color: 'bg-indigo-600' },
              { shift: 'Turno 3 (22:00 - 06:00)', leadTime: 18.2, count: 6, color: 'bg-amber-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.shift}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">({item.count} despachos)</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {item.leadTime} min
                    </span>
                  </div>
                </div>
                <div className="relative w-full bg-slate-100 h-6 rounded-md overflow-hidden flex items-center px-2">
                  <div
                    className={`${item.color} h-full absolute left-0 top-0 rounded-md transition-all duration-500`}
                    style={{ width: `${(item.leadTime / 25) * 100}%` }}
                  ></div>
                  {/* Goal line indicator at 20 min (80% of 25) */}
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 z-10"
                    style={{ left: '80%' }}
                    title="Meta límite: 20 min"
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-rose-500 border-t border-dashed"></span> Línea de advertencia (20 min)
            </span>
            <span>El turno 1 mantiene el mejor tiempo de respuesta (14.8 min)</span>
          </div>
        </div>

        {/* Right Chart: Prensa Downtime & Distribution (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-slate-700" />
              Paradas de Prensa por Suministro
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Roland vs Komori</span>
          </div>

          <div className="space-y-3">
            {/* Roland 700 breakdown */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Roland 700 (Pliego 70x100)</span>
                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {metrics.rolandDowntimeCount} eventos · 46 min tot.
                </span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1">
                {filteredDowntimes
                  .filter((d) => d.machine === 'Roland 700')
                  .map((d) => (
                    <li key={d.id} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>
                        <span className="font-semibold text-slate-800">{d.impactOrder}:</span> {d.reason} ({d.durationMinutes} min)
                      </span>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Komori breakdown */}
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">Komori Lithrone (Pliego 103x79)</span>
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  0 eventos · 0 min
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                100% de disponibilidad continua por suministro oportuno de kits de producción farmacéutica.
              </p>
            </div>
          </div>

          {/* Material Category Distribution */}
          <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
            <span className="text-slate-500 font-medium">Volumen de Despachos por Clase ABC:</span>
            <div className="flex h-3 rounded-md overflow-hidden">
              <div className="bg-rose-500" style={{ width: '65%' }} title="Clase A: 65% del volumen"></div>
              <div className="bg-amber-500" style={{ width: '25%' }} title="Clase B: 25% del volumen"></div>
              <div className="bg-indigo-500" style={{ width: '10%' }} title="Clase C: 10% del volumen"></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Clase A: 65%</span>
              <span>Clase B: 25%</span>
              <span>Clase C: 10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continual Improvement & Audit Hallazgos (PHVA / ISO 12647 / ISO 9001) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Plan de Mejora Continua y Hallazgos de Auditoría (Ciclo PHVA)
              </h3>
              <p className="text-xs text-slate-500">
                Seguimiento a las acciones correctivas reportadas en Informe de Auditoría FO-LOG-02 (Impresos El Día S.A.S.).
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono">
            Código: C-LOG-02
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">1. Control de Estibado de Papel</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Subsanado
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Hallazgo previo:</span> Daño en bordes de papel esmaltado por apilamiento excesivo de personal temporal.
            </p>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Acción correctiva:</span> Demarcación de altura máxima en estibas y capacitación práctica en estibado seguro.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">2. Control Higrométrico (ISO 12647)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Conforme
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Verificación:</span> Termohigrómetros calibrados registran humedad relativa entre 50% y 55% HR y 21°C.
            </p>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Beneficio:</span> Cero problemas de ondulación y registro perfecto de tiro y retiro en prensas.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">3. Ergonómia & Tránsito Seguro (ISO 45001)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Activo
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Rutas de transporte:</span> Pasillos exclusivos demarcados para estibadores hidráulicos y transpaletas.
            </p>
            <p className="text-slate-600 text-[11px]">
              <span className="font-semibold text-slate-800">Seguridad:</span> Reducción total de sobreesfuerzo físico en traslado de bobinas y resmas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
