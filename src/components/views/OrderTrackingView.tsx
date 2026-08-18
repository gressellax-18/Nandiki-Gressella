import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Navigation,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Flame,
  Activity,
} from "lucide-react";
import { OrderShipmentTracking, DeliveryAgent } from "../../types";

export const OrderTrackingView: React.FC<{ initialOrderId?: string }> = ({ initialOrderId }) => {
  const {
    shipmentTrackings,
    deliveryAgents,
    orders,
    reassignDeliveryAgent,
    setSelectedOrderId,
    setCurrentView,
  } = useWarehouse();

  const [selectedTrackingId, setSelectedTrackingId] = useState<string>(
    initialOrderId || shipmentTrackings[0]?.orderId || "ORD-1048"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const currentShipment =
    shipmentTrackings.find((s) => s.orderId === selectedTrackingId) || shipmentTrackings[0];
  const linkedOrder = orders.find((o) => o.id === currentShipment?.orderId);

  const filteredTrackings = shipmentTrackings.filter((s) => {
    const matchesSearch =
      s.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destinationArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === "ALL" || s.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
      case "HIGH":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MEDIUM":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getMilestoneIcon = (type: string, status: string) => {
    if (status === "COMPLETED") {
      return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
    }
    if (status === "ACTIVE") {
      return (
        <div className="relative flex items-center justify-center shrink-0">
          <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-400 animate-ping absolute" />
          <span className="w-3 h-3 rounded-full bg-indigo-500 relative" />
        </div>
      );
    }
    if (status === "DELAYED") {
      return <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />;
    }
    return <div className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />;
  };

  return (
    <div className="space-y-6" id="order-tracking-view">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Doorstep & Shipment Control Tower
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    LIVE GPS 100%
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  End-to-end multi-hub transit visibility, delay diagnostics, and intelligent agent dispatch
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                Active In-Transit
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {shipmentTrackings.filter((s) => s.status !== "DELIVERED").length}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-amber-400 block font-mono">
                At-Risk SLA
              </span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {shipmentTrackings.filter((s) => s.riskLevel === "HIGH" || s.riskLevel === "CRITICAL").length}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-mono">
                Avg ETA Accuracy
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                98.4%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Left List + Right Detail Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Shipment List */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order, AWB, area, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] custom-scrollbar">
              {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRisk(r)}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    filterRisk === r
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
            {filteredTrackings.map((tracking) => {
              const isSelected = tracking.orderId === selectedTrackingId;
              return (
                <div
                  key={tracking.orderId}
                  onClick={() => setSelectedTrackingId(tracking.orderId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500 shadow-md shadow-indigo-500/10"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {tracking.orderId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {tracking.carrier}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-1 truncate max-w-[200px]">
                        {tracking.customerName}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        {tracking.destinationArea} • {tracking.pincode}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(
                          tracking.riskLevel
                        )}`}
                      >
                        {tracking.riskLevel}
                      </span>
                      <p className="text-[11px] font-mono text-emerald-400 mt-1.5 font-semibold">
                        {tracking.etaFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-indigo-400" />
                      {tracking.distanceRemainingKm} km remaining
                    </span>
                    <span className="font-mono text-slate-300">
                      Conf: {tracking.confidencePercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Tracker with GPS Map, Diagnostics, Milestones, Agent Assignment */}
        <div className="lg:col-span-8 space-y-6">
          {currentShipment ? (
            <>
              {/* Top Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-bold text-white font-mono">
                        {currentShipment.orderId}
                      </h2>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        AWB: {currentShipment.trackingNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRiskBadge(
                          currentShipment.riskLevel
                        )}`}
                      >
                        Risk: {currentShipment.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Origin Hub: <span className="text-slate-200 font-medium">{currentShipment.originHub}</span> → Destination:{" "}
                      <span className="text-slate-200 font-medium">
                        {currentShipment.destinationArea} ({currentShipment.pincode})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrderId(currentShipment.orderId);
                        setCurrentView("orders");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      View Order SLA
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => setCurrentView("feedback")}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
                    >
                      Feedback Loop
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Key Real-Time Transit Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Guaranteed ETA
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                      {currentShipment.etaFormatted}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Distance Remaining
                    </span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                      {currentShipment.distanceRemainingKm} km
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      AI Confidence
                    </span>
                    <span className="text-sm font-bold text-indigo-400 font-mono mt-0.5 block">
                      {currentShipment.confidencePercentage}%
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                      Shipping Speed
                    </span>
                    <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 block">
                      {currentShipment.shippingMethod}
                    </span>
                  </div>
                </div>

                {/* Delay Diagnostic Panel (Why is my order delayed?) */}
                {currentShipment.delayDiagnostics && (
                  <div
                    className={`p-4 rounded-xl border ${
                      currentShipment.delayDiagnostics.isDelayed
                        ? "bg-amber-950/30 border-amber-600/40 text-amber-200"
                        : "bg-emerald-950/30 border-emerald-600/40 text-emerald-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          currentShipment.delayDiagnostics.isDelayed
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                            {currentShipment.delayDiagnostics.isDelayed
                              ? `⚠️ Root Cause Diagnostic: ${currentShipment.delayDiagnostics.estimatedDelayMinutes} Mins Latency`
                              : "✅ On-Track: No Active Delay Risk"}
                          </h4>
                          <span className="text-[10px] font-mono opacity-80">
                            Stage: {currentShipment.delayDiagnostics.bottleneckStage}
                          </span>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">
                          {currentShipment.delayDiagnostics.explanation}
                        </p>
                        <div className="pt-2 border-t border-amber-700/30 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-amber-300">
                            AI Recovery Recommendation: {currentShipment.delayDiagnostics.mitigationRecommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual Transit Map Simulation */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      Live Route Simulation (Bengaluru Hub → Regional Hub → Doorstep)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      GPS Telemetry Active
                    </span>
                  </div>

                  {/* Route Visualizer Bar */}
                  <div className="relative py-4 px-2">
                    <div className="h-2 bg-slate-800 rounded-full w-full relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(10, (100 - currentShipment.distanceRemainingKm * 1.5))
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-3 text-[11px] text-slate-400">
                      <div className="text-left">
                        <p className="font-bold text-white">Bhiwandi / Bengaluru FC</p>
                        <p className="text-[10px] text-slate-500">Origin Sortation</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-indigo-300">Regional Mother Hub</p>
                        <p className="text-[10px] text-slate-500">Cross-Dock Intermodal</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400">{currentShipment.destinationArea}</p>
                        <p className="text-[10px] text-slate-500">Customer Doorstep</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone Timeline & Delivery Agent Allocation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Milestone Timeline */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    Shipment Milestones
                  </h3>

                  <div className="space-y-4 relative pl-3 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {currentShipment.milestones.map((milestone) => (
                      <div key={milestone.id} className="relative flex items-start gap-3 pl-4">
                        <div className="absolute -left-[5px] top-1">
                          {getMilestoneIcon(milestone.stage, milestone.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-white truncate">
                              {milestone.title}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {milestone.timestampFormatted}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{milestone.description}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            📍 {milestone.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Delivery Agent Dispatcher */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      Assigned Delivery Agent
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                      Overlap Optimized
                    </span>
                  </div>

                  {currentShipment.assignedAgent ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                            {currentShipment.assignedAgent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">
                              {currentShipment.assignedAgent.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              ID: {currentShipment.assignedAgent.id} • {currentShipment.assignedAgent.vehicleType}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {currentShipment.assignedAgent.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Distance</span>
                          <span className="font-mono font-bold text-slate-200">
                            {currentShipment.assignedAgent.distanceFromHubKm} km
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Route Overlap</span>
                          <span className="font-mono font-bold text-emerald-400">
                            {currentShipment.assignedAgent.routeOverlapPercentage}%
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Success Rate</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {currentShipment.assignedAgent.rating} ★
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {currentShipment.assignedAgent.phone}
                        </span>
                        <span className="text-emerald-400 font-semibold font-mono">
                          Battery: {currentShipment.assignedAgent.batteryOrFuelPercent}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-700/30 text-amber-300 text-xs">
                      No delivery agent assigned yet. Choose a recommended agent below:
                    </div>
                  )}

                  {/* Reassign Agent Selector */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Smart Available Agents in Hub Cluster:
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {deliveryAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs hover:border-slate-700"
                        >
                          <div>
                            <span className="font-medium text-slate-200">{agent.name}</span>
                            <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                              ({agent.distanceFromHubKm}km away • {agent.routeOverlapPercentage}% overlap)
                            </span>
                          </div>
                          <button
                            onClick={() => reassignDeliveryAgent(currentShipment.orderId, agent.id)}
                            className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-semibold transition-all"
                          >
                            Assign
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
              Select a shipment from the left list to view live tracking details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
