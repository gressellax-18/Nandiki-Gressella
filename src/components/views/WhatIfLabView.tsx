import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  FlaskConical,
  Sparkles,
  Users,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { WhatIfScenarioResult } from "../../types";

export const WhatIfLabView: React.FC = () => {
  const { runWhatIfSimulation, approveRecommendation } = useWarehouse();

  const [activeScenario, setActiveScenario] = useState<string>("WORKER_LOSS");
  const [simulationResult, setSimulationResult] = useState<WhatIfScenarioResult>(
    runWhatIfSimulation("WORKER_LOSS")
  );
  const [appliedProtocol, setAppliedProtocol] = useState<boolean>(false);

  const handleSelectScenario = (type: string) => {
    setActiveScenario(type);
    setSimulationResult(runWhatIfSimulation(type));
    setAppliedProtocol(false);
  };

  const handleApplyProtocol = () => {
    approveRecommendation("REC-802");
    setAppliedProtocol(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Warehouse What-If Simulation Lab</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Predictive Digital Twin Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate future operational disruptions, stress-test capacity limits, and generate automated contingency playbooks.
          </p>
        </div>
      </div>

      {appliedProtocol && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            AI Contingency Protocol Activated: Dynamic workforce reassignments and expedited routing applied.
          </span>
        </div>
      )}

      {/* Scenario Presets Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            id: "WORKER_LOSS",
            title: "Loss of 2 Pickers",
            desc: "Simulate absenteeism during peak hour",
            icon: Users,
          },
          {
            id: "DEMAND_SURGE",
            title: "+200% SKU Demand Surge",
            desc: "Flash surge for SKU WH-1042 sensors",
            icon: TrendingUp,
          },
          {
            id: "ZONE_OUTAGE",
            title: "Zone B Conveyor Stoppage",
            desc: "Mechanical belt sensor failure",
            icon: AlertTriangle,
          },
          {
            id: "URGENT_WAVE",
            title: "10-Order Urgent Ingestion",
            desc: "Simultaneous <60m deadlines",
            icon: Flame,
          },
        ].map((s) => {
          const Icon = s.icon;
          const isSelected = activeScenario === s.id;
          return (
            <div
              key={s.id}
              onClick={() => handleSelectScenario(s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                isSelected
                  ? "bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-100">{s.title}</h4>
              </div>
              <p className="text-slate-400 text-[11px]">{s.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Simulation Results Comparison Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300">
              SIMULATION FORECAST
            </span>
            <h2 className="text-base font-bold text-slate-100">{simulationResult.scenarioName}</h2>
          </div>
          <p className="text-slate-400 mt-1">{simulationResult.description}</p>
        </div>

        {/* Before vs After Metric Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Baseline Normal Operation */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Baseline Metrics (Pre-Disruption)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Orders At SLA Risk:</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {simulationResult.before.ordersAtRisk} orders
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Avg Pick Time:</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {simulationResult.before.avgPickTimeMinutes} mins
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">SLA Breach Risk:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {simulationResult.before.slaBreachPercentage}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Backlog Queue:</span>
                <span className="text-base font-bold text-slate-200 font-mono">
                  {simulationResult.before.activeBacklogTasks} tasks
                </span>
              </div>
            </div>
          </div>

          {/* Projected Disrupted State */}
          <div className="p-4 bg-red-950/20 rounded-xl border border-red-500/40 space-y-3">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
              Projected Post-Disruption Telemetry
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-red-900/40">
                <span className="text-slate-500 block text-[10px]">Orders At SLA Risk:</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  {simulationResult.after.ordersAtRisk} orders (+125%)
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-red-900/40">
                <span className="text-slate-500 block text-[10px]">Avg Pick Time:</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  {simulationResult.after.avgPickTimeMinutes} mins (+74%)
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-red-900/40">
                <span className="text-slate-500 block text-[10px]">SLA Breach Risk:</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  {simulationResult.after.slaBreachPercentage}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/90 rounded-lg border border-red-900/40">
                <span className="text-slate-500 block text-[10px]">Backlog Queue:</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  {simulationResult.after.activeBacklogTasks} tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Contingency Plan */}
        <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-3">
          <div className="flex items-center space-x-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm">AI Autonomous Contingency Mitigation Plan</span>
          </div>

          <p className="text-slate-300 font-medium">
            <strong>Impact Diagnostics:</strong> {simulationResult.impactSummary}
          </p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Recommended Protocol Actions:
            </span>
            <ul className="space-y-1 text-slate-200">
              {simulationResult.aiContingencyPlan.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleApplyProtocol}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Deploy Autonomous Contingency Protocol</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
