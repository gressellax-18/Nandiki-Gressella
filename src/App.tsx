import React, { useState } from "react";
import { WarehouseProvider, useWarehouse } from "./context/WarehouseContext";
import { Header } from "./components/common/Header";
import { DemoBar } from "./components/common/DemoBar";
import { Sidebar } from "./components/common/Sidebar";
import { NexusCopilot } from "./components/common/NexusCopilot";
import { GlobalSearchModal } from "./components/common/GlobalSearchModal";
import { OrderDetailModal } from "./components/views/OrderDetailModal";

// Views
import { CommandCenterView } from "./components/views/CommandCenterView";
import { OrdersView } from "./components/views/OrdersView";
import { InventoryView } from "./components/views/InventoryView";
import { InventoryAllocationView } from "./components/views/InventoryAllocationView";
import { PickingControlView } from "./components/views/PickingControlView";
import { PackingCenterView } from "./components/views/PackingCenterView";
import { QualityControlView } from "./components/views/QualityControlView";
import { DispatchCenterView } from "./components/views/DispatchCenterView";
import { WorkforceView } from "./components/views/WorkforceView";
import { WarehouseMapView } from "./components/views/WarehouseMapView";
import { ExceptionsView } from "./components/views/ExceptionsView";
import { AiActionCenterView } from "./components/views/AiActionCenterView";
import { WhatIfLabView } from "./components/views/WhatIfLabView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { AuditLogsView } from "./components/views/AuditLogsView";
import { SettingsView } from "./components/views/SettingsView";
import { OrderTrackingView } from "./components/views/OrderTrackingView";
import { CustomerFeedbackView } from "./components/views/CustomerFeedbackView";

const MainContent: React.FC = () => {
  const { currentView } = useWarehouse();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case "command-center":
        return <CommandCenterView />;
      case "orders":
        return <OrdersView />;
      case "inventory":
        return <InventoryView />;
      case "allocation":
        return <InventoryAllocationView />;
      case "picking":
        return <PickingControlView />;
      case "packing":
        return <PackingCenterView />;
      case "qc":
        return <QualityControlView />;
      case "dispatch":
        return <DispatchCenterView />;
      case "tracking":
        return <OrderTrackingView />;
      case "feedback":
        return <CustomerFeedbackView />;
      case "workforce":
        return <WorkforceView />;
      case "map":
        return <WarehouseMapView />;
      case "exceptions":
        return <ExceptionsView />;
      case "ai-actions":
        return <AiActionCenterView />;
      case "what-if":
        return <WhatIfLabView />;
      case "analytics":
        return <AnalyticsView />;
      case "audit-logs":
        return <AuditLogsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      {/* Demo Simulation Bar */}
      <DemoBar />

      {/* Body Area with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>

      {/* AI Copilot Drawer */}
      <NexusCopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />

      {/* Global Modals */}
      <OrderDetailModal />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <MainContent />
    </WarehouseProvider>
  );
}
