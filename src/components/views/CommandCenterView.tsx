import React from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Flame,
  AlertTriangle,
  Sparkles,
  Zap,
  TrendingUp,
  Package,
  Crosshair,
  Truck,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Activity,
  Box,
  Scale,
  Bot,
  Sliders,
  ChevronRight,
  TrendingDown,
} from "lucide-react";

export const CommandCenterView: React.FC = () => {
  const {
    metrics,
    orders,
    zones,
    workers,
    exceptions,
    recommendations,
    liveEvents,
    setSelectedOrderId,
    setCurrentView,
    approveRecommendation,
    rejectRecommendation,
    setIsCopilotOpen,
    userRole,
  } = useWarehouse();

  const atRiskOrders = orders.filter(
    (o) => o.slaRisk === "CRITICAL" || o.slaRisk === "HIGH" || o.priority === "CRITICAL"
  );
  const pendingRecs = recommendations.filter((r) => r.status === "PENDING_APPROVAL");
  const openExceptions = exceptions.filter((e) => e.status !== "RESOLVED");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Top Hero Command Center Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-indigo-950/40 border border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>FACILITY ID: IN-BLR-FC01 (Bengaluru Mega Hub)</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AUTONOMOUS ENGINE ACTIVE</span>
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700">
                SLA DISPATCH: <strong className="text-emerald-400">{metrics.dispatchSlaRate}%</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2.5">
              Warehouse Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time fulfillment control tower with continuous SLA risk evaluation, pick-path optimization, and autonomous workforce rebalancing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 group"
            >
              <Bot className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
              <span>Launch NEXUS Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>

            <button
              onClick={() => setCurrentView("ai-actions")}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Decision Hub ({pendingRecs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards with Refined Enterprise Styling */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Orders */}
        <div
          onClick={() => setCurrentView("orders")}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Pipeline</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{metrics.totalOrders}</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">+12%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Orders in fulfillment</p>
        </div>

        {/* Orders At SLA Risk */}
        <div
          onClick={() => setCurrentView("orders")}
          className="bg-slate-900/90 border border-red-500/40 p-4 rounded-2xl hover:border-red-500 hover:bg-red-950/20 transition-all cursor-pointer group shadow-sm glow-red"
        >
          <div className="flex items-center justify-between text-red-300">
            <span className="text-xs font-bold">SLA Breach Risk</span>
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 animate-pulse">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight">{metrics.ordersAtRisk}</span>
            <span className="text-[10px] font-mono font-bold text-red-300">CRITICAL</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Deadline &lt;60 mins</p>
        </div>

        {/* Pick Efficiency */}
        <div
          onClick={() => setCurrentView("picking")}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pick Efficiency</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Crosshair className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.pickingEfficiencyScore}%
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Optimal</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.ordersInPicking} active pick runs</p>
        </div>

        {/* Packing & QC */}
        <div
          onClick={() => setCurrentView("packing")}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Packing & QC</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Box className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {metrics.ordersInPacking + metrics.ordersInQC}
            </span>
            <span className="text-[10px] font-mono text-blue-400 font-bold">{metrics.ordersInQC} in QC</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">98.4% first-pass yield</p>
        </div>

        {/* Dispatch SLA */}
        <div
          onClick={() => setCurrentView("dispatch")}
          className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl hover:border-purple-500/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Carrier SLA</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{metrics.dispatchSlaRate}%</span>
            <span className="text-[10px] font-mono text-purple-400 font-bold">{metrics.ordersDispatchedToday} Out</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SwiftShip &amp; BlueDart</p>
        </div>

        {/* Open Exceptions */}
        <div
          onClick={() => setCurrentView("exceptions")}
          className="bg-slate-900/90 border border-amber-500/40 p-4 rounded-2xl hover:border-amber-500 hover:bg-amber-950/20 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-bold">Exceptions</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">{openExceptions.length}</span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">AI Solved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Alternatives staged</p>
        </div>
      </div>

      {/* Real-time Operational Critical Incidents Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <h2 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              High-Priority Operational Bottlenecks &amp; Live Alerts
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Live Control Stream</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Incident 1: ORD-1048 SLA Breach Risk */}
          <div
            onClick={() => {
              setSelectedOrderId("ORD-1048");
              setCurrentView("orders");
            }}
            className="p-4 bg-gradient-to-b from-red-950/40 to-slate-950/80 border border-red-500/40 hover:border-red-500 rounded-xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  🔴 SLA AT RISK (78%)
                </span>
                <span className="text-xs font-mono font-bold text-red-400">42m Left</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-red-300 transition-colors">
                Order #ORD-1048 (Apex Robotics)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Shortage on SKU <code className="text-slate-200">WH-1042</code> + missing item discrepancy in Bin B-05-01.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-red-900/40 flex items-center justify-between text-[11px] text-red-300 font-semibold">
              <span>View Resolution Path</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Incident 2: Zone B Congestion */}
          <div
            onClick={() => setCurrentView("map")}
            className="p-4 bg-gradient-to-b from-amber-950/40 to-slate-950/80 border border-amber-500/40 hover:border-amber-500 rounded-xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🟠 ZONE B CONGESTION
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">88% Load</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                Zone B (Sensors &amp; Optics)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                14 queued tasks with 2 active pickers. Average pick time 6.8 min (+74%).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-amber-900/40 flex items-center justify-between text-[11px] text-amber-300 font-semibold">
              <span>Inspect Digital Twin Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Incident 3: Stock Depletion */}
          <div
            onClick={() => setCurrentView("inventory")}
            className="p-4 bg-gradient-to-b from-yellow-950/40 to-slate-950/80 border border-yellow-500/40 hover:border-yellow-500 rounded-xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  🟡 STOCK DEPLETION
                </span>
                <span className="text-xs font-mono font-bold text-yellow-400">0.8 Days</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-yellow-300 transition-colors">
                SKU WH-1042 (Pro Sensors)
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Only 2 units remaining in available pool against 14.2/day run-rate.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-yellow-900/40 flex items-center justify-between text-[11px] text-yellow-300 font-semibold">
              <span>Generate PO (120 units)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Incident 4: Workforce Disparity */}
          <div
            onClick={() => setCurrentView("workforce")}
            className="p-4 bg-gradient-to-b from-blue-950/40 to-slate-950/80 border border-blue-500/40 hover:border-blue-500 rounded-xl transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  👥 WORKFORCE IMBALANCE
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">92% Load</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-blue-300 transition-colors">
                Worker Aarav Sharma (W-01) Overload
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                12 tasks assigned to Aarav while Priya Nair (W-03) has only 3 tasks (41%).
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-blue-900/40 flex items-center justify-between text-[11px] text-blue-300 font-semibold">
              <span>Rebalance 4 Tasks to Priya</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: AI Action Hub (Left) & Real-Time Orders / Zones (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Top AI Action Cards with Explainability */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Autonomous AI Recommendations &amp; Directives
                </h3>
                <p className="text-[11px] text-slate-400">
                  Continuous operational decision proposals requiring supervisor authorization
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("ai-actions")}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
            >
              <span>View All ({recommendations.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {pendingRecs.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/95 border border-slate-800 hover:border-purple-500/50 p-5 rounded-2xl shadow-md transition-all text-xs"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        rec.urgency === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {rec.urgency}
                    </span>
                    <span className="font-mono text-slate-400 font-semibold">{rec.id}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-300 font-medium">{rec.category.replace(/_/g, " ")}</span>
                  </div>
                </div>

                {/* Title & Summary */}
                <h4 className="text-sm font-bold text-white mt-2.5">{rec.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.summary}</p>

                {/* Explainability / Rationale Section */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span>Telemetry Considered &amp; Deterministic Rationale:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {rec.rationaleData.map((fact, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong>Projected Result:</strong> {rec.expectedImpact}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 truncate">
                    Affected: {rec.affectedEntities.map((e) => e.label).join(", ")}
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => rejectRecommendation(rec.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => approveRecommendation(rec.id)}
                      className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Approve Decision</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Priority Orders & Digital Twin Zone Health */}
        <div className="lg:col-span-5 space-y-4">
          {/* Priority Orders Section */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Flame className="w-4 h-4 text-red-400" />
                <span>Orders Requiring Immediate Supervision</span>
              </h3>
              <span className="text-xs text-red-400 font-bold font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-500/30">
                {atRiskOrders.length} Flagged
              </span>
            </div>

            <div className="space-y-2.5">
              {atRiskOrders.slice(0, 4).map((order) => (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setCurrentView("orders");
                  }}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer group text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-indigo-400">{order.id}</span>
                      <span className="font-semibold text-white truncate max-w-[130px]">
                        {order.customerName}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        order.priority === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      Score: {order.priorityScore}/100
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Status: <strong className="text-slate-200">{order.status}</strong>
                    </span>
                    <span className="flex items-center space-x-1 text-red-400 font-mono font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{order.minutesRemaining} mins left</span>
                    </span>
                  </div>

                  {order.priorityReasons?.[0] && (
                    <p className="text-[11px] text-slate-400 mt-1.5 truncate">
                      💡 {order.priorityReasons[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Warehouse Zones Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Facility Zones Live Status</span>
              </h3>
              <button
                onClick={() => setCurrentView("map")}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>Digital Twin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setCurrentView("map")}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    zone.bottleneckDetected
                      ? "bg-amber-950/30 border-amber-500/40 hover:border-amber-500"
                      : "bg-slate-950/70 border-slate-800/90 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                        zone.bottleneckDetected
                          ? "bg-amber-500 text-slate-950 animate-pulse font-extrabold"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {zone.id}
                    </div>
                    <div>
                      <p className="font-bold text-white">{zone.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {zone.activeWorkers} Pickers • {zone.activeTasks} Queued Tasks
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        zone.congestionLevel === "HIGH" || zone.congestionLevel === "CRITICAL"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : zone.congestionLevel === "MODERATE"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {zone.congestionScore}% Load
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      Avg: {zone.avgPickTimeMinutes}m / pick
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
