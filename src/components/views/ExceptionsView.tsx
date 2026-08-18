import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Layers,
  MapPin,
  Clock,
  User,
  Filter,
} from "lucide-react";
import { OperationalException } from "../../types";

export const ExceptionsView: React.FC = () => {
  const { exceptions, resolveException, setSelectedOrderId, setCurrentView } = useWarehouse();

  const [selectedException, setSelectedException] = useState<OperationalException | null>(
    exceptions.find((e) => e.status !== "RESOLVED") || exceptions[0] || null
  );
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredExceptions = exceptions.filter((e) => {
    if (filterType === "ALL") return true;
    if (filterType === "OPEN") return e.status !== "RESOLVED";
    return e.type === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Operational Exceptions & AI Recovery</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              {exceptions.filter((e) => e.status !== "RESOLVED").length} Open Incident Cases
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Root cause analysis, automated inventory substitution, and supervisor resolution workflows.
          </p>
        </div>
      </div>

      {/* 2-Column Grid: Exception Incident Feed (Left) vs Deep AI Resolution Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Exception Cases List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {["ALL", "OPEN", "MISSING_ITEM", "DAMAGED_ITEM", "QC_FAILED"].map((pill) => (
              <button
                key={pill}
                onClick={() => setFilterType(pill)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filterType === pill
                    ? "bg-red-600 text-white font-semibold shadow-sm"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {pill.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {filteredExceptions.map((ex) => {
              const isSelected = selectedException?.id === ex.id;
              const isResolved = ex.status === "RESOLVED";

              return (
                <div
                  key={ex.id}
                  onClick={() => setSelectedException(ex)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? "bg-slate-900 border-red-500 shadow-md ring-1 ring-red-500/30"
                      : isResolved
                      ? "bg-slate-900/60 border-slate-800 opacity-75"
                      : "bg-slate-900 border-red-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-red-400">{ex.id}</span>
                      <span className="font-semibold text-slate-200">
                        {ex.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isResolved
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300 animate-pulse"
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  <p className="text-slate-300 line-clamp-2">{ex.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>Order: <strong className="text-indigo-400 font-mono">#{ex.orderId}</strong></span>
                    <span>Reported by {ex.reportedRole}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Exception Deep Dive & AI Decision Rationale */}
        <div className="lg:col-span-7 space-y-4">
          {selectedException ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-red-400 text-sm">
                      {selectedException.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300">
                      Severity: {selectedException.severity}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-base mt-1">
                    {selectedException.type.replace(/_/g, " ")} on #{selectedException.orderId}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedOrderId(selectedException.orderId);
                    setCurrentView("orders");
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg font-semibold transition-colors flex items-center space-x-1"
                >
                  <span>Inspect Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Incident Log</span>
                <p className="text-slate-200 text-sm">{selectedException.description}</p>
                {selectedException.location && (
                  <p className="text-[11px] text-amber-300 font-mono mt-1">
                    Physical Location: Bay {selectedException.location} (Zone {selectedException.zone})
                  </p>
                )}
              </div>

              {/* AI Autonomous Resolution Engine Analysis */}
              <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-purple-300 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">AI Autonomous Recovery Analysis</span>
                </div>

                <div className="space-y-2 text-slate-200">
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Root Cause Diagnostics:
                    </span>
                    <p className="mt-0.5">{selectedException.aiAnalysis.rootCause}</p>
                  </div>

                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800">
                    <span className="text-emerald-400 block text-[10px] uppercase font-bold">
                      Recommended Remediation Action:
                    </span>
                    <p className="mt-0.5 text-emerald-300 font-semibold">
                      {selectedException.aiAnalysis.recommendedAction}
                    </p>
                  </div>

                  {selectedException.aiAnalysis.alternativeLocation && (
                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                      <span>
                        Alternative Stock: Bin{" "}
                        <strong className="text-amber-300 font-mono">
                          {selectedException.aiAnalysis.alternativeLocation}
                        </strong>{" "}
                        (Zone {selectedException.aiAnalysis.alternativeZone})
                      </span>
                      <span className="font-bold text-emerald-400">
                        {selectedException.aiAnalysis.alternativeQtyAvailable} units available
                      </span>
                    </div>
                  )}

                  <div className="text-[11px] text-purple-200 font-medium">
                    ⚡ <strong>Projected Outcome:</strong> {selectedException.aiAnalysis.projectedImpact}
                  </div>
                </div>
              </div>

              {/* Resolution Action Button */}
              {selectedException.status !== "RESOLVED" ? (
                <div className="pt-2">
                  <button
                    onClick={() =>
                      resolveException(
                        selectedException.id,
                        selectedException.aiAnalysis.recommendedAction
                      )
                    }
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize AI Recovery & Mark Exception Resolved</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-center font-bold flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Exception Resolved ({selectedException.resolution?.resolvedAt?.split("T")[0]})
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-500">
              Select an exception incident to inspect AI diagnostics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
