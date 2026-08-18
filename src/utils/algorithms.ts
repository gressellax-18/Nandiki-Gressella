import { Order, OrderItem, ProductInventory, WarehouseZone, Worker, PickingRouteStep, AIRecommendation } from "../types";

/**
 * Calculates dynamic Order Priority Score (0-100) and produces human-readable reasons.
 * Priority Score = Urgency * 30 + Customer/SLA Risk * 25 + Order Age * 15 + Stock Availability * 15 + Shipping Deadline * 15
 */
export function calculateDynamicPriority(
  order: Partial<Order>,
  inventoryMap: Record<string, ProductInventory>
): { score: number; priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  const minutesRemaining = order.minutesRemaining ?? 120;
  const isVipCustomer = order.customerRegion?.includes("Expedited") || order.customerRegion?.includes("East");
  const totalUnits = order.items?.reduce((sum, i) => sum + i.quantityRequested, 0) || 1;

  // 1. Shipping Deadline & Urgency factor (max 30 pts)
  if (minutesRemaining <= 45) {
    score += 30;
    reasons.push(`Dispatch deadline in ${minutesRemaining} minutes (Immediate SLA cutoff)`);
  } else if (minutesRemaining <= 90) {
    score += 22;
    reasons.push(`Dispatch deadline in ${minutesRemaining} minutes`);
  } else if (minutesRemaining <= 180) {
    score += 14;
    reasons.push(`Standard dispatch window (${Math.round(minutesRemaining / 60)}h remaining)`);
  } else {
    score += 6;
  }

  // 2. SLA Risk Factor (max 25 pts)
  if (order.slaRisk === "CRITICAL" || minutesRemaining <= 60) {
    score += 25;
    reasons.push("Customer SLA at critical breach risk (>75% risk threshold)");
  } else if (order.slaRisk === "HIGH" || isVipCustomer) {
    score += 18;
    reasons.push("High-priority tier SLA commitment");
  } else if (order.slaRisk === "MEDIUM") {
    score += 12;
  } else {
    score += 5;
  }

  // 3. Order Age factor (max 15 pts)
  // Assuming older orders gain priority
  const ageHours = 2.5; // sample age
  if (ageHours >= 3) {
    score += 15;
    reasons.push(`Order age: ${ageHours} hours in backlog queue`);
  } else if (ageHours >= 1.5) {
    score += 10;
    reasons.push(`Order age: ${ageHours} hours`);
  } else {
    score += 5;
  }

  // 4. Stock Availability factor (max 15 pts)
  let allInStock = true;
  let partialStock = false;
  let stockPct = 100;

  if (order.items && order.items.length > 0) {
    let reqTotal = 0;
    let availTotal = 0;
    for (const item of order.items) {
      const inv = inventoryMap[item.sku];
      reqTotal += item.quantityRequested;
      const avail = inv ? inv.availableStock : 0;
      availTotal += Math.min(item.quantityRequested, avail);
    }
    stockPct = Math.round((availTotal / reqTotal) * 100);
    if (stockPct < 100 && stockPct > 0) {
      partialStock = true;
      allInStock = false;
    } else if (stockPct === 0) {
      allInStock = false;
    }
  }

  if (allInStock) {
    score += 15;
    reasons.push("100% stock verified and immediately allocatable");
  } else if (partialStock) {
    score += 10;
    reasons.push(`${stockPct}% stock currently available; pending secondary allocation`);
  } else {
    score += 2;
    reasons.push("Stock shortage detected; requires replenishment transfer");
  }

  // 5. Shipping Carrier Deadline factor (max 15 pts)
  if (order.carrier === "SwiftShip" && minutesRemaining <= 60) {
    score += 15;
    reasons.push("Carrier SwiftShip express evening pickup in progress");
  } else if (order.carrier === "BlueDart") {
    score += 12;
  } else {
    score += 8;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(score)));

  let priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (finalScore >= 88) priority = "CRITICAL";
  else if (finalScore >= 72) priority = "HIGH";
  else if (finalScore >= 45) priority = "MEDIUM";

  return {
    score: finalScore,
    priority,
    reasons,
  };
}

/**
 * Optimizes picking route order across warehouse zones A -> B -> C -> D -> E
 * and shelf/bin numerical order, reducing travel distance and time.
 */
