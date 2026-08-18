import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Truck,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  Barcode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Package,
} from "lucide-react";

export const DispatchCenterView: React.FC = () => {
  const { orders, dispatchOrder, setSelectedOrderId } = useWarehouse();

  const [selectedCarrier, setSelectedCarrier] = useState<string>("ALL");
  const [manifestPrinted, setManifestPrinted] = useState<boolean>(false);

  const readyOrders = orders.filter(
    (o) =>
      o.status === "READY_FOR_DISPATCH" ||
      o.status === "QC_PASSED" ||
      o.status === "DISPATCHED"
  );

  const filteredOrders = readyOrders.filter((o) =>
    selectedCarrier === "ALL" ? true : o.carrier === selectedCarrier
  );

  const handlePrintManifest = () => {
    setManifestPrinted(true);
    setTimeout(() => setManifestPrinted(false), 4000);
  };

  const handleBatchDispatch = () => {
    readyOrders
      .filter((o) => o.status !== "DISPATCHED")
      .forEach((o) => dispatchOrder(o.id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Outbound Dispatch & Carrier Control</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              4 Active Carrier Docks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Carrier cut-off management, automated shipping manifests, barcode verification, and SLA tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrintManifest}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Master Manifest</span>
          </button>
          <button
            onClick={handleBatchDispatch}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Batch Dispatch Handover</span>
          </button>
        </div>
      </div>

      {manifestPrinted && (
        <div className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-xl text-xs text-purple-200 font-semibold flex items-center space-x-2 animate-in fade-in">
          <Printer className="w-4 h-4 text-purple-400" />
          <span>
            Outbound Master EDI Manifest generated and transmitted to SwiftShip & BlueDart dispatch APIs.
          </span>
        </div>
      )}

      {/* Carrier Dock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { name: "SwiftShip Express", cutoff: "14:00 (3h left)", packages: 12, onTime: "99.2%", color: "border-indigo-500/40" },
          { name: "BlueDart Priority", cutoff: "15:30 (4.5h left)", packages: 8, onTime: "98.5%", color: "border-blue-500/40" },
          { name: "QuickX Logistics", cutoff: "17:00 (6h left)", packages: 5, onTime: "97.8%", color: "border-purple-500/40" },
          { name: "ParcelPro Ground", cutoff: "18:00 (7h left)", packages: 14, onTime: "99.0%", color: "border-emerald-500/40" },
        ].map((c) => (
          <div
            key={c.name}
            onClick={() => setSelectedCarrier(c.name.split(" ")[0])}
            className={`p-4 bg-slate-900 border rounded-2xl hover:border-slate-700 transition-all cursor-pointer text-xs space-y-2 ${c.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100">{c.name}</span>
              <Truck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Cut-off:</span>
              <span className="text-red-400 font-bold">{c.cutoff}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800 text-[11px]">
              <span>{c.packages} Parcels Staged</span>
              <span className="text-emerald-400 font-bold">{c.onTime} SLA</span>
            </div>
          </div>
        ))}
      </div>

      {/* Staged Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm text-xs">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 flex items-center space-x-2">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>Staged Consignments Awaiting Carrier Handover</span>
          </h3>
          <span className="text-slate-400">{filteredOrders.length} Consignments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Recipient</th>
                <th className="py-3 px-4 font-semibold">Carrier & Tracking</th>
                <th className="py-3 px-4 font-semibold text-center">Weight</th>
                <th className="py-3 px-4 font-semibold">Dispatch Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                    {o.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{o.customerName}</div>
                    <div className="text-[11px] text-slate-400">{o.customerRegion}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="font-bold text-slate-200">{o.carrier}</div>
                    <div className="text-slate-500">{o.trackingNumber || "TRK-PENDING"}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-300">
                    {o.totalWeightKg} kg
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === "DISPATCHED"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-purple-500/20 text-purple-300"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {o.status !== "DISPATCHED" ? (
                      <button
                        onClick={() => dispatchOrder(o.id)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors"
                      >
                        Hand Over to Carrier
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold font-mono">✓ Dispatched</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
