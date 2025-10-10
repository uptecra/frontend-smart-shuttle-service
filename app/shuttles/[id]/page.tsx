"use client";

import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import ShuttleDetails from "@/components/shuttles-details";

export default function Page() {
  const router = useRouter();

  const handleNavigation = (tab: string) => {
    switch (tab) {
      case "dashboard":
        router.push("/");
        break;
      case "employees":
        router.push("/#employees");
        break;
      case "shuttles":
        router.push("/#shuttles");
        break;
      case "optimization":
        router.push("/#optimization");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab="Shuttles" setActiveTab={handleNavigation} />
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
}
