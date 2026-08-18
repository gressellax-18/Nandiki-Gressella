export type UserRole =
  | "WAREHOUSE_MANAGER"
  | "OPERATIONS_SUPERVISOR"
  | "PICKER"
  | "PACKER"
  | "DISPATCH_COORDINATOR";

export type OrderPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type OrderStatus =
  | "CREATED"
  | "PRIORITIZED"
  | "ALLOCATED"
  | "PICKING"
  | "PICKED"
  | "PACKING"
  | "PACKED"
  | "PENDING_QC"
  | "QC_PASSED"
  | "QC_FAILED"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "ON_HOLD"
  | "EXCEPTION";

export type InventoryHealth = "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";

export type WorkerStatus = "AVAILABLE" | "PICKING" | "PACKING" | "BREAK" | "OFFLINE";

export type ExceptionType = "MISSING_ITEM" | "DAMAGED_ITEM" | "QC_FAILED" | "STOCKOUT" | "BOTTLENECK_DELAY";
export type ExceptionStatus = "DETECTED" | "ANALYZING" | "ACTION_PROPOSED" | "SUPERVISOR_REVIEW" | "RESOLVED" | "REJECTED";

export interface OrderItem {
  id: string;
  sku: string;
  productName: string;
  quantityRequested: number;
  quantityAllocated: number;
  quantityPicked: number;
  quantityPacked: number;
  unitPrice: number;
  unitPriceINR?: number;
  location: string; // e.g. B-05-01
  zone: string; // e.g. B
  weightKg: number;
}

export type VIPTier =
  | "VIP_DIAMOND"
  | "FLIPKART_SUPER_ELITE"
  | "VIP_PLATINUM"
  | "TATKAL_PRIME"
  | "STANDARD";

export interface Order {
  id: string; // e.g. ORD-1048
  customerName: string;
  customerRegion: string; // e.g. Bengaluru Hub, Mumbai BKC, Delhi NCR
  customerCity?: string;
  customerPincode?: string;
  vipTier?: VIPTier;
  deliverySlot?: string; // e.g. "Tatkal 2-Hour Express", "Same-Day Prime Slot"
  orderValueINR?: number;
  createdAt: string;
  deadline: string; // ISO string
  minutesRemaining: number;
  status: OrderStatus;
  priority: OrderPriority;
  priorityScore: number; // 0 - 100
  priorityReasons: string[];
  items: OrderItem[];
  totalUnits: number;
  totalWeightKg: number;
  assignedPickerId?: string;
  assignedPackerId?: string;
  carrier: string; // Ekart Express, BlueDart Air, Delhivery Prime, Shadowfax, SwiftShip
  trackingNumber?: string;
  slaRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  slaRiskScore: number;
  slaRiskReasons: string[];
  allocationNotes?: string;
  packingNotes?: string;
  qcNotes?: string;
  dispatchedAt?: string;
}

export interface ProductInventory {
  sku: string;
  name: string;
  category: string;
  // Multi-state detailed inventory breakdown
  onHand: number;
  reserved: number;
  available: number;
  picking: number;
  packed: number;
  damaged: number;
  missing: number;
  quarantine: number;
  incoming: number;
  // Legacy aliases for backwards-compat
  currentStock: number;
  reservedStock: number;
  damagedStock: number;
  availableStock: number;
  incomingQty: number;
  reorderPoint: number;
  safetyStock: number;
  suggestedReorderQty: number;
  zone: string; // A, B, C, D, E
  shelf: string; // 01 - 20
  bin: string; // 01 - 10
  locationString: string; // A-12-04
  supplier: string;
  leadTimeDays: number;
  unitCost: number;
  priceINR?: number;
  discountPercent?: number;
  stockBadge?: string; // "🔥 Only 2 left in stock!", "⚡ 4 units remaining in Bin B-05-01"
  flipkartRank?: string; // "#1 Bestseller in Electronics", "Flipkart Assured VIP"
  health: InventoryHealth;
  dailyVelocity: number; // avg units/day
  daysOfSupplyRemaining: number;
  demandHistory7d: number[];
  demandHistory30dTotal: number;
  itemNumber?: string; // e.g. "ITEM-WH1042-IND"
  regionalHubStocks?: RegionalHubStock[];
  secondaryLocations?: {
    location: string;
    zone: string;
    qty: number;
  }[];
}

