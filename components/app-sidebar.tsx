"use client"

import type * as React from "react"
import Image from "next/image"

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
import { sidebarData as data } from "../lib/sidebar-data"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <a href="#" className="flex flex-col items-start ms-2 mt-1.5 h-17">
          <Image
            src="/upfleet.png"
            alt="Upfleet"
            width={500}
            height={500}
            className="h-7 w-18"
          />
          <span className="text-sm font-semibold mt-2 text-gray-600">
            Shuttle Optimization
          </span>
        </a>
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
