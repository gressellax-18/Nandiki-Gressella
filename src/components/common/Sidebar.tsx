import React from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Scale,
  Crosshair,
  Box,
  CheckCircle2,
  Users,
  MapPin,
  AlertOctagon,
  Truck,
  TrendingUp,
  Sparkles,
  FlaskConical,
  ScrollText,
  Settings,
  ChevronRight,
  Shield,
  Layers,
  ArrowRightLeft,
  Navigation,
  MessageSquare,
  Activity,
} from "lucide-react";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { currentView, setCurrentView, userRole, exceptions, recommendations, metrics, customerFeedbacks } = useWarehouse();

  const openExceptions = exceptions.filter((e) => e.status !== "RESOLVED").length;
  const pendingRecs = recommendations.filter((r) => r.status === "PENDING_APPROVAL").length;
  const lateFeedbacks = customerFeedbacks.filter((f) => !f.wasOnTime).length;

  const handleSelectView = (id: string) => {
    setCurrentView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems = [
    {
      group: "Operations Core",
      items: [
        { id: "command-center", label: "Command Center", icon: LayoutDashboard, badge: null },
        { id: "orders", label: "Orders & VIP SLAs", icon: ClipboardList, badge: metrics.ordersAtRisk > 0 ? `${metrics.ordersAtRisk} Tatkal Risk` : null, badgeColor: "bg-red-500/20 text-red-300 border-red-500/30" },
        { id: "inventory", label: "Multi-State Stock", icon: Package, badge: metrics.lowStockItemsCount > 0 ? `${metrics.lowStockItemsCount} Low` : null, badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
        { id: "allocation", label: "Inventory Allocation", icon: Scale, badge: "Conflict Solver", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
      ],
    },
    {
      group: "Execution Floor",
      items: [
        { id: "picking", label: "Batch & Route Picking", icon: Crosshair, badge: `${metrics.ordersInPicking} Active` },
        { id: "packing", label: "Packing & Volumetrics", icon: Box, badge: `${metrics.ordersInPacking}` },
        { id: "qc", label: "5-Point Quality Gate", icon: CheckCircle2, badge: `${metrics.ordersInQC}` },
        { id: "dispatch", label: "Shipping Control Tower", icon: Truck, badge: `${metrics.ordersDispatchedToday} Done` },
      ],
    },
    {
      group: "Doorstep & Customer Loop",
      items: [
        { id: "tracking", label: "Doorstep & Transit Map", icon: Navigation, badge: "Live GPS", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
        { id: "feedback", label: "Feedback & Closed Loop", icon: MessageSquare, badge: lateFeedbacks > 0 ? "Root Cause" : "Loop Ready", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
      ],
    },
    {
      group: "Intelligence & Resources",
      items: [
        { id: "workforce", label: "Worker Command Center", icon: Users, badge: `${metrics.activeWorkersCount} On-Shift` },
        { id: "map", label: "Warehouse Digital Twin", icon: MapPin, badge: metrics.activeBottlenecksCount > 0 ? "Congestion" : "Live Heatmap", badgeColor: metrics.activeBottlenecksCount > 0 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
        { id: "exceptions", label: "Exceptions & Re-route", icon: AlertOctagon, badge: openExceptions > 0 ? `${openExceptions}` : null, badgeColor: "bg-red-500 text-white font-bold" },
        { id: "ai-actions", label: "AI Recommendations", icon: Sparkles, badge: pendingRecs > 0 ? `${pendingRecs} New` : null, badgeColor: "bg-purple-600 text-white font-bold" },
        { id: "what-if", label: "What-If Lab & Sim", icon: FlaskConical, badge: "Lab", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
        { id: "analytics", label: "Bottleneck Intelligence", icon: TrendingUp, badge: "Latencies" },
      ],
    },
    {
      group: "System & Governance",
      items: [
        { id: "audit-logs", label: "Audit & Decision Trail", icon: ScrollText, badge: null },
        { id: "settings", label: "System Settings", icon: Settings, badge: null },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } min-h-[calc(100vh-6rem)]`}
      >
        {/* Scrollable Navigation */}
        <div className="py-3 px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-10rem)] custom-scrollbar">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-indigo-600/90 text-white shadow-sm shadow-indigo-600/30 font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 border ${
                            item.badgeColor || "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Role Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {userRole.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {userRole.replace(/_/g, " ")}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                Connected • Shift A
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
