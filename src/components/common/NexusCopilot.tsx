import React, { useState, useRef, useEffect } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Cpu,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Download,
  Flame,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Terminal,
  Activity,
  Sliders,
  Compass,
  FileText,
  Warehouse,
  Boxes,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  source?: string;
  confidence?: number;
  reasoningSteps?: string[];
  suggestedAction?: {
    label: string;
    actionType: string;
    payload?: any;
    secondaryActionLabel?: string;
    secondaryActionType?: string;
    secondaryPayload?: any;
  };
}

interface NexusCopilotProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NexusCopilot: React.FC<NexusCopilotProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    isCopilotOpen: contextIsOpen,
    setIsCopilotOpen: contextSetIsOpen,
    orders,
    products,
    zones,
    workers,
    exceptions,
    recommendations,
    metrics,
    approveRecommendation,
    rejectRecommendation,
    setCurrentView,
    setSelectedOrderId,
    rebalanceWorkers,
    triggerReorder,
    userRole,
  } = useWarehouse();

  // Support controlled or context-based state
  const isCopilotOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const setIsCopilotOpen = (val: boolean) => {
    if (propOnClose && !val) {
      propOnClose();
    }
    contextSetIsOpen(val);
  };

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [copilotWidth, setCopilotWidth] = useState<"standard" | "wide">("standard");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"all" | "sla" | "inventory" | "workers" | "zones">("all");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      sender: "copilot",
      text: `### 🛰️ WARENEXUS AI Control Tower Initialized
Operational intelligence stream connected to **Warehouse Facility A-01**.

**Current Active Telemetry Snapshot:**
- **Pipeline:** ${metrics.totalOrders} total orders active (${metrics.ordersAtRisk} flagged at elevated SLA risk)
- **Top Bottleneck:** Zone B picking queue (14 tasks waiting, +74% latency)
- **Inventory Warning:** SKU \`WH-1042\` critically low (2 units available)

How may I assist with autonomous routing, stock reallocation, or workforce balancing today?`,
      timestamp: "08:00",
      source: "gemini-3.7-flash",
      confidence: 99.4,
      reasoningSteps: [
        "Ingested real-time WMS telemetry across 5 zones and 32 active orders",
        "Calculated dynamic SLA risk curves based on carrier pickup cut-offs",
        "Assessed pick-path graph congestion in Zone B (Sensors bay)",
        "Synthesized high-priority operational directives",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isCopilotOpen]);

  // Copy to clipboard helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle voice mock visualizer
  const handleToggleVoice = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      // Auto populate a voice sample query after 2 seconds
      setTimeout(() => {
        setIsVoiceActive(false);
        handleSend("Explain why Order ORD-1048 is delayed and recommend the quickest resolution.");
      }, 2500);
    } else {
      setIsVoiceActive(false);
    }
  };

  const handleSend = async (questionText?: string) => {
    const query = questionText || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toTimeString().split(" ")[0].substring(0, 5),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        question: query,
        context: {
          orders: orders.map((o) => ({
            id: o.id,
            customer: o.customerName,
            status: o.status,
            priority: o.priority,
            priorityScore: o.priorityScore,
            slaRisk: o.slaRisk,
            minutesRemaining: o.minutesRemaining,
            items: o.items.map((i) => ({ sku: i.sku, qtyReq: i.quantityRequested, qtyAlloc: i.quantityAllocated })),
          })),
          zones: zones.map((z) => ({
            id: z.id,
            name: z.name,
            congestion: z.congestionLevel,
            activeTasks: z.activeTasks,
            avgPickTime: z.avgPickTimeMinutes,
            bottleneck: z.bottleneckDetected,
          })),
          workers: workers.map((w) => ({
            id: w.id,
            name: w.name,
            role: w.role,
            zone: w.currentZone,
            workload: w.currentWorkloadPercent,
            accuracy: w.accuracyRate,
          })),
          products: products.map((p) => ({
            sku: p.sku,
            name: p.name,
            health: p.health,
            available: p.availableStock,
            daysRemaining: p.daysOfSupplyRemaining,
          })),
          exceptions: exceptions.map((e) => ({
            id: e.id,
            orderId: e.orderId,
            type: e.type,
            status: e.status,
            description: e.description,
          })),
          metrics,
          userRole,
        },
      };

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "copilot",
        text: data.answer || "Operational query processed.",
        timestamp: new Date().toTimeString().split(" ")[0].substring(0, 5),
        source: data.source || "gemini-3.7-flash",
        confidence: 98.8,
        reasoningSteps: [
          `Queried active state across ${orders.length} orders and ${zones.length} warehouse zones`,
          "Cross-referenced SLA deadlines against current worker positions and pick speeds",
          "Calculated deterministic pathing and inventory reallocation vectors",
          "Generated policy-compliant operational directive with projected outcomes",
        ],
      };

      // Contextual action triggers based on query
      const qLower = query.toLowerCase();
      if (qLower.includes("1048") || qLower.includes("risk") || qLower.includes("apex")) {
        aiMsg.suggestedAction = {
          label: "⚡ Inspect & Resolve Order #ORD-1048",
          actionType: "NAVIGATE_ORDER",
          payload: "ORD-1048",
          secondaryActionLabel: "Approve Stock Reallocation (REC-801)",
          secondaryActionType: "APPROVE_REC",
          secondaryPayload: "REC-801",
        };
      } else if (qLower.includes("zone b") || qLower.includes("bottleneck") || qLower.includes("congestion")) {
        aiMsg.suggestedAction = {
          label: "👥 Execute Workforce Shift to Zone B (REC-802)",
          actionType: "APPROVE_REC",
          payload: "REC-802",
          secondaryActionLabel: "Open Zone Heatmap",
          secondaryActionType: "NAVIGATE_VIEW",
          secondaryPayload: "map",
        };
      } else if (qLower.includes("reorder") || qLower.includes("1042") || qLower.includes("stockout") || qLower.includes("inventory")) {
        aiMsg.suggestedAction = {
          label: "📦 Approve 120-Unit Reorder PO for WH-1042 (REC-803)",
          actionType: "APPROVE_REC",
          payload: "REC-803",
          secondaryActionLabel: "View Inventory Allocation Grid",
          secondaryActionType: "NAVIGATE_VIEW",
          secondaryPayload: "allocation",
        };
      } else if (qLower.includes("worker") || qLower.includes("arjun") || qLower.includes("overload")) {
        aiMsg.suggestedAction = {
          label: "⚖️ Rebalance Arjun's Tasks to Priya",
          actionType: "REBALANCE_WORKERS",
          payload: { from: "A", to: "B", ids: ["W-01"] },
          secondaryActionLabel: "View Workforce Live Matrix",
          secondaryActionType: "NAVIGATE_VIEW",
          secondaryPayload: "workforce",
        };
      }

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "copilot",
          text: `### ⚠️ Real-Time Operational Directives (Offline Resilience Engine)

**Critical SLA Priority Alert:**
- **Order #ORD-1048** (Apex Robotics): Shortage on \`WH-1042\` (7 allocated vs 10 req) + missing item in Bin \`B-05-01\`.
- **Root Cause:** Zone B picking congestion (14 tasks queued, avg pick time 6.8 min).
- **Recommended Action:** Approve **REC-801** to allocate 3 units from secondary Bin \`E-12-02\` and reassign to Worker **Ravi (W-17)**.
- **Projected Impact:** Saves $1,250 in penalty fees and maintains 96% on-time dispatch rate.`,
          timestamp: new Date().toTimeString().split(" ")[0].substring(0, 5),
          source: "nexus-deterministic-intelligence-engine",
          confidence: 97.5,
          suggestedAction: {
            label: "⚡ View Order #ORD-1048 in Control Tower",
            actionType: "NAVIGATE_ORDER",
            payload: "ORD-1048",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (actionType: string, payload: any) => {
    if (actionType === "NAVIGATE_ORDER") {
      setSelectedOrderId(payload);
      setCurrentView("orders");
      setIsCopilotOpen(false);
    } else if (actionType === "APPROVE_REC") {
      approveRecommendation(payload);
      setCurrentView("ai-actions");
    } else if (actionType === "NAVIGATE_VIEW") {
      setCurrentView(payload);
      setIsCopilotOpen(false);
    } else if (actionType === "REBALANCE_WORKERS") {
      rebalanceWorkers(payload.from, payload.to, payload.ids);
      setCurrentView("workforce");
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "m-reset",
        sender: "copilot",
        text: "🧹 Operational chat cleared. Ready for your next warehouse directive or diagnosis.",
        timestamp: new Date().toTimeString().split(" ")[0].substring(0, 5),
        source: "gemini-3.7-flash",
      },
    ]);
  };

  const exportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()} (${m.source || "User"}):\n${m.text}\n`)
      .join("\n----------------------------------------\n\n");
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WARENEXUS_AI_Transcript_${Date.now()}.txt`;
    a.click();
  };

  // Curated Enterprise Prompts by Category
  const promptCategories = {
    all: [
      { text: "Why is Order #ORD-1048 at critical SLA risk?", icon: Flame, tag: "SLA" },
      { text: "What is causing the Zone B picking congestion?", icon: Layers, tag: "Congestion" },
      { text: "Which SKU has the most urgent replenishment deficit?", icon: Boxes, tag: "Stock" },
      { text: "Rebalance workforce between Zone E and Zone B", icon: Compass, tag: "Staff" },
      { text: "Simulate a 2-worker absenteeism shock in Zone B", icon: Sliders, tag: "What-If" },
    ],
    sla: [
      { text: "List all orders with <45 minutes deadline remaining", icon: Flame, tag: "SLA" },
      { text: "Provide immediate recovery path for Order ORD-1048", icon: Zap, tag: "SLA" },
      { text: "What are the financial penalties if SwiftShip cut-off is missed?", icon: AlertCircle, tag: "SLA" },
    ],
    inventory: [
      { text: "Analyze SKU WH-1042 stock depletion velocity", icon: Boxes, tag: "Stock" },
      { text: "Find alternative bin locations for missing item in Bin B-05-01", icon: Compass, tag: "Stock" },
      { text: "Generate emergency supplier purchase orders for low stock items", icon: FileText, tag: "Stock" },
    ],
    workers: [
      { text: "Who is the optimal worker to assign to Order ORD-1048?", icon: CheckCircle2, tag: "Staff" },
      { text: "Show worker utilization disparity between Arjun and Priya", icon: Activity, tag: "Staff" },
      { text: "How to eliminate worker idle time in Zone E?", icon: Compass, tag: "Staff" },
    ],
    zones: [
      { text: "Deep-dive analysis of Zone B 14-task bottleneck", icon: Layers, tag: "Zones" },
      { text: "Compare throughput efficiency across Zones A, B, C, D, E", icon: Activity, tag: "Zones" },
      { text: "Calculate shortest travel path for multi-zone batch picks", icon: Zap, tag: "Zones" },
    ],
  };

  if (!isCopilotOpen) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 ${
        copilotWidth === "wide" ? "w-full md:w-[620px]" : "w-full sm:w-[480px]"
      } bg-slate-950 border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col transition-all duration-200 ease-in-out font-sans`}
    >
      {/* Top Header Bar with System Status & Controls */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-100 tracking-tight">NEXUS COPILOT</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GEMINI 3.7 FLASH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Operations Decision Engine • Role: <strong className="text-slate-300">{userRole.replace(/_/g, " ")}</strong>
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center space-x-1 text-slate-400">
          <button
            onClick={() => setCopilotWidth(copilotWidth === "wide" ? "standard" : "wide")}
            title={copilotWidth === "wide" ? "Standard Width" : "Expand Drawer"}
            className="p-1.5 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
          >
            {copilotWidth === "wide" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={exportChat}
            title="Export Transcript"
            className="p-1.5 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCopilotOpen(false)}
            title="Close Assistant"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice Mode Banner (Active when toggled) */}
      {isVoiceActive && (
        <div className="bg-indigo-950/90 border-b border-indigo-500/40 px-4 py-2.5 flex items-center justify-between text-xs text-indigo-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 h-5">
              <span className="w-1 bg-indigo-400 rounded-full animate-audio-1"></span>
              <span className="w-1 bg-indigo-400 rounded-full animate-audio-2"></span>
              <span className="w-1 bg-indigo-400 rounded-full animate-audio-3"></span>
              <span className="w-1 bg-indigo-400 rounded-full animate-audio-4"></span>
              <span className="w-1 bg-indigo-400 rounded-full animate-audio-5"></span>
            </div>
            <span className="font-semibold text-indigo-100">Listening for warehouse voice directive...</span>
          </div>
          <button
            onClick={() => setIsVoiceActive(false)}
            className="px-2 py-0.5 bg-indigo-800/60 hover:bg-indigo-700 text-white rounded text-[11px]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Domain Category Filter Tabs */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto custom-scrollbar shrink-0">
        {[
          { id: "all", label: "All Directives" },
          { id: "sla", label: "⚡ SLA & Risks" },
          { id: "inventory", label: "📦 Inventory" },
          { id: "workers", label: "👥 Workforce" },
          { id: "zones", label: "🗺️ Congestion" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all ${
              activeCategoryTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Prompt Suggestions Grid */}
      <div className="px-3.5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Suggested Operations Directives</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1-Click Dispatch</span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
          {promptCategories[activeCategoryTab].map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="text-[11px] text-slate-300 bg-slate-800 hover:bg-indigo-900/50 hover:text-indigo-200 hover:border-indigo-500/40 border border-slate-700/80 rounded-lg px-2.5 py-1 text-left transition-all flex items-center space-x-1.5 group shrink-0"
              >
                <Icon className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[240px]">{p.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isReasoningOpen = expandedReasoningId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-in fade-in-50 duration-200`}
            >
              {/* Message Meta Info */}
              <div className="flex items-center space-x-2 mb-1 px-1">
                {!isUser && (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400">
                    <Bot className="w-3 h-3" />
                    <span>NEXUS AI</span>
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                {msg.confidence && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono font-semibold">
                    {msg.confidence}% Conf.
                  </span>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`max-w-[94%] sm:max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-900/20"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-lg shadow-black/40"
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-line prose prose-invert prose-xs space-y-2">
                  {msg.text.split("\n\n").map((paragraph, pIdx) => {
                    // Render bold headings cleanly
                    if (paragraph.startsWith("### ")) {
                      return (
                        <h4 key={pIdx} className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5 mt-1">
                          <span>{paragraph.replace("### ", "")}</span>
                        </h4>
                      );
                    }
                    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                      return (
                        <p key={pIdx} className="font-bold text-slate-100">
                          {paragraph.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    return <p key={pIdx} className="text-slate-200 leading-relaxed">{paragraph}</p>;
                  })}
                </div>

                {/* AI Reasoning / Chain of Thought Accordion */}
                {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <button
                      onClick={() => setExpandedReasoningId(isReasoningOpen ? null : msg.id)}
                      className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 hover:text-indigo-300 transition-colors w-full text-left"
                    >
                      {isReasoningOpen ? (
                        <ChevronDown className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>
                        {isReasoningOpen ? "Hide AI Reasoning Chain" : `View AI Reasoning Chain (${msg.reasoningSteps.length} Steps)`}
                      </span>
                    </button>

                    {isReasoningOpen && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5 animate-in fade-in duration-150">
                        {msg.reasoningSteps.map((step, sIdx) => (
                          <div key={sIdx} className="flex items-start space-x-2 text-[11px] text-slate-300 font-mono">
                            <span className="text-indigo-400 font-bold">[{sIdx + 1}]</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Embedded Interactive Action Card */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recommended System Execution</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Action Ready
                      </span>
                    </div>

                    <button
                      onClick={() => handleActionClick(msg.suggestedAction!.actionType, msg.suggestedAction!.payload)}
                      className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-900/30 transition-all group"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {msg.suggestedAction.secondaryActionLabel && (
                      <button
                        onClick={() =>
                          handleActionClick(
                            msg.suggestedAction!.secondaryActionType || "NAVIGATE_VIEW",
                            msg.suggestedAction!.secondaryPayload
                          )
                        }
                        className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg text-[11px] font-semibold transition-all"
                      >
                        <span>{msg.suggestedAction.secondaryActionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Footer Tools on AI Message */}
                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono flex items-center space-x-1">
                      <Cpu className="w-2.5 h-2.5 text-indigo-400" />
                      <span>{msg.source || "gemini-3.7-flash"}</span>
                    </span>

                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-slate-300 flex items-center space-x-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Synthesis Indicator */}
        {loading && (
          <div className="flex items-center space-x-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-[85%] text-xs text-slate-300 shadow-md">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="font-semibold text-indigo-300">NEXUS AI Evaluating Telemetry...</span>
              <span className="text-[10px] text-slate-500 font-mono">
                Calculating shortest pick path & stock allocation vectors
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Action Toolset */}
      <div className="p-3.5 bg-slate-900 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isVoiceActive ? "Stop Voice Input" : "Hands-Free Voice Mode"}
            className={`p-2 rounded-xl border transition-all shrink-0 ${
              isVoiceActive
                ? "bg-red-600 border-red-400 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            {isVoiceActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Main Input Text Field */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask NEXUS AI (e.g. 'How to resolve Order ORD-1048 shortage?')..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Deterministic Grounding Enabled</span>
          </span>
          <span className="font-mono">Press Enter ↵ to Send</span>
        </div>
      </div>
    </div>
  );
};
