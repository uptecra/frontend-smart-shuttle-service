<<<<<<< HEAD
"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import HereMap from "@/components/here-map"
import { SiteHeader } from "@/components/site-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Shuttle {
  id: string
  name: string
  morning_shift: string
  evening_shift: string
  capacity: number
  map_url: string
  coordinates: string
  distance_to_office: number
}

export default function ShuttleDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [shuttle, setShuttle] = useState<Shuttle | null>(null)
  const [passengers, setPassengers] = useState<number>(0)

  const shuttleId = useMemo(() => (typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : ""), [params])

  useEffect(() => {
    if (!shuttleId) return
    try {
      const saved = localStorage.getItem("Shuttles")
      if (saved) {
        const list: Shuttle[] = JSON.parse(saved)
        const found = list.find(s => s.id === shuttleId) || null
        setShuttle(found)
      }
    } catch (e) {
      console.error("Failed to read shuttle from storage", e)
    }
  }, [shuttleId])

  const pickupPoints = useMemo(() => {
    const raw = shuttle?.coordinates?.trim() || ""
    if (!raw) return [] as { label: string; lat: number; lng: number }[]
    const parts = raw.split(/[;|]/).map(p => p.trim()).filter(Boolean)
    const points = parts.map((p, idx) => {
      const [latStr, lngStr] = p.split(",").map(s => s.trim())
      const lat = Number.parseFloat(latStr)
      const lng = Number.parseFloat(lngStr)
      return { label: `Pickup #${idx + 1}`, lat, lng }
    }).filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lng))
    return points
  }, [shuttle?.coordinates])

  const occupancyRate = useMemo(() => {
    const cap = shuttle?.capacity ?? 0
    if (cap <= 0) return 0
    return Math.min(100, Math.max(0, Math.round((passengers / cap) * 100)))
  }, [passengers, shuttle?.capacity])

  const estimatedDurationMin = useMemo(() => {
    const dist = shuttle?.distance_to_office ?? 0
    return Math.round((dist / 30) * 60)
  }, [shuttle?.distance_to_office])

  return (
    <div className="space-y-6 ">
      <SiteHeader showTrigger={false}>
        <div className="flex w-full items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{shuttle?.name ?? "Shuttle Details"}</h2>
          <p className="text-muted-foreground">Service details and route information</p>
        </div>
         
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
            <Button asChild>
=======
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import HereMap from "@/components/here-map";
import { SiteHeader } from "@/components/site-header";
import {
  MapPin,
  Clock,
  Users,
  Navigation,
  Percent,
  Car,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface Shuttle {
  id: string;
  name: string;
  morning_shift: string;
  evening_shift: string;
  capacity: number;
  map_url: string;
  coordinates: string;
  distance_to_office: number;
}

interface Employee {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address: string;
  coordinates: string;
  distance_to_office: number;
  active?: boolean;
}

interface ShuttleAssignment {
  id: string;
  employeeId: string;
  employee: Employee;
  ShuttleId: string;
  Shuttle: Shuttle;
  assignedDate: string;
  status: "active" | "inactive";
}

export default function ShuttleDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [shuttle, setShuttle] = useState<Shuttle | null>(null);
  const [passengers, setPassengers] = useState<number>(0);
  const [expandedPoints, setExpandedPoints] = useState<Set<number>>(new Set());
  const [shuttleAssignments, setShuttleAssignments] = useState<
    ShuttleAssignment[]
  >([]);

  const shuttleId = useMemo(
    () =>
      typeof params?.id === "string"
        ? params.id
        : Array.isArray(params?.id)
        ? params?.id?.[0]
        : "",
    [params]
  );

  useEffect(() => {
    if (!shuttleId) return;
    try {
      const saved = localStorage.getItem("Shuttles");
      if (saved) {
        const list: Shuttle[] = JSON.parse(saved);
        const found = list.find((s) => s.id === shuttleId) || null;
        setShuttle(found);
      }
    } catch (e) {
      console.error("Failed to read shuttle from storage", e);
    }
  }, [shuttleId]);

  // Load shuttle assignments
  useEffect(() => {
    try {
      const savedAssignments = localStorage.getItem("ShuttleAssignments");
      if (savedAssignments) {
        const assignments: ShuttleAssignment[] = JSON.parse(savedAssignments);
        setShuttleAssignments(assignments);
      }
    } catch (e) {
      console.error("Failed to read shuttle assignments from storage", e);
    }
  }, []);

  // Get assigned employees for this shuttle
  const assignedEmployees = useMemo(() => {
    if (!shuttle?.id) return [];
    return shuttleAssignments
      .filter(
        (assignment) =>
          assignment.ShuttleId === shuttle.id && assignment.status === "active"
      )
      .map((assignment) => assignment.employee);
  }, [shuttle?.id, shuttleAssignments]);

  const pickupPoints = useMemo(() => {
    const raw = shuttle?.coordinates?.trim() || "";
    if (!raw)
      return [] as {
        label: string;
        lat: number;
        lng: number;
        assignedEmployees: Employee[];
      }[];
    const parts = raw
      .split(/[;|]/)
      .map((p) => p.trim())
      .filter(Boolean);
    const points = parts
      .map((p, idx) => {
        const [latStr, lngStr] = p.split(",").map((s) => s.trim());
        const lat = Number.parseFloat(latStr);
        const lng = Number.parseFloat(lngStr);

        // Find employees assigned to this specific pickup point
        // For now, we'll distribute employees evenly across pickup points
        // In a real implementation, you'd have specific pickup point assignments
        const pointAssignedEmployees =
          assignedEmployees.length > 0
            ? assignedEmployees.slice(idx, idx + 1) // Simple distribution for demo
            : [];

        return {
          label: `Pickup #${idx + 1}`,
          lat,
          lng,
          assignedEmployees: pointAssignedEmployees,
        };
      })
      .filter((pt) => Number.isFinite(pt.lat) && Number.isFinite(pt.lng));
    return points;
  }, [shuttle?.coordinates, assignedEmployees]);

  const occupancyRate = useMemo(() => {
    const cap = shuttle?.capacity ?? 0;
    if (cap <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((passengers / cap) * 100)));
  }, [passengers, shuttle?.capacity]);

  const estimatedDurationMin = useMemo(() => {
    const dist = shuttle?.distance_to_office ?? 0;
    return Math.round((dist / 30) * 60);
  }, [shuttle?.distance_to_office]);

  // Update passengers count based on assigned employees
  useEffect(() => {
    setPassengers(assignedEmployees.length);
  }, [assignedEmployees.length]);

  const togglePointExpansion = (index: number) => {
    setExpandedPoints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      <SiteHeader showTrigger={false}>
        <div className="-mx-4 lg:-mx-6 flex w-full items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {shuttle?.name ?? "Shuttle Details"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Shuttle details and route information
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Button asChild size="sm" className="text-xs sm:text-sm">
>>>>>>> b798db6 (pickup points 1)
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
<<<<<<< HEAD
          <div className="px-4 lg:px-6 max-w-4xl">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{shuttle ? `${shuttle.name} Overview` : "Shuttle Overview"}</CardTitle>
                    <CardDescription>Key service metrics.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {shuttle ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[500px]">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Total Distance (km)</CardDescription>
                            <CardTitle className="text-2xl">{shuttle.distance_to_office}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Estimated Duration (min)</CardDescription>
                            <CardTitle className="text-2xl">{estimatedDurationMin}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Passengers</CardDescription>
                            <CardTitle className="text-2xl">{passengers}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Pickup Points</CardDescription>
                            <CardTitle className="text-2xl">{pickupPoints.length}</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Occupancy Rate</CardDescription>
                            <CardTitle className="text-2xl">{occupancyRate}%</CardTitle>
                          </CardHeader>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardDescription>Capacity</CardDescription>
                            <CardTitle className="text-2xl">{shuttle.capacity}</CardTitle>
                          </CardHeader>
                        </Card>
                      </div>
                    ) : (
                      <div className="py-6 text-sm text-muted-foreground">Shuttle not found in local data.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Points</CardTitle>
                    <CardDescription>List of pickup stops for this service.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pickupPoints.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {pickupPoints.map((pt, idx) => (
                          <AccordionItem key={`${pt.lat}-${pt.lng}-${idx}`} value={`item-${idx}`}>
                            <AccordionTrigger>{pt.label}</AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm">
                                <div><span className="text-muted-foreground">Latitude:</span> {pt.lat}</div>
                                <div><span className="text-muted-foreground">Longitude:</span> {pt.lng}</div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-sm text-muted-foreground">No pickup points available.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Map</CardTitle>
                    <CardDescription>Service route area preview.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HereMap
                      className="h-71 w-full "
                      center={pickupPoints[0] ? { lat: pickupPoints[0].lat, lng: pickupPoints[0].lng } : undefined}
                      zoom={pickupPoints[0] ? 12 : 11}
                    />
                  </CardContent>
                </Card>
              </div>
=======
          <div className="px-0 w-full">
            {/* Map ve Overview - Ayrı kartlar, aynı hizada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Overview Card */}
              <Card className="h-auto lg:h-[500px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl">
                    {shuttle ? `${shuttle.name} Overview` : "Shuttle Overview"}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Key shuttle metrics and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden">
                  {shuttle ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 h-full overflow-auto">
                      {/* Total Distance */}
                      <Card>
                        <CardContent className="p-1 sm:p-1">
                          <div className="flex items-center">
                            <Navigation className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
                            <div className="pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Total Distance
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {shuttle.distance_to_office} km
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Duration */}
                      <Card>
                        <CardContent className="p-1 sm:p-1.5">
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                            <div className=" pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Duration
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {estimatedDurationMin} min
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Passengers */}
                      <Card>
                        <CardContent className="p-1 sm:p-1.5">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 flex-shrink-0" />
                            <div className="pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Passengers
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {passengers}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pickup Points */}
                      <Card>
                        <CardContent className="p-1 sm:p-1.5">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 flex-shrink-0" />
                            <div className="pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Pickup Points
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {pickupPoints.length}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Occupancy Rate */}
                      <Card>
                        <CardContent className="p-1 sm:p-1.5">
                          <div className="flex items-center">
                            <Percent className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0" />
                            <div className="pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Occupancy Rate
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {occupancyRate}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Capacity */}
                      <Card>
                        <CardContent className="p-1 sm:p-1.5">
                          <div className="flex items-center">
                            <Car className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
                            <div className="pl-2 min-w-0 flex-1">
                              <div className="pl-2 text-xs sm:text-sm text-muted-foreground">
                                Capacity
                              </div>
                              <div className="text-base sm:text-lg font-bold pl-2">
                                {shuttle.capacity}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="py-6 text-sm text-muted-foreground text-center">
                      Shuttle not found in local data.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Card */}
              <Card className="h-auto lg:h-[500px] flex flex-col">
                <CardHeader className="pb-0 flex-shrink-0">
                  <CardTitle className="text-lg sm:text-xl">Map</CardTitle>
                  <CardDescription className="text-sm">
                    Shuttle route area preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden p-2">
                  <div className="h-full w-full rounded-lg overflow-hidden border">
                    <HereMap
                      className="h-full w-full"
                      center={
                        pickupPoints[0]
                          ? {
                              lat: pickupPoints[0].lat,
                              lng: pickupPoints[0].lng,
                            }
                          : undefined
                      }
                      zoom={pickupPoints[0] ? 12 : 11}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pickup Points - Table View */}
            <div className="mt-6 lg:mt-10">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">
                    Pickup Points
                  </CardTitle>
                  <CardDescription className="text-sm">
                    List of pickup stops for this shuttle. Click to expand for
                    details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pickupPoints.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pickup Point</TableHead>
                            <TableHead>Coordinates</TableHead>
                            <TableHead>Assigned Employees</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pickupPoints.map((pt, idx) => {
                            const isExpanded = expandedPoints.has(idx);
                            return (
                              <>
                                <TableRow
                                  key={`${pt.lat}-${pt.lng}-${idx}`}
                                  className="hover:bg-muted/50"
                                >
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-orange-600" />
                                      <div>
                                        <div className="font-medium">
                                          {pt.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Point #{idx + 1}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-mono text-sm">
                                      {pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-4 w-4 text-black" />
                                      <span className="text-sm">
                                        {pt.assignedEmployees.length}{" "}
                                        employee(s)
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => togglePointExpansion(idx)}
                                      className="h-8 w-8 p-0"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                {isExpanded && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="p-0">
                                      <div className="bg-muted/30 p-4 border-t">
                                        <div className="space-y-4">
                                          {/* Coordinates Details */}

                                          {/* Assigned Employees */}
                                          <div>
                                            {pt.assignedEmployees.length > 0 ? (
                                              <div className="overflow-x-auto">
                                                <Table>
                                                  <TableHeader>
                                                    <TableRow>
                                                      <TableHead className="w-1/7 text-left">
                                                        ID
                                                      </TableHead>
                                                      <TableHead className="w-1/7 text-left">
                                                        Name
                                                      </TableHead>
                                                      <TableHead className="w-1/7 text-left">
                                                        Email
                                                      </TableHead>
                                                      <TableHead className="w-1/4 text-left">
                                                        Address
                                                      </TableHead>
                                                      <TableHead className="w-1/7 text-left">
                                                        Walking Distance
                                                      </TableHead>
                                                    </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                    {pt.assignedEmployees.map(
                                                      (
                                                        employee: Employee,
                                                        empIdx: number
                                                      ) => (
                                                        <TableRow
                                                          key={`${employee.id}-${empIdx}`}
                                                          className="hover:bg-muted/50"
                                                        >
                                                          <TableCell className="w-1/5 text-left">
                                                            <div
                                                              className="font-medium text-sm truncate"
                                                              title={
                                                                employee.id
                                                              }
                                                            >
                                                              {employee.id}
                                                            </div>
                                                          </TableCell>
                                                          <TableCell className="w-1/5 text-left">
                                                            <div
                                                              className="font-medium text-sm truncate"
                                                              title={
                                                                employee.name ||
                                                                "N/A"
                                                              }
                                                            >
                                                              {employee.name ||
                                                                "N/A"}
                                                            </div>
                                                          </TableCell>
                                                          <TableCell className="w-1/5 text-left">
                                                            <div
                                                              className="text-sm truncate"
                                                              title={
                                                                employee.email ||
                                                                "N/A"
                                                              }
                                                            >
                                                              {employee.email ||
                                                                "N/A"}
                                                            </div>
                                                          </TableCell>
                                                          <TableCell className="w-1/5 text-left">
                                                            <div className="text-sm">
                                                              <div
                                                                className="truncate max-w-[200px]"
                                                                title={`${employee.address} (${employee.coordinates})`}
                                                              >
                                                                {
                                                                  employee.address
                                                                }
                                                              </div>
                                                              <div className="font-mono text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                                                                {
                                                                  employee.coordinates
                                                                }
                                                              </div>
                                                            </div>
                                                          </TableCell>
                                                          <TableCell className="w-1/5 text-left">
                                                            <div
                                                              className="text-sm font-medium"
                                                              title={`${employee.distance_to_office} km from office`}
                                                            >
                                                              {
                                                                employee.distance_to_office
                                                              }{" "}
                                                              km
                                                            </div>
                                                          </TableCell>
                                                        </TableRow>
                                                      )
                                                    )}
                                                  </TableBody>
                                                </Table>
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 text-muted-foreground">
                                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <div className="text-sm">
                                                  No employees assigned to this
                                                  pickup point
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-8">
                      No pickup points available.
                    </div>
                  )}
                </CardContent>
              </Card>
>>>>>>> b798db6 (pickup points 1)
            </div>
          </div>
        </div>
      </div>
    </div>
<<<<<<< HEAD
  )
}


=======
  );
}
>>>>>>> b798db6 (pickup points 1)
