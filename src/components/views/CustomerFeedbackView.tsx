import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  MessageSquare,
  Star,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Clock,
  User,
  MapPin,
  Send,
  Sliders,
  Award,
  Zap,
} from "lucide-react";
import { CustomerFeedback } from "../../types";

export const CustomerFeedbackView: React.FC = () => {
  const {
    customerFeedbacks,
    submitCustomerFeedback,
    rebalanceWorkers,
    workers,
    zones,
    orders,
    setSelectedOrderId,
    setCurrentView,
  } = useWarehouse();

  // Feedback form state
  const [selectedOrderId, setFormOrderId] = useState<string>("ORD-1048");
  const [customerName, setCustomerName] = useState<string>("Dr. Arvind Swaminathan");
  const [customerRegion, setCustomerRegion] = useState<string>("Whitefield, Bengaluru");
  const [rating, setRating] = useState<number>(3);
  const [wasOnTime, setWasOnTime] = useState<boolean>(false);
  const [packageCondition, setPackageCondition] = useState<CustomerFeedback["packageCondition"]>("PERFECT");
  const [deliveryExperience, setDeliveryExperience] = useState<CustomerFeedback["deliveryExperience"]>("AVERAGE");
  const [complaintCategory, setComplaintCategory] = useState<CustomerFeedback["complaintCategory"]>("LATE_DELIVERY");
  const [comment, setComment] = useState<string>(
    "Delivery took 22 mins longer than the VIP Tatkal commitment. Product inside was safe and authentic."
  );
  const [submittedBanner, setSubmittedBanner] = useState<boolean>(false);

  // Stats calculation
  const totalCount = customerFeedbacks.length;
  const avgRating = (
    customerFeedbacks.reduce((acc, f) => acc + f.rating, 0) / (totalCount || 1)
  ).toFixed(1);
  const onTimePercent = Math.round(
    (customerFeedbacks.filter((f) => f.wasOnTime).length / (totalCount || 1)) * 100
  );
  const perfectPackagingPercent = Math.round(
    (customerFeedbacks.filter((f) => f.packageCondition === "PERFECT").length /
      (totalCount || 1)) *
      100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCustomerFeedback({
      orderId: selectedOrderId,
      customerName,
      customerRegion,
      rating,
      wasOnTime,
      packageCondition,
      deliveryExperience,
      complaintCategory,
      comment,
      originZone: "Zone B",
      originPickerId: "W-17",
      originPackerId: "W-11",
      carrier: "Ekart Tatkal Express",
      linkedRootCause:
        complaintCategory === "LATE_DELIVERY"
          ? "Zone B picking congestion during Tatkal surge."
          : "Standard fulfillment trajectory.",
      operationalRecommendation:
        complaintCategory === "LATE_DELIVERY"
          ? "Rebalance 2 cross-trained pickers to Zone B."
          : "Maintain current QC gate protocols.",
    });

    setSubmittedBanner(true);
    setTimeout(() => setSubmittedBanner(false), 5000);
  };

  const handleExecuteClosedLoopRebalance = () => {
    // Rebalance 2 workers from Zone A and C to Zone B to clear bottleneck
    rebalanceWorkers("Zone A & C", "Zone B", ["W-18", "W-23"]);
  };

  return (
    <div className="space-y-6" id="customer-feedback-view">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Closed-Loop Feedback & Traceability
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    ROOT CAUSE ENGINE ACTIVE
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Connect customer delivery ratings directly to origin pickers, packers, and warehouse zone bottlenecks
                </p>
              </div>
            </div>
          </div>

          {/* Aggregate KPI Chips */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                CSAT Rating
              </span>
              <span className="text-lg font-bold text-amber-400 font-mono flex items-center justify-center gap-1">
                {avgRating} <Star className="w-3.5 h-3.5 fill-amber-400" />
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                On-Time Rate
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {onTimePercent}%
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                Packaging Pass
              </span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {perfectPackagingPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Closed-Loop AI Root Cause Insight Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-purple-500/20 text-purple-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                AI Closed-Loop Operational Diagnostic
              </h2>
            </div>
            <p className="text-sm text-purple-100 font-medium leading-relaxed">
              <span className="font-bold text-amber-300">68% of recent customer delivery delays</span>{" "}
              originated from <span className="font-bold text-white underline decoration-purple-400">Zone B picking congestion</span>{" "}
              during the 14:00 Tatkal surge (Average pick latency was 6.8 min vs 3.2 min baseline).
            </p>
            <p className="text-xs text-slate-400">
              Closed Loop Recommendation: Shifting 2 cross-trained workers to Zone B immediately restores SLA compliance from 78% to 94%.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleExecuteClosedLoopRebalance}
              className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Rebalance 2 Workers to Zone B
            </button>
            <button
              onClick={() => setCurrentView("analytics")}
              className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            >
              View Latency Deep-Dive
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Feedback Ingest Form + Feed of Feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Feedback Ingestion Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Customer Feedback Portal (Mock/Live)
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">End-User App</span>
            </div>

            {submittedBanner && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Feedback recorded! Linked root cause analysis attached to fulfillment record.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Target Customer Order
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setFormOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} • {o.customerName} ({o.customerArea})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Region / Pin
                  </label>
                  <input
                    type="text"
                    value={customerRegion}
                    onChange={(e) => setCustomerRegion(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Overall Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        rating >= star
                          ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-600"
                      }`}
                    >
                      <Star className={`w-5 h-5 ${rating >= star ? "fill-amber-400" : ""}`} />
                    </button>
                  ))}
                  <span className="ml-2 font-mono font-bold text-slate-300">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* On Time & Packaging */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Delivered On Time?
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWasOnTime(true)}
                      className={`flex-1 py-1.5 rounded-lg font-medium border text-[11px] ${
                        wasOnTime
                          ? "bg-emerald-600 text-white border-emerald-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      Yes (On-Time)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWasOnTime(false)}
                      className={`flex-1 py-1.5 rounded-lg font-medium border text-[11px] ${
                        !wasOnTime
                          ? "bg-rose-600 text-white border-rose-500"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      No (Delayed)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    Package Condition
                  </label>
                  <select
                    value={packageCondition}
                    onChange={(e) =>
                      setPackageCondition(e.target.value as CustomerFeedback["packageCondition"])
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="PERFECT">✨ Perfect / Intact</option>
                    <option value="SLIGHT_WEAR">📦 Slight Wear</option>
                    <option value="DAMAGED_BOX">⚠️ Damaged Outer Box</option>
                    <option value="BROKEN_SEAL">🚨 Broken Seal</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Primary Feedback Category
                </label>
                <select
                  value={complaintCategory}
                  onChange={(e) =>
                    setComplaintCategory(e.target.value as CustomerFeedback["complaintCategory"])
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="NONE">✅ No Complaint (Compliment)</option>
                  <option value="LATE_DELIVERY">⏱️ Late Delivery SLA Breach</option>
                  <option value="DAMAGED_BOX">📦 Damaged / Crushed Box</option>
                  <option value="WRONG_ITEM">❌ Wrong Item In Package</option>
                  <option value="COURTESY">🛵 Delivery Agent Behavior</option>
                  <option value="MISSING_ITEM">🔍 Missing Component Inside</option>
                </select>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                  Customer Review Comment
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                Ingest Feedback & Trigger Traceability Loop
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Ingested Feedbacks with Lineage (Picker, Packer, Zone, Carrier) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Traceable Customer Reviews & Operational Lineage
                </h3>
                <p className="text-[11px] text-slate-500">
                  Every star rating is reverse-mapped to warehouse floor metadata
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {customerFeedbacks.length} Feedbacks
              </span>
            </div>

            <div className="space-y-3.5 max-h-[640px] overflow-y-auto custom-scrollbar pr-1">
              {customerFeedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">
                          {fb.orderId}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {fb.id}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            fb.wasOnTime
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {fb.wasOnTime ? "ON-TIME" : "DELAYED"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 mt-1">
                        {fb.customerName}{" "}
                        <span className="text-[11px] font-normal text-slate-400">
                          ({fb.customerRegion})
                        </span>
                      </p>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center gap-1 text-amber-400 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < fb.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 italic">
                    "{fb.comment}"
                  </p>

                  {/* Floor Lineage Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Origin Zone</span>
                      <span className="text-indigo-400 font-bold">{fb.originZone}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Picker</span>
                      <span className="text-slate-200 font-bold">{fb.originPickerId}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Packer</span>
                      <span className="text-slate-200 font-bold">{fb.originPackerId}</span>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block">Carrier</span>
                      <span className="text-amber-400 font-bold truncate">{fb.carrier}</span>
                    </div>
                  </div>

                  {/* Closed Loop Root Cause Analysis Box */}
                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] space-y-1">
                    <p className="text-indigo-200 font-medium">
                      <span className="font-bold text-indigo-400">Linked Diagnostic:</span>{" "}
                      {fb.linkedRootCause}
                    </p>
                    <p className="text-emerald-300 font-semibold">
                      <span className="font-bold text-emerald-400">Closed-Loop Fix:</span>{" "}
                      {fb.operationalRecommendation}
                    </p>
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
