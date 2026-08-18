import React, { useState, useMemo } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  ShieldAlert,
  ArrowRightLeft,
  Box,
  MapPin,
  Star,
  Search,
  Filter,
  Building2,
  Truck,
  TrendingUp,
  MessageSquare,
  Send,
  Check,
  Package,
  Plus,
  RefreshCw,
} from "lucide-react";

export const InventoryAllocationView: React.FC = () => {
  const {
    orders,
    products,
    reallocateStock,
    reallocateRegionalHubStock,
    approveRecommendation,
    setSelectedOrderId,
    setCurrentView,
    panIndiaHubs,
    areaItemFeedbacks,
    submitAreaItemFeedback,
  } = useWarehouse();

  // Selection state
  const [selectedSku, setSelectedSku] = useState("WH-1042");
  const [selectedHubFilter, setSelectedHubFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Reallocation form state
  const [sourceHub, setSourceHub] = useState("MUM");
  const [targetHub, setTargetHub] = useState("HYD");
  const [targetOrder, setTargetOrder] = useState("ORD-1048");
  const [fromZone, setFromZone] = useState("E");
  const [toZone, setToZone] = useState("B");
  const [transferQty, setTransferQty] = useState(4);
  const [allocatedSuccess, setAllocatedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Feedback form state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [newFeedbackName, setNewFeedbackName] = useState("");
  const [newFeedbackCity, setNewFeedbackCity] = useState("HITEC City, Hyderabad");
  const [newFeedbackHub, setNewFeedbackHub] = useState("HYD");
  const [newFeedbackRating, setNewFeedbackRating] = useState(5);
  const [newFeedbackComment, setNewFeedbackComment] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const product = products.find((p) => p.sku === selectedSku) || products[0];

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.itemNumber && p.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Categories list
  const categories = useMemo(() => {
    return ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  // Filtered feedbacks for current view / selected item
  const filteredFeedbacks = useMemo(() => {
    return areaItemFeedbacks.filter((fb) => {
      const matchesHub = selectedHubFilter === "ALL" || fb.hubCode === selectedHubFilter;
      const matchesSku = fb.sku === selectedSku || selectedSku === "ALL";
      return matchesHub && matchesSku;
    });
  }, [areaItemFeedbacks, selectedHubFilter, selectedSku]);

  // Execute Inter-Hub Reallocation
  const handleExecuteHubReallocation = () => {
    if (sourceHub === targetHub) {
      // Internal zone reallocation
      reallocateStock(targetOrder, selectedSku, fromZone, toZone, transferQty);
      setSuccessMessage(
        `Local Warehouse Reallocation Executed: ${transferQty} units of ${product.name} moved from Zone ${fromZone} to Zone ${toZone} for Order #${targetOrder}!`
      );
    } else {
      // Regional Inter-Hub transfer
      reallocateRegionalHubStock(selectedSku, sourceHub, targetHub, transferQty, targetOrder);
      const srcHubName = panIndiaHubs.find((h) => h.code === sourceHub)?.city || sourceHub;
      const tgtHubName = panIndiaHubs.find((h) => h.code === targetHub)?.city || targetHub;
      setSuccessMessage(
        `Pan-India Reallocation Executed: ${transferQty} units of ${product.name} transferred from ${srcHubName} Hub to ${tgtHubName} Hub to fulfill Order #${targetOrder}!`
      );
    }
    setAllocatedSuccess(true);
    setTimeout(() => setAllocatedSuccess(false), 5000);
  };

  // Submit Feedback
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackName.trim() || !newFeedbackComment.trim()) return;

    const hubObj = panIndiaHubs.find((h) => h.code === newFeedbackHub);
    submitAreaItemFeedback({
      sku: product.sku,
      itemName: product.name,
      customerName: newFeedbackName,
      cityArea: newFeedbackCity,
      hubCode: newFeedbackHub as any,
      hubName: hubObj?.name || `${newFeedbackHub} Hub`,
      rating: newFeedbackRating,
      comment: newFeedbackComment,
      stockAvailabilityNote: "Stock allocated directly from local regional hub inventory.",
      deliverySpeed: newFeedbackRating >= 4 ? "Same-Day Prime Express" : "Standard Courier",
      packageStatus: "PERFECT",
      wasOnTime: newFeedbackRating >= 4,
    });

    setFeedbackSuccess(true);
    setNewFeedbackName("");
    setNewFeedbackComment("");
    setTimeout(() => {
      setFeedbackSuccess(false);
      setShowFeedbackModal(false);
    }, 1500);
  };

  // AI auto solver
  const handleAutoSolve = () => {
    approveRecommendation("REC-801");
    reallocateRegionalHubStock("WH-1042", "MUM", "HYD", 8, "ORD-1048");
    setSuccessMessage(
      "AI Optimal Multi-Hub Solver Applied: 8 units of SKU WH-1042 reallocated from Mumbai Bhiwandi Surplus to Hyderabad Shamshabad Hub for Apex Robotics #ORD-1048!"
    );
    setAllocatedSuccess(true);
    setTimeout(() => setAllocatedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <span>Pan-India Inventory Allocation & Regional Stock Engine</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              9 Indian Hubs Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock name & item number allocation across Hyderabad, Bengaluru, Mumbai, Delhi-NCR, Chennai, Pune, Kolkata, Ahmedabad & Vijayawada hubs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleAutoSolve}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
            <span>Auto-Solve Pan-India Deficit (AI Solver)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {allocatedSuccess && (
        <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 shadow-lg shadow-emerald-950/40">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => {
              setSelectedOrderId("ORD-1048");
              setCurrentView("orders");
            }}
            className="text-emerald-400 underline font-bold hover:text-emerald-300 whitespace-nowrap self-end sm:self-auto"
          >
            Inspect Order #ORD-1048 →
          </button>
        </div>
      )}

      {/* Summary KPI Cards across Pan-India Network */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Regional Hubs</span>
            <MapPin className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">9 Mega Hubs</div>
          <p className="text-[10px] text-slate-400">HYD, BLR, MUM, DEL, MAA, PNQ, CCU, AMD, VJA</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pan-India On-Hand</span>
            <Box className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {products.reduce((acc, p) => acc + (p.onHand || p.currentStock || 0), 0).toLocaleString()} Units
          </div>
          <p className="text-[10px] text-slate-400">Across 8 primary categories</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stockout Risk Hubs</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">2 Hubs at Risk</div>
          <p className="text-[10px] text-amber-400/80">Hyderabad (HYD) & Bengaluru (BLR)</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Area Delivery CSAT</span>
            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">4.7 / 5.0 ★</div>
          <p className="text-[10px] text-slate-400">{areaItemFeedbacks.length} Verified Customer Reviews</p>
        </div>
      </div>

      {/* Area / Hub Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter by Region / Area Hub:</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Currently viewing:{" "}
            <strong className="text-indigo-400">
              {selectedHubFilter === "ALL"
                ? "Pan-India All Over India Network"
                : panIndiaHubs.find((h) => h.code === selectedHubFilter)?.name}
            </strong>
          </span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedHubFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              selectedHubFilter === "ALL"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <span>🇮🇳 All India (Pan-National)</span>
          </button>
          {panIndiaHubs.map((hub) => {
            const isSelected = selectedHubFilter === hub.code;
            return (
              <button
                key={hub.code}
                onClick={() => setSelectedHubFilter(hub.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/40"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{hub.code}</span>
                <span>{hub.city}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left = Stock Name & Item Number Directory; Right = Deep Dive Regional Allocation & Transfer Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stock Name & Item Number Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>Stock Directory (Name & Item #)</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">{filteredProducts.length} Items</span>
            </div>

            {/* Search and Category Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Stock Name or Item Number / SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-md whitespace-nowrap font-medium transition-colors ${
                      categoryFilter === cat
                        ? "bg-slate-800 text-indigo-300 font-bold border border-indigo-500/40"
                        : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List Cards */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isSelected = p.sku === selectedSku;
                const totalPanIndiaOnHand = p.onHand || p.currentStock || 0;
                const totalPanIndiaAvail = p.available || p.availableStock || 0;
                const isCritical = p.health === "CRITICAL" || p.health === "OUT_OF_STOCK";

                return (
                  <div
                    key={p.sku}
                    onClick={() => setSelectedSku(p.sku)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-950/50"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                            {p.itemNumber || `ITEM-${p.sku}-IND`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">SKU: {p.sku}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-100 truncate">{p.name}</h3>
                        <p className="text-[10px] text-slate-400">{p.category} • ₹{p.priceINR?.toLocaleString() || "12,499"}</p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                          isCritical
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : p.health === "LOW"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isCritical ? "SCARCITY CONFLICT" : `${totalPanIndiaAvail} Available`}
                      </span>
                    </div>

                    {/* Regional mini stock indicators */}
                    <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center space-x-1 font-mono">
                        <span className="text-slate-500">Pan-India:</span>
                        <span className="text-emerald-400 font-bold">{totalPanIndiaAvail} Avail</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-300">{totalPanIndiaOnHand} Total</span>
                      </div>
                      <div className="flex items-center space-x-1 text-indigo-400 font-medium">
                        <span>Inspect Hubs</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Dive Regional Breakdown & Reallocation Tool (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Item Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {product.itemNumber || `ITEM-${product.sku}-IND`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    SKU: {product.sku}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/20 text-purple-300">
                    {product.flipkartRank || "Flipkart Assured VIP"}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100">{product.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Category: <span className="text-slate-200">{product.category}</span> • Unit Price:{" "}
                  <span className="text-emerald-400 font-mono font-bold">₹{product.priceINR?.toLocaleString() || "12,499"}</span> • Primary Pick Bay:{" "}
                  <span className="text-indigo-400 font-mono">{product.locationString || "B-05-01"}</span>
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-400">Total Pan-India Stock</div>
                <div className="text-xl font-bold font-mono text-slate-100">
                  {product.onHand || product.currentStock} <span className="text-xs text-slate-400">units</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {product.available || product.availableStock} units ready for allocation
                </div>
              </div>
            </div>

            {/* Regional Hub Stock Breakdown Cards for this Item */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Area-Wise Hub Inventory Allocation Across India</span>
                </h3>
                <span className="text-[10px] text-slate-400">Real-Time Hub Sync</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(product.regionalHubStocks || []).map((rhs) => {
                  const isMatchingFilter = selectedHubFilter === "ALL" || selectedHubFilter === rhs.hubCode;
                  const isCriticalShortage = rhs.bufferHealth === "CRITICAL_SHORTAGE" || rhs.available < 3;
                  const isSurplus = rhs.bufferHealth === "SURPLUS" || rhs.available > 20;

                  return (
                    <div
                      key={rhs.hubCode}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        !isMatchingFilter
                          ? "opacity-40 bg-slate-950/40 border-slate-900"
                          : isCriticalShortage
                          ? "bg-red-950/30 border-red-500/40"
                          : isSurplus
                          ? "bg-emerald-950/20 border-emerald-500/30"
                          : "bg-slate-950/80 border-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-xs text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                            {rhs.hubCode}
                          </span>
                          <span className="font-bold text-xs text-slate-100">{rhs.city}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            isCriticalShortage
                              ? "bg-red-500/20 text-red-300"
                              : isSurplus
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {isCriticalShortage ? "DEFICIT" : isSurplus ? "SURPLUS" : "BALANCED"}
                        </span>
                      </div>

                      {/* Stock stats */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[9px]">Available</span>
                          <strong
                            className={`font-mono text-xs ${
                              isCriticalShortage ? "text-red-400" : isSurplus ? "text-emerald-400" : "text-slate-200"
                            }`}
                          >
                            {rhs.available} u
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Reserved / On-Hand</span>
                          <span className="font-mono text-slate-300">
                            {rhs.allocated} / {rhs.onHand} u
                          </span>
                        </div>
                      </div>

                      {/* Local aisle & CSAT */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span className="font-mono text-slate-400">Bay: {rhs.localAisles}</span>
                        <span className="flex items-center text-amber-300 font-medium">
                          <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                          {rhs.csatRating}★
                        </span>
                      </div>

                      {/* Quick transfer button */}
                      <div className="flex items-center space-x-1 pt-1">
                        {isCriticalShortage ? (
                          <button
                            onClick={() => {
                              setTargetHub(rhs.hubCode);
                              setSourceHub("MUM");
                            }}
                            className="w-full py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-700/50 text-red-200 rounded text-[10px] font-bold transition-colors"
                          >
                            ⚡ Transfer In to {rhs.hubCode}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSourceHub(rhs.hubCode);
                              setTargetHub("HYD");
                            }}
                            className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-medium transition-colors"
                          >
                            Source From {rhs.hubCode}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Pan-India Inter-Hub & Zone Stock Re-allocator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                <span>Pan-India Inter-Hub Stock Reallocation Console</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono">
                Item: {product.sku}
              </span>
            </div>

            <p className="text-slate-400 text-xs">
              Dynamically route stock between regional Indian hubs (e.g. Mumbai/Bengaluru Surplus → Hyderabad Deficit) or local warehouse picking zones to fulfill priority customer orders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Source Hub */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">Source Area / Hub</label>
                <select
                  value={sourceHub}
                  onChange={(e) => setSourceHub(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MUM">MUM - Mumbai Bhiwandi (Surplus: 28u)</option>
                  <option value="BLR">BLR - Bengaluru Whitefield (FC)</option>
                  <option value="DEL">DEL - Delhi-NCR Gurugram (16u)</option>
                  <option value="PNQ">PNQ - Pune Chakan (14u)</option>
                  <option value="MAA">MAA - Chennai Sriperumbudur (9u)</option>
                  <option value="AMD">AMD - Ahmedabad Sanand (9u)</option>
                  <option value="HYD">HYD - Hyderabad Shamshabad (Local)</option>
                  <option value="CCU">CCU - Kolkata Dankuni (2u)</option>
                  <option value="VJA">VJA - Vijayawada Transit (1u)</option>
                </select>
              </div>

              {/* Destination Hub */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">Destination Area / Hub</label>
                <select
                  value={targetHub}
                  onChange={(e) => setTargetHub(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="HYD">HYD - Hyderabad (Critical Shortage)</option>
                  <option value="VJA">VJA - Vijayawada (Shortage)</option>
                  <option value="BLR">BLR - Bengaluru Whitefield</option>
                  <option value="CCU">CCU - Kolkata Dankuni</option>
                  <option value="DEL">DEL - Delhi-NCR Gurugram</option>
                  <option value="MAA">MAA - Chennai Sriperumbudur</option>
                  <option value="PNQ">PNQ - Pune Chakan</option>
                  <option value="MUM">MUM - Mumbai Bhiwandi</option>
                  <option value="AMD">AMD - Ahmedabad Sanand</option>
                </select>
              </div>

              {/* Target Order */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">Assign to Order</label>
                <select
                  value={targetOrder}
                  onChange={(e) => setTargetOrder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ORD-1048">ORD-1048 (Apex Robotics - HYD)</option>
                  <option value="ORD-1049">ORD-1049 (Kavitha R. - BLR Tatkal)</option>
                  <option value="ORD-1051">ORD-1051 (Quantum Labs - MUM)</option>
                  <option value="ORD-1022">ORD-1022 (Global Precision - DEL)</option>
                  <option value="ORD-1033">ORD-1033 (TVS Logistics - MAA)</option>
                </select>
              </div>

              {/* Units to Transfer */}
              <div>
                <label className="text-slate-400 font-medium block mb-1">Units to Reallocate</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Impact Calculation Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 block">Estimated Transit Mode:</span>
                <span className="text-slate-200 font-semibold">
                  {sourceHub === targetHub
                    ? "Internal Forklift Runner (Zone E → B)"
                    : "Inter-City Express Air Cargo Corridor"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Lead Time:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {sourceHub === targetHub ? "4 Minutes" : "2.5 Hours Air Shuttle"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">SLA Penalty Avoided:</span>
                <span className="text-indigo-400 font-mono font-bold">₹1,02,500 ($1,250/hr)</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleExecuteHubReallocation}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-950/50 flex items-center space-x-2 transition-all"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Execute Regional Allocation Move ({transferQty} units)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flagship Scenario Showcase: SKU WH-1042 Competing Demand across Indian Cities */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                HIGH DEMAND CONFLICT: SKU WH-1042
              </span>
              <h2 className="text-sm font-bold text-slate-100">
                Pro Thermal Optical Sensors 4K • Hyderabad vs Delhi-NCR Contention
              </h2>
            </div>
            <p className="text-slate-400 mt-1">
              Two competing customer orders in Hyderabad and Delhi-NCR require SKU WH-1042, but primary Hyderabad pick face contains only 4 units.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 font-bold font-mono text-right whitespace-nowrap self-start sm:self-auto">
            Supply Deficit: -8 Units in HYD
          </span>
        </div>

        {/* Competing Orders Visual Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order A: ORD-1048 (Urgent Enterprise in Hyderabad) */}
          <div className="p-4 bg-slate-950/80 border-2 border-indigo-500/60 rounded-xl space-y-3 relative">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold font-mono border border-red-500/30 text-[10px]">
                PRIORITY SCORE: 94/100
              </span>
            </div>

            <div>
              <span className="text-indigo-400 font-mono font-bold text-sm">#ORD-1048</span>
              <h3 className="font-bold text-slate-100 mt-0.5">Apex Robotics (Platinum VIP)</h3>
              <p className="text-[11px] text-slate-400">
                Area: <strong className="text-slate-200">HITEC City Phase 2, Hyderabad</strong> • Carrier: Ekart Tatkal (42m remaining)
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg space-y-1.5 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Requested:</span>
                <strong className="text-slate-100 font-mono">10 units</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Reallocated:</span>
                <strong className="text-emerald-400 font-mono">
                  10 units (4 from HYD Hub + 6 Express Air Shuttled from MUM Hub)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SLA Breach Penalty:</span>
                <strong className="text-red-400 font-mono">₹1,02,500 / hour ($1,250)</strong>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400 font-medium">
              ✅ <strong>AI Decision:</strong> FULL PRIORITY ALLOCATION APPROVED. Cross-docked via Mumbai Bhiwandi air corridor.
            </div>
          </div>

          {/* Order B: ORD-1022 (Standard Retail in Delhi-NCR) */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 font-mono font-bold text-sm">#ORD-1022</span>
                <h3 className="font-bold text-slate-100 mt-0.5">Global Precision Tools Pvt Ltd</h3>
                <p className="text-[11px] text-slate-400">
                  Area: <strong className="text-slate-200">Gurugram Cyber City, Delhi-NCR</strong> • Carrier: BlueDart (310m remaining)
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold font-mono border border-slate-700 text-[10px]">
                PRIORITY SCORE: 48/100
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg space-y-1.5 border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Requested:</span>
                <strong className="text-slate-100 font-mono">5 units</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Allocation:</span>
                <strong className="text-amber-400 font-mono">Fulfilled from Delhi Gurugram local buffer</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SLA Breach Penalty:</span>
                <strong className="text-slate-400 font-mono">None (Standard Window)</strong>
              </div>
            </div>

            <div className="text-[11px] text-amber-300 font-medium">
              ⏸️ <strong>AI Decision:</strong> Scheduled for evening replenishment wave at 17:00. Zero SLA breach incurred.
            </div>
          </div>
        </div>
      </div>

      {/* Area Customer Feedback & Delivery Experience Traceability Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-100">
                All-India Area Customer Feedback & CSAT Lineage
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customer reviews, packaging integrity, and delivery speed ratings linked to regional inventory allocation.
            </p>
          </div>

          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Submit Customer Feedback for Area</span>
          </button>
        </div>

        {/* Feedback Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFeedbacks.map((fb) => (
            <div
              key={fb.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">{fb.customerName}</span>
                    <span className="text-[11px] text-indigo-400 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1" />
                      {fb.cityArea}
                    </span>
                  </div>
                  <div className="flex items-center space-x-0.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < fb.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  "{fb.comment}"
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800 text-[10px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Item: <strong className="text-slate-200">{fb.sku}</strong></span>
                  <span className="font-mono text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded">
                    Hub: {fb.hubCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Speed: <strong className="text-slate-300">{fb.deliverySpeed}</strong></span>
                  <span className={fb.wasOnTime ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                    {fb.wasOnTime ? "✓ On Time" : "⚠️ Delayed"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-0.5">
                  Allocation Trace: {fb.stockAvailabilityNote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Customer Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Submit Area Customer Feedback</span>
              </h3>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold px-1"
              >
                ✕
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center space-y-2 text-emerald-300">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 animate-bounce" />
                <h4 className="font-bold text-sm">Feedback Successfully Ingested!</h4>
                <p className="text-xs text-emerald-300/80">
                  Customer satisfaction score has been updated in the Pan-India trace ledger.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddFeedback} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Customer / Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar (TechCorp Hyderabad)"
                    value={newFeedbackName}
                    onChange={(e) => setNewFeedbackName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">City / Area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HITEC City, Hyderabad"
                      value={newFeedbackCity}
                      onChange={(e) => setNewFeedbackCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium">Regional Hub</label>
                    <select
                      value={newFeedbackHub}
                      onChange={(e) => setNewFeedbackHub(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      {panIndiaHubs.map((h) => (
                        <option key={h.code} value={h.code}>
                          {h.code} - {h.city} Hub
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Customer Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setNewFeedbackRating(num)}
                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg border font-bold ${
                          newFeedbackRating >= num
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-slate-950 text-slate-500 border-slate-800"
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${newFeedbackRating >= num ? "fill-amber-400 text-amber-400" : ""}`} />
                        <span>{num}★</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Customer Review & Stock Notes</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter customer feedback on delivery speed, item availability, and packaging..."
                    value={newFeedbackComment}
                    onChange={(e) => setNewFeedbackComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
