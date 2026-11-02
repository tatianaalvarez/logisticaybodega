export type CategoryABC = 'A' | 'B' | 'C';

export type MachineType = 'Roland 700' | 'Komori' | 'Guillotina Polar 115' | 'Pegadora Automática';

export type RequestStatus = 'Solicitada' | 'En preparación' | 'En tránsito' | 'Entregada' | 'Rechazada';

export type ApprovalStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';

export type UrgencyLevel = 'Normal' | 'Prioritaria' | 'Parada Inminente';

export interface KardexItem {
  id: string;
  code: string;
  description: string;
  category: CategoryABC;
  classificationDetail: string;
  location: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costCenter: string;
  suitableMachines: ('Roland 700' | 'Komori' | 'Ambas' | 'Acabados' | 'Pre-prensa' | 'Pegadora Automática' | 'Guillotina Polar 115')[];
  status: 'Normal' | 'Crítico' | 'Agotado';
  lastSync: string;
  humidityTempControl: boolean;
  targetTolerance: string;
}

export interface RequisitionItem {
  itemId: string;
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface SupplyRequest {
  id: string;
  opNumber: string;
  costCenter: string;
  requestingOperator: string;
  requestTime: string;
  deadlineTime: string;
  urgency: UrgencyLevel;
  targetMachine: MachineType;
  items: RequisitionItem[];
  status: RequestStatus;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvalTime?: string;
  rejectionReason?: string;
  assignedBodeguero?: string;
  pickingStartedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  deliveredBy?: string;
  receivedBy?: string;
  kitName?: string;
  milkRunId?: string;
  isSyncedToKardex: boolean;
  leadTimeMinutes?: number;
  notes?: string;
  shift: 'Turno 1' | 'Turno 2' | 'Turno 3';
}

export interface SyncAuditLog {
  id: string;
  timestamp: string;
  requestId: string;
  opNumber: string;
  itemCode: string;
  description: string;
  quantityDeducted: number;
  unit: string;
  stockBefore: number;
  stockAfter: number;
  targetMachine: string;
  deliveredBy: string;
  receivedBy: string;
  status: 'Sincronizado' | 'Reconciliado';
}

export interface ProductionKit {
  id: string;
  name: string;
  targetMachine: 'Roland 700' | 'Komori';
  description: string;
  productionType: string;
  items: {
    itemCode: string;
    description: string;
    defaultQuantity: number;
    unit: string;
  }[];
}

export interface MilkRunSchedule {
  id: string;
  scheduledTime: string;
  shift: 'Turno 1' | 'Turno 2' | 'Turno 3';
  carrierEquipment: string;
  stops: string[];
  status: 'Programada' | 'En ruta' | 'Completada';
  assignedOperator: string;
  machineDestinations: MachineType[];
  notes: string;
}

export interface MachineDowntime {
  id: string;
  machine: 'Roland 700' | 'Komori';
  date: string;
  shift: 'Turno 1' | 'Turno 2' | 'Turno 3';
  durationMinutes: number;
  reason: string;
  missingItemCode?: string;
  resolvedAt: string;
  impactOrder: string;
}
