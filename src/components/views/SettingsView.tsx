import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  Bell,
  Clock,
  RotateCcw,
  CheckCircle2,
  Save,
  Volume2,
  Database,
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const { resetToDefaults } = useWarehouse();

  const [saved, setSaved] = useState(false);
  const [criticalSlaThreshold, setCriticalSlaThreshold] = useState(60);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoApproveLowRisk, setAutoApproveLowRisk] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Control Tower Settings & Governance</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              System v3.4-PROD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure SLA penalty triggers, autonomous AI threshold levels, carrier cut-offs, and simulation parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saved ? "Saved Changes!" : "Save System Config"}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Operational governance rules updated across all 5 warehouse zones.</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* SLA & Risk Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>SLA & Order Urgency Thresholds</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Critical SLA Breach Warning Threshold (Minutes):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={criticalSlaThreshold}
                  onChange={(e) => setCriticalSlaThreshold(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-indigo-400 w-16 text-right">
                  {criticalSlaThreshold} mins
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Orders with remaining time below this threshold automatically escalate to CRITICAL tier.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="text-slate-300 font-semibold block mb-1">
                Enterprise Client SLA Penalty Rate ($/hour):
              </label>
              <input
                type="number"
                defaultValue={1250}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* AI Autonomous Governance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Autonomous Governance Rules</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                AI Confidence Threshold for Autonomous Execution (%):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="60"
                  max="99"
                  value={aiConfidenceThreshold}
                  onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                  className="flex-1 accent-purple-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-purple-400 w-12 text-right">
                  {aiConfidenceThreshold}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Decisions with confidence below this require mandatory supervisor human-in-the-loop review.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApproveLowRisk}
                  onChange={(e) => setAutoApproveLowRisk(e.target.checked)}
                  className="rounded text-purple-600 bg-slate-950 border-slate-700"
                />
                <span className="text-slate-200 font-medium">
                  Auto-authorize low-risk inter-bin stock transfers (&lt;$200 value)
                </span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="rounded text-purple-600 bg-slate-950 border-slate-700"
                />
                <span className="text-slate-200 font-medium">
                  Audible alarms for Level 1 Critical exceptions
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Database & Simulation Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>State Management & Live Demonstration Controls</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <h4 className="font-bold text-slate-200">Reset Simulator State to Initial Seed</h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Restores orders, inventory bins, workers, and active exceptions back to the clean baseline demo state.
              </p>
            </div>

            <button
              onClick={() => {
                resetToDefaults();
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-200 hover:text-red-300 border border-slate-700 rounded-lg font-bold transition-colors shrink-0 flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Warehouse State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
