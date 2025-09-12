"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconTruck, IconMapPin, IconClock } from "@tabler/icons-react"
import HereMap from "@/components/here-map"
import { useMemo, memo } from "react"

export const DashboardTab = memo(function DashboardTab() {
  return (
    <div className="space-y-6">
      

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shuttles</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+3 new routes this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Areas</CardTitle>
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Across Istanbul region</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Travel Time</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32 min</div>
            <p className="text-xs text-muted-foreground">-5 min from optimization</p>
          </CardContent>
        </Card>
      </div>

    

      <Card>
        
        <CardContent className="p-0">
          <HereMap className="h-[350px] w-full rounded-md border" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Optimizations</CardTitle>
            <CardDescription>Latest Shuttle route optimizations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Kadıköy - Levent Route</p>
                <p className="text-sm text-muted-foreground">Optimized 2 hours ago</p>
              </div>
              <Badge variant="secondary">-15% travel time</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Üsküdar - Maslak Route</p>
                <p className="text-sm text-muted-foreground">Optimized 5 hours ago</p>
              </div>
              <Badge variant="secondary">+8 employees</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Beylikdüzü - Zorlu Center</p>
                <p className="text-sm text-muted-foreground">Optimized yesterday</p>
              </div>
              <Badge variant="secondary">-12% cost</Badge>
            </div>
          </CardContent>
        </Card>

        
      </div>
    </div>
  )
})