export interface RegionalHubStock {
  hubCode: "HYD" | "BLR" | "MUM" | "DEL" | "MAA" | "PNQ" | "CCU" | "AMD" | "VJA";
  hubName: string;
  city: string;
  state: string;
  onHand: number;
  allocated: number;
  available: number;
  inTransit: number;
  reorderLevel: number;
  bufferHealth: "OPTIMAL" | "LOW" | "CRITICAL_SHORTAGE" | "SURPLUS";
  avgDeliveryHours: number;
  activeOrdersCount: number;
  slaCompliancePercent: number;
  csatRating: number;
  localAisles: string;
}

export interface AreaItemFeedback {
  id: string;
  orderId: string;
  sku: string;
  itemName: string;
  customerName: string;
  cityArea: string;
  hubCode: "HYD" | "BLR" | "MUM" | "DEL" | "MAA" | "PNQ" | "CCU" | "AMD" | "VJA";
  hubName: string;
  rating: number;
  timestamp: string;
  deliverySpeed: string;
  stockAvailabilityNote: string;
  comment: string;
  packageStatus: "PERFECT" | "GOOD" | "DAMAGED";
  wasOnTime: boolean;
}

export interface WarehouseZone {
  id: string; // A, B, C, D, E
  name: string;
  description: string;
  activeWorkers: number;
  activeTasks: number;
  avgPickTimeMinutes: number;
  congestionScore: number; // 0 - 100
  congestionLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  shelfCount: number;
  totalCapacity: number;
  occupiedCapacity: number;
  bottleneckDetected: boolean;
  bottleneckReason?: string;
  recommendedAction?: string;
  coordinates: { x: number; y: number; width: number; height: number };
}

export interface Worker {
  id: string; // W-01
  name: string;
  role: "Picker" | "Packer" | "QC Inspector" | "Forklift Operator" | "Lead Supervisor";
  status: WorkerStatus;
  currentZone: string;
  tasksAssigned: number;
  tasksCompletedToday: number;
  avgPickTimeMinutes: number;
  accuracyRate: number; // 99.4%
  currentWorkloadPercent: number; // e.g. 92%
  shift: "Morning (06:00 - 14:00)" | "Day (14:00 - 22:00)" | "Night (22:00 - 06:00)";
  efficiencyScore: number; // 0 - 100
  avatarColor: string;
  currentTaskId?: string;
  zoneFamiliarity: Record<string, number>; // zone -> score 1-100
  phone?: string;
  cityHub?: string;
  experienceYears?: number;
  specialization?: string;
  badges?: string[];
}

export interface PickingRouteStep {
  stepNumber: number;
  location: string;
  zone: string;
  sku: string;
  productName: string;
  quantity: number;
  status: "PENDING" | "PICKED" | "MISSING" | "DAMAGED";
  distanceFromPrevMeters: number;
}

export interface PickingTask {
  id: string; // PK-204
  orderId: string;
  workerId: string;
  workerName: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  itemsCount: number;
  totalUnits: number;
  unoptimizedDistanceMeters: number;
  optimizedDistanceMeters: number;
  estimatedTimeSavedMinutes: number;
  routeSteps: PickingRouteStep[];
  startedAt?: string;
  completedAt?: string;
}

export interface PackingTask {
  id: string; // PCK-102
  orderId: string;
  packerId: string;
  packerName: string;
  status: "QUEUED" | "PACKING" | "COMPLETED" | "EXCEPTION";
  boxType: "BOX-S" | "BOX-M" | "BOX-L" | "BOX-XL" | "CUSTOM-THERMAL";
  itemsVerified: number;
  totalItems: number;
  weightVerifiedKg: number;
  maxWeightAllowedKg: number;
  packingSlipGenerated: boolean;
}

