<<<<<<< HEAD
"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { EmployeesTab } from "@/components/employees-tab"
import AddEmployeeTab from "@/components/add-employee-tab"
import { ShuttlesTab } from "@/components/shuttles-tab"
import { OptimizationTab } from "@/components/optimization-tab"
import { ProtectedRoute } from "@/components/auth/protected-route"

import ShuttleDetails from "@/components/shuttles-details"

export default function Page() {
 
  const [activeTab, setActiveTab] = useState("dashboard")

  // Sync hash -> activeTab
  useEffect(() => {
    const applyFromHash = () => {
      const raw = (window.location.hash || "").replace(/^#/, "")
      const [hash] = raw.split("?")
      if (hash) setActiveTab(hash)
    }
    applyFromHash()
    window.addEventListener("hashchange", applyFromHash)
    return () => window.removeEventListener("hashchange", applyFromHash)
  }, [])

  // Memoized tab rendering for better performance
  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case "employees":
        return <EmployeesTab />
      case "add-employee":
        return <AddEmployeeTab />
      case "Shuttles":
        return <ShuttlesTab />
      case "optimization":
        return <OptimizationTab />
      default:
        return null
    }
  }, [activeTab])

  // Memoized active tab component to prevent unnecessary re-renders
  const ActiveTabComponent = useMemo(() => renderActiveTab(), [renderActiveTab])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex min-h-0 flex-1 overflow-hidden">
  <div className="flex items-start  py-3">
    <SidebarTrigger className="inline-flex h-10 w-10 p-0 items-center justify-center" />
  </div>

  <div className="flex-1 overflow-auto p-4">
    {ActiveTabComponent}
    <div className="">
      <ShuttleDetails />
    </div>
  </div>
</main>

      </SidebarProvider>
    </ProtectedRoute>
  )
=======
"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import ShuttleDetails from "@/components/shuttles-details";

export default function Page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab="Shuttles" setActiveTab={() => {}} />
        <main className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex items-start py-3">
            <SidebarTrigger className="inline-flex h-10 w-10 p-0 items-center justify-center" />
          </div>

          <div className="flex-1 overflow-auto p-4">
            <ShuttleDetails />
          </div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  );
>>>>>>> b798db6 (pickup points 1)
}
