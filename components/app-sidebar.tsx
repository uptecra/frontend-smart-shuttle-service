"use client"

import type * as React from "react"
import Image from "next/image"
import {
  IconUsers,
  IconTruck,
  IconChartBar,
  IconDashboard,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUserPlus,
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
  SidebarMenuSubItem,
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
          icon: IconUserPlus,
        }
      ]
    },
    {
      title: "Shuttles",
      url: "#",
      icon: IconTruck,
      key: "Shuttles",
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
          <SidebarMenuSubItem className="data-[slot=sidebar-menu-button]:! mt-1.5 h-15 ">
  <a href="#" className="flex flex-col items-start ms-2">
    <Image 
      src="/upfleet.png" 
      alt="Upfleet" 
      width={500} 
      height={500} 
      className="h-7 w-18" 
    />
    <span className="text-sm font-semibold mt-1 text-gray-600">
      Shuttle Optimization
    </span>
  </a>
</SidebarMenuSubItem>

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
