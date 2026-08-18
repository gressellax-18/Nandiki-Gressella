import React, { useState } from "react";
import { useWarehouse } from "../../context/WarehouseContext";
import {
  Sparkles,
  Zap,
  Flame,
  AlertTriangle,
  Users,
  Package,
  RotateCcw,
  Layers,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Play,
  CheckCircle2,
  Navigation,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export const DemoBar: React.FC = () => {
  const {
    triggerDemoSimulation,
    resetAllData,
    hackathonStoryStep,
    advanceHackathonStoryStep,
    operationalHealthScore,
    currentView,
    setCurrentView,
  } = useWarehouse();

  const [isStoryExpanded, setIsStoryExpanded] = useState<boolean>(false);

  const storySteps = [
    { step: 1, title: "Urgent Order (ORD-1048)", view: "orders" },
    { step: 2, title: "Stock Conflict Solver", view: "allocation" },
    { step: 3, title: "Worker Match (W-31)", view: "workforce" },
    { step: 4, title: "Shared-Zone Batch Pick", view: "picking" },
    { step: 5, title: "Missing Bin Re-route", view: "exceptions" },
    { step: 6, title: "5-Point QC Gate", view: "qc" },
    { step: 7, title: "Carrier Dispatch", view: "dispatch" },
    { step: 8, title: "Doorstep Transit", view: "tracking" },
    { step: 9, title: "Customer 3★ Feedback", view: "feedback" },
    { step: 10, title: "Closed-Loop 94% Recovery", view: "analytics" },
  ];

  return (
    <div className="bg-slate-900/95 border-b border-indigo-900/40 text-xs select-none backdrop-blur-sm sticky top-14 z-30 shadow-lg">
      <div className="px-4 py-2 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon 10-Step Story Controller */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40 text-[11px] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
            <span className="font-mono">CLOSED-LOOP HACKATHON STORY</span>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() =>
                advanceHackathonStoryStep(
                  hackathonStoryStep > 1 ? hackathonStoryStep - 1 : 10
                )
              }
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Previous Step"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => advanceHackathonStoryStep()}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[11px] shadow-sm transition-all"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {hackathonStoryStep === 0
                  ? "Start 10-Step Story"
                  : `Step ${hackathonStoryStep}/10: ${
                      storySteps[hackathonStoryStep - 1]?.title || "Next Step"
                    }`}
              </span>
            </button>

            <button
              onClick={() => advanceHackathonStoryStep()}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Next Step"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsStoryExpanded(!isStoryExpanded)}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-700 underline-offset-2 ml-1"
          >
            {isStoryExpanded ? "Hide Story Steps" : "View All 10 Steps"}
          </button>
        </div>

        {/* Right: Health Score & Quick Sim Triggers */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Live Operational Health Badge */}
          <div
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-mono text-[11px] font-bold ${
              operationalHealthScore >= 90
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : operationalHealthScore >= 75
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                operationalHealthScore >= 90
                  ? "bg-emerald-400"
                  : operationalHealthScore >= 75
                  ? "bg-amber-400"
                  : "bg-rose-400"
              }`}
            />
            <span>Control Health: {operationalHealthScore}%</span>
          </div>

          {/* Quick Trigger Pills */}
          <button
            onClick={() => triggerDemoSimulation("SIMULATE_STOCK_CONFLICT")}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded font-medium border border-purple-500/30 transition-colors text-[10px]"
          >
            Stock Conflict
          </button>

          <button
            onClick={() => triggerDemoSimulation("SIMULATE_ZONE_BOTTLENECK")}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-medium border border-amber-500/30 transition-colors text-[10px]"
          >
            Zone B Jam
          </button>

          <button
            onClick={() => triggerDemoSimulation("SIMULATE_MISSING_ITEM")}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-yellow-300 rounded font-medium border border-yellow-500/30 transition-colors text-[10px]"
          >
            Missing Bin
          </button>

          <button
            onClick={() => triggerDemoSimulation("SIMULATE_CUSTOMER_FEEDBACK")}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded font-medium border border-emerald-500/30 transition-colors text-[10px]"
          >
            3★ Feedback
          </button>

          <button
            onClick={resetAllData}
            className="px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-medium border border-slate-700 transition-colors text-[10px] flex items-center gap-1"
            title="Reset operational state to clean baseline"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Expanded 10-Step Interactive Story Stepper Map */}
      {isStoryExpanded && (
        <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold mb-2">
              Closed-Loop Story Flow (Click any step to jump & simulate):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 text-[10px]">
              {storySteps.map((s) => {
                const isActive = hackathonStoryStep === s.step;
                const isPassed = hackathonStoryStep > s.step;
                return (
                  <button
                    key={s.step}
                    onClick={() => advanceHackathonStoryStep(s.step)}
                    className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-indigo-600/30 border-indigo-500 text-white shadow-xs"
                        : isPassed
                        ? "bg-slate-900 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span>Step {s.step}</span>
                      {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <p className="font-semibold text-slate-200 mt-1 line-clamp-2 leading-tight">
                      {s.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

