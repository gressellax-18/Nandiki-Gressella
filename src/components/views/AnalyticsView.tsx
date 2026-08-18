import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const AnalyticsView: React.FC = () => {
  const { metrics, orders, zones } = useWarehouse();
  const [timeRange, setTimeRange] = useState<"today" | "7days" | "30days">("today");

  // Chart data
  const volumeData = [
    { hour: "06:00", ingested: 12, dispatched: 10, backlog: 2 },
    { hour: "07:00", ingested: 18, dispatched: 14, backlog: 6 },
    { hour: "08:00", ingested: 25, dispatched: 20, backlog: 11 },
    { hour: "09:00", ingested: 32, dispatched: 26, backlog: 17 },
    { hour: "10:00", ingested: 28, dispatched: 29, backlog: 16 },
    { hour: "11:00", ingested: 22, dispatched: 24, backlog: 14 },
    { hour: "12:00", ingested: 19, dispatched: 20, backlog: 13 },
  ];

  const zoneLatencyData = zones.map((z) => ({
    name: `Zone ${z.id}`,
    pickTime: z.avgPickTimeMinutes,
    congestion: z.congestionScore,
  }));

  const priorityDistribution = [
    { name: "Critical (80-100)", count: orders.filter((o) => o.priority === "CRITICAL").length, color: "#ef4444" },
    { name: "High (65-79)", count: orders.filter((o) => o.priority === "HIGH").length, color: "#f59e0b" },
    { name: "Normal (35-64)", count: orders.filter((o) => o.priority === "NORMAL").length, color: "#6366f1" },
    { name: "Low (0-34)", count: orders.filter((o) => o.priority === "LOW").length, color: "#10b981" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Fulfillment Analytics & Operational Metrics</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live BI Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Throughput velocity, SLA compliance trajectory, picker productivity trends, and zone latency.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(["today", "7days", "30days"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range === "today" ? "Today (Shift A)" : range === "7days" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">On-Time SLA Rate</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-emerald-400">{metrics.dispatchSlaRate}%</span>
            <span className="text-[10px] text-emerald-400 font-mono">+1.2%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Target: &gt;98.0%</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Avg Pick-to-Pack Time</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100">{metrics.averageFulfillmentTimeMinutes}m</span>
            <span className="text-[10px] text-emerald-400 font-mono">-2.4m vs target</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Optimized by AI TSP Routing</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Picking Efficiency</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-indigo-400">{metrics.pickingEfficiencyScore}%</span>
            <span className="text-[10px] text-indigo-400 font-mono">High</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Travel distance reduced 33%</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-medium">Orders Completed</span>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100">{metrics.ordersDispatchedToday}</span>
            <span className="text-[10px] text-slate-400 font-mono">Today</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">98.8% First-Pass QC</p>
        </div>
      </div>

      {/* 2-Column Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Throughput Volume Curve */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Hourly Ingestion vs Dispatch Volume</span>
            </h3>
            <span className="text-xs text-slate-400">Parcels / Hour</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingestedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="dispatchedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" textAnchor="end" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="ingested" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#ingestedGrad)" name="Ingested Orders" />
                <Area type="monotone" dataKey="dispatched" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#dispatchedGrad)" name="Dispatched Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Flame className="w-4 h-4 text-red-400" />
            <span>Order Priority Tier Distribution</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-slate-300 text-[11px]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Latency Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Zone Average Pick Latency & Congestion Index</span>
          </h3>
          <span className="text-xs text-slate-400">Minutes per Task</span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneLatencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="pickTime" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Pick Time (mins)" />
              <Bar dataKey="congestion" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Congestion Index (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
