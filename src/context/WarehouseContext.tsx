import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  UserRole,
  Order,
  OrderStatus,
  ProductInventory,
  WarehouseZone,
  Worker,
  OperationalException,
  AIRecommendation,
  AuditLog,
  WarehouseMetrics,
  WhatIfScenarioResult,
  PickingRouteStep,
  DeliveryAgent,
  OrderShipmentTracking,
  CustomerFeedback,
  BottleneckStage,
  BatchPickGroup,
  AreaItemFeedback,
} from "../types";
import {
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_ZONES,
  INITIAL_WORKERS,
  INITIAL_EXCEPTIONS,
  INITIAL_AI_RECOMMENDATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_METRICS,
  INITIAL_DELIVERY_AGENTS,
  INITIAL_SHIPMENT_TRACKINGS,
  INITIAL_CUSTOMER_FEEDBACK,
  INITIAL_BOTTLENECK_STAGES,
  INITIAL_BATCH_PICKS,
  PAN_INDIA_HUBS,
  INITIAL_AREA_ITEM_FEEDBACKS,
} from "../data/mockData";
import {
  calculateDynamicPriority,
  optimizePickingRoute,
  calculateReorderRecommendation,
  recommendWorkerForTask,
} from "../utils/algorithms";

interface LiveEvent {
  id: string;
  time: string;
  text: string;
  type: "info" | "warning" | "critical" | "success" | "ai";
}

