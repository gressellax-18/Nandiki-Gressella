import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Users,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Activity,
  Award,
  Zap,
  Clock,
} from "lucide-react";

export const WorkforceView: React.FC = () => {
  const { workers, rebalanceWorkers, approveRecommendation } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [rebalancedSuccess, setRebalancedSuccess] = useState(false);

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.currentZone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" ? true : w.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const overloadedCount = workers.filter((w) => w.currentWorkloadPercent > 80).length;
  const underutilizedCount = workers.filter((w) => w.currentWorkloadPercent < 45 && w.status === "IDLE").length;

  const handleExecuteRebalance = () => {
    approveRecommendation("REC-802");
    setRebalancedSuccess(true);
    setTimeout(() => setRebalancedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Workforce Intelligence & Load Balancing</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {workers.length} On-Duty Personnel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time worker load monitoring, pick-rate metrics, dynamic zone staffing, and burnout prevention.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExecuteRebalance}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Apply AI Workforce Rebalance (REC-802)</span>
          </button>
        </div>
      </div>

      {rebalancedSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Workforce Optimization Applied: 2 pickers shifted to Zone B. Average pick latency reduced by 41%!
            </span>
          </div>
        </div>
      )}

      {/* AI Imbalance Callout Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              Workload Variance Detected (92% vs 38%)
            </h3>
            <p className="text-slate-400 mt-0.5">
              Picker <strong>Arjun (W-01)</strong> in Zone B has 12 queued tasks, while <strong>Priya (W-03)</strong> in Zone E has only 3 tasks.
            </p>
          </div>
        </div>

        <button
          onClick={handleExecuteRebalance}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-sm transition-colors shrink-0 flex items-center space-x-1.5"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Rebalance 4 Tasks from Aarav to Priya</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Worker Name (Aarav, Priya, Sneha), ID (W-01), City Hub, Specialization..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Role:</span>
          {["ALL", "Picker", "Packer", "QC Inspector", "Lead Supervisor", "Forklift Operator"].map(
            (role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  roleFilter === role
                    ? "bg-indigo-600 text-white font-semibold shadow-sm"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                {role}
              </button>
            )
          )}
        </div>
      </div>

      {/* Worker Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => {
          const isOverloaded = worker.currentWorkloadPercent >= 80;
          return (
            <div
              key={worker.id}
              className={`p-4 rounded-2xl border transition-all text-xs space-y-3.5 relative overflow-hidden ${
                isOverloaded
                  ? "bg-slate-900 border-amber-500/40 shadow-sm"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${worker.avatarColor} flex items-center justify-center text-white font-extrabold text-sm shadow-md ring-2 ring-slate-800`}
                  >
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-bold text-slate-100 text-sm">{worker.name}</h4>
                      {worker.experienceYears && worker.experienceYears >= 5 && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-semibold border border-amber-500/30">
                          VIP Staff
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {worker.id} • {worker.role} {worker.experienceYears ? `(${worker.experienceYears}y exp)` : ""}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    worker.status === "PICKING" || worker.status === "PACKING"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : worker.status === "AVAILABLE"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {worker.status}
                </span>
              </div>

              {/* Badges / Specialization */}
              <div className="space-y-1">
                {worker.specialization && (
                  <p className="text-[11px] text-indigo-300 font-medium truncate">
                    🎯 {worker.specialization}
                  </p>
                )}
                {worker.badges && worker.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {worker.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Current Workload:</span>
                  <span
                    className={`font-mono font-bold ${
                      isOverloaded ? "text-amber-400" : "text-emerald-400"
                    }`}
                  >
                    {worker.currentWorkloadPercent}% ({worker.tasksAssigned} active tasks)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverloaded ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${worker.currentWorkloadPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800 text-center text-[10px]">
                <div className="p-1.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-500 block">Zone:</span>
                  <span className="font-bold text-slate-200">Zone {worker.currentZone}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-500 block">Cycle:</span>
                  <span className="font-bold text-slate-200">{worker.avgPickTimeMinutes}m</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-500 block">Done Today:</span>
                  <span className="font-bold text-slate-200">{worker.tasksCompletedToday}</span>
                </div>
                <div className="p-1.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-500 block">Accuracy:</span>
                  <span className="font-bold text-emerald-400">{worker.accuracyRate}%</span>
                </div>
              </div>

              {/* Hub & Contact Footer */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="truncate max-w-[170px]">📍 {worker.cityHub || "Main FC"}</span>
                {worker.phone && <span className="font-mono text-slate-400">{worker.phone}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
