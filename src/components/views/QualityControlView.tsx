import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Barcode,
  Scale,
  Package,
  Layers,
  Truck,
  ArrowRight,
} from "lucide-react";

export const QualityControlView: React.FC = () => {
  const { orders, submitQualityCheck, setSelectedOrderId } = useWarehouse();

  const [selectedOrderIdLocal, setSelectedOrderIdLocal] = useState<string>("ORD-1048");
  const [failModalOpen, setFailModalOpen] = useState<boolean>(false);
  const [failReason, setFailReason] = useState<string>("Barcode / Serial number mismatch");
  const [qcNotes, setQcNotes] = useState<string>("");

  const [checklist, setChecklist] = useState({
    skuMatch: true,
    qtyMatch: true,
    damageFree: true,
    packagingIntact: true,
    weightTolerant: true,
  });

  const qcOrders = orders.filter(
    (o) => o.status === "PENDING_QC" || o.status === "PACKED" || o.status === "CREATED"
  );
  const activeOrder = orders.find((o) => o.id === selectedOrderIdLocal) || qcOrders[0] || orders[0];

  const handlePass = () => {
    submitQualityCheck(activeOrder.id, true);
  };

  const handleFail = () => {
    submitQualityCheck(activeOrder.id, false, `${failReason}: ${qcNotes || "Failed station check"}`);
    setFailModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">5-Point Quality Control Station</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Station QC-1 (Optical & Weight Rig)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-defect outbound assurance, item integrity inspection, and instant RMA quarantine routing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5-Point Inspection Station */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">QC Verification Station</h3>
                  <p className="text-[11px] text-slate-400">Inspector: Elena Rostova (W-08)</p>
                </div>
              </div>

              <select
                value={selectedOrderIdLocal}
                onChange={(e) => setSelectedOrderIdLocal(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.customerName} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Inspection Target</span>
                <p className="font-mono font-bold text-sm text-indigo-400">{activeOrder.id}</p>
                <p className="text-[11px] text-slate-300">{activeOrder.customerName}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Carrier</span>
                <p className="font-bold text-slate-200">{activeOrder.carrier}</p>
                <span className="text-[10px] text-red-400 font-mono">
                  {activeOrder.minutesRemaining}m to cutoff
                </span>
              </div>
            </div>

            {/* 5-Point Interactive Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mandatory 5-Point Outbound Verification:
              </span>

              <div className="space-y-2">
                {[
                  {
                    key: "skuMatch",
                    title: "1. SKU Barcode & Optical Serial Match",
                    desc: "Optical scanner confirms physical item matches invoice SKU exactly.",
                  },
                  {
                    key: "qtyMatch",
                    title: "2. Exact Unit Count Matching",
                    desc: "Physical unit count matches requested quantity with 0 deficit.",
                  },
                  {
                    key: "damageFree",
                    title: "3. Cosmetic & Functional Damage Check",
                    desc: "No dented casings, cracked seals, or moisture indicators.",
                  },
                  {
                    key: "packagingIntact",
                    title: "4. Protective Cushioning & Void Fill",
                    desc: "Antistatic bubble wrap and fragile safety seals applied.",
                  },
                  {
                    key: "weightTolerant",
                    title: "5. Scale Weight Tolerance (<2% Deviation)",
                    desc: "Measured weight aligns with calculated manifest mass.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-3 cursor-pointer hover:border-slate-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={(checklist as any)[item.key]}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <div>
                      <p className="font-bold text-slate-200">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setFailModalOpen(true)}
                className="flex-1 py-2.5 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Fail Quality Check & Quarantine</span>
              </button>

              <button
                onClick={handlePass}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pass QC & Authorize Dispatch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Inspection Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center justify-between">
              <span>QC Inspection Queue</span>
              <span className="text-slate-400">{qcOrders.length} Orders</span>
            </h3>

            <div className="space-y-2">
              {qcOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderIdLocal(o.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    o.id === activeOrder.id
                      ? "bg-emerald-950/40 border-emerald-500/50"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-400">{o.id}</span>
                    <span className="font-semibold text-slate-200">{o.customerName}</span>
                    <span className="text-red-400 font-mono font-bold text-[11px]">
                      {o.minutesRemaining}m
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{o.items.length} SKUs • {o.totalUnits} Units</span>
                    <span className="text-emerald-300 font-semibold">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QC Failure Modal */}
      {failModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl text-slate-100 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-red-400 flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5" />
                <span>Log Quality Control Failure</span>
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-semibold block">Primary Defect Category:</label>
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
              >
                <option value="Barcode / Serial number mismatch">Barcode / Serial number mismatch</option>
                <option value="Physical unit count deficit">Physical unit count deficit</option>
                <option value="Cosmetic damage / cracked housing">Cosmetic damage / cracked housing</option>
                <option value="Packaging seal compromised">Packaging seal compromised</option>
                <option value="Weight tolerance exceeded">Weight tolerance exceeded</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Inspector Notes:</label>
              <textarea
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="Describe exact defect location or issue..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setFailModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFail}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold"
              >
                Submit Defect & Quarantine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
