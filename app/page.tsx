"use client"

import { useState, useCallback, useMemo } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { EmployeesTab } from "@/components/employees-tab"
import { ServicesTab } from "@/components/services-tab"
import { OptimizationTab } from "@/components/optimization-tab"
import { DashboardTab } from "@/components/dashboard-tab"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // Memoized tab rendering for better performance
  const renderActiveTab = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />
      case "employees":
      case "add-employee":
        return <EmployeesTab />
      case "services":
        return <ServicesTab />
      case "optimization":
        return <OptimizationTab />
      default:
        return <DashboardTab />
    }
  }, [activeTab])

  // Memoized active tab component to prevent unnecessary re-renders
  const ActiveTabComponent = useMemo(() => renderActiveTab(), [renderActiveTab])

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 flex-1">
              <h1 className="text-lg font-semibold">Zorlu Holding - Service Optimization Dashboard</h1>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4">{ActiveTabComponent}</div>
        </main>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