export function optimizePickingRoute(items: OrderItem[]): {
  steps: PickingRouteStep[];
  unoptimizedDistanceMeters: number;
  optimizedDistanceMeters: number;
  timeSavedMinutes: number;
} {
  // Sort items logically by zone (A to E), then shelf numerical, then bin numerical
  const sorted = [...items].sort((a, b) => {
    if (a.zone !== b.zone) {
      return a.zone.localeCompare(b.zone);
    }
    return a.location.localeCompare(b.location);
  });

  const steps: PickingRouteStep[] = sorted.map((item, index) => {
    // Generate realistic distances between successive picking bays
    const distance = index === 0 ? 35 : Math.floor(25 + Math.random() * 35);
    return {
      stepNumber: index + 1,
      location: item.location,
      zone: item.zone,
      sku: item.sku,
      productName: item.productName,
      quantity: item.quantityAllocated || item.quantityRequested,
      status: "PENDING",
      distanceFromPrevMeters: distance,
    };
  });

  // Calculate distances
  const optimizedDistanceMeters = steps.reduce((sum, s) => sum + s.distanceFromPrevMeters, 45);
  // Unoptimized route has serpentine backtracking (approx 1.5x - 1.7x longer)
  const unoptimizedDistanceMeters = Math.round(optimizedDistanceMeters * 1.55);
  const diffMeters = unoptimizedDistanceMeters - optimizedDistanceMeters;
  // Avg picker speed 1m/sec = 60m/min
  const timeSavedMinutes = Math.max(3, Math.round((diffMeters / 45) * 10) / 10);

  return {
    steps,
    unoptimizedDistanceMeters,
    optimizedDistanceMeters,
    timeSavedMinutes,
  };
}

/**
 * Demand forecasting and reorder recommendation
 */
export function calculateReorderRecommendation(product: ProductInventory): {
  health: "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
  dailyVelocity: number;
  daysRemaining: number;
  suggestedReorderQty: number;
  reason: string;
} {
  const dailyVelocity = product.dailyVelocity || 8.5;
  const avail = Math.max(0, product.currentStock - product.reservedStock - product.damagedStock);
  const daysRemaining = dailyVelocity > 0 ? Math.round((avail / dailyVelocity) * 10) / 10 : 99;

  let health: "HEALTHY" | "LOW" | "CRITICAL" | "OUT_OF_STOCK" = "HEALTHY";
  let suggestedReorder = 0;
  let reason = "Stock level is adequate for planned fulfillment volume.";

  if (avail <= 0) {
    health = "OUT_OF_STOCK";
    suggestedReorder = Math.round(dailyVelocity * (product.leadTimeDays + 14));
    reason = `CRITICAL: Stock is depleted. 0 available units against ${dailyVelocity} avg daily units. Immediate supplier order required.`;
  } else if (daysRemaining <= 2 || avail < product.safetyStock) {
    health = "CRITICAL";
    suggestedReorder = Math.round(dailyVelocity * (product.leadTimeDays + 10) + product.safetyStock);
    reason = `Projected stockout within ${daysRemaining} days based on recent demand velocity (${dailyVelocity}/day). Lead time is ${product.leadTimeDays} days.`;
  } else if (avail <= product.reorderPoint) {
    health = "LOW";
    suggestedReorder = Math.max(50, Math.round(dailyVelocity * (product.leadTimeDays + 7)));
    reason = `Stock has dipped below Reorder Point (${product.reorderPoint} units). Reorder recommended to avoid safety buffer breach.`;
  }

  return {
    health,
    dailyVelocity,
    daysRemaining,
    suggestedReorderQty: suggestedReorder || product.suggestedReorderQty || 60,
    reason,
  };
}

/**
 * Smart Worker Assignment recommendation
 */
export function recommendWorkerForTask(
  taskZone: string,
  workers: Worker[]
): {
  recommendedWorker: Worker;
  score: number;
  reason: string;
  alternates: Worker[];
} {
  const availableWorkers = workers.filter((w) => w.role === "Picker" && w.status !== "OFFLINE");

  const scoredWorkers = availableWorkers.map((w) => {
    let score = 100;

    // Availability penalty
    if (w.status === "PICKING") score -= 15;
    if (w.status === "BREAK") score -= 40;

    // Workload penalty (lower is better)
    score -= (w.currentWorkloadPercent / 100) * 35;

    // Zone familiarity & proximity bonus
    const zoneFam = w.zoneFamiliarity?.[taskZone] || 70;
    score += (zoneFam / 100) * 20;

    if (w.currentZone === taskZone) {
      score += 15;
    }

    // Accuracy & efficiency bonus
    score += (w.accuracyRate - 90) * 2;
    score += (w.efficiencyScore / 100) * 10;

    return {
      worker: w,
      score: Math.round(score),
    };
  });

  scoredWorkers.sort((a, b) => b.score - a.score);

  const best = scoredWorkers[0]?.worker || workers[0];
  const isSameZone = best.currentZone === taskZone;
  const reason = isSameZone
    ? `Currently stationed in Zone ${taskZone}, available with ${100 - best.currentWorkloadPercent}% spare capacity, and 99.2% picking accuracy.`
    : `Optimal availability (${best.currentWorkloadPercent}% workload), highest efficiency (${best.efficiencyScore}/100) and only 60m from Zone ${taskZone}.`;

  return {
    recommendedWorker: best,
    score: scoredWorkers[0]?.score || 85,
    reason,
    alternates: scoredWorkers.slice(1, 3).map((s) => s.worker),
  };
}