export interface QualityCheck {
  id: string; // QC-501
  orderId: string;
  inspectorName: string;
  status: "PENDING" | "PASSED" | "FAILED";
  checklist: {
    skuVerification: boolean;
    quantityVerification: boolean;
    damageInspection: boolean;
    packagingIntegrity: boolean;
    orderIdMatching: boolean;
  };
  failureReason?: string;
  notes?: string;
  timestamp?: string;
}

export interface OperationalException {
  id: string; // EXP-401
  orderId: string;
  type: ExceptionType;
  reportedBy: string;
  reportedRole: string;
  sku?: string;
  productName?: string;
  location?: string;
  zone?: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: ExceptionStatus;
  aiAnalysis: {
    rootCause: string;
    alternativeFound: boolean;
    alternativeLocation?: string;
    alternativeZone?: string;
    alternativeQtyAvailable?: number;
    recommendedAction: string;
    projectedImpact: string;
  };
  resolution?: {
    actionTaken: string;
    resolvedBy: string;
    resolvedAt: string;
    notes: string;
  };
  createdAt: string;
}

export interface AIRecommendation {
  id: string; // REC-801
  category: "PRIORITIZATION" | "ALLOCATION" | "ROUTE_OPTIMIZATION" | "WORKFORCE_REBALANCE" | "REORDER" | "BOTTLENECK";
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  title: string;
  summary: string;
  rationaleData: string[];
  expectedImpact: string;
  recommendedAction: string;
  affectedEntities: {
    type: "ORDER" | "WORKER" | "ZONE" | "PRODUCT";
    id: string;
    label: string;
  }[];
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "APPLIED";
  actionPayload?: any;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  eventType:
    | "ORDER_CREATED"
    | "PRIORITY_CALCULATED"
    | "INVENTORY_ALLOCATED"
    | "WORKER_ASSIGNED"
    | "PICKING_STARTED"
    | "PICKING_COMPLETED"
    | "EXCEPTION_RAISED"
    | "AI_RECOMMENDATION_GENERATED"
    | "SUPERVISOR_APPROVAL"
    | "SUPERVISOR_OVERRIDE"
    | "PACKING_COMPLETED"
    | "QC_PASSED"
    | "QC_FAILED"
    | "DISPATCH_COMPLETED"
    | "REORDER_TRIGGERED"
    | "WHAT_IF_SIMULATED";
  actor: string; // "System (AI Engine)", "Supervisor Alex", "Picker Ravi", etc.
  orderId?: string;
  summary: string;
  details: string;
  badgeColor: string;
}

export interface WarehouseMetrics {
  totalOrders: number;
  ordersAtRisk: number;
  ordersDispatchedToday: number;
  ordersInPicking: number;
  ordersInPacking: number;
  ordersInQC: number;
  inventoryHealthScore: number; // 0 - 100%
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  activeWorkersCount: number;
  pickingEfficiencyScore: number; // 94.2%
  packingEfficiencyScore: number; // 96.8%
  dispatchSlaRate: number; // 98.4%
  openExceptionsCount: number;
  activeBottlenecksCount: number;
  avgOrderFulfillmentTimeMinutes: number;
}

export interface WhatIfScenarioResult {
  scenarioName: string;
  description: string;
  before: {
    ordersAtRisk: number;
    avgPickTimeMinutes: number;
    slaBreachPercentage: number;
    activeBacklogTasks: number;
    delayedOrdersCount: number;
  };
  after: {
    ordersAtRisk: number;
    avgPickTimeMinutes: number;
    slaBreachPercentage: number;
    activeBacklogTasks: number;
    delayedOrdersCount: number;
  };
  impactSummary: string;
  aiContingencyPlan: string[];
  mitigationSteps: string[];
}

