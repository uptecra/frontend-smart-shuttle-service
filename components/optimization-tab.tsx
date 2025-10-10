"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Users, Bus, MapPin, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";

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

interface Shuttle {
  id: string;
  name?: string;
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

interface ShuttleAssignment {
  id: string;
  employeeId: string;
  employee: Employee;
  ShuttleId: string;
  Shuttle: Shuttle;
  assignedDate: string;
  status: "active" | "inactive";
}

export const OptimizationTab = memo(function OptimizationTab() {
  const [viewMode, setViewMode] = useState<"shuttle" | "employee">("shuttle");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shuttles, setShuttles] = useState<Shuttle[]>([]);
  const [shuttleAssignments, setShuttleAssignments] = useState<
    ShuttleAssignment[]
  >([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Optimized data loading with useCallback
  const loadData = useCallback(() => {
    try {
      console.log("=== Loading data from localStorage ===");
      
      // Load employees
      const savedEmployees = localStorage.getItem("employees");
      console.log("Employees key exists:", !!savedEmployees);
      console.log("Employees raw data:", savedEmployees);
      
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        console.log("Parsed employees:", parsedEmployees);
        if (Array.isArray(parsedEmployees)) {
          console.log("✅ Loaded employees:", parsedEmployees.length);
          console.log("First employee sample:", parsedEmployees[0]);
          setEmployees(parsedEmployees);
        } else {
          console.warn("❌ Employees data is not an array:", typeof parsedEmployees);
        }
      } else {
        console.warn("❌ No employees data found in localStorage");
      }

      // Load shuttles
      const savedShuttles = localStorage.getItem("Shuttles");
      console.log("Shuttles key exists:", !!savedShuttles);
      console.log("Shuttles raw data:", savedShuttles);
      
      if (savedShuttles) {
        const parsedShuttles = JSON.parse(savedShuttles);
        console.log("Parsed shuttles:", parsedShuttles);
        if (Array.isArray(parsedShuttles)) {
          console.log("✅ Loaded shuttles:", parsedShuttles.length);
          console.log("First shuttle sample:", parsedShuttles[0]);
          setShuttles(parsedShuttles);
        } else {
          console.warn("❌ Shuttles data is not an array:", typeof parsedShuttles);
        }
      } else {
        console.warn("❌ No shuttles data found in localStorage");
      }

      // Load assignments
      const savedAssignments = localStorage.getItem("ShuttleAssignments");
      if (savedAssignments) {
        const parsedAssignments = JSON.parse(savedAssignments);
        if (Array.isArray(parsedAssignments)) {
          console.log("✅ Loaded assignments:", parsedAssignments.length);
          setShuttleAssignments(parsedAssignments);
        }
      }
      
      console.log("=== Data loading completed ===");
    } catch (error) {
      console.error("❌ Error loading data:", error);
    }
  }, []);

  // Load data from localStorage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save assignments to localStorage with useCallback for performance
  const saveAssignmentsToStorage = useCallback(
    (assignments: ShuttleAssignment[]) => {
      try {
        localStorage.setItem("ShuttleAssignments", JSON.stringify(assignments));
      } catch (error) {
        console.error("Error saving assignments:", error);
      }
    },
    []
  );

  // Optimized assignment generation with better algorithm
  const generateOptimizedAssignments = useCallback(() => {
    console.log("=== generateOptimizedAssignments called ===");
    console.log("Employees available:", employees.length);
    console.log("Shuttles available:", shuttles.length);
    
    if (employees.length === 0 || shuttles.length === 0) {
      console.error("❌ Cannot generate assignments: missing data");
      return;
    }

    setIsOptimizing(true);
    console.log("🔄 Starting optimization process...");

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const newAssignments: ShuttleAssignment[] = [];
      const shuttleCapacityMap = new Map<string, number>();

      // Initialize capacity map for O(1) lookups (will be updated with valid shuttles later)
      shuttles.forEach((shuttle) => {
        shuttleCapacityMap.set(shuttle.id, shuttle.capacity || 0);
      });

      // Process and validate imported data
      const validEmployees = employees
        .filter(emp => emp && emp.id && emp.address) // Valid employee must have id and address
        .map(emp => ({
          ...emp,
          distance_to_office: emp.distance_to_office || 0,
          name: emp.name || `Employee ${emp.id}`,
          coordinates: emp.coordinates || "",
          active: emp.active !== false
        }));
      
      const validShuttles = shuttles
        .filter(shuttle => shuttle && shuttle.id && shuttle.capacity > 0) // Valid shuttle must have id and capacity
        .map(shuttle => ({
          ...shuttle,
          name: shuttle.name || shuttle.service_name || `Shuttle ${shuttle.id}`,
          distance_to_office: shuttle.distance_to_office || 0,
          coordinates: shuttle.coordinates || "",
          morning_shift: shuttle.morning_shift || "08:00",
          evening_shift: shuttle.evening_shift || "18:00",
          map_url: shuttle.map_url || ""
        }));
      
      console.log("Valid employees sample:", validEmployees.slice(0, 2));
      console.log("Valid shuttles sample:", validShuttles.slice(0, 2));
      console.log(`Filtered: ${validEmployees.length}/${employees.length} employees, ${validShuttles.length}/${shuttles.length} shuttles`);
      
      // Update capacity map with valid shuttles
      shuttleCapacityMap.clear();
      validShuttles.forEach((shuttle) => {
        shuttleCapacityMap.set(shuttle.id, shuttle.capacity);
        console.log(`Valid Shuttle ${shuttle.id} (${shuttle.name}): capacity ${shuttle.capacity}`);
      });
      
      console.log("Total valid shuttle capacity:", Array.from(shuttleCapacityMap.values()).reduce((a, b) => a + b, 0));

      // Sort employees by distance for better optimization
      const sortedEmployees = [...validEmployees].sort(
        (a, b) => a.distance_to_office - b.distance_to_office
      );

      // Sort shuttles by distance for better matching  
      const sortedShuttles = [...validShuttles].sort(
        (a, b) => a.distance_to_office - b.distance_to_office
      );
      
      console.log("Sorted employees count:", sortedEmployees.length);
      console.log("Sorted shuttles count:", sortedShuttles.length);

      // Optimized assignment algorithm
      console.log("🔄 Starting assignment loop...");
      let assignedCount = 0;
      
      for (const employee of sortedEmployees) {
        let bestShuttle = null;
        let minDistanceDiff = Infinity;

        // Find best shuttle with available capacity
        for (const shuttle of sortedShuttles) {
          const currentCapacity = shuttleCapacityMap.get(shuttle.id) || 0;
          if (currentCapacity > 0) {
            const distanceDiff = Math.abs(
              shuttle.distance_to_office - employee.distance_to_office
            );
            if (distanceDiff < minDistanceDiff) {
              minDistanceDiff = distanceDiff;
              bestShuttle = shuttle;
            }
          }
        }

        if (bestShuttle) {
          const assignment: ShuttleAssignment = {
            id: `assignment-${Date.now()}-${employee.id}`,
            employeeId: employee.id,
            employee: employee,
            ShuttleId: bestShuttle.id,
            Shuttle: bestShuttle,
            assignedDate: new Date().toISOString().split("T")[0],
            status: "active",
          };

          newAssignments.push(assignment);
          assignedCount++;
          
          // Update capacity
          shuttleCapacityMap.set(
            bestShuttle.id,
            (shuttleCapacityMap.get(bestShuttle.id) || 0) - 1
          );
          
          if (assignedCount <= 5) {
            console.log(`Assignment ${assignedCount}: Employee ${employee.id} → Shuttle ${bestShuttle.id}`);
          }
        } else {
          if (assignedCount <= 5) {
            console.warn(`❌ No available shuttle for employee ${employee.id}`);
          }
        }
      }
      
      console.log(`📊 Assignment summary: ${assignedCount}/${sortedEmployees.length} employees assigned`);

      console.log(`✅ Generated ${newAssignments.length} assignments`);
      console.log("Sample assignments:", newAssignments.slice(0, 3));
      
      setShuttleAssignments(newAssignments);
      saveAssignmentsToStorage(newAssignments);
      setIsOptimizing(false);
      
      console.log("🎉 Optimization completed!");
    });
  }, [employees, shuttles, saveAssignmentsToStorage]);

