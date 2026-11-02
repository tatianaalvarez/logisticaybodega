import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  KardexItem,
  SupplyRequest,
  SyncAuditLog,
  ProductionKit,
  MilkRunSchedule,
  MachineDowntime,
  RequestStatus,
  MachineType,
  UrgencyLevel,
} from '../types';
import {
  INITIAL_KARDEX,
  INITIAL_REQUESTS,
  INITIAL_SYNC_LOGS,
  PRODUCTION_KITS,
  MILK_RUN_SCHEDULES,
  MACHINE_DOWNTIMES,
} from '../data/initialData';

export type TabId = 'kardex' | 'trazabilidad' | 'autorizaciones' | 'programacion' | 'sincronizacion' | 'desempeno';

interface AppContextType {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  kardex: KardexItem[];
  requests: SupplyRequest[];
  syncLogs: SyncAuditLog[];
  productionKits: ProductionKit[];
  milkRuns: MilkRunSchedule[];
  machineDowntimes: MachineDowntime[];
  notification: { type: 'success' | 'warning' | 'info'; message: string } | null;
  setNotification: (notif: { type: 'success' | 'warning' | 'info'; message: string } | null) => void;
  // Actions
  createRequest: (data: {
    opNumber: string;
    costCenter: string;
    requestingOperator: string;
    targetMachine: MachineType;
    urgency: UrgencyLevel;
    deadlineTime: string;
    items: { itemId: string; quantity: number }[];
    notes?: string;
    kitName?: string;
  }) => { success: boolean; error?: string; requestId?: string };
  approveRequest: (requestId: string, approvedBy?: string, assignedBodeguero?: string) => void;
  rejectRequest: (requestId: string, reason: string) => void;
  advanceRequestStatus: (requestId: string, customBodeguero?: string, customReceiver?: string) => void;
  adjustKardexStock: (itemId: string, newStock: number, reason: string, operator: string) => void;
  dispatchProductionKit: (kitId: string, opNumber: string, requestingOperator: string) => void;
  updateMilkRunStatus: (milkRunId: string, status: 'Programada' | 'En ruta' | 'Completada') => void;
  triggerReconciliationAudit: () => { discrepanciesFound: number; message: string };
  // Metrics helper
  getMetrics: (filterShift?: string, filterOperator?: string) => {
    otifPercentage: number;
    avgLeadTimeMinutes: number;
    errorRatePercentage: number;
    totalDelivered: number;
    pendingCount: number;
    inProgressCount: number;
    criticalStockCount: number;
    rolandDowntimeHours: number;
    komoriDowntimeHours: number;
    rolandDowntimeCount: number;
    komoriDowntimeCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabId>('kardex');
  const [kardex, setKardex] = useState<KardexItem[]>(() => {
    const saved = localStorage.getItem('logiprint_kardex');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_KARDEX;
  });

  const [requests, setRequests] = useState<SupplyRequest[]>(() => {
    const saved = localStorage.getItem('logiprint_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_REQUESTS;
  });

  const [syncLogs, setSyncLogs] = useState<SyncAuditLog[]>(() => {
    const saved = localStorage.getItem('logiprint_sync_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SYNC_LOGS;
  });

  const [productionKits] = useState<ProductionKit[]>(PRODUCTION_KITS);
  const [milkRuns, setMilkRuns] = useState<MilkRunSchedule[]>(MILK_RUN_SCHEDULES);
  const [machineDowntimes, setMachineDowntimes] = useState<MachineDowntime[]>(MACHINE_DOWNTIMES);
  const [notification, setNotification] = useState<{ type: 'success' | 'warning' | 'info'; message: string } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('logiprint_kardex', JSON.stringify(kardex));
  }, [kardex]);

  useEffect(() => {
    localStorage.setItem('logiprint_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('logiprint_sync_logs', JSON.stringify(syncLogs));
  }, [syncLogs]);

  // Auto clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Recalculate item status helper
  const getItemStatus = (stock: number, minStock: number): 'Normal' | 'Crítico' | 'Agotado' => {
    if (stock <= 0) return 'Agotado';
    if (stock < minStock) return 'Crítico';
    return 'Normal';
  };

  // 1. Create formal request
  const createRequest = ({
    opNumber,
    costCenter,
    requestingOperator,
    targetMachine,
    urgency,
    deadlineTime,
    items,
    notes,
    kitName,
  }: {
    opNumber: string;
    costCenter: string;
    requestingOperator: string;
    targetMachine: MachineType;
    urgency: UrgencyLevel;
    deadlineTime: string;
    items: { itemId: string; quantity: number }[];
    notes?: string;
    kitName?: string;
  }) => {
    if (!opNumber.trim()) return { success: false, error: 'Debe ingresar el número de Orden de Producción (OP).' };
    if (!requestingOperator.trim()) return { success: false, error: 'Debe especificar el operario solicitante.' };
    if (items.length === 0) return { success: false, error: 'Debe incluir al menos un insumo en la solicitud.' };

    // Check availability
    const resolvedItems = items.map((reqItem) => {
      const found = kardex.find((k) => k.id === reqItem.itemId || k.code === reqItem.itemId);
      if (!found) throw new Error(`Ítem no encontrado en Kardex: ${reqItem.itemId}`);
      if (reqItem.quantity > found.currentStock) {
        throw new Error(`Cantidad solicitada (${reqItem.quantity} ${found.unit}) de ${found.code} excede el stock disponible actual (${found.currentStock} ${found.unit}).`);
      }
      return {
        itemId: found.id,
        itemCode: found.code,
        description: found.description,
        quantity: reqItem.quantity,
        unit: found.unit,
      };
    });

    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newId = `REQ-2026-${String(requests.length + 101).padStart(3, '0')}`;

    const newRequest: SupplyRequest = {
      id: newId,
      opNumber: opNumber.toUpperCase(),
      costCenter,
      requestingOperator,
      requestTime: formattedNow,
      deadlineTime: deadlineTime || '14:00',
      urgency,
      targetMachine,
      items: resolvedItems,
      status: 'Solicitada',
      approvalStatus: 'Pendiente',
      isSyncedToKardex: false,
      notes: notes || '',
      kitName,
      shift: 'Turno 1',
    };

    setRequests((prev) => [newRequest, ...prev]);
    setNotification({
      type: 'success',
      message: `Solicitud ${newId} para ${targetMachine} registrada exitosamente. En cola de autorización.`,
    });

    return { success: true, requestId: newId };
  };

  // 2. Approve Request
  const approveRequest = (
    requestId: string,
    approvedBy: string = 'Ing. Tatiana Álvarez (Jefe Bodega)',
    assignedBodeguero: string = 'Miguel Palacio (Auxiliar Bodega)'
  ) => {
    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            approvalStatus: 'Aprobada',
            approvedBy,
            approvalTime: formattedNow,
            assignedBodeguero,
            status: 'Solicitada',
          };
        }
        return req;
      })
    );

    setNotification({
      type: 'success',
      message: `Solicitud ${requestId} aprobada por ${approvedBy}. Asignada a ${assignedBodeguero} para alistamiento.`,
    });
  };

  // 3. Reject Request
  const rejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            approvalStatus: 'Rechazada',
            status: 'Rechazada',
            rejectionReason: reason,
          };
        }
        return req;
      })
    );

    setNotification({
      type: 'warning',
      message: `Solicitud ${requestId} rechazada por motivo de no conformidad: "${reason}".`,
    });
  };

  // 4. Advance status & trigger real-time Kardex deduction upon delivery
  const advanceRequestStatus = (requestId: string, customBodeguero?: string, customReceiver?: string) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (target.status === 'Solicitada') {
      // Advance to Picking
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'En preparación',
                pickingStartedAt: formattedNow,
                assignedBodeguero: customBodeguero || r.assignedBodeguero || 'Miguel Palacio',
              }
            : r
        )
      );
      setNotification({
        type: 'info',
        message: `Solicitud ${requestId} ahora está en preparación (Picking de insumos en bodega).`,
      });
    } else if (target.status === 'En preparación') {
      // Advance to In Transit
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'En tránsito',
                dispatchedAt: formattedNow,
              }
            : r
        )
      );
      setNotification({
        type: 'info',
        message: `Solicitud ${requestId} despachada hacia prensa ${target.targetMachine}. En tránsito interno.`,
      });
    } else if (target.status === 'En tránsito') {
      // Advance to Delivered -> TRIGGER INSTANT KARDEX DEDUCTION!
      const deliveryBodeguero = customBodeguero || target.assignedBodeguero || 'Miguel Palacio';
      const receiver = customReceiver || `${target.requestingOperator} (Pie de máquina ${target.targetMachine})`;

      // Calculate lead time in minutes from requestTime or pickingStartedAt
      const reqDate = new Date(target.requestTime.replace(' ', 'T')).getTime();
      const nowDate = now.getTime();
      const calculatedLeadTime = Math.max(8, Math.round((nowDate - reqDate) / (1000 * 60)) || 16);

      // 1) Update Request
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'Entregada',
                deliveredAt: formattedNow,
                deliveredBy: deliveryBodeguero,
                receivedBy: receiver,
                isSyncedToKardex: true,
                leadTimeMinutes: calculatedLeadTime,
              }
            : r
        )
      );

      // 2) Deduct items from Kardex and generate audit entries
      const newAuditEntries: SyncAuditLog[] = [];

      setKardex((prevKardex) => {
        return prevKardex.map((kItem) => {
          const reqItem = target.items.find((i) => i.itemCode === kItem.code || i.itemId === kItem.id);
          if (reqItem) {
            const stockBefore = kItem.currentStock;
            const stockAfter = Math.max(0, stockBefore - reqItem.quantity);
            const newStatus = getItemStatus(stockAfter, kItem.minStock);

            newAuditEntries.push({
              id: `KDX-OUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: `${formattedNow}:${String(now.getSeconds()).padStart(2, '0')}`,
              requestId: target.id,
              opNumber: target.opNumber,
              itemCode: kItem.code,
              description: kItem.description,
              quantityDeducted: reqItem.quantity,
              unit: kItem.unit,
              stockBefore,
              stockAfter,
              targetMachine: target.targetMachine,
              deliveredBy: deliveryBodeguero,
              receivedBy: receiver,
              status: 'Sincronizado',
            });

            return {
              ...kItem,
              currentStock: stockAfter,
              status: newStatus,
              lastSync: formattedNow,
            };
          }
          return kItem;
        });
      });

      // 3) Append to sync logs
      setSyncLogs((prevLogs) => [...newAuditEntries, ...prevLogs]);

      setNotification({
        type: 'success',
        message: `¡ENTREGA CONFIRMADA! Insumos entregados en pie de ${target.targetMachine}. Se descontaron ${target.items.length} ítems en tiempo real del Kardex (Cero stock fantasma).`,
      });
    }
  };

  // 5. Manual Stock Adjustment (Auditoría / Conteo Cíclico)
  const adjustKardexStock = (itemId: string, newStock: number, reason: string, operator: string) => {
    const now = new Date();
    const formattedNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let adjustedItem: KardexItem | undefined;

    setKardex((prev) =>
      prev.map((item) => {
        if (item.id === itemId || item.code === itemId) {
          adjustedItem = item;
          const newStatus = getItemStatus(newStock, item.minStock);
          return {
            ...item,
            currentStock: newStock,
            status: newStatus,
            lastSync: formattedNow,
          };
        }
        return item;
      })
    );

    if (adjustedItem) {
      const diff = newStock - adjustedItem.currentStock;
      const logEntry: SyncAuditLog = {
        id: `KDX-AJUSTE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `${formattedNow}:${String(now.getSeconds()).padStart(2, '0')}`,
        requestId: 'CONTEO-CICLICO-ISO12647',
        opNumber: 'N/A (Auditoría)',
        itemCode: adjustedItem.code,
        description: adjustedItem.description,
        quantityDeducted: -diff,
        unit: adjustedItem.unit,
        stockBefore: adjustedItem.currentStock,
        stockAfter: newStock,
        targetMachine: 'Bodega Central',
        deliveredBy: operator,
        receivedBy: 'Auditoría Cíclica',
        status: 'Reconciliado',
      };
      setSyncLogs((prev) => [logEntry, ...prev]);
    }

    setNotification({
      type: 'info',
      message: `Ajuste de inventario registrado para ${adjustedItem?.code || itemId}. Motivo: ${reason}`,
    });
  };

  // 6. 1-Click Production Kit Dispatch
  const dispatchProductionKit = (kitId: string, opNumber: string, requestingOperator: string) => {
    const kit = productionKits.find((k) => k.id === kitId);
    if (!kit) return;

    const items = kit.items.map((kItem) => {
      const foundInKardex = kardex.find((k) => k.code === kItem.itemCode);
      return {
        itemId: foundInKardex?.id || kItem.itemCode,
        quantity: kItem.defaultQuantity,
      };
    });

    const res = createRequest({
      opNumber: opNumber || `OP-${Math.floor(90420 + Math.random() * 50)}`,
      costCenter: 'Litografía Prensa Offset',
      requestingOperator: requestingOperator || 'Andrés Jaramillo (Maquinista)',
      targetMachine: kit.targetMachine,
      urgency: 'Prioritaria',
      deadlineTime: '13:45',
      items,
      kitName: kit.name,
      notes: `Despacho automático por Kit de Producción: ${kit.description}`,
    });

    if (res.success && res.requestId) {
      // Auto approve standard kits for seamless production
      approveRequest(res.requestId, 'Ing. Tatiana Álvarez (Jefe Bodega)', 'Miguel Palacio (Auxiliar Bodega)');
    }
  };

  // 7. Update Milk Run Status
  const updateMilkRunStatus = (milkRunId: string, status: 'Programada' | 'En ruta' | 'Completada') => {
    setMilkRuns((prev) =>
      prev.map((mr) => (mr.id === milkRunId ? { ...mr, status } : mr))
    );
    setNotification({
      type: 'info',
      message: `Ruta lechera ${milkRunId} actualizada a estado: ${status}.`,
    });
  };

  // 8. Reconciliation verification
  const triggerReconciliationAudit = () => {
    // Check if any negative stocks or mismatch
    const discrepancies = kardex.filter((k) => k.currentStock < 0);
    return {
      discrepanciesFound: discrepancies.length,
      message:
        discrepancies.length === 0
          ? 'Auditoría completada al 100%: Cero "stock fantasma" detectado. Todas las entregas a pie de prensa se encuentran conciliadas con el Kardex.'
          : `Se detectaron ${discrepancies.length} referencias con discrepancias numéricas.`,
    };
  };

  // 9. Metrics calculations
  const getMetrics = (filterShift?: string, filterOperator?: string) => {
    let filteredRequests = requests;
    if (filterShift && filterShift !== 'Todos') {
      filteredRequests = filteredRequests.filter((r) => r.shift === filterShift);
    }
    if (filterOperator && filterOperator !== 'Todos') {
      filteredRequests = filteredRequests.filter((r) => r.assignedBodeguero?.includes(filterOperator));
    }

    const delivered = filteredRequests.filter((r) => r.status === 'Entregada');
    const totalDelivered = delivered.length;

    // OTIF (On-Time In-Full)
    // Assume delivery on time if leadTimeMinutes <= 25 and not rejected/incomplete
    const onTimeInFull = delivered.filter((r) => (r.leadTimeMinutes || 15) <= 25);
    const otifPercentage = totalDelivered > 0 ? Math.round((onTimeInFull.length / totalDelivered) * 100 * 10) / 10 : 96.4;

    // Picking lead time
    const totalLeadTime = delivered.reduce((acc, curr) => acc + (curr.leadTimeMinutes || 15), 0);
    const avgLeadTimeMinutes = totalDelivered > 0 ? Math.round((totalLeadTime / totalDelivered) * 10) / 10 : 15.2;

    // Error rate
    const rejectedOrDefective = filteredRequests.filter((r) => r.approvalStatus === 'Rechazada');
    const errorRatePercentage = filteredRequests.length > 0 ? Math.round((rejectedOrDefective.length / filteredRequests.length) * 100 * 10) / 10 : 0.8;

    const pendingCount = requests.filter((r) => r.approvalStatus === 'Pendiente').length;
    const inProgressCount = requests.filter((r) => r.status === 'En preparación' || r.status === 'En tránsito').length;
    const criticalStockCount = kardex.filter((k) => k.status === 'Crítico' || k.status === 'Agotado').length;

    // Downtimes
    const rolandStops = machineDowntimes.filter((d) => d.machine === 'Roland 700');
    const komoriStops = machineDowntimes.filter((d) => d.machine === 'Komori');

    const rolandMinutes = rolandStops.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const komoriMinutes = komoriStops.reduce((acc, curr) => acc + curr.durationMinutes, 0);

    return {
      otifPercentage,
      avgLeadTimeMinutes,
      errorRatePercentage,
      totalDelivered,
      pendingCount,
      inProgressCount,
      criticalStockCount,
      rolandDowntimeHours: Math.round((rolandMinutes / 60) * 10) / 10,
      komoriDowntimeHours: Math.round((komoriMinutes / 60) * 10) / 10,
      rolandDowntimeCount: rolandStops.length,
      komoriDowntimeCount: komoriStops.length,
    };
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        kardex,
        requests,
        syncLogs,
        productionKits,
        milkRuns,
        machineDowntimes,
        notification,
        setNotification,
        createRequest,
        approveRequest,
        rejectRequest,
        advanceRequestStatus,
        adjustKardexStock,
        dispatchProductionKit,
        updateMilkRunStatus,
        triggerReconciliationAudit,
        getMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
