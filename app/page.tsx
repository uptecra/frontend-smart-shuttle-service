"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { EmployeesTab } from "@/components/employees-tab";
import AddEmployeeTab from "@/components/add-employee-tab";
import { ShuttlesTab } from "@/components/shuttles-tab";
import AddShuttleTab from "@/components/add-shuttle-tab";
import { OptimizationTab } from "@/components/optimization-tab";
import { DashboardTab } from "@/components/dashboard-tab";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employeesKey, setEmployeesKey] = useState(0);

  // Sync hash -> activeTab
  useEffect(() => {
    const applyFromHash = () => {
      const raw = (window.location.hash || "").replace(/^#/, "");
      const [hash] = raw.split("?");
      if (hash) {
        setActiveTab(hash);
        // If switching to employees tab, refresh it
        if (hash === "employees") {
          setEmployeesKey((prev) => prev + 1);
        }
      } else {
        setActiveTab("dashboard");
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  // Memoized tab rendering for better performance
  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "employees":
        return <EmployeesTab key={employeesKey} />;
      case "add-employee":
        return <AddEmployeeTab />;
      case "shuttles":
        return <ShuttlesTab setActiveTab={setActiveTab} />;
      case "add-shuttle":
        return <AddShuttleTab setActiveTab={setActiveTab} />;
      case "optimization":
        return <OptimizationTab />;
      default:
        return <DashboardTab />;
    }
  }, [activeTab]);

  // Memoized active tab component to prevent unnecessary re-renders
  const ActiveTabComponent = useMemo(
    () => renderActiveTab(),
    [renderActiveTab]
  );

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex items-start  py-3">
            <SidebarTrigger className="inline-flex h-10 w-10 p-0 items-center justify-center" />
          </div>

          <div className="flex-1 overflow-auto p-4">{ActiveTabComponent}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
