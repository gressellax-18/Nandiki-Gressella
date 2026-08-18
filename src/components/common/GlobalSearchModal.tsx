import React, { useState, useEffect } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Search,
  X,
  ClipboardList,
  Package,
  Users,
  MapPin,
  AlertOctagon,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    orders,
    products,
    workers,
    zones,
    exceptions,
    recommendations,
    setSelectedOrderId,
    setCurrentView,
  } = useWarehouse();

  const [query, setQuery] = useState("");

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.carrier.toLowerCase().includes(q)
      )
    : orders.slice(0, 3);

  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.locationString.toLowerCase().includes(q)
      )
    : products.slice(0, 3);

  const filteredWorkers = q
    ? workers.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.id.toLowerCase().includes(q) ||
          w.role.toLowerCase().includes(q)
      )
    : workers.slice(0, 3);

  const filteredZones = q
    ? zones.filter((z) => z.id.toLowerCase().includes(q) || z.name.toLowerCase().includes(q))
    : zones.slice(0, 2);

  const filteredExceptions = q
    ? exceptions.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.orderId.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      )
    : exceptions.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Order # (ORD-1048), SKU (WH-1042), Worker (Ravi), Zone B..."
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          {/* Orders Section */}
          {filteredOrders.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2 text-[10px]">
                <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
                <span>Orders ({filteredOrders.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredOrders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      setCurrentView("orders");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700/60 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-indigo-300">{o.id}</span>
                      <span className="text-slate-200 font-medium truncate max-w-xs">{o.customerName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          o.priority === "CRITICAL"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : o.priority === "HIGH"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {o.priority} ({o.priorityScore})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span>{o.status}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products & Inventory Section */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2 text-[10px]">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                <span>Inventory & SKUs ({filteredProducts.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredProducts.map((p) => (
                  <button
                    key={p.sku}
                    onClick={() => {
                      setCurrentView("inventory");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700/60 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-amber-300">{p.sku}</span>
                      <span className="text-slate-200 font-medium truncate max-w-xs">{p.name}</span>
                      <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded">
                        {p.locationString} (Zone {p.zone})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          p.health === "CRITICAL" || p.health === "OUT_OF_STOCK"
                            ? "bg-red-500/20 text-red-300"
                            : p.health === "LOW"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {p.availableStock} Avail ({p.health})
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Workers Section */}
          {filteredWorkers.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2 text-[10px]">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Workforce ({filteredWorkers.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredWorkers.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setCurrentView("workforce");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700/60 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-emerald-300">{w.id}</span>
                      <span className="text-slate-200 font-medium">{w.name}</span>
                      <span className="text-slate-400 text-[11px]">• {w.role}</span>
                      <span className="text-slate-500 text-[10px]">Zone {w.currentZone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span>{w.currentWorkloadPercent}% Load</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions Section */}
          {filteredExceptions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold uppercase tracking-wider mb-2 text-[10px]">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Exceptions ({filteredExceptions.length})</span>
              </div>
              <div className="space-y-1.5">
                {filteredExceptions.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setCurrentView("exceptions");
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-indigo-900/40 border border-slate-700/60 transition-colors text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-rose-300">{e.id}</span>
                      <span className="text-slate-300 truncate max-w-sm">{e.description}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
                        {e.status}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">ESC</kbd> to exit</span>
            <span>•</span>
            <span>Click any result to jump directly to control panel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