interface WarehouseContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  orders: Order[];
  products: ProductInventory[];
  zones: WarehouseZone[];
  workers: Worker[];
  exceptions: OperationalException[];
  recommendations: AIRecommendation[];
  auditLogs: AuditLog[];
  metrics: WarehouseMetrics;
  liveEvents: LiveEvent[];
  deliveryAgents: DeliveryAgent[];
  shipmentTrackings: OrderShipmentTracking[];
  customerFeedbacks: CustomerFeedback[];
  areaItemFeedbacks: AreaItemFeedback[];
  panIndiaHubs: typeof PAN_INDIA_HUBS;
  bottleneckStages: BottleneckStage[];
  batchPicks: BatchPickGroup[];
  operationalHealthScore: number;
  hackathonStoryStep: number;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isLiveSimulationActive: boolean;
  setIsLiveSimulationActive: (active: boolean) => void;

  // Actions
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  assignWorkerToOrder: (orderId: string, workerId: string) => void;
  approveRecommendation: (recId: string, comment?: string) => void;
  rejectRecommendation: (recId: string, reason?: string) => void;
  resolveException: (exceptionId: string, actionTaken: string, notes?: string) => void;
  reportMissingItem: (orderId: string, sku: string, location: string) => void;
  reportDamagedItem: (orderId: string, sku: string, location: string) => void;
  reallocateStock: (orderId: string, sku: string, fromZone: string, toZone: string, qty: number) => void;
  reallocateRegionalHubStock: (sku: string, fromHubCode: string, toHubCode: string, qty: number, targetOrderId?: string) => void;
  advancePickingStep: (orderId: string, stepIndex: number) => void;
  completePicking: (orderId: string) => void;
  completePacking: (orderId: string, boxType: string) => void;
  submitQualityCheck: (orderId: string, passed: boolean, failureReason?: string) => void;
  dispatchOrder: (orderId: string) => void;
  triggerReorder: (sku: string, qty: number) => void;
  rebalanceWorkers: (fromZone: string, toZone: string, workerIds: string[]) => void;
  runWhatIfSimulation: (scenarioType: string) => WhatIfScenarioResult;
  triggerDemoSimulation: (demoType: string) => void;
  submitCustomerFeedback: (feedback: Partial<CustomerFeedback>) => void;
  submitAreaItemFeedback: (feedback: Partial<AreaItemFeedback>) => void;
  reassignDeliveryAgent: (orderId: string, agentId: string) => void;
  advanceHackathonStoryStep: (stepNumber?: number) => void;
  resetAllData: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>("WAREHOUSE_MANAGER");
  const [currentView, setCurrentView] = useState<string>("command-center");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<ProductInventory[]>(INITIAL_PRODUCTS);
  const [zones, setZones] = useState<WarehouseZone[]>(INITIAL_ZONES);
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [exceptions, setExceptions] = useState<OperationalException[]>(INITIAL_EXCEPTIONS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_AI_RECOMMENDATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [metrics, setMetrics] = useState<WarehouseMetrics>(INITIAL_METRICS);

  const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>(INITIAL_DELIVERY_AGENTS);
  const [shipmentTrackings, setShipmentTrackings] = useState<OrderShipmentTracking[]>(INITIAL_SHIPMENT_TRACKINGS);
  const [customerFeedbacks, setCustomerFeedbacks] = useState<CustomerFeedback[]>(INITIAL_CUSTOMER_FEEDBACK);
  const [areaItemFeedbacks, setAreaItemFeedbacks] = useState<AreaItemFeedback[]>(INITIAL_AREA_ITEM_FEEDBACKS);
  const [bottleneckStages, setBottleneckStages] = useState<BottleneckStage[]>(INITIAL_BOTTLENECK_STAGES);
  const [batchPicks, setBatchPicks] = useState<BatchPickGroup[]>(INITIAL_BATCH_PICKS);
  const [hackathonStoryStep, setHackathonStoryStep] = useState<number>(0);

  const operationalHealthScore = useMemo(() => {
    let score = 94;
    const hasActiveBottlenecks = zones.some((z) => z.bottleneckDetected);
    const criticalOrders = orders.filter((o) => o.priority === "CRITICAL" && o.status !== "DISPATCHED").length;
    const unresolvedExceptions = exceptions.filter((e) => e.status !== "RESOLVED").length;

    if (hasActiveBottlenecks) score -= 16;
    if (criticalOrders > 0) score -= Math.min(17, criticalOrders * 6);
    if (unresolvedExceptions > 0) score -= Math.min(12, unresolvedExceptions * 4);

    return Math.max(48, Math.min(99, score));
  }, [zones, orders, exceptions]);

  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    { id: "e1", time: "08:01:12", text: "AI Priority Engine recalculated score for Order #ORD-1048 to 94 (CRITICAL).", type: "critical" },
    { id: "e2", time: "08:01:05", text: "Zone B picking congestion warning: 14 tasks waiting with 2 active pickers.", type: "warning" },
    { id: "e3", time: "08:00:45", text: "Inventory alert: SKU WH-1042 available stock is critically low (2 units).", type: "ai" },
    { id: "e4", time: "08:00:10", text: "Order #ORD-1054 dispatched via SwiftShip with on-time SLA 100%.", type: "success" },
  ]);

  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(true);

  // Helper to add audit log
  const addAuditLog = useCallback((eventType: AuditLog["eventType"], actor: string, summary: string, details: string, orderId?: string) => {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(" ")[0];
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: now.toISOString(),
      timeFormatted,
      eventType,
      actor,
      orderId,
      summary,
      details,
      badgeColor: eventType.includes("CRITICAL") || eventType.includes("EXCEPTION")
        ? "bg-red-100 text-red-800 border-red-200"
        : eventType.includes("AI") || eventType.includes("RECOMMENDATION")
        ? "bg-purple-100 text-purple-800 border-purple-200"
        : eventType.includes("APPROVAL") || eventType.includes("DISPATCH")
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : "bg-blue-100 text-blue-800 border-blue-200",
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // Helper to add live event
  const addLiveEvent = useCallback((text: string, type: LiveEvent["type"] = "info") => {
    const now = new Date();
    const time = now.toTimeString().split(" ")[0];
    const event: LiveEvent = {
      id: `live-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time,
      text,
      type,
    };
    setLiveEvents((prev) => [event, ...prev.slice(0, 19)]);
  }, []);

  // Recalculate global metrics dynamically
  useEffect(() => {
    const atRisk = orders.filter((o) => o.slaRisk === "CRITICAL" || o.slaRisk === "HIGH" || o.priority === "CRITICAL").length;
    const dispatched = orders.filter((o) => o.status === "DISPATCHED").length;
    const inPicking = orders.filter((o) => o.status === "PICKING" || o.status === "ALLOCATED").length;
    const inPacking = orders.filter((o) => o.status === "PACKING" || o.status === "PICKED").length;
    const inQC = orders.filter((o) => o.status === "PENDING_QC").length;
    const lowStock = products.filter((p) => p.health === "LOW").length;
    const oos = products.filter((p) => p.health === "OUT_OF_STOCK" || p.health === "CRITICAL").length;
    const openEx = exceptions.filter((e) => e.status !== "RESOLVED" && e.status !== "REJECTED").length;
    const bottlenecks = zones.filter((z) => z.bottleneckDetected).length;

    setMetrics((prev) => ({
      ...prev,
      totalOrders: orders.length,
      ordersAtRisk: atRisk,
      ordersDispatchedToday: dispatched,
      ordersInPicking: inPicking,
      ordersInPacking: inPacking,
      ordersInQC: inQC,
      lowStockItemsCount: lowStock,
      outOfStockItemsCount: oos,
      openExceptionsCount: openEx,
      activeBottlenecksCount: bottlenecks,
    }));
  }, [orders, products, zones, exceptions]);

  // Live simulation ticker for background warehouse pulse
  useEffect(() => {
    if (!isLiveSimulationActive) return;

    const interval = setInterval(() => {
      // Decrement countdown timers for active orders slightly
      setOrders((prev) =>
        prev.map((o) => {
          if (o.status !== "DISPATCHED" && o.minutesRemaining > 1) {
            const updatedMinutes = Math.max(1, o.minutesRemaining - 1);
            return {
              ...o,
              minutesRemaining: updatedMinutes,
            };
          }
          return o;
        })
      );
    }, 45000);

    return () => clearInterval(interval);
  }, [isLiveSimulationActive]);

  // 1. Update Order Status
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus, notes?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            allocationNotes: notes || o.allocationNotes,
          };
        }
        return o;
      })
    );
    addAuditLog("SUPERVISOR_APPROVAL", `${userRole}`, `Order ${orderId} transitioned to ${newStatus}.`, notes || `Status updated by ${userRole}.`, orderId);
    addLiveEvent(`Order #${orderId} moved to stage: ${newStatus}`, "info");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 2. Assign Worker to Order
  const assignWorkerToOrder = useCallback((orderId: string, workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    const workerName = worker ? worker.name : workerId;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            assignedPickerId: workerId,
            status: o.status === "ALLOCATED" || o.status === "CREATED" ? "PICKING" : o.status,
          };
        }
        return o;
      })
    );

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          return {
            ...w,
            status: "PICKING",
            tasksAssigned: w.tasksAssigned + 1,
            currentWorkloadPercent: Math.min(100, w.currentWorkloadPercent + 12),
          };
        }
        return w;
      })
    );

    addAuditLog("WORKER_ASSIGNED", `${userRole}`, `Assigned Order ${orderId} to ${workerName} (${workerId}).`, `Workforce optimization dispatch applied.`, orderId);
    addLiveEvent(`Worker ${workerName} (${workerId}) assigned to Order #${orderId}`, "success");
  }, [workers, userRole, addAuditLog, addLiveEvent]);

  // 3. Approve AI Recommendation
  const approveRecommendation = useCallback((recId: string, comment?: string) => {
    const rec = recommendations.find((r) => r.id === recId);
    if (!rec) return;

    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: "APPROVED" } : r))
    );

    // Apply specific recommendation effect
    if (rec.id === "REC-801") {
      // Prioritize ORD-1048 & reallocate
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === "ORD-1048") {
            return {
              ...o,
              items: o.items.map((i) => (i.sku === "WH-1042" ? { ...i, quantityAllocated: 10 } : i)),
              allocationNotes: "AI priority allocation approved: 10 units allocated (7 from B-05-01, 3 transferred from E-12-02).",
            };
          }
          if (o.id === "ORD-1022") {
            return {
              ...o,
              status: "ON_HOLD",
              allocationNotes: "Held on standby. Stock prioritized for urgent enterprise order ORD-1048.",
            };
          }
          return o;
        })
      );
    } else if (rec.id === "REC-802") {
      // Rebalance workforce: move Priya (W-03) and Elena (W-08) to Zone B
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id === "W-03" || w.id === "W-08") {
            return { ...w, currentZone: "B" };
          }
          return w;
        })
      );
      setZones((prev) =>
        prev.map((z) => {
          if (z.id === "B") {
            return {
              ...z,
              activeWorkers: z.activeWorkers + 2,
              congestionScore: 45,
              congestionLevel: "MODERATE",
              bottleneckDetected: false,
            };
          }
          if (z.id === "E") {
            return { ...z, activeWorkers: Math.max(1, z.activeWorkers - 2) };
          }
          return z;
        })
      );
    } else if (rec.id === "REC-803") {
      // Reorder SKU WH-1042
      setProducts((prev) =>
        prev.map((p) => (p.sku === "WH-1042" ? { ...p, incomingQty: p.incomingQty + 120, health: "LOW" } : p))
      );
    }

    addAuditLog(
      "SUPERVISOR_APPROVAL",
      `${userRole}`,
      `Approved AI Recommendation ${rec.id}: ${rec.title}`,
      `Rationale accepted: ${rec.expectedImpact}. Note: ${comment || "Immediate approval"}`,
      rec.affectedEntities.find((e) => e.type === "ORDER")?.id
    );
    addLiveEvent(`Approved AI Action: ${rec.title}`, "success");
  }, [recommendations, userRole, addAuditLog, addLiveEvent]);

  // 4. Reject AI Recommendation
  const rejectRecommendation = useCallback((recId: string, reason?: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: "REJECTED" } : r))
    );
    addAuditLog(
      "SUPERVISOR_OVERRIDE",
      `${userRole}`,
      `Rejected AI Recommendation ${recId}`,
      `Supervisor manual override reason: ${reason || "Operational divergence"}`,
    );
    addLiveEvent(`Rejected AI Recommendation ${recId}`, "warning");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 5. Resolve Exception
  const resolveException = useCallback((exceptionId: string, actionTaken: string, notes?: string) => {
    const ex = exceptions.find((e) => e.id === exceptionId);
    if (!ex) return;

    setExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              status: "RESOLVED",
              resolution: {
                actionTaken,
                resolvedBy: `${userRole}`,
                resolvedAt: new Date().toISOString(),
                notes: notes || "Resolved via Control Tower automated inventory substitution.",
              },
            }
          : e
      )
    );

    // If resolving EXP-401 for ORD-1048, ensure order items are fully picked from secondary location
    if (ex.orderId === "ORD-1048") {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === "ORD-1048") {
            return {
              ...o,
              items: o.items.map((i) => (i.sku === "WH-1042" ? { ...i, quantityAllocated: 10, quantityPicked: 10 } : i)),
              status: "PICKED",
              slaRisk: "LOW",
              slaRiskScore: 22,
              allocationNotes: "Exception resolved: 4 units transferred from Bin E-12-02 to complete full 10-unit quota.",
            };
          }
          return o;
        })
      );
      // Deduct from Zone E secondary inventory
      setProducts((prev) =>
        prev.map((p) => {
          if (p.sku === "WH-1042") {
            return {
              ...p,
              secondaryLocations: p.secondaryLocations?.map((loc) =>
                loc.location === "E-12-02" ? { ...loc, qty: Math.max(0, loc.qty - 4) } : loc
              ),
            };
          }
          return p;
        })
      );
    }

    addAuditLog(
      "SUPERVISOR_APPROVAL",
      `${userRole}`,
      `Exception ${exceptionId} marked RESOLVED`,
      `Action taken: ${actionTaken}. Notes: ${notes || "Auto-reallocated"}`,
      ex.orderId
    );
    addLiveEvent(`Exception ${exceptionId} successfully resolved on #${ex.orderId}`, "success");
  }, [exceptions, userRole, addAuditLog, addLiveEvent]);

  // 6. Report Missing Item
  const reportMissingItem = useCallback((orderId: string, sku: string, location: string) => {
    const product = products.find((p) => p.sku === sku);
    const altLoc = product?.secondaryLocations?.[0];

    const newEx: OperationalException = {
      id: `EXP-${Math.floor(400 + Math.random() * 500)}`,
      orderId,
      type: "MISSING_ITEM",
      reportedBy: `${userRole}`,
      reportedRole: userRole === "PICKER" ? "Picker" : "Supervisor",
      sku,
      productName: product?.name || sku,
      location,
      zone: location.split("-")[0] || "B",
      description: `Physical count mismatch reported at Bay ${location} for SKU ${sku}.`,
      severity: "CRITICAL",
      status: "SUPERVISOR_REVIEW",
      aiAnalysis: {
        rootCause: `Discrepancy at primary slot ${location}.`,
        alternativeFound: Boolean(altLoc),
        alternativeLocation: altLoc?.location || "E-12-02",
        alternativeZone: altLoc?.zone || "E",
        alternativeQtyAvailable: altLoc?.qty || 14,
        recommendedAction: altLoc
          ? `Authorize direct transfer from secondary bulk Bin ${altLoc.location} (Zone ${altLoc.zone}).`
          : "Trigger emergency inventory search across overflow bays.",
        projectedImpact: "Restores order fulfillment trajectory within 5 minutes.",
      },
      createdAt: new Date().toISOString(),
    };

    setExceptions((prev) => [newEx, ...prev]);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "EXCEPTION", slaRisk: "CRITICAL" } : o))
    );

    addAuditLog("EXCEPTION_RAISED", `${userRole}`, `Missing item reported on ${orderId} (${sku} at ${location})`, `AI located ${altLoc?.qty || 14} backup units in Bin ${altLoc?.location || "E-12-02"}.`, orderId);
    addLiveEvent(`Missing Item reported for SKU ${sku} at ${location}! AI analyzing alternatives...`, "critical");
  }, [products, userRole, addAuditLog, addLiveEvent]);

  // 7. Report Damaged Item
  const reportDamagedItem = useCallback((orderId: string, sku: string, location: string) => {
    const product = products.find((p) => p.sku === sku);

    // Update product damaged inventory count
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          const newDamaged = p.damagedStock + 1;
          const newAvail = Math.max(0, p.currentStock - p.reservedStock - newDamaged);
          return {
            ...p,
            damagedStock: newDamaged,
            availableStock: newAvail,
          };
        }
        return p;
      })
    );

    const newEx: OperationalException = {
      id: `EXP-${Math.floor(500 + Math.random() * 400)}`,
      orderId,
      type: "DAMAGED_ITEM",
      reportedBy: `${userRole}`,
      reportedRole: userRole === "PACKER" ? "Packer" : "Picker",
      sku,
      productName: product?.name || sku,
      location,
      zone: location.split("-")[0] || "A",
      description: `Damaged packaging/product identified during handling at ${location}.`,
      severity: "HIGH",
      status: "SUPERVISOR_REVIEW",
      aiAnalysis: {
        rootCause: "Handling damage / cracked casing detected.",
        alternativeFound: true,
        alternativeLocation: product?.secondaryLocations?.[0]?.location || "A-18-02",
        alternativeZone: "A",
        alternativeQtyAvailable: 8,
        recommendedAction: "Quarantine unit with RMA tag; swap with clean stock from adjacent bay.",
        projectedImpact: "Replacement swapped in 2 minutes without dispatch penalty.",
      },
      createdAt: new Date().toISOString(),
    };

    setExceptions((prev) => [newEx, ...prev]);
    addAuditLog("EXCEPTION_RAISED", `${userRole}`, `Damaged item logged on ${orderId} (${sku})`, `Unit isolated. Stock adjusted.`, orderId);
    addLiveEvent(`Damaged unit detected for SKU ${sku}. Quarantine record created.`, "warning");
  }, [products, userRole, addAuditLog, addLiveEvent]);

  // 8. Reallocate Stock
  const reallocateStock = useCallback((orderId: string, sku: string, fromZone: string, toZone: string, qty: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            items: o.items.map((i) => (i.sku === sku ? { ...i, quantityAllocated: qty, zone: toZone } : i)),
            allocationNotes: `Reallocated ${qty} units of ${sku} from Zone ${fromZone} to Zone ${toZone}.`,
          };
        }
        return o;
      })
    );
    addAuditLog("INVENTORY_ALLOCATED", `${userRole}`, `Reallocated ${qty}x ${sku} to ${orderId}`, `Transferred from Zone ${fromZone} to Zone ${toZone}.`, orderId);
    addLiveEvent(`Reallocated ${qty} units of ${sku} to #${orderId}`, "success");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 8b. Reallocate Regional Hub Stock (Pan-India)
  const reallocateRegionalHubStock = useCallback(
    (sku: string, fromHubCode: string, toHubCode: string, qty: number, targetOrderId?: string) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.sku === sku) {
            const updatedRegional = p.regionalHubStocks?.map((rhs) => {
              if (rhs.hubCode === fromHubCode) {
                const newAvail = Math.max(0, rhs.available - qty);
                const newOnHand = Math.max(0, rhs.onHand - qty);
                return {
                  ...rhs,
                  available: newAvail,
                  onHand: newOnHand,
                  bufferHealth: (newAvail < 3 ? "CRITICAL_SHORTAGE" : newAvail < 8 ? "LOW" : rhs.bufferHealth) as any,
                };
              }
              if (rhs.hubCode === toHubCode) {
                const newAvail = rhs.available + qty;
                const newOnHand = rhs.onHand + qty;
                return {
                  ...rhs,
                  available: newAvail,
                  onHand: newOnHand,
                  bufferHealth: (newAvail > 15 ? "OPTIMAL" : rhs.bufferHealth === "CRITICAL_SHORTAGE" ? "LOW" : rhs.bufferHealth) as any,
                };
              }
              return rhs;
            });
            return {
              ...p,
              regionalHubStocks: updatedRegional,
            };
          }
          return p;
        })
      );

      if (targetOrderId) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id === targetOrderId) {
              return {
                ...o,
                items: o.items.map((i) =>
                  i.sku === sku
                    ? { ...i, quantityAllocated: Math.min(i.quantityRequested, (i.quantityAllocated || 0) + qty) }
                    : i
                ),
                allocationNotes: `Stock transferred (+${qty} units) from ${fromHubCode} Hub to ${toHubCode} Hub for order fulfillment.`,
              };
            }
            return o;
          })
        );
      }

      addAuditLog(
        "INVENTORY_ALLOCATED",
        `${userRole}`,
        `Pan-India Inter-Hub Reallocation: ${qty}x ${sku}`,
        `Transferred ${qty} units from ${fromHubCode} Hub to ${toHubCode} Hub. ${targetOrderId ? `Assigned to Order #${targetOrderId}` : ""}`,
        targetOrderId
      );
      addLiveEvent(
        `Inter-Hub Reallocation: Transferred ${qty} units of ${sku} (${fromHubCode} → ${toHubCode})`,
        "success"
      );
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    },
    [userRole, addAuditLog, addLiveEvent]
  );

  // 9. Advance Picking Step
  const advancePickingStep = useCallback((orderId: string, stepIndex: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item, idx) => {
            if (idx === stepIndex) {
              return { ...item, quantityPicked: item.quantityAllocated || item.quantityRequested };
            }
            return item;
          });
          const allPicked = updatedItems.every((i) => i.quantityPicked >= (i.quantityAllocated || i.quantityRequested));
          return {
            ...o,
            items: updatedItems,
            status: allPicked ? "PICKED" : "PICKING",
          };
        }
        return o;
      })
    );
    addLiveEvent(`Pick item confirmed for Order #${orderId}`, "info");
  }, [addLiveEvent]);

  // 10. Complete Picking
  const completePicking = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "PICKED",
            items: o.items.map((i) => ({ ...i, quantityPicked: i.quantityAllocated || i.quantityRequested })),
          };
        }
        return o;
      })
    );
    addAuditLog("PICKING_COMPLETED", `${userRole}`, `Picking completed for Order ${orderId}`, `Cart staged at Packing Bay 2.`, orderId);
    addLiveEvent(`Picking completed for #${orderId}. Ready for Packing queue.`, "success");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 11. Complete Packing
  const completePacking = useCallback((orderId: string, boxType: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "PENDING_QC",
            packingNotes: `Packed in ${boxType}. Barcode seal verified.`,
            items: o.items.map((i) => ({ ...i, quantityPacked: i.quantityPicked })),
          };
        }
        return o;
      })
    );
    addAuditLog("PACKING_COMPLETED", `${userRole}`, `Packed Order ${orderId} in ${boxType}`, `Manifest printed and sent to QC Inspection conveyor.`, orderId);
    addLiveEvent(`Order #${orderId} packed in ${boxType}. Awaiting QC.`, "info");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 12. Quality Check Submission
  const submitQualityCheck = useCallback((orderId: string, passed: boolean, failureReason?: string) => {
    if (passed) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "READY_FOR_DISPATCH", qcNotes: "100% 5-point verification passed." } : o))
      );
      addAuditLog("QC_PASSED", `${userRole}`, `Order ${orderId} PASSED 5-Point Quality Control`, `All SKU counts, seals, weights verified.`, orderId);
      addLiveEvent(`Order #${orderId} passed QC! Ready for carrier staging.`, "success");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "QC_FAILED", qcNotes: `Failed QC: ${failureReason}` } : o))
      );
      const newEx: OperationalException = {
        id: `EXP-${Math.floor(600 + Math.random() * 300)}`,
        orderId,
        type: "QC_FAILED",
        reportedBy: `${userRole}`,
        reportedRole: "QC Inspector",
        description: `QC Failure: ${failureReason || "Barcode / quantity mismatch detected."}`,
        severity: "HIGH",
        status: "SUPERVISOR_REVIEW",
        aiAnalysis: {
          rootCause: "Verification failure at final inspection station.",
          alternativeFound: true,
          recommendedAction: "Return order to picking/re-pack station for correction.",
          projectedImpact: "Prevents dispatch of incorrect consignment to client.",
        },
        createdAt: new Date().toISOString(),
      };
      setExceptions((prev) => [newEx, ...prev]);
      addAuditLog("QC_FAILED", `${userRole}`, `Order ${orderId} FAILED Quality Check`, `Reason: ${failureReason}`, orderId);
      addLiveEvent(`QC Failure on #${orderId}: ${failureReason}`, "critical");
    }
  }, [userRole, addAuditLog, addLiveEvent]);

  // 13. Dispatch Order
  const dispatchOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: "DISPATCHED",
            dispatchedAt: new Date().toISOString(),
            slaRisk: "LOW",
            slaRiskScore: 0,
          };
        }
        return o;
      })
    );

    // Launch celebratory confetti for completing dispatch
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}

    addAuditLog("DISPATCH_COMPLETED", `${userRole}`, `Order ${orderId} DISPATCHED`, `Handed over to carrier dock bay.`, orderId);
    addLiveEvent(`Order #${orderId} officially dispatched! SLA met successfully.`, "success");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 14. Trigger Reorder
  const triggerReorder = useCallback((sku: string, qty: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.sku === sku) {
          return {
            ...p,
            incomingQty: p.incomingQty + qty,
            health: p.health === "OUT_OF_STOCK" ? "LOW" : p.health,
          };
        }
        return p;
      })
    );
    addAuditLog("REORDER_TRIGGERED", `${userRole}`, `Reorder PO created for ${qty} units of SKU ${sku}`, `Sent to supplier with expedited transit.`, sku);
    addLiveEvent(`Purchase order placed for ${qty} units of SKU ${sku}.`, "success");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 15. Rebalance Workers
  const rebalanceWorkers = useCallback((fromZone: string, toZone: string, workerIds: string[]) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (workerIds.includes(w.id)) {
          return { ...w, currentZone: toZone };
        }
        return w;
      })
    );
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === toZone) {
          return { ...z, activeWorkers: z.activeWorkers + workerIds.length, congestionScore: Math.max(20, z.congestionScore - 30), bottleneckDetected: false };
        }
        if (z.id === fromZone) {
          return { ...z, activeWorkers: Math.max(1, z.activeWorkers - workerIds.length) };
        }
        return z;
      })
    );
    addAuditLog("SUPERVISOR_APPROVAL", `${userRole}`, `Rebalanced ${workerIds.length} workers from Zone ${fromZone} to Zone ${toZone}`, `Resolved zone congestion.`);
    addLiveEvent(`Rebalanced workers to Zone ${toZone} to alleviate bottlenecks.`, "success");
  }, [userRole, addAuditLog, addLiveEvent]);

  // 16. What-If Simulation
  const runWhatIfSimulation = useCallback((scenarioType: string): WhatIfScenarioResult => {
    if (scenarioType === "WORKER_LOSS") {
      return {
        scenarioName: "Sudden Loss of 2 Active Pickers",
        description: "Simulating sudden absenteeism of 2 senior pickers in Zone B and D during peak hour.",
        before: {
          ordersAtRisk: 4,
          avgPickTimeMinutes: 3.9,
          slaBreachPercentage: 6.2,
          activeBacklogTasks: 22,
          delayedOrdersCount: 2,
        },
        after: {
          ordersAtRisk: 9,
          avgPickTimeMinutes: 6.8,
          slaBreachPercentage: 24.5,
          activeBacklogTasks: 44,
          delayedOrdersCount: 7,
        },
        impactSummary: "Queue backlog doubles in Zone B; 5 additional orders breach 60-minute SLA window.",
        aiContingencyPlan: [
          "Activate AI Workload Rebalance: Shift 2 cross-trained Packers (Marcus W-11 & Fatima W-14) to picking roles.",
          "Restrict batch picking to top-tier critical orders (Score > 80).",
          "Extend carrier pickup window request by 20 minutes for secondary routes.",
        ],
        mitigationSteps: [
          "Approve dynamic worker role reassignment.",
          "Throttle non-urgent replenishment moves.",
        ],
      };
    } else if (scenarioType === "DEMAND_SURGE") {
      return {
        scenarioName: "200% Surge in SKU WH-1042 Demand",
        description: "Simulating sudden arrival of 15 flash enterprise orders for Pro Thermal Sensors.",
        before: {
          ordersAtRisk: 4,
          avgPickTimeMinutes: 3.9,
          slaBreachPercentage: 6.2,
          activeBacklogTasks: 22,
          delayedOrdersCount: 2,
        },
        after: {
          ordersAtRisk: 14,
          avgPickTimeMinutes: 5.4,
          slaBreachPercentage: 38.0,
          activeBacklogTasks: 58,
          delayedOrdersCount: 11,
        },
        impactSummary: "Instant stockout at primary Bin B-05-01; secondary overflow Bin E-12-02 depleted within 40 mins.",
        aiContingencyPlan: [
          "Execute split allocation rule: Allocate available units to highest SLA tier accounts first.",
          "Issue emergency PO for 200 units with overnight courier delivery.",
          "Stage bulk inventory replenishment from overflow racking.",
        ],
        mitigationSteps: [
          "Approve automated priority tier allocation.",
          "Contact supplier OptiTech for urgent morning restock.",
        ],
      };
    } else if (scenarioType === "ZONE_OUTAGE") {
      return {
        scenarioName: "Conveyor Stoppage in Zone B",
        description: "Simulating mechanical sensor breakdown halting Zone B pick sorting belt.",
        before: {
          ordersAtRisk: 4,
          avgPickTimeMinutes: 3.9,
          slaBreachPercentage: 6.2,
          activeBacklogTasks: 22,
          delayedOrdersCount: 2,
        },
        after: {
          ordersAtRisk: 12,
          avgPickTimeMinutes: 8.2,
          slaBreachPercentage: 42.0,
          activeBacklogTasks: 38,
          delayedOrdersCount: 8,
        },
        impactSummary: "All Zone B items must be manually carted; transit distance increases 3.4x.",
        aiContingencyPlan: [
          "Reroute all sensor picks to secondary overflow racking in Zone E.",
          "Deploy forklift runner Liam (W-25) to shuttle batch bins.",
          "Notify SwiftShip dispatcher of 30-minute buffer requirement.",
        ],
        mitigationSteps: [
          "Authorize manual carting protocol.",
          "Dispatch maintenance crew to Zone B sensor loop.",
        ],
      };
    }

    // Default: Urgent Order Surge
    return {
      scenarioName: "Emergency 10-Order Urgent Wave",
      description: "Simulating simultaneous ingestion of 10 CRITICAL enterprise orders with <60m deadlines.",
      before: {
        ordersAtRisk: 4,
        avgPickTimeMinutes: 3.9,
        slaBreachPercentage: 6.2,
        activeBacklogTasks: 22,
        delayedOrdersCount: 2,
      },
      after: {
        ordersAtRisk: 11,
        avgPickTimeMinutes: 4.8,
        slaBreachPercentage: 21.0,
        activeBacklogTasks: 48,
        delayedOrdersCount: 5,
      },
      impactSummary: "Packing lines become bottlenecked; picker capacity reaches 98%.",
      aiContingencyPlan: [
        "Dynamically pause standard-priority order picking (ORD-1022, ORD-1053).",
        "Form 2-picker co-picking clusters for high-density aisles.",
        "Pre-assemble standard shipping boxes BOX-M and BOX-L.",
      ],
      mitigationSteps: [
        "Enforce priority-only pick lanes.",
        "Open staging bay 4 for fast-track carrier handoff.",
      ],
    };
  }, []);

  // 17. Demo Mode Simulation Triggers (for 3-5 min hackathon demo)
  const triggerDemoSimulation = useCallback((demoType: string) => {
    if (demoType === "DEMO_GRAND_WALKTHROUGH") {
      // Complete automated walk-through of the flagship story:
      // ORD-1048 Shortage -> Urgent Allocation -> Worker Selection -> Route Optimization -> Missing Item -> Secondary Reallocation -> QC -> Dispatch
      setSelectedOrderId("ORD-1048");
      setCurrentView("orders");
      addLiveEvent("⚡ GRAND DEMO ACTIVATED: Initialized Order #ORD-1048 shortage scenario.", "ai");
      addAuditLog("AI_RECOMMENDATION_GENERATED", "Demo Engine", "Grand Hackathon Walkthrough Started", "Scenario: ORD-1048 shortage & recovery.", "ORD-1048");
    } else if (demoType === "SIMULATE_URGENT_ORDER") {
      const newOrder: Order = {
        id: `ORD-${Math.floor(1060 + Math.random() * 50)}`,
        customerName: "Vertex Cybernetics Group",
        customerRegion: "North America - Expedited",
        createdAt: new Date().toISOString(),
        deadline: new Date(Date.now() + 40 * 60000).toISOString(),
        minutesRemaining: 38,
        status: "CREATED",
        priority: "CRITICAL",
        priorityScore: 96,
        priorityReasons: [
          "Emergency dispatch window in 38 minutes",
          "Platinum enterprise SLA guarantee",
          "High volume multi-sensor package",
        ],
        items: [
          {
            id: `item-${Date.now()}-1`,
            sku: "WH-1042",
            productName: "Pro Thermal Optical Sensors",
            quantityRequested: 8,
            quantityAllocated: 8,
            quantityPicked: 0,
            quantityPacked: 0,
            unitPrice: 145.0,
            location: "B-05-01",
            zone: "B",
            weightKg: 2.0,
          },
          {
            id: `item-${Date.now()}-2`,
            sku: "WH-3015",
            productName: "Lithium Powerpack 24V 15Ah",
            quantityRequested: 2,
            quantityAllocated: 2,
            quantityPicked: 0,
            quantityPacked: 0,
            unitPrice: 220.0,
            location: "C-11-03",
            zone: "C",
            weightKg: 4.0,
          },
        ],
        totalUnits: 10,
        totalWeightKg: 6.0,
        carrier: "SwiftShip",
        slaRisk: "CRITICAL",
        slaRiskScore: 82,
        slaRiskReasons: ["Urgent arrival: deadline in 38 mins."],
      };
      setOrders((prev) => [newOrder, ...prev]);
      addLiveEvent(`🔴 CRITICAL ORDER ARRIVAL: #${newOrder.id} (Deadline: 38 mins). AI auto-prioritizing...`, "critical");
      addAuditLog("ORDER_CREATED", "EDI Ingest", `Urgent Order ${newOrder.id} created`, "Flagged CRITICAL with priority score 96.", newOrder.id);
    } else if (demoType === "SIMULATE_ZONE_BOTTLENECK") {
      setZones((prev) =>
        prev.map((z) => (z.id === "B" ? { ...z, congestionScore: 96, congestionLevel: "CRITICAL", activeTasks: 19, avgPickTimeMinutes: 7.4, bottleneckDetected: true } : z))
      );
      addLiveEvent("🟠 BOTTLENECK SPIKE: Zone B pick latency jumped to 7.4 min! Recommendation REC-802 flagged.", "warning");
      addAuditLog("AI_RECOMMENDATION_GENERATED", "Bottleneck Engine", "Severe congestion detected in Zone B", "Average pick time 7.4m (+89% over baseline).");
    } else if (demoType === "SIMULATE_MISSING_ITEM") {
      reportMissingItem("ORD-1048", "WH-1042", "B-05-01");
    } else if (demoType === "SIMULATE_DAMAGED_ITEM") {
      reportDamagedItem("ORD-1051", "WH-3015", "C-11-03");
    } else if (demoType === "SIMULATE_STOCKOUT") {
      setProducts((prev) =>
        prev.map((p) => (p.sku === "WH-1042" ? { ...p, currentStock: 0, availableStock: 0, health: "OUT_OF_STOCK" } : p))
      );
      addLiveEvent("🟡 STOCKOUT ALERT: SKU WH-1042 reached 0 units. Emergency Reorder REC-803 triggered.", "critical");
    } else if (demoType === "SIMULATE_WORKER_SHORTAGE") {
      setWorkers((prev) =>
        prev.map((w) => (w.id === "W-01" ? { ...w, status: "OFFLINE", currentWorkloadPercent: 0 } : w))
      );
      addLiveEvent("👥 WORKER OFFLINE: Picker Aarav Sharma (W-01) logged offline. AI reassigning 12 queued tasks.", "warning");
    } else if (demoType === "SIMULATE_STOCK_CONFLICT") {
      setCurrentView("allocation");
      addLiveEvent("🔴 STOCK CONFLICT DETECTED: Order #ORD-1048 (Critical) vs #ORD-1022 (Normal). AI Allocation Engine ready.", "critical");
    } else if (demoType === "SIMULATE_HUB_DELAY") {
      setShipmentTrackings((prev) =>
        prev.map((s) =>
          s.orderId === "ORD-1048"
            ? { ...s, riskLevel: "HIGH", confidencePercentage: 67, distanceRemainingKm: 18.4, etaFormatted: "Today, 6:55 PM" }
            : s
        )
      );
      addLiveEvent("🚚 HUB DELAY WARNING: Inter-hub sortation backlog at Vijayawada Hub (+20 min impact).", "warning");
    } else if (demoType === "SIMULATE_CUSTOMER_FEEDBACK") {
      setCurrentView("feedback");
      addLiveEvent("⭐ NEW OPERATIONAL FEEDBACK: Dr. Arvind Swaminathan (ORD-1048) rated 3/5 due to late arrival.", "info");
    }
  }, [reportMissingItem, reportDamagedItem, addLiveEvent, addAuditLog]);

  // 18. Customer feedback submission
  const submitCustomerFeedback = useCallback(
    (fb: Partial<CustomerFeedback>) => {
      const newFeedback: CustomerFeedback = {
        id: `FB-${Date.now().toString().slice(-4)}`,
        orderId: fb.orderId || "ORD-1048",
        customerName: fb.customerName || "Customer",
        customerRegion: fb.customerRegion || "Regional Area",
        rating: fb.rating || 4,
        wasOnTime: fb.wasOnTime ?? true,
        packageCondition: fb.packageCondition || "PERFECT",
        deliveryExperience: fb.deliveryExperience || "GOOD",
        comment: fb.comment || "Order delivered.",
        complaintCategory: fb.complaintCategory || "NONE",
        timestamp: new Date().toISOString(),
        originZone: fb.originZone || "Zone B",
        originPickerId: fb.originPickerId || "W-17",
        originPackerId: fb.originPackerId || "W-11",
        carrier: fb.carrier || "Ekart Tatkal Express",
        linkedRootCause: fb.linkedRootCause || "Zone B picking congestion during peak rush.",
        operationalRecommendation: fb.operationalRecommendation || "Rebalance 2 workers to Zone B during 14:00-18:00 rush.",
      };
      setCustomerFeedbacks((prev) => [newFeedback, ...prev]);
      addLiveEvent(`⭐ Customer Feedback ingested for #${newFeedback.orderId}: ${newFeedback.rating}/5 stars.`, "info");
      addAuditLog("FEEDBACK_INGESTED" as any, "Customer App", `Feedback for ${newFeedback.orderId}`, `Rating: ${newFeedback.rating}/5. ${newFeedback.comment}`, newFeedback.orderId);
    },
    [addLiveEvent, addAuditLog]
  );

  // 18b. Submit Area Item Feedback
  const submitAreaItemFeedback = useCallback(
    (fb: Partial<AreaItemFeedback>) => {
      const newFb: AreaItemFeedback = {
        id: `AFB-${Date.now().toString().slice(-4)}`,
        orderId: fb.orderId || "ORD-1048",
        sku: fb.sku || "WH-1042",
        itemName: fb.itemName || "Pro Thermal Optical Sensors 4K",
        customerName: fb.customerName || "Customer",
        cityArea: fb.cityArea || "HITEC City, Hyderabad",
        hubCode: (fb.hubCode as any) || "HYD",
        hubName: fb.hubName || "Hyderabad Shamshabad Mega Hub",
        rating: fb.rating || 5,
        timestamp: "Just now",
        deliverySpeed: fb.deliverySpeed || "Same-Day Prime",
        stockAvailabilityNote: fb.stockAvailabilityNote || "Stock allocated from local city hub.",
        comment: fb.comment || "Great product quality and quick regional hub fulfillment.",
        packageStatus: fb.packageStatus || "PERFECT",
        wasOnTime: fb.wasOnTime ?? true,
      };
      setAreaItemFeedbacks((prev) => [newFb, ...prev]);
      addLiveEvent(`⭐ Area Feedback added for ${newFb.sku} in ${newFb.cityArea} (${newFb.rating}★)`, "info");
    },
    [addLiveEvent]
  );

  // 19. Delivery agent reassignment
  const reassignDeliveryAgent = useCallback(
    (orderId: string, agentId: string) => {
      const agent = deliveryAgents.find((a) => a.id === agentId);
      if (!agent) return;

      setShipmentTrackings((prev) =>
        prev.map((s) => (s.orderId === orderId ? { ...s, assignedAgent: agent } : s))
      );
      addLiveEvent(`🛵 Delivery Agent ${agent.name} (${agent.id}) assigned to shipment #${orderId}. Route overlap: ${agent.routeOverlapPercentage}%.`, "success");
      addAuditLog("AGENT_ASSIGNED" as any, "Delivery Promise Engine", `Assigned Agent ${agent.name}`, `Agent distance: ${agent.distanceFromHubKm}km. Overlap: ${agent.routeOverlapPercentage}%`, orderId);
    },
    [deliveryAgents, addLiveEvent, addAuditLog]
  );

  // 20. Master Hackathon 10-Step Story Stepper
  const advanceHackathonStoryStep = useCallback(
    (stepNumber?: number) => {
      const nextStep = typeof stepNumber === "number" ? stepNumber : (hackathonStoryStep % 10) + 1;
      setHackathonStoryStep(nextStep);

      switch (nextStep) {
        case 1:
          // Step 1: Customer Places Urgent Order (ORD-1048)
          setCurrentView("orders");
          setSelectedOrderId("ORD-1048");
          addLiveEvent("1️⃣ STEP 1: Urgent Order #ORD-1048 placed by Apex Robotics Labs. Critical SLA (42 mins).", "critical");
          addAuditLog("ORDER_CREATED", "EDI API", "Urgent Order ORD-1048 created", "Requested 10 units of WH-1042. Only 7 available.", "ORD-1048");
          break;
        case 2:
          // Step 2: Stock Conflict Detected -> Priority-first Allocation
          setCurrentView("allocation");
          addLiveEvent("2️⃣ STEP 2: Stock Conflict Detected! Order ORD-1048 gets 7 units (partial), ORD-1022 held on backorder.", "warning");
          addAuditLog("INVENTORY_ALLOCATED", "Smart Allocation Engine", "Conflict Resolved", "Allocated 7 to critical ORD-1048; held normal order ORD-1022.", "ORD-1048");
          break;
        case 3:
          // Step 3: Smart Worker Engine Selects W-31
          setCurrentView("workforce");
          addLiveEvent("3️⃣ STEP 3: Smart Worker Engine matches W-31 (Vikram Rathore): 120m away, 55% workload, 93% Zone B efficiency, saving 8 min.", "ai");
          addAuditLog("WORKER_ASSIGNED", "Smart Worker Dispatcher", "Assigned W-31 to ORD-1048", "Optimal match across distance, workload, and zone expertise.", "ORD-1048");
          break;
        case 4:
          // Step 4: Smart Picking Route Optimized
          setCurrentView("picking");
          addLiveEvent("4️⃣ STEP 4: Smart Picking Route computed: Start → A03 → A12 → B04 → C07 → Packing (Distance 420m → 280m, saved 9 min).", "success");
          break;
        case 5:
          // Step 5: Missing Item Exception & Resolution
          setCurrentView("exceptions");
          reportMissingItem("ORD-1048", "WH-1042", "B-05-01");
          addLiveEvent("5️⃣ STEP 5: Missing item reported at Bin B-05-01. AI finds 14 reserve units in Bin E-12-02 → Auto-resolved.", "critical");
          break;
        case 6:
          // Step 6: Packing & QC Verification
          setCurrentView("qc");
          submitQualityCheck("ORD-1048", true);
          addLiveEvent("6️⃣ STEP 6: 5-Point QC Gate Passed (Barcode, weight, tamper seals verified). Moving to Dispatch.", "success");
          break;
        case 7:
          // Step 7: Dispatched via Carrier
          setCurrentView("dispatch");
          dispatchOrder("ORD-1048");
          addLiveEvent("7️⃣ STEP 7: Dispatched via Ekart Tatkal Express dock with verified shipping manifest.", "success");
          break;
        case 8:
          // Step 8: Multi-Hub Location & Delivery Agent Intelligence
          setCurrentView("tracking");
          addLiveEvent("8️⃣ STEP 8: Live tracking at Vijayawada Regional Hub. Agent D-07 assigned for final mile handover.", "ai");
          break;
        case 9:
          // Step 9: Customer Operational Feedback Ingested
          setCurrentView("feedback");
          submitCustomerFeedback({
            orderId: "ORD-1048",
            customerName: "Dr. Arvind Swaminathan (Apex Robotics Labs)",
            rating: 3,
            wasOnTime: false,
            comment: "Tamper seals perfect, but package arrived 22 minutes later than initial estimate.",
            complaintCategory: "LATE_DELIVERY",
          });
          addLiveEvent("9️⃣ STEP 9: Customer gave 3/5 stars due to 22-min delay. Traceability engine analyzing root cause.", "warning");
          break;
        case 10:
          // Step 10: Closed-Loop AI Discovers: 68% of Delays from Zone B -> Operational Recovery!
          setCurrentView("analytics");
          setZones((prev) =>
            prev.map((z) => (z.id === "B" ? { ...z, activeWorkers: 5, congestionScore: 28, congestionLevel: "LOW", bottleneckDetected: false } : z))
          );
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          addLiveEvent("🔟 STEP 10: CLOSED THE LOOP! AI diagnosed 68% late orders originated from Zone B picking. Rebalanced 2 workers to Zone B. System Health recovered to 94%! 🎉", "success");
          break;
        default:
          break;
      }
    },
    [hackathonStoryStep, reportMissingItem, submitQualityCheck, dispatchOrder, submitCustomerFeedback, addLiveEvent, addAuditLog]
  );

  // 21. Reset Data to initial state
  const resetAllData = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    setZones(INITIAL_ZONES);
    setWorkers(INITIAL_WORKERS);
    setExceptions(INITIAL_EXCEPTIONS);
    setRecommendations(INITIAL_AI_RECOMMENDATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setMetrics(INITIAL_METRICS);
    setDeliveryAgents(INITIAL_DELIVERY_AGENTS);
    setShipmentTrackings(INITIAL_SHIPMENT_TRACKINGS);
    setCustomerFeedbacks(INITIAL_CUSTOMER_FEEDBACK);
    setBottleneckStages(INITIAL_BOTTLENECK_STAGES);
    setBatchPicks(INITIAL_BATCH_PICKS);
    setHackathonStoryStep(0);
    setSelectedOrderId(null);
    addLiveEvent("Warehouse operational state reset to default demo seed.", "info");
  }, [addLiveEvent]);

  const value = useMemo(
    () => ({
      userRole,
      setUserRole,
      currentView,
      setCurrentView,
      selectedOrderId,
      setSelectedOrderId,
      orders,
      products,
      zones,
      workers,
      exceptions,
      recommendations,
      auditLogs,
      metrics,
      liveEvents,
      deliveryAgents,
      shipmentTrackings,
      customerFeedbacks,
      areaItemFeedbacks,
      panIndiaHubs: PAN_INDIA_HUBS,
      bottleneckStages,
      batchPicks,
      operationalHealthScore,
      hackathonStoryStep,
      isCopilotOpen,
      setIsCopilotOpen,
      isSearchOpen,
      setIsSearchOpen,
      isLiveSimulationActive,
      setIsLiveSimulationActive,
      updateOrderStatus,
      assignWorkerToOrder,
      approveRecommendation,
      rejectRecommendation,
      resolveException,
      reportMissingItem,
      reportDamagedItem,
      reallocateStock,
      reallocateRegionalHubStock,
      advancePickingStep,
      completePicking,
      completePacking,
      submitQualityCheck,
      dispatchOrder,
      triggerReorder,
      rebalanceWorkers,
      runWhatIfSimulation,
      triggerDemoSimulation,
      submitCustomerFeedback,
      submitAreaItemFeedback,
      reassignDeliveryAgent,
      advanceHackathonStoryStep,
      resetAllData,
    }),
    [
      userRole,
      currentView,
      selectedOrderId,
      orders,
      products,
      zones,
      workers,
      exceptions,
      recommendations,
      auditLogs,
      metrics,
      liveEvents,
      deliveryAgents,
      shipmentTrackings,
      customerFeedbacks,
      areaItemFeedbacks,
      bottleneckStages,
      batchPicks,
      operationalHealthScore,
      hackathonStoryStep,
      isCopilotOpen,
      isSearchOpen,
      isLiveSimulationActive,
      updateOrderStatus,
      assignWorkerToOrder,
      approveRecommendation,
      rejectRecommendation,
      resolveException,
      reportMissingItem,
      reportDamagedItem,
      reallocateStock,
      reallocateRegionalHubStock,
      advancePickingStep,
      completePicking,
      completePacking,
      submitQualityCheck,
      dispatchOrder,
      triggerReorder,
      rebalanceWorkers,
      runWhatIfSimulation,
      triggerDemoSimulation,
      submitCustomerFeedback,
      submitAreaItemFeedback,
      reassignDeliveryAgent,
      advanceHackathonStoryStep,
      resetAllData,
    ]
  );

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
};

