import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Crosshair,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  Barcode,
  RotateCcw,
  Zap,
  Box,
  Compass,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";

export const PickingControlView: React.FC = () => {
  const {
    orders,
    workers,
    advancePickingStep,
    completePicking,
    reportMissingItem,
    reportDamagedItem,
    setSelectedOrderId,
    setCurrentView,
    userRole,
  } = useWarehouse();

  const [activeTaskOrderId, setActiveTaskOrderId] = useState<string>("ORD-1048");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.id === activeTaskOrderId) || orders[0];
  const assignedWorker = workers.find((w) => w.id === activeOrder?.assignedPickerId) || workers[0];

  const handleScanItem = (sku: string) => {
    setScanFeedback(`✅ Barcode Scanned: [${sku}] verified! Pick quantity logged.`);
    advancePickingStep(activeOrder.id, currentStepIdx);
    if (currentStepIdx < activeOrder.items.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
    setTimeout(() => setScanFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">AI Picking Route Optimization & Floor HUD</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TSP Wave Solver Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic shortest-path waypoint generation, real-time aisle congestion avoidance, and mobile scanning terminal.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 flex items-center space-x-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>33.3% Travel Distance Reduction</span>
          </div>
        </div>
      </div>

      {/* 2-Column Layout: Mobile Picker HUD (Left) vs AI Route Comparison Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mobile Picker Terminal HUD */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-xl text-xs space-y-4 relative">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-100 text-sm">MOBILE PICKER TERMINAL</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Picker: <strong>{assignedWorker.name}</strong> • Cart ID: <strong>CRT-04</strong>
                  </p>
                </div>
              </div>

              {/* Task Selector */}
              <select
                value={activeTaskOrderId}
                onChange={(e) => {
                  setActiveTaskOrderId(e.target.value);
                  setCurrentStepIdx(0);
                }}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                {orders
                  .filter((o) => o.status !== "DISPATCHED")
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} ({o.customerName}) - {o.priority}
                    </option>
                  ))}
              </select>
            </div>

            {/* Active Order Summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Active Task</span>
                <p className="font-mono font-bold text-sm text-indigo-400">{activeOrder.id}</p>
                <p className="text-[11px] text-slate-300">{activeOrder.customerName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-red-400 font-semibold uppercase">Deadline</span>
                <p className="font-mono font-bold text-sm text-red-400">
                  {activeOrder.minutesRemaining} mins left
                </p>
                <span className="text-[10px] text-slate-400">
                  Priority Score: {activeOrder.priorityScore}
                </span>
              </div>
            </div>

            {/* Interactive Pick Steps Sequence */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Compass className="w-3 h-3 text-indigo-400" />
                <span>Optimized Waypoint Sequence ({activeOrder.items.length} Stops)</span>
              </span>

              <div className="space-y-2">
                {activeOrder.items.map((item, idx) => {
                  const isCurrent = idx === currentStepIdx;
                  const isPicked = item.quantityPicked >= (item.quantityAllocated || item.quantityRequested);

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                          : isPicked
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-slate-950/60 border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                              isPicked
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-indigo-600 text-white"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {isPicked ? "✓" : idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-amber-300 text-xs">
                                Bay {item.location}
                              </span>
                              <span className="text-slate-400 text-[10px] font-mono">
                                (Zone {item.zone})
                              </span>
                            </div>
                            <p className="font-bold text-slate-100 mt-0.5">{item.productName}</p>
                            <p className="font-mono text-slate-400 text-[10px]">SKU: {item.sku}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Pick Qty:</span>
                          <span className="font-mono font-extrabold text-sm text-slate-100">
                            {item.quantityAllocated || item.quantityRequested} units
                          </span>
                        </div>
                      </div>

                      {/* Action Bar for Current Step */}
                      {isCurrent && !isPicked && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleScanItem(item.sku)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                          >
                            <Barcode className="w-4 h-4" />
                            <span>Scan Item Barcode</span>
                          </button>

                          <button
                            onClick={() => reportMissingItem(activeOrder.id, item.sku, item.location)}
                            className="px-2.5 py-2 bg-slate-800 hover:bg-yellow-600 text-yellow-300 hover:text-white rounded-lg font-semibold transition-colors flex items-center space-x-1"
                            title="Report missing inventory at this location"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Missing</span>
                          </button>

                          <button
                            onClick={() => reportDamagedItem(activeOrder.id, item.sku, item.location)}
                            className="px-2.5 py-2 bg-slate-800 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg font-semibold transition-colors flex items-center space-x-1"
                            title="Report damaged unit found at bin"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Damaged</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scan Feedback Alert */}
            {scanFeedback && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-300 font-semibold animate-in fade-in">
                {scanFeedback}
              </div>
            )}

            {/* Complete Pick Batch Button */}
            <div className="pt-2">
              <button
                onClick={() => completePicking(activeOrder.id)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-extrabold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                <Box className="w-4 h-4" />
                <span>Complete Pick Batch & Stage for Packing Bay 2</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Route Comparison Visualizer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    AI Route Efficiency Visualizer
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Traveling Salesperson Problem (TSP) Optimization Engine
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                9.0 Mins Saved
              </span>
            </div>

            {/* Distance Comparison Metrics */}
            <div className="grid grid-cols-2 gap-3">
              {/* Unoptimized Path */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Legacy Serpentine Path
                </span>
                <p className="font-mono text-xl font-bold text-slate-300">420 meters</p>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Est. Time: 16.5 mins</span>
                </div>
                <p className="text-[10px] text-red-400">Traverses congested Zone B aisle twice</p>
              </div>

              {/* AI Optimized Path */}
              <div className="p-3.5 bg-purple-950/30 rounded-xl border border-purple-500/40 space-y-1.5">
                <span className="text-[10px] font-semibold text-purple-300 uppercase flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>WARENEXUS AI Path</span>
                </span>
                <p className="font-mono text-xl font-extrabold text-emerald-400">280 meters</p>
                <div className="text-[11px] text-emerald-300 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Est. Time: 7.5 mins (-55%)</span>
                </div>
                <p className="text-[10px] text-emerald-400">Avoids Zone B bottleneck via Bay C</p>
              </div>
            </div>

            {/* 2D Path Schematic Map */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Warehouse Floor Waypoint Route Graph:
              </span>

              <div className="h-44 bg-slate-900 rounded-lg border border-slate-800 relative p-4 flex flex-col justify-between overflow-hidden">
                {/* Visual Floor Grid Background */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #818cf8 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>

                {/* Node 1: Start Depot */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span className="font-mono text-[10px] text-slate-200">Start: Cart Staging</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">→ 40m →</span>
                  <div className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-mono text-[10px] text-slate-200">Stop 1: A-12-04</span>
                  </div>
                </div>

                {/* Arrow Vector Connector */}
                <div className="flex items-center justify-center my-1 z-10">
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                    ⚡ AI Aisle Bypass: Saves 140m
                  </span>
                </div>

                {/* Node 2: Secondary & Packing */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center space-x-2 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="font-mono text-[10px] text-slate-200">Stop 2: B-05-01</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">→ 60m →</span>
                  <div className="flex items-center space-x-2 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30 text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono text-[10px]">End: Packing Bay 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Callout */}
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200">
              💡 <strong>Autonomous Dynamic Routing:</strong> Sequence automatically adjusted based on live worker GPS coordinates and real-time conveyor traffic sensors.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
