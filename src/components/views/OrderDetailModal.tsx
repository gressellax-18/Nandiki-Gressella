import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  X,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  User,
  Truck,
  Box,
  Crosshair,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Package,
  Layers,
  MapPin,
  FileText,
  AlertOctagon,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";
import { OrderStatus } from "../../types";

export const OrderDetailModal: React.FC = () => {
  const {
    selectedOrderId,
    setSelectedOrderId,
    orders,
    workers,
    exceptions,
    auditLogs,
    updateOrderStatus,
    assignWorkerToOrder,
    resolveException,
    completePicking,
    completePacking,
    submitQualityCheck,
    dispatchOrder,
    userRole,
  } = useWarehouse();

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedBoxType, setSelectedBoxType] = useState<string>("BOX-M");
  const [qcFailReason, setQcFailReason] = useState<string>("");
  const [showQcFailInput, setShowQcFailInput] = useState<boolean>(false);

  if (!selectedOrderId) return null;

  const order = orders.find((o) => o.id === selectedOrderId);
  if (!order) return null;

  const orderExceptions = exceptions.filter((e) => e.orderId === order.id);
  const orderAuditLogs = auditLogs.filter((l) => l.orderId === order.id);
  const assignedPicker = workers.find((w) => w.id === order.assignedPickerId);
  const assignedPacker = workers.find((w) => w.id === order.assignedPackerId) || workers.find((w) => w.id === "W-11");

  // 7-step lifecycle
  const lifecycleSteps: { key: OrderStatus; label: string; icon: any }[] = [
    { key: "CREATED", label: "Created", icon: Package },
    { key: "PRIORITIZED", label: "Prioritized", icon: Sparkles },
    { key: "ALLOCATED", label: "Allocated", icon: Layers },
    { key: "PICKING", label: "Picking", icon: Crosshair },
    { key: "PACKING", label: "Packing", icon: Box },
    { key: "PENDING_QC", label: "QC Inspection", icon: ShieldCheck },
    { key: "DISPATCHED", label: "Dispatched", icon: Truck },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "CREATED":
        return 0;
      case "PRIORITIZED":
        return 1;
      case "ALLOCATED":
      case "ON_HOLD":
        return 2;
      case "PICKING":
        return 3;
      case "PICKED":
        return 3.5;
      case "PACKING":
        return 4;
      case "PACKED":
      case "PENDING_QC":
        return 5;
      case "QC_PASSED":
      case "READY_FOR_DISPATCH":
        return 5.5;
      case "DISPATCHED":
        return 6;
      case "EXCEPTION":
      case "QC_FAILED":
        return 3.2;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xl font-extrabold text-indigo-400">
                {order.id}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.priority === "CRITICAL"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : order.priority === "HIGH"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                Priority: {order.priority} ({order.priorityScore}/100)
              </span>
              {order.vipTier === "VIP_DIAMOND" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  💎 VIP Diamond Tier
                </span>
              )}
              {order.vipTier === "FLIPKART_SUPER_ELITE" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  👑 Flipkart SuperElite
                </span>
              )}
              {order.vipTier === "VIP_PLATINUM" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ⭐ VIP Platinum
                </span>
              )}
              {order.vipTier === "TATKAL_PRIME" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  ⚡ Tatkal Prime
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Status: {order.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 pt-1">
              <span className="font-semibold text-slate-200">{order.customerName}</span>
              <span>•</span>
              <span>{order.customerRegion}</span>
              {order.customerPincode && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-400">PIN: {order.customerPincode}</span>
                </>
              )}
              {order.deliverySlot && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">🚀 {order.deliverySlot}</span>
                </>
              )}
              <span>•</span>
              <span>Carrier: <strong className="text-slate-200">{order.carrier}</strong></span>
              {order.trackingNumber && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-400">Track: {order.trackingNumber}</span>
                </>
              )}
              {order.orderValueINR && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    Total: ₹{order.orderValueINR.toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-red-400 bg-red-950/60 px-3 py-1.5 rounded-lg border border-red-500/30">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>{order.minutesRemaining} mins to deadline</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">SLA Risk: {order.slaRisk}</p>
            </div>
            <button
              onClick={() => setSelectedOrderId(null)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual 7-Step Lifecycle Bar */}
        <div className="bg-slate-950/70 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>

            {lifecycleSteps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = Math.floor(currentStepIdx) === idx;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30 shadow-md shadow-indigo-600/40"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-medium mt-1.5 ${
                      isCurrent
                        ? "text-indigo-300 font-bold"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* Active Exceptions Alert Banner (if any) */}
          {orderExceptions.length > 0 && (
            <div className="space-y-2.5">
              {orderExceptions.map((ex) => (
                <div
                  key={ex.id}
                  className={`p-4 rounded-xl border ${
                    ex.status === "RESOLVED"
                      ? "bg-emerald-950/30 border-emerald-500/40"
                      : "bg-red-950/40 border-red-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertOctagon
                        className={`w-4 h-4 ${
                          ex.status === "RESOLVED" ? "text-emerald-400" : "text-red-400"
                        }`}
                      />
                      <span className="font-bold text-slate-100">
                        Exception {ex.id}: {ex.type.replace(/_/g, " ")} ({ex.severity})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ex.status === "RESOLVED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300 animate-pulse"
                      }`}
                    >
                      Status: {ex.status}
                    </span>
                  </div>

                  <p className="text-slate-300 mt-2">{ex.description}</p>

                  {/* AI Resolution Analysis */}
                  <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Autonomous Resolution Analysis</span>
                    </div>
                    <p className="text-slate-200">
                      <strong>Root Cause:</strong> {ex.aiAnalysis.rootCause}
                    </p>
                    <p className="text-emerald-300 font-medium">
                      <strong>Recommended Action:</strong> {ex.aiAnalysis.recommendedAction}
                    </p>
                    {ex.aiAnalysis.alternativeLocation && (
                      <p className="text-slate-400 text-[11px]">
                        Backup inventory available in Bin{" "}
                        <strong className="text-amber-300">{ex.aiAnalysis.alternativeLocation}</strong>{" "}
                        (Zone {ex.aiAnalysis.alternativeZone}, {ex.aiAnalysis.alternativeQtyAvailable} units).
                      </p>
                    )}
                  </div>

                  {/* Action buttons if not resolved */}
                  {ex.status !== "RESOLVED" && (
                    <div className="mt-3 flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          resolveException(
                            ex.id,
                            `Approved AI Transfer: Reallocated backup units from Bin ${ex.aiAnalysis.alternativeLocation || "E-12-02"}.`
                          )
                        }
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow-sm flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Authorize AI Reallocation & Resolve Exception</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 2-Column Grid: Order Items & Inventory Allocation (Left) vs Decision Explainability (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Items Breakdown & Allocation Status */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h3 className="font-bold text-slate-100 flex items-center justify-between mb-3">
                  <span>Order Items & Fulfillment Status</span>
                  <span className="text-slate-400 font-normal">
                    {order.items.length} SKUs • {order.totalUnits} Total Units
                  </span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="pb-2 font-semibold">SKU & Item</th>
                        <th className="pb-2 font-semibold">Pick Bay</th>
                        <th className="pb-2 font-semibold text-center">Req / Alloc</th>
                        <th className="pb-2 font-semibold text-center">Picked</th>
                        <th className="pb-2 font-semibold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {order.items.map((item) => (
                        <tr key={item.id} className="text-slate-300">
                          <td className="py-2.5 pr-2">
                            <div className="font-bold text-slate-100">{item.sku}</div>
                            <div className="font-sans text-[11px] text-slate-400 truncate max-w-[170px]">
                              {item.productName}
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300">
                              {item.location} (Zone {item.zone})
                            </span>
                          </td>
                          <td className="py-2.5 text-center font-bold">
                            <span className="text-slate-100">{item.quantityRequested}</span>
                            <span className="text-slate-500"> / </span>
                            <span
                              className={
                                item.quantityAllocated >= item.quantityRequested
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }
                            >
                              {item.quantityAllocated}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.quantityPicked >= item.quantityRequested
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {item.quantityPicked} / {item.quantityAllocated}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-200">
                            <div>
                              ₹{((item.unitPriceINR || item.unitPrice * 85) * item.quantityRequested).toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans">
                              ${(item.unitPrice * item.quantityRequested).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {order.allocationNotes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-[11px]">
                    ℹ️ <strong>Allocation Log:</strong> {order.allocationNotes}
                  </div>
                )}
              </div>

              {/* Worker Assignment Card */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-100 flex items-center justify-between">
                  <span>Assigned Floor Personnel</span>
                  <span className="text-[11px] text-slate-400">Shift A (Morning)</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      Assigned Picker
                    </span>
                    {assignedPicker ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full ${assignedPicker.avatarColor} flex items-center justify-center text-white font-bold text-[10px]`}>
                          {assignedPicker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-xs">{assignedPicker.name}</p>
                          <p className="text-[10px] text-emerald-400">
                            Zone {assignedPicker.currentZone} • {assignedPicker.accuracyRate}% Acc
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400">No picker assigned yet</div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      Assigned Packer / QC
                    </span>
                    {assignedPacker ? (
                      <div className="mt-1 flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full ${assignedPacker.avatarColor} flex items-center justify-center text-white font-bold text-[10px]`}>
                          {assignedPacker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-xs">{assignedPacker.name} ({assignedPacker.id})</p>
                          <p className="text-[10px] text-indigo-400">Packing Bay • {assignedPacker.specialization || "Tamper-Proof Seal"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 text-slate-400">Unassigned</div>
                    )}
                  </div>
                </div>

                {/* Supervisor Reassign Toolbar */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">Select alternate picker to reassign...</option>
                    {workers
                      .filter((w) => w.role === "Picker")
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.id}) - Zone {w.currentZone} - {w.currentWorkloadPercent}% Load
                        </option>
                      ))}
                  </select>
                  <button
                    disabled={!selectedWorkerId}
                    onClick={() => {
                      assignWorkerToOrder(order.id, selectedWorkerId);
                      setSelectedWorkerId("");
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg font-semibold transition-colors shrink-0"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            </div>

            {/* Right: AI Explainability & Operational Decision Engine */}
            <div className="lg:col-span-5 space-y-4">
              {/* WHY THIS DECISION Card */}
              <div className="bg-slate-950/60 border border-purple-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-xs">
                      AI Priority & Allocation Rationale
                    </h4>
                    <p className="text-[10px] text-purple-300">Decision Explainability Engine</p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Scoring Dimensions Considered:
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {order.priorityReasons?.map((reason, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                  ⚡ <strong>Control Directive:</strong> Prioritized over standard order ORD-1022 to avoid $1,250 enterprise SLA breach penalty.
                </div>
              </div>

              {/* Stage Progression Action Controls */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-100 text-xs flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Workflow Execution Action Bar</span>
                </h4>

                <div className="space-y-2">
                  {order.status === "PICKING" && (
                    <button
                      onClick={() => completePicking(order.id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <Crosshair className="w-4 h-4" />
                      <span>Complete Picking (Stage at Packing Bay)</span>
                    </button>
                  )}

                  {(order.status === "PICKED" || order.status === "PACKING") && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">Box Size:</span>
                        <select
                          value={selectedBoxType}
                          onChange={(e) => setSelectedBoxType(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs"
                        >
                          <option value="BOX-S">BOX-S (Small - Up to 2kg)</option>
                          <option value="BOX-M">BOX-M (Medium - Up to 5kg)</option>
                          <option value="BOX-L">BOX-L (Large - Up to 15kg)</option>
                          <option value="BOX-XL">BOX-XL (Heavy Freight)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => completePacking(order.id, selectedBoxType)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-2"
                      >
                        <Box className="w-4 h-4" />
                        <span>Seal Box & Send to Quality Control</span>
                      </button>
                    </div>
                  )}

                  {order.status === "PENDING_QC" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => submitQualityCheck(order.id, true)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pass 5-Point QC</span>
                        </button>
                        <button
                          onClick={() => setShowQcFailInput(!showQcFailInput)}
                          className="px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg font-bold text-xs transition-colors"
                        >
                          Fail QC
                        </button>
                      </div>

                      {showQcFailInput && (
                        <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg space-y-2">
                          <input
                            type="text"
                            value={qcFailReason}
                            onChange={(e) => setQcFailReason(e.target.value)}
                            placeholder="Reason (e.g., 'Barcode seal broken')..."
                            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded px-2.5 py-1.5 text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              submitQualityCheck(order.id, false, qcFailReason || "Inspection failure");
                              setShowQcFailInput(false);
                            }}
                            className="w-full py-1 bg-red-600 hover:bg-red-500 text-white rounded font-semibold text-xs"
                          >
                            Submit QC Failure & Raise Exception
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(order.status === "READY_FOR_DISPATCH" || order.status === "QC_PASSED") && (
                    <button
                      onClick={() => dispatchOrder(order.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Truck className="w-4 h-4 text-amber-300" />
                      <span>Confirm Carrier Handover & Dispatch ({order.carrier})</span>
                    </button>
                  )}

                  {order.status === "DISPATCHED" && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-center text-emerald-300 font-bold flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order Officially Dispatched & Manifest Sealed!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h4 className="font-bold text-slate-100 mb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Immutable Operational Audit Trail ({orderAuditLogs.length} Events)</span>
            </h4>

            <div className="space-y-2 font-mono text-[11px]">
              {orderAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold">{log.timeFormatted}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${log.badgeColor}`}>
                        {log.eventType}
                      </span>
                      <span className="text-slate-400">Actor: {log.actor}</span>
                    </div>
                    <p className="text-slate-200 font-sans text-xs">{log.summary}</p>
                    {log.details && (
                      <p className="text-slate-500 font-sans text-[11px]">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Viewing full operational state record for {order.id}</span>
          <button
            onClick={() => setSelectedOrderId(null)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
