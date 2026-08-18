import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  FileText,
  Search,
  Filter,
  Download,
  ShieldCheck,
  Bot,
  User,
  Cpu,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actorFilter, setActorFilter] = useState<string>("ALL");
  const [copied, setCopied] = useState<boolean>(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor =
      actorFilter === "ALL" ? true : log.actor.toUpperCase().includes(actorFilter);

    return matchesSearch && matchesActor;
  });

  const handleExportJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `warenexus-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Enterprise Immutable Audit Log</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SHA-256 Ledger Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete traceability for autonomous AI decisions, supervisor overrides, and floor dispatch events.
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{copied ? "Exporting JSON..." : "Export Audit Trail (JSON)"}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by Keyword, Order ID (ORD-1048), SKU, or Worker..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Actor:</span>
          {["ALL", "AI", "SUPERVISOR", "PICKER", "SYSTEM"].map((actor) => (
            <button
              key={actor}
              onClick={() => setActorFilter(actor)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                actorFilter === actor
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {actor}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-slate-950">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Target Entity</th>
                <th className="py-3 px-4 font-semibold">Operational Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log) => {
                const isAi = log.actor.includes("AI") || log.actor.includes("NEXUS");
                const isSupervisor = log.actor.includes("Supervisor");

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {log.timestamp.split("T")[1]?.split(".")[0] || log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAi
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : isSupervisor
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {isAi ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{log.actor}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200 font-sans text-xs">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-bold text-xs">
                      {log.targetId}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs max-w-md">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
