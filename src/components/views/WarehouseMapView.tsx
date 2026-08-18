import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  MapPin,
  Sparkles,
  Layers,
  Users,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  Box,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { WarehouseZone } from "../../types";

export const WarehouseMapView: React.FC = () => {
  const { zones, workers, orders, approveRecommendation } = useWarehouse();

  const [selectedZone, setSelectedZone] = useState<WarehouseZone | null>(zones.find((z) => z.id === "B") || zones[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Warehouse Digital Twin & Heatmap</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Sensor Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aisle congestion visualization, worker positioning, and physical bottleneck detection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {zones.some((z) => z.bottleneckDetected) && (
            <button
              onClick={() => approveRecommendation("REC-802")}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clear Zone B Bottleneck (Deploy 2 Pickers)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map & Zone Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Warehouse Schematic Map Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Facility Layout & Live Congestion Heatmap (50,000 sq ft)</span>
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span className="text-slate-400">Normal (&lt;40%)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span className="text-slate-400">Moderate (40-75%)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-red-500 animate-pulse"></span>
                  <span className="text-slate-400">Bottleneck (&gt;75%)</span>
                </span>
              </div>
            </div>

            {/* Interactive Layout Map Grid */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 relative space-y-4">
              {/* Storage Zones A - E */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {zones.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;
                  const zoneWorkers = workers.filter((w) => w.currentZone === zone.id);

                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? "border-indigo-500 shadow-lg shadow-indigo-500/20 bg-slate-900"
                          : zone.bottleneckDetected
                          ? "border-amber-500/80 bg-amber-950/30 animate-pulse"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-300 font-bold flex items-center justify-center text-xs font-mono">
                          {zone.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                            zone.congestionScore > 75
                              ? "bg-red-500/20 text-red-300"
                              : zone.congestionScore > 40
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-emerald-500/20 text-emerald-300"
                          }`}
                        >
                          {zone.congestionScore}% Congestion
                        </span>
                      </div>

                      {/* Zone Name & Category */}
                      <h4 className="font-bold text-slate-100 text-xs mt-2">{zone.name}</h4>
                      <p className="text-[10px] text-slate-400">{zone.category}</p>

                      {/* Workers & Queue Stats */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          👥 {zoneWorkers.length} Pickers
                        </span>
                        <span className="text-slate-300 font-mono font-semibold">
                          📋 {zone.activeTasks} Tasks
                        </span>
                      </div>

                      {/* Active Worker Avatars */}
                      <div className="flex -space-x-1.5 mt-2">
                        {zoneWorkers.map((w) => (
                          <div
                            key={w.id}
                            title={`${w.name} (${w.role})`}
                            className={`w-5 h-5 rounded-full ${w.avatarColor} border border-slate-900 text-white flex items-center justify-center text-[9px] font-bold`}
                          >
                            {w.name.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floor Facility Hubs: Packing Bay, QC Inspection, Shipping Dock */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-center">
                  <Box className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-200 text-xs block">Packing Bay 1 & 2</span>
                  <span className="text-[10px] text-slate-400">4 Stations Active</span>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-200 text-xs block">QC Optical Rig</span>
                  <span className="text-[10px] text-slate-400">96.8% Pass Rate</span>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-center">
                  <Truck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <span className="font-bold text-slate-200 text-xs block">Carrier Outbound Docks</span>
                  <span className="text-[10px] text-slate-400">SwiftShip & BlueDart</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Zone Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedZone && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                    Zone Inspector
                  </span>
                  <h3 className="font-bold text-slate-100 text-sm">{selectedZone.name}</h3>
                </div>
                <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold font-mono">
                  {selectedZone.id}
                </span>
              </div>

              {/* Status Metrics */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Congestion Score</span>
                  <span
                    className={`text-base font-bold font-mono ${
                      selectedZone.congestionScore > 75 ? "text-red-400" : "text-slate-100"
                    }`}
                  >
                    {selectedZone.congestionScore}%
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Avg Pick Latency</span>
                  <span className="text-base font-bold font-mono text-slate-100">
                    {selectedZone.avgPickTimeMinutes} mins
                  </span>
                </div>
              </div>

              {/* Active Workers in this Zone */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Personnel in Zone {selectedZone.id}:
                </span>
                <div className="space-y-1.5">
                  {workers
                    .filter((w) => w.currentZone === selectedZone.id)
                    .map((w) => (
                      <div
                        key={w.id}
                        className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`w-5 h-5 rounded-full ${w.avatarColor} text-white flex items-center justify-center text-[9px] font-bold`}>
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200">{w.name}</span>
                            <span className="text-slate-500 text-[10px]"> ({w.role})</span>
                          </div>
                        </div>
                        <span className="font-mono text-slate-300 font-semibold">{w.currentWorkloadPercent}% Load</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Bottleneck Recommendation */}
              {selectedZone.bottleneckDetected && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Severe Bottleneck Detected</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    14 tasks queued with only {selectedZone.activeWorkers} active pickers.
                  </p>
                  <button
                    onClick={() => approveRecommendation("REC-802")}
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold transition-colors"
                  >
                    Authorize AI Workforce Rebalance
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
