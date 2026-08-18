import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Package,
  Search,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Truck,
} from "lucide-react";
import { ProductInventory } from "../../types";

export const InventoryView: React.FC = () => {
  const { products, triggerReorder } = useWarehouse();

  const [searchTerm, setSearchTerm] = useState("");
  const [healthFilter, setHealthFilter] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [reorderQty, setReorderQty] = useState<number>(100);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.itemNumber && p.itemNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.locationString.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHealth = healthFilter === "ALL" ? true : p.health === healthFilter;
    return matchesSearch && matchesHealth;
  });

  const lowStockCount = products.filter((p) => p.health === "LOW" || p.health === "CRITICAL").length;
  const outOfStockCount = products.filter((p) => p.health === "OUT_OF_STOCK").length;

  const handleOpenReorder = (prod: ProductInventory) => {
    setSelectedProduct(prod);
    setReorderQty(prod.suggestedReorderQty || 100);
    setIsReorderModalOpen(true);
  };

  const handleConfirmReorder = () => {
    if (!selectedProduct) return;
    triggerReorder(selectedProduct.sku, reorderQty);
    setIsReorderModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-100">Inventory & SKU Control</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {products.length} Tracked SKUs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-bin stock tracking, reserved allocation, safety thresholds, and reorder forecasting.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center space-x-1.5 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{lowStockCount} Low Stock</span>
          </div>
          {outOfStockCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 flex items-center space-x-1.5 font-semibold">
              <span>{outOfStockCount} Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SKU (WH-1042), Product Name, Zone (B), Bin (B-05-01)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Stock Health:</span>
          {[
            { id: "ALL", label: "All SKUs" },
            { id: "HEALTHY", label: "Healthy Stock" },
            { id: "LOW", label: "⚠️ Low Supply" },
            { id: "CRITICAL", label: "🚨 Critical" },
            { id: "OUT_OF_STOCK", label: "⛔ Out of Stock" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setHealthFilter(pill.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                healthFilter === pill.id
                  ? "bg-amber-600 text-white font-semibold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Product Name & Category</th>
                <th className="py-3 px-4 font-semibold">Primary Location</th>
                <th className="py-3 px-4 font-semibold text-center">Total / Reserved</th>
                <th className="py-3 px-4 font-semibold text-center">Available Stock</th>
                <th className="py-3 px-4 font-semibold text-center">Supply Runway</th>
                <th className="py-3 px-4 font-semibold">Health Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.map((prod) => (
                <tr
                  key={prod.sku}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* SKU & Item Number */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-bold text-amber-300">{prod.sku}</div>
                    {prod.itemNumber && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {prod.itemNumber}
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 flex items-center space-x-2">
                      <span>{prod.name}</span>
                      {prod.priceINR && (
                        <span className="font-mono text-emerald-400 font-bold text-xs">
                          ₹{prod.priceINR.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{prod.category}</span>
                      {prod.flipkartRank && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-blue-400 font-medium">{prod.flipkartRank}</span>
                        </>
                      )}
                    </div>
                    {prod.stockBadge && (
                      <div className="mt-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                            prod.availableStock <= 2
                              ? "bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
                              : prod.availableStock <= 15
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {prod.stockBadge}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Primary Location */}
                  <td className="py-3.5 px-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                      {prod.locationString} (Zone {prod.zone})
                    </span>
                    {prod.secondaryLocations && prod.secondaryLocations.length > 0 && (
                      <div className="text-[10px] text-slate-500 mt-1">
                        + Reserve: {prod.secondaryLocations[0].location} ({prod.secondaryLocations[0].qty}u)
                      </div>
                    )}
                  </td>

                  {/* Total vs Reserved */}
                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    <span className="text-slate-200">{prod.currentStock}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-indigo-400">{prod.reservedStock} res</span>
                  </td>

                  {/* Available Stock */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span
                      className={`text-sm font-bold ${
                        prod.availableStock <= 2
                          ? "text-red-400"
                          : prod.availableStock <= 15
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {prod.availableStock}
                    </span>
                    <span className="text-[10px] text-slate-500 block">units left</span>
                  </td>

                  {/* Supply Runway */}
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span
                      className={`font-semibold ${
                        prod.daysOfSupplyRemaining <= 2
                          ? "text-red-400"
                          : prod.daysOfSupplyRemaining <= 5
                          ? "text-amber-400"
                          : "text-slate-300"
                      }`}
                    >
                      {prod.daysOfSupplyRemaining.toFixed(1)} Days
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      ~{prod.dailyVelocity} units/day
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        prod.health === "CRITICAL" || prod.health === "OUT_OF_STOCK"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : prod.health === "LOW"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {prod.health.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* Reorder Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenReorder(prod)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg font-semibold transition-all inline-flex items-center space-x-1 text-xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder PO Modal */}
      {isReorderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-5 shadow-2xl text-slate-100 text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">
                  Generate Automated Purchase Order
                </h3>
              </div>
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-amber-300">{selectedProduct.sku}</span>
                <span className="text-slate-400 font-sans">{selectedProduct.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Available:</span>
                  <span className="font-bold text-slate-200">{selectedProduct.availableStock} units</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Daily Velocity:</span>
                  <span className="font-bold text-slate-200">{selectedProduct.demandVelocityPerDay} units</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Supplier:</span>
                  <span className="font-bold text-slate-200">OptiTech Systems</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Reorder Quantity (Units):</label>
              <input
                type="number"
                value={reorderQty}
                onChange={(e) => setReorderQty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400">
                AI Optimal EOQ Recommendation: 120 units based on 8-day lead time and surge velocity.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReorder}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-sm flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transmit PO to Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