  // Clear assignments only (keep imported data)
  const clearAssignments = useCallback(() => {
    try {
      localStorage.removeItem('ShuttleAssignments');
      setShuttleAssignments([]);
      console.log("Assignments cleared, keeping imported data");
    } catch (error) {
      console.error("Error clearing assignments:", error);
    }
  }, []);

  // Optimized export function with useCallback
  const exportAssignments = useCallback(() => {
    if (shuttleAssignments.length === 0) return;

    const headers = [
      "Employee ID",
      "Employee Address",
      "Employee Coordinates",
      "Employee Distance to Office",
      "Shuttle Name",
      "Shuttle Morning Shift",
      "Shuttle Evening Shift",
      "Shuttle Capacity",
      "Shuttle Coordinates",
      "Shuttle Distance to Office",
      "Assigned Date",
      "Status",
    ];

    // Prepare data for Excel
    const excelData = [
      headers,
      ...shuttleAssignments.map((assignment) => [
        assignment.employee.id,
        assignment.employee.address,
        assignment.employee.coordinates,
        assignment.employee.distance_to_office,
        assignment.Shuttle.name,
        assignment.Shuttle.morning_shift,
        assignment.Shuttle.evening_shift,
        assignment.Shuttle.capacity,
        assignment.Shuttle.coordinates,
        assignment.Shuttle.distance_to_office,
        assignment.assignedDate,
        assignment.status,
      ]),
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shuttle Assignments");

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download the file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shuttle-assignments.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  }, [shuttleAssignments]);

  // Memoized data processing for better performance
  const assignmentsByShuttle = useMemo(() => {
    return shuttleAssignments.reduce((acc, assignment) => {
      const shuttleName = assignment.Shuttle.name || assignment.Shuttle.service_name || `Shuttle ${assignment.Shuttle.id}`;
      if (!acc[shuttleName]) {
        acc[shuttleName] = [];
      }
      acc[shuttleName].push(assignment);
      return acc;
    }, {} as Record<string, ShuttleAssignment[]>);
  }, [shuttleAssignments]);

  const assignmentsByEmployee = useMemo(() => {
    return shuttleAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.employee.id]) {
        acc[assignment.employee.id] = [];
      }
      acc[assignment.employee.id].push(assignment);
      return acc;
    }, {} as Record<string, ShuttleAssignment[]>);
  }, [shuttleAssignments]);

  const stats = useMemo(() => {
    const totalEmployees = shuttleAssignments.length;
    const totalShuttles = Object.keys(assignmentsByShuttle).length;
    const totalCapacity = shuttles.reduce(
      (sum, shuttle) => sum + shuttle.capacity,
      0
    );
    const assignedCapacity = shuttleAssignments.length;

    return {
      totalEmployees,
      totalShuttles,
      totalCapacity,
      assignedCapacity,
    };
  }, [shuttleAssignments, assignmentsByShuttle, shuttles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Shuttle Optimization Assignments
          </h2>
          <p className="text-muted-foreground">
            View and manage employees assigned to shuttles
          </p>
          
          {employees.length === 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>No employees found.</strong> Please import employees from the Employees tab first.
              </p>
            </div>
          )}
          {shuttles.length === 0 && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>No shuttles found.</strong> Please import shuttles from the Shuttles tab first.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline" onClick={clearAssignments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Clear Assignments
          </Button>
          <Button variant="outline" onClick={exportAssignments}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button
            onClick={() => {
              console.log("=== Generate Assignments Clicked ===");
              console.log("Employees count:", employees.length);
              console.log("Shuttles count:", shuttles.length);
              console.log("Is optimizing:", isOptimizing);
              console.log("Employees data:", employees.slice(0, 3)); // Show first 3 employees
              console.log("Shuttles data:", shuttles.slice(0, 3)); // Show first 3 shuttles
              
              if (employees.length === 0) {
                console.error("❌ No employees found! Cannot generate assignments.");
                return;
              }
              if (shuttles.length === 0) {
                console.error("❌ No shuttles found! Cannot generate assignments.");
                return;
              }
              
              console.log("✅ Starting optimization...");
              generateOptimizedAssignments();
            }}
            disabled={
              isOptimizing || employees.length === 0 || shuttles.length === 0
            }
          >
            {isOptimizing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
{isOptimizing ? "Optimizing..." : `Generate Assignments ${employees.length === 0 || shuttles.length === 0 ? "(No Data)" : ""}`}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedCapacity}</div>
            <p className="text-xs text-muted-foreground">
              of {employees.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Shuttles
            </CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShuttles}</div>
            <p className="text-xs text-muted-foreground">
              of {shuttles.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Capacity Utilization
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCapacity > 0
                ? Math.round(
                    (stats.assignedCapacity / stats.totalCapacity) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.assignedCapacity}/{stats.totalCapacity} seats
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "shuttle" | "employee")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shuttle" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            By Shuttle
          </TabsTrigger>
          <TabsTrigger value="employee" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Employee
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shuttle" className="space-y-4">
          {Object.entries(assignmentsByShuttle).map(
            ([shuttleName, assignments]) => (
              <Card key={shuttleName}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    {shuttleName}
                  </CardTitle>
                  <CardDescription>
                    {assignments[0]?.Shuttle.name} • {assignments.length}{" "}
                    employees
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.employee.id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              <span className="max-w-[200px] truncate">
                                {assignment.employee.address}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {assignment.employee.coordinates}
                          </TableCell>
                          <TableCell>
                            {assignment.employee.distance_to_office} km
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.Shuttle.morning_shift}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.Shuttle.evening_shift}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              assignment.assignedDate
                            ).toLocaleDateString("en-US")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>

        <TabsContent value="employee" className="space-y-4">
          {Object.entries(assignmentsByEmployee).map(
            ([employeeId, assignments]) => (
              <Card key={employeeId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employee {employeeId}
                  </CardTitle>
                  <CardDescription>
                    {assignments[0]?.employee.address}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {assignments[0]?.employee.coordinates} •{" "}
                      {assignments[0]?.employee.distance_to_office} km to office
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Shuttle Name</TableHead>
                          <TableHead>Morning Shift</TableHead>
                          <TableHead>Evening Shift</TableHead>
                          <TableHead>Shuttle Capacity</TableHead>
                          <TableHead>Shuttle Distance</TableHead>
                          <TableHead>Assigned Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">
                              {assignment.Shuttle.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {assignment.Shuttle.morning_shift}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {assignment.Shuttle.evening_shift}
                              </Badge>
                            </TableCell>
                            <TableCell>{assignment.Shuttle.capacity}</TableCell>
                            <TableCell>
                              {assignment.Shuttle.distance_to_office} km
                            </TableCell>
                            <TableCell>
                              {new Date(
                                assignment.assignedDate
                              ).toLocaleDateString("en-US")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
});