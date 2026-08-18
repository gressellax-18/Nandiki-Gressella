import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  ClipboardList,
  Search,
  Filter,
  Flame,
  Clock,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  Package,
  Layers,
  Crosshair,
  Box,
  ShieldCheck,
  Truck,
  Plus,
  RefreshCw,
} from "lucide-react";
import { OrderStatus } from "../../types";

export const OrdersView: React.FC = () => {
  const { orders, setSelectedOrderId, triggerDemoSimulation } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "deadline" | "date">("priority");

  // Filter orders
  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some((i) => i.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "RISK"
          ? order.slaRisk === "CRITICAL" || order.slaRisk === "HIGH"
          : order.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ? true : order.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        return b.priorityScore - a.priorityScore;
      }
      if (sortBy === "deadline") {
        return a.minutesRemaining - b.minutesRemaining;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Order Fulfillment Control</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {filteredOrders.length} Orders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic priority scoring, SLA risk monitoring, and automated pick routing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerDemoSimulation("SIMULATE_URGENT_ORDER")}
            className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>+ Simulate Urgent Order Wave</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID (ORD-1048), Client, SKU (WH-1042), Carrier..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sorter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg py-1.5 px-3 text-xs text-slate-200 focus:outline-none"
            >
              <option value="priority">Priority Score (Highest First)</option>
              <option value="deadline">Deadline Remaining (Urgent First)</option>
              <option value="date">Order Creation Date</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Status:</span>
          {[
            { id: "ALL", label: "All Orders" },
            { id: "RISK", label: "🔥 SLA At Risk" },
            { id: "CREATED", label: "Created" },
            { id: "ALLOCATED", label: "Allocated" },
            { id: "PICKING", label: "Picking" },
            { id: "PACKING", label: "Packing" },
            { id: "PENDING_QC", label: "QC Check" },
            { id: "READY_FOR_DISPATCH", label: "Ready to Dispatch" },
            { id: "DISPATCHED", label: "Dispatched" },
            { id: "ON_HOLD", label: "On Hold" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === pill.id
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Client & SLA Tier</th>
                <th className="py-3 px-4 font-semibold text-center">Priority Score</th>
                <th className="py-3 px-4 font-semibold">Fulfillment Stage</th>
                <th className="py-3 px-4 font-semibold">Items & SKUs</th>
                <th className="py-3 px-4 font-semibold">Deadline Remaining</th>
                <th className="py-3 px-4 font-semibold">Carrier</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((order) => {
                const isCritical = order.priority === "CRITICAL" || order.slaRisk === "CRITICAL";
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`hover:bg-indigo-950/20 transition-colors cursor-pointer group ${
                      isCritical ? "bg-red-950/10" : ""
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">
                      <div className="flex items-center space-x-1.5">
                        {isCritical && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                        <span>{order.id}</span>
                      </div>
                    </td>

                    {/* Client & Region */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-100">{order.customerName}</span>
                        {order.vipTier === "VIP_DIAMOND" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center space-x-1 shrink-0">
                            <span>💎 VIP Diamond</span>
                          </span>
                        )}
                        {order.vipTier === "FLIPKART_SUPER_ELITE" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center space-x-1 shrink-0">
                            <span>👑 Flipkart SuperElite</span>
                          </span>
                        )}
                        {order.vipTier === "VIP_PLATINUM" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center space-x-1 shrink-0">
                            <span>⭐ VIP Platinum</span>
                          </span>
                        )}
                        {order.vipTier === "TATKAL_PRIME" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-flex items-center space-x-1 shrink-0">
                            <span>⚡ Tatkal Prime</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>{order.customerRegion}</span>
                        {order.orderValueINR && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-semibold font-mono">
                              ₹{order.orderValueINR.toLocaleString("en-IN")}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Dynamic Priority Score */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold font-mono text-xs ${
                            order.priority === "CRITICAL"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : order.priority === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {order.priorityScore}/100
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">
                        {order.priority}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${
                          order.status === "DISPATCHED"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : order.status === "PICKING"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : order.status === "PENDING_QC"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : order.status === "ON_HOLD"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {order.items.length} SKUs • {order.totalUnits} Units
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-[150px]">
                        {order.items.map((i) => i.sku).join(", ")}
                      </div>
                    </td>

                    {/* Countdown */}
                    <td className="py-3.5 px-4 font-mono">
                      <div
                        className={`flex items-center space-x-1 font-bold ${
                          order.minutesRemaining <= 60
                            ? "text-red-400"
                            : order.minutesRemaining <= 180
                            ? "text-amber-400"
                            : "text-slate-300"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{order.minutesRemaining} mins</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Risk: {order.slaRisk}
                      </div>
                    </td>

                    {/* Carrier */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {order.carrier}
                    </td>

                    {/* Drill-down action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(order.id);
                        }}
                        className="px-2.5 py-1 bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white rounded-lg font-semibold transition-all inline-flex items-center space-x-1 text-xs"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
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
