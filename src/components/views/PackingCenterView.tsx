import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Box,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Barcode,
  Truck,
  Printer,
  ShieldCheck,
  Package,
} from "lucide-react";

export const PackingCenterView: React.FC = () => {
  const { orders, completePacking, setSelectedOrderId } = useWarehouse();

  const [selectedOrderIdLocal, setSelectedOrderIdLocal] = useState<string>("ORD-1048");
  const [selectedBox, setSelectedBox] = useState<string>("BOX-M");
  const [weightKg, setWeightKg] = useState<number>(4.2);
  const [packedSuccess, setPackedSuccess] = useState<boolean>(false);

  const packingOrders = orders.filter(
    (o) => o.status === "PICKED" || o.status === "PACKING" || o.status === "CREATED"
  );
  const activeOrder = orders.find((o) => o.id === selectedOrderIdLocal) || packingOrders[0] || orders[0];

  const handleFinishPacking = () => {
    completePacking(activeOrder.id, selectedBox);
    setPackedSuccess(true);
    setTimeout(() => setPackedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Packing Center & Station Staging</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Station Bay 2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Volumetric cartonization, protective packing verification, and automatic shipping manifest generation.
          </p>
        </div>
      </div>

      {packedSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Order #{activeOrder.id} successfully packed in {selectedBox} and routed to 5-Point QC Station!
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Packing Workbench */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Packing Workbench</h3>
                  <p className="text-[11px] text-slate-400">Packer: Marcus Vance (W-11)</p>
                </div>
              </div>

              {/* Order selector */}
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

            {/* Order Items Verification Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Item Verification & Carton Content:
              </span>
              <div className="space-y-1.5">
                {activeOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-100">{item.productName}</p>
                        <p className="text-[10px] font-mono text-slate-400">
                          SKU: {item.sku} • Bin: {item.location}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-200">
                      {item.quantityAllocated || item.quantityRequested} units
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Box Size Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>AI Volumetric Cartonization Recommendation:</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Recommended: BOX-M
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "BOX-S", label: "BOX-S", desc: "Up to 2kg (Small)", rec: false },
                  { id: "BOX-M", label: "BOX-M", desc: "Up to 5kg (Standard)", rec: true },
                  { id: "BOX-L", label: "BOX-L", desc: "Up to 15kg (Large)", rec: false },
                  { id: "BOX-XL", label: "BOX-XL", desc: "Heavy Freight", rec: false },
                ].map((box) => (
                  <button
                    key={box.id}
                    onClick={() => setSelectedBox(box.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedBox === box.id
                        ? "bg-blue-600 text-white border-blue-400 shadow-sm"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold font-mono">{box.label}</span>
                      {box.rec && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                          AI PICK
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{box.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Weight Check */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">Conveyor Scale Reading:</span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-100"
                />
                <span className="text-slate-400 font-bold">kg</span>
                <span className="text-emerald-400 text-[10px] font-bold">(In Tolerance)</span>
              </div>
            </div>

            {/* Complete Packing Button */}
            <button
              onClick={handleFinishPacking}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Seal Carton & Dispatch to Quality Control Inspection</span>
            </button>
          </div>
        </div>

        {/* Right: Packing Queue Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center justify-between">
              <span>Orders in Packing Queue</span>
              <span className="text-slate-400">{packingOrders.length} Pending</span>
            </h3>

            <div className="space-y-2">
              {packingOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderIdLocal(o.id)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    o.id === activeOrder.id
                      ? "bg-blue-950/40 border-blue-500/50"
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
                    <span className="text-blue-300 font-semibold">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