export interface DeliveryAgent {
  id: string; // e.g. D-07
  name: string;
  phone: string;
  currentArea: string; // e.g. "Vijayawada Sector 4", "Koramangala 5th Block"
  activeDeliveries: number;
  route: string;
  routeOverlapPercentage: number;
  distanceFromHubKm: number;
  etaMinutes: number;
  workloadPercent: number;
  onTimeRate: number; // e.g. 98.6%
  vehicleType: "EV 2-Wheeler" | "Express Cargo Van" | "Hyperlocal Bike";
  status: "ON_DELIVERY" | "AVAILABLE" | "RETURNING_TO_HUB" | "OFFLINE";
  avatarColor: string;
}

export type ShipmentStage =
  | "PACKED"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "REGIONAL_HUB"
  | "LOCAL_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface ShipmentMilestone {
  stage: ShipmentStage;
  title: string;
  location: string;
  timestamp?: string;
  completed: boolean;
  active: boolean;
  notes?: string;
}

export interface OrderShipmentTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  currentStage: ShipmentStage;
  currentLocationName: string; // e.g. "Vijayawada Regional Hub"
  nextLocationName: string; // e.g. "Local Hub B (Sector 7)"
  distanceRemainingKm: number;
  etaFormatted: string; // e.g. "Today, 6:35 PM"
  deliveryWindow: string; // e.g. "6:00 PM – 7:00 PM"
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  confidencePercentage: number; // e.g. 92%
  assignedAgent?: DeliveryAgent;
  milestones: ShipmentMilestone[];
  delayDiagnostics?: {
    isDelayed: boolean;
    rootCause: string; // e.g. "Zone B picking congestion"
    secondaryCause?: string; // e.g. "Worker shortage during peak shift"
    impactMinutes: number; // e.g. +22 mins
    recoveryAction: string; // e.g. "Worker W-22 reassigned & Tatkal expedited delivery route engaged"
    originalETA: string;
    newETA: string;
  };
}

export interface CustomerFeedback {
  id: string; // e.g. FB-901
  orderId: string;
  customerName: string;
  customerRegion: string;
  rating: number; // 1 - 5
  wasOnTime: boolean;
  packageCondition: "PERFECT" | "GOOD" | "SLIGHTLY_DAMAGED" | "DAMAGED";
  deliveryExperience: "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR";
  comment: string;
  complaintCategory?: "LATE_DELIVERY" | "DAMAGED_ITEM" | "MISSING_ITEM" | "WRONG_ITEM" | "RUDE_BEHAVIOR" | "NONE";
  timestamp: string;
  // Closed loop operational traceability
  originZone: string; // e.g. "Zone B"
  originPickerId: string; // e.g. "W-01"
  originPackerId: string; // e.g. "W-11"
  carrier: string;
  linkedRootCause?: string;
  operationalRecommendation?: string;
}

export interface BottleneckStage {
  id: string;
  stageName: string;
  avgDurationMinutes: number;
  standardBenchmarkMinutes: number;
  timeLostPercentage: number;
  status: "HEALTHY" | "OPTIMAL" | "CONGESTED" | "CRITICAL_BOTTLENECK";
  zoneAffected?: string;
  rootCause: string;
  actionRecommendation: string;
}

export interface BatchPickGroup {
  batchId: string;
  orderIds: string[];
  zone: string;
  totalSKUs: number;
  totalUnits: number;
  unoptimizedDistanceM: number;
  optimizedDistanceM: number;
  timeSavedMinutes: number;
  assignedPickerId: string;
  assignedPickerName: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED";
}

export interface SmartWorkerAssignment {
  taskId: string;
  orderId: string;
  targetZone: string;
  recommendedWorkerId: string;
  recommendedWorkerName: string;
  distanceMeters: number;
  currentWorkloadPercent: number;
  zoneEfficiencyPercent: number;
  estimatedTimeSavedMinutes: number;
  rationale: string;
  candidateWorkers: {
    workerId: string;
    workerName: string;
    distanceMeters: number;
    workloadPercent: number;
    zoneEfficiencyPercent: number;
    overallScore: number;
  }[];
}

