import React from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import { UserRole } from "../../types";
import {
  ShieldAlert,
  Bot,
  Search,
  Sparkles,
  RefreshCw,
  Bell,
  Sliders,
  ChevronDown,
  Warehouse,
  Flame,
  Clock,
  Activity,
  Zap,
} from "lucide-react";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onOpenSearch?: () => void;
  onToggleCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onToggleCopilot,
}) => {
  const {
    userRole,
    setUserRole,
    metrics,
    exceptions,
    recommendations,
    liveEvents,
    isCopilotOpen,
    setIsCopilotOpen,
    setIsSearchOpen,
    triggerDemoSimulation,
    resetAllData,
  } = useWarehouse();

  const pendingRecs = recommendations.filter((r) => r.status === "PENDING_APPROVAL").length;
  const openExceptions = exceptions.filter((e) => e.status !== "RESOLVED").length;

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    WAREHOUSE_MANAGER: { title: "Warehouse Manager", color: "bg-indigo-600 text-white", desc: "Full Operational Oversight" },
    OPERATIONS_SUPERVISOR: { title: "Operations Supervisor", color: "bg-purple-600 text-white", desc: "Dispatch & Task Allocation" },
    PICKER: { title: "Picker", color: "bg-emerald-600 text-white", desc: "Pick Route HUD & Barcode Scanning" },
    PACKER: { title: "Packer", color: "bg-amber-600 text-white", desc: "Verification & Boxing Staging" },
    DISPATCH_COORDINATOR: { title: "Dispatch Coordinator", color: "bg-blue-600 text-white", desc: "Carriers & SLA Manifests" },
  };

  const latestEvent = liveEvents[0];

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleCopilotToggle = () => {
    if (onToggleCopilot) {
      onToggleCopilot();
    } else {
      setIsCopilotOpen(!isCopilotOpen);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner Ticker for Real-time Operational Events */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs flex items-center justify-between border-b border-slate-800/80 font-mono">
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold uppercase tracking-wider shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE CONTROL TOWER</span>
          </span>
          <span className="text-slate-600">|</span>
          <div className="truncate flex items-center space-x-2 text-slate-300">
            {latestEvent && (
              <>
                <span className="text-slate-500">[{latestEvent.time}]</span>
                <span className="truncate">{latestEvent.text}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 shrink-0 text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Shift A (06:00 - 14:00)</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center space-x-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>SLA: <strong className="text-emerald-400">{metrics.dispatchSlaRate}%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Tagline + Mobile Toggle */}
        <div className="flex items-center space-x-3">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700"
              aria-label="Toggle Navigation"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/20 border border-indigo-400/30">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  WARENEXUS
                </span>
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI CONTROL TOWER
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 leading-tight">
                From Order Chaos to Intelligent Fulfillment
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <button
          onClick={handleSearchClick}
          className="hidden md:flex items-center space-x-2.5 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-slate-300 transition-colors w-64 lg:w-72 justify-between group"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
            <span className="text-slate-400">Search Order, SKU, Zone...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Recommendations Pulse Badge */}
          {pendingRecs > 0 && (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-medium animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{pendingRecs} AI Decisions</span>
            </div>
          )}

          {/* SLA At Risk Counter */}
          {metrics.ordersAtRisk > 0 && (
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-medium">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>{metrics.ordersAtRisk} At Risk</span>
            </div>
          )}

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-1">
            <span className="hidden sm:inline text-[11px] text-slate-400 px-2 font-medium">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-slate-900 text-xs text-slate-200 font-medium py-1 px-2 rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="WAREHOUSE_MANAGER">Manager</option>
              <option value="OPERATIONS_SUPERVISOR">Supervisor</option>
              <option value="PICKER">Picker (HUD)</option>
              <option value="PACKER">Packer (Station)</option>
              <option value="DISPATCH_COORDINATOR">Dispatch</option>
            </select>
          </div>

          {/* NEXUS AI Copilot Button */}
          <button
            onClick={handleCopilotToggle}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isCopilotOpen
                ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30"
                : "bg-indigo-950/60 border-indigo-700/60 hover:bg-indigo-900/80 text-indigo-200"
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">NEXUS Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>
        </div>
      </div>
    </header>
  );
};
