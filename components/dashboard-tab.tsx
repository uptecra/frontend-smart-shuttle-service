"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IconUsers, IconTruck, IconMapPin, IconClock, IconFlag, IconChargingPile, IconGauge } from "@tabler/icons-react"
import HereMap from "@/components/here-map"
import { useMemo, memo, useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Bus, MapPin } from "lucide-react"

// Removed mock pickup data

export const DashboardTab = memo(function DashboardTab() {
  const [optimizedAssignments, setOptimizedAssignments] = useState<any[]>([])

  const center = { lat: 41.085, lng: 29.01 }
  const zoom = 11

  // Post-optimization metrics
  const assignmentsByService = useMemo(() => {
    return optimizedAssignments.reduce((acc: Record<string, any[]>, a: any) => {
      const name = a?.Shuttle?.name ?? 'Service'
      if (!acc[name]) acc[name] = []
      acc[name].push(a)
      return acc
    }, {} as Record<string, any[]>)
  }, [optimizedAssignments])

  const totalServices = useMemo(() => Object.keys(assignmentsByService).length, [assignmentsByService])
  const totalEmployees = optimizedAssignments.length
  const totalStops = totalServices
  const averageWalkingDistanceMeters = 450

  // Mock occupancy (assumes 12 seats per service)
  const capacityPerService = 12
  const occupancyRate = Math.min(100, Math.round((totalEmployees / (totalServices * capacityPerService)) * 100))

  // Load optimized shuttle assignments (read-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ShuttleAssignments')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setOptimizedAssignments(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load optimized assignments', e)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Map with top-left compact summary overlay */}
      <Card className="py-0 overflow-hidden">
        <div className="relative">
          <CardContent className="p-0 h-[400px]">
            <HereMap className="absolute inset-0" center={center} zoom={zoom} />
          </CardContent>

          <div className="pointer-events-auto absolute left-3 top-3 z-10 w-[min(92vw,260px)]">
            <div>
              <div className="p-2 ">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border bg-white p-3">
                    <div className="flex items-start gap-2">
                      <IconTruck className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Total Shuttles</div>
                        <div className="mt-0.5 text-lg font-semibold">{totalServices}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border bg-white p-3">
                    <div className="flex items-start gap-2">
                      <IconMapPin className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Pickup Points</div>
                        <div className="mt-0.5 text-lg font-semibold">{totalStops}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border bg-white p-3">
                    <div className="flex items-start gap-2">
                      <IconUsers className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Avg. Walking Distance</div>
                        <div className="mt-0.5 text-lg font-semibold">{averageWalkingDistanceMeters} m</div>
                      </div>
                    </div>
                  </div>
                 
                  <div className="rounded-md border bg-white p-3">
                    <div className="flex items-start gap-2">
                      <IconGauge className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-xs text-muted-foreground">Capacity Utilization
                        </div>
                        <div className="mt-0.5 text-lg font-semibold">{occupancyRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* No selected pickup (mock removed) */}

          </div>
        </div>
          </div>
        </div>
      </Card>

      {/* Optimized shuttles and assigned employees (same as Optimization tab view) */}
        <Card>
          <CardHeader>
          <CardTitle>Optimized Shuttles</CardTitle>
          <CardDescription>View shuttles and their assigned employees</CardDescription>
          </CardHeader>
        <CardContent>
          {Object.keys(assignmentsByService).length === 0 ? (
            <div className="text-sm text-muted-foreground">No optimized services found. Generate assignments in Optimization tab.</div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(assignmentsByService).map(([serviceName, assignments]) => (
                <AccordionItem key={serviceName} value={serviceName}>
                  <AccordionTrigger className="py-3">
                    <div className="flex items-start gap-3 w-full">
                      <Bus className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{serviceName}</div>
                        <div className="text-xs text-muted-foreground">{assignments.length} employees</div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant="secondary">{assignments[0]?.Shuttle?.morning_shift ?? '—'}</Badge>
                        <Badge variant="secondary">{assignments[0]?.Shuttle?.evening_shift ?? '—'}</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Coordinates</TableHead>
                          <TableHead>Distance to Office</TableHead>
                          <TableHead>Morning Shift</TableHead>
                          <TableHead>Evening Shift</TableHead>
                          <TableHead>Assigned Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.employee?.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3" />
                                <span className="max-w-[200px] truncate">{a.employee?.address}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{a.employee?.coordinates}</TableCell>
                            <TableCell>{a.employee?.distance_to_office} km</TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignments[0]?.Shuttle?.morning_shift}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignments[0]?.Shuttle?.evening_shift}</Badge>
                            </TableCell>
                            <TableCell>{a.assignedDate ? new Date(a.assignedDate).toLocaleDateString('en-US') : '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          </CardContent>
        </Card>
    </div>
  )
})