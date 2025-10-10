"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useRouteManager } from "@/hooks/use-route-manager";
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
  Maximize,
} from "lucide-react";

interface Shuttle {
  id: string;
  service_name?: string;
  driver_name?: string;
  driver_phone?: string;
  morning_shift: string;
  evening_shift: string;
  capacity: number;
  map_url: string;
  coordinates?: string;
  distance_to_office?: number;
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
  walkingDistance?: number;
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
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Route manager hook for map functionality
  const { calculateRoute, setRoute, clearRoute, route } = useRouteManager();

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

        if (found) {
          // If no coordinates, generate pickup points from assigned employees
          if (!found.coordinates || !found.coordinates.includes(";")) {
            console.log(
              "No coordinates found for shuttle, generating from employee locations..."
            );

            // Get assignments for this shuttle
            const savedAssignments = localStorage.getItem("ShuttleAssignments");
            let shuttleCoordinates = "";

            if (savedAssignments) {
              try {
                const assignments = JSON.parse(savedAssignments);
                const thisShuttleAssignments = assignments.filter(
                  (a: any) => a.ShuttleId === found.id && a.status === "active"
                );

                if (thisShuttleAssignments.length > 0) {
                  // Get unique employee coordinates
                  const employeeCoords = thisShuttleAssignments
                    .map((a: any) => a.employee?.coordinates)
                    .filter((coord: string) => coord && coord.includes(","))
                    .slice(0, 5); // Max 5 pickup points

                  shuttleCoordinates = employeeCoords.join(";");
                  console.log(
                    `Generated coordinates for shuttle ${found.id}:`,
                    shuttleCoordinates
                  );
                } else {
                  console.log(
                    `No assignments found for shuttle ${found.id}, using default coordinates`
                  );
                }
              } catch (error) {
                console.error("Error generating coordinates:", error);
              }
            }

            // If no assignments, create default pickup points around Istanbul
            const defaultCoordinates =
              shuttleCoordinates ||
              [
                "41.0082,28.9784", // Kadıköy
                "41.0123,28.9856", // Beşiktaş
                "41.0067,28.9723", // Şişli
                "41.0156,28.9901", // Beyoğlu
                "41.0034,28.9654", // Üsküdar
              ].join(";");

            const updatedShuttle = {
              ...found,
              coordinates: defaultCoordinates,
            };

            console.log(
              `Final coordinates for shuttle ${found.id}:`,
              defaultCoordinates
            );
            setShuttle(updatedShuttle);
          } else {
            setShuttle(found);
          }
        } else {
          setShuttle(null);
        }
      } else {
        setShuttle(null);
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
      } else {
        setShuttleAssignments([]);
      }
    } catch (e) {
      console.error("Failed to read shuttle assignments from storage", e);
    }
  }, [shuttleId]);

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

  // Calculate walking distance between two coordinates (Haversine formula)
  const calculateWalkingDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return Math.round(R * c); // Distance in meters
    },
    []
  );

  const pickupPoints = useMemo(() => {
    const raw = shuttle?.coordinates?.trim() || "";
    console.log("Pickup points calculation - raw coordinates:", raw);
    console.log("Shuttle data:", shuttle);

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
    console.log("Coordinate parts:", parts);
    const points = parts
      .map((p, idx) => {
        const [latStr, lngStr] = p.split(",").map((s) => s.trim());
        const lat = Number.parseFloat(latStr);
        const lng = Number.parseFloat(lngStr);

        // Distribute employees more evenly across pickup points
        // Each point gets employees in a round-robin fashion
        const employeesPerPoint = Math.ceil(
          assignedEmployees.length / parts.length
        );
        const startIdx = idx * employeesPerPoint;
        const endIdx = Math.min(
          startIdx + employeesPerPoint,
          assignedEmployees.length
        );
        const pointAssignedEmployees = assignedEmployees.slice(
          startIdx,
          endIdx
        );

        // Calculate walking distance for each employee to this pickup point
        const employeesWithWalkingDistance = pointAssignedEmployees.map(
          (employee) => {
            const [empLat, empLng] = employee.coordinates
              .split(",")
              .map(Number);
            const walkingDistance = calculateWalkingDistance(
              empLat,
              empLng,
              lat,
              lng
            );
            return {
              ...employee,
              walkingDistance,
            };
          }
        );

        return {
          label: `Pickup Point #${idx + 1}`,
          lat,
          lng,
          assignedEmployees: employeesWithWalkingDistance,
        };
      })
      .filter((pt) => Number.isFinite(pt.lat) && Number.isFinite(pt.lng));
    console.log("Final pickup points:", points);
    return points;
  }, [shuttle?.coordinates, assignedEmployees, calculateWalkingDistance]);

  // Convert pickup points to format expected by HereMap component - only show when there are active assignments
  const mapPickupPoints = useMemo(() => {
    // Only show pickup points if there are active assignments
    if (assignedEmployees.length === 0) {
      return [];
    }

    const points = pickupPoints.map((point, index) => ({
      lat: point.lat,
      lng: point.lng,
      id: `pickup-${index}`,
      name: point.label,
    }));
    console.log("Map pickup points:", points);
    return points;
  }, [pickupPoints, assignedEmployees.length]);

  // Calculate route for the shuttle - only when there are active assignments
  const calculateShuttleRoute = useCallback(async () => {
    if (mapPickupPoints.length < 2 || assignedEmployees.length === 0) return;

    setIsCalculatingRoute(true);
    try {
      const routeCoordinates = await calculateRoute(mapPickupPoints);
      if (routeCoordinates) {
        setRoute(routeCoordinates);
      }
    } catch (error) {
      console.error("Error calculating shuttle route:", error);
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [mapPickupPoints, calculateRoute, setRoute, assignedEmployees.length]);

  // Calculate route when pickup points change - only if there are active assignments
  useEffect(() => {
    if (mapPickupPoints.length >= 2 && assignedEmployees.length > 0) {
      calculateShuttleRoute();
    } else {
      clearRoute();
    }
  }, [
    mapPickupPoints,
    calculateShuttleRoute,
    clearRoute,
    assignedEmployees.length,
  ]);

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
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">
              {shuttle?.service_name ?? "Shuttle Details"}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
              Shuttle details and route information.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 sm:ml-4">
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => router.push("/#shuttles")}
            >
              Back
            </Button>
          </div>
        </div>
      </SiteHeader>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-0 w-full">
            {/* Route Controls */}

            {/* Map ve Overview - Ayrı kartlar, aynı hizada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Overview Card */}
              <div className="h-auto lg:h-[500px] flex flex-col">
                <div className="pt-7 pb-4 flex-shrink-0">
                  <h3 className="pb-2 text-base sm:text-lg md:text-xl font-semibold">
                    {shuttle?.service_name ? `Overview` : "Shuttle Overview"}
                  </h3>
                  <p className="pb-4 text-xs sm:text-sm text-muted-foreground">
                    Key shuttle metrics and statistics.
                  </p>
                </div>
                {shuttle ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 h-full overflow-auto">
                    {/* Total Distance */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Total Distance
                        </CardTitle>
                        <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="ml-3 text-xl sm:text-3xl font-bold">
                          {shuttle.distance_to_office} km
                        </div>
                      </CardContent>
                    </Card>

                    {/* Duration */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Duration
                        </CardTitle>
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className=" ml-3 text-xl sm:text-3xl font-bold">
                          {estimatedDurationMin} min
                        </div>
                      </CardContent>
                    </Card>

                    {/* Passengers */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Passengers
                        </CardTitle>
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className=" ml-3 text-xl sm:text-3xl font-bold">
                          {passengers}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pickup Points */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Pickup Points
                        </CardTitle>
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="ml-3 text-xl sm:text-3xl font-bold">
                          {pickupPoints.length}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Occupancy Rate */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Occupancy
                        </CardTitle>
                        <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="ml-3 text-xl sm:text-3xl font-bold">
                          {occupancyRate}%
                        </div>
                      </CardContent>
                    </Card>

                    {/* Capacity */}
                    <Card className="col-span-1">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 sm:pb-1">
                        <CardTitle className="text-s sm:text-s font-medium text-muted-foreground">
                          Capacity
                        </CardTitle>
                        <Car className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="p-2 sm:p-3">
                        <div className="ml-3 text-xl sm:text-3xl font-bold">
                          {shuttle.capacity}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="py-6 text-sm text-muted-foreground text-center">
                    Shuttle not found in local data.
                  </div>
                )}
              </div>

              {/* Map Card */}
              <Card className="h-auto lg:h-[500px] flex flex-col">
                <CardHeader className="pb-0 flex-shrink-0">
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    Map
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Shuttle route area preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden p-1 sm:p-2">
                  <div className="h-[300px] sm:h-full w-full rounded-lg overflow-hidden border relative">
                    <HereMap
                      className="h-full w-full"
                      pickupPoints={mapPickupPoints}
                      route={route}
                      onPickupPointClick={(point) => {
                        // Find the corresponding pickup point and expand it
                        const pointIndex = mapPickupPoints.findIndex(
                          (p) => p.id === point.id
                        );
                        if (pointIndex !== -1) {
                          togglePointExpansion(pointIndex);
                        }
                      }}
                    />
                    {assignedEmployees.length === 0  }
                    {/* Full Screen Button - Aligned with HERE Maps controls */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-[10px] right-[10px] z-20 bg-white hover:bg-gray-50 shadow-md border border-gray-300 p-1 w-7 h-7 rounded"
                        >
                          <Maximize className="h-3.5 w-3.5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 sm:max-w-[95vw] ">
                        <DialogHeader className="text-base sm:text-lg md:text-xl pt-8 pl-4">
                          <DialogTitle>
                            {shuttle?.service_name
                              ? `${shuttle.service_name} - Route Map`
                              : "Route Map"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className=" w-full rounded-lg h-[calc(95vh-80px)] p-2 relative">
                          <HereMap
                            className="h-full w-full rounded-lg"
                            pickupPoints={mapPickupPoints}
                            route={route}
                            onPickupPointClick={(point) => {
                              // Find the corresponding pickup point and expand it
                              const pointIndex = mapPickupPoints.findIndex(
                                (p) => p.id === point.id
                              );
                              if (pointIndex !== -1) {
                                togglePointExpansion(pointIndex);
                              }
                            }}
                          />
                          {assignedEmployees.length === 0 && (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
                              <div className="text-center p-4">
                                <div className="text-muted-foreground text-sm mb-2">
                                  No active assignments
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Generate assignments in the Optimization tab
                                  to see routes
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Custom styles for HERE Maps controls */}
                    <style jsx>{`
                      :global(.H_ib_body) {
                        transform: scale(0.8) !important;
                        transform-origin: top right !important;
                      }
                      :global(.H_ib_horizontal) {
                        transform: scale(0.8) !important;
                        transform-origin: top right !important;
                      }
                      :global(.H_ib_body .H_ib_content) {
                        padding: 2px !important;
                      }
                    `}</style>
                  </div>
                  {isCalculatingRoute && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-muted-foreground">
                      Calculating route...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pickup Points */}
            <div className="mt-4 sm:mt-6 lg:mt-10">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    Pickup Points
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {assignedEmployees.length > 0
                      ? "List of pickup stops for this shuttle. Click to expand for details."
                      : "Generate assignments in the Optimization tab to see pickup points."}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {assignedEmployees.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground text-sm mb-2">
                        No assignments generated yet
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Go to the Optimization tab to generate assignments and
                        see pickup points
                      </div>
                    </div>
                  ) : pickupPoints.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No pickup points added yet.
                    </div>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
                      {pickupPoints.map((pt, idx) => (
                        <AccordionItem
                          key={`${pt.lat}-${pt.lng}-${idx}`}
                          value={`${idx}`}
                        >
                          <AccordionTrigger className="py-2 sm:py-3">
                            <div className="flex items-start gap-2 sm:gap-3 w-full">
                              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate text-sm sm:text-base">
                                  {pt.label}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Point #{idx + 1}
                                </div>
                              </div>

                              {/* sağ tarafta özet bilgileri rozet gibi gösterelim */}
                              <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
                                <div className="hidden sm:flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-xs"
                                  >
                                    {pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}
                                  </Badge>
                                  {pt.assignedEmployees.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      Avg:{" "}
                                      {Math.round(
                                        pt.assignedEmployees.reduce(
                                          (sum, emp) =>
                                            sum + (emp.walkingDistance || 0),
                                          0
                                        ) / pt.assignedEmployees.length
                                      )}
                                      m
                                    </Badge>
                                  )}
                                </div>
                                <Badge
                                  variant={
                                    pt.assignedEmployees.length > 0
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`text-xs ${
                                    pt.assignedEmployees.length > 0
                                      ? "bg-blue-100 text-blue-800"
                                      : ""
                                  }`}
                                >
                                  {pt.assignedEmployees.length} emp
                                  {pt.assignedEmployees.length !== 1 ? "s" : ""}
                                </Badge>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent>
                            {/* Expanded content: Assigned Employees table */}
                            {pt.assignedEmployees.length > 0 ? (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-muted-foreground">
                                    Assigned Employees (
                                    {pt.assignedEmployees.length})
                                  </h4>
                                </div>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[60px] sm:w-[80px] text-left text-xs sm:text-sm">
                                          ID
                                        </TableHead>
                                        <TableHead className="w-[100px] sm:w-[120px] text-left text-xs sm:text-sm">
                                          Name
                                        </TableHead>
                                        <TableHead className="w-[120px] sm:w-[150px] text-left text-xs sm:text-sm hidden sm:table-cell">
                                          Email
                                        </TableHead>
                                        <TableHead className="w-[140px] sm:w-[180px] text-left text-xs sm:text-sm">
                                          Address
                                        </TableHead>
                                        <TableHead className="w-[100px] sm:w-[140px] text-left text-xs sm:text-sm">
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
                                            <TableCell className="text-left">
                                              <div
                                                className="font-mono text-xs bg-muted px-1 sm:px-2 py-1 rounded"
                                                title={String(employee.id)}
                                              >
                                                {String(employee.id).length > 6
                                                  ? `${String(
                                                      employee.id
                                                    ).slice(0, 6)}...`
                                                  : String(employee.id)}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                              <div
                                                className="font-medium text-xs sm:text-sm truncate"
                                                title={employee.name || "N/A"}
                                              >
                                                {employee.name || "N/A"}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-left hidden sm:table-cell">
                                              <div
                                                className="text-xs sm:text-sm truncate"
                                                title={employee.email || "N/A"}
                                              >
                                                {employee.email || "N/A"}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                              <div className="text-xs sm:text-sm">
                                                <div
                                                  className="truncate max-w-[120px] sm:max-w-[250px]"
                                                  title={`${employee.address} (${employee.coordinates})`}
                                                >
                                                  {employee.address}
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                              <div className="text-xs sm:text-sm">
                                                {employee.walkingDistance ? (
                                                  <span className="font-medium">
                                                    {employee.walkingDistance <
                                                    1000
                                                      ? `${employee.walkingDistance}m`
                                                      : `${(
                                                          employee.walkingDistance /
                                                          1000
                                                        ).toFixed(1)}km`}
                                                  </span>
                                                ) : (
                                                  "—"
                                                )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No assigned employees for this point.
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
