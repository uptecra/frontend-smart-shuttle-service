"use client"

import type * as React from "react"
import {
  IconUsers,
  IconTruck,
  IconChartBar,
  IconDashboard,
  IconSettings,
  IconHelp,
  IconSearch,
  IconBuildingFactory2,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@zorluholding.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
 
    {
      title: "Employees",
      url: "#",
      icon: IconUsers,
      key: "employees",
      subItems: [
        {
          title: "Add Employee",
          url: "#",
          key: "add-employee",
        }
      ]
    },
    {
      title: "Services",
      url: "#",
      icon: IconTruck,
      key: "services",
    },
    {
      title: "Optimization",
      url: "#",
      icon: IconChartBar,
      key: "optimization",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconBuildingFactory2 className="!size-5" />
                <span className="text-base font-semibold">Zorlu Holding</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} activeTab={activeTab} setActiveTab={setActiveTab} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
