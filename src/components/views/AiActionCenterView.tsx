import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Activity,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  X,
  FileText,
} from "lucide-react";

export const AiActionCenterView: React.FC = () => {
  const { recommendations, approveRecommendation, rejectRecommendation } = useWarehouse();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");

  const filteredRecs = recommendations.filter((r) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  const pendingCount = recommendations.filter((r) => r.status === "PENDING_APPROVAL").length;

  const handleConfirmReject = () => {
    if (rejectModalId) {
      rejectRecommendation(rejectModalId, rejectReason || "Supervisor manual divergence");
      setRejectModalId(null);
      setRejectReason("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">AI Action Hub & Autonomous Governance</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {pendingCount} Pending Decisions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable AI decision engine with complete transparency, metric inputs, and supervisor override control.
          </p>
        </div>

        {/* Quick Bulk Approve if pending */}
        {pendingCount > 0 && (
          <button
            onClick={() => {
              recommendations
                .filter((r) => r.status === "PENDING_APPROVAL")
                .forEach((r) => approveRecommendation(r.id));
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Approve All Recommended Actions</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        {[
          { id: "ALL", label: `All Recommendations (${recommendations.length})` },
          { id: "PENDING_APPROVAL", label: `⚡ Pending Approval (${pendingCount})` },
          { id: "APPROVED", label: "✓ Approved" },
          { id: "REJECTED", label: "✕ Rejected" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              statusFilter === tab.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const isPending = rec.status === "PENDING_APPROVAL";
          const isApproved = rec.status === "APPROVED";
          const isRejected = rec.status === "REJECTED";

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all text-xs space-y-4 ${
                isApproved
                  ? "bg-slate-900/60 border-emerald-500/40"
                  : isRejected
                  ? "bg-slate-900/40 border-slate-800 opacity-60"
                  : "bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/20"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                      rec.urgency === "CRITICAL"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    {rec.urgency}
                  </span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{rec.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-semibold">{rec.category.replace(/_/g, " ")}</span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border self-start sm:self-auto ${
                    isApproved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : isRejected
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse"
                  }`}
                >
                  Status: {rec.status}
                </span>
              </div>

              {/* Title & Summary */}
              <div>
                <h3 className="text-base font-bold text-slate-100">{rec.title}</h3>
                <p className="text-slate-300 mt-1 leading-relaxed text-sm">{rec.summary}</p>
              </div>

              {/* AI Deep Explainability Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Telemetry Considered */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Decision Rationale & Data Points Considered:</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {rec.rationaleData.map((fact, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact & Penalty projection */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      ⚡ Projected Positive Impact:
                    </span>
                    <p className="text-slate-200 mt-1 font-semibold">{rec.expectedImpact}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                      ⚠️ Consequence If Action Ignored:
                    </span>
                    <p className="text-slate-400 mt-0.5 text-[11px]">
                      SLA breach penalties ($1,250+) and upstream pick backlog cascading to Shift B.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  Target Entities:{" "}
                  {rec.affectedEntities.map((e) => (
                    <span key={e.id} className="font-mono text-slate-300 font-semibold mr-2">
                      [{e.type}: {e.label}]
                    </span>
                  ))}
                </div>

                {isPending && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRejectModalId(rec.id)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-300 rounded-lg font-semibold transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Recommendation</span>
                    </button>
                    <button
                      onClick={() => approveRecommendation(rec.id)}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-md shadow-purple-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Authorize & Apply Decision</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Override Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl text-slate-100 text-xs space-y-4">
            <h3 className="font-bold text-sm text-red-400">
              Supervisor Manual Override / Rejection
            </h3>
            <p className="text-slate-400">
              Please document the operational rationale for diverging from the AI recommendation. This will be stored permanently in the audit trail.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. 'Customer Apex Robotics authorized 30m buffer'..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
