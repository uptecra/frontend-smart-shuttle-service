<<<<<<< HEAD
"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Users, Bus, MapPin, RefreshCw } from "lucide-react"
import * as XLSX from 'xlsx'

interface Employee {
  id: string
  address: string
  coordinates: string
  distance_to_office: number
}

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

interface ShuttleAssignment {
  id: string
  employeeId: string
  employee: Employee
  ShuttleId: string
  Shuttle: Shuttle
  assignedDate: string
  status: "active" | "inactive"
}

export const OptimizationTab = memo(function OptimizationTab() {
  const [viewMode, setViewMode] = useState<"Shuttle" | "employee">("Shuttle")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [Shuttles, setShuttles] = useState<Shuttle[]>([])
  const [ShuttleAssignments, setShuttleAssignments] = useState<ShuttleAssignment[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
=======
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
  address: string;
  coordinates: string;
  distance_to_office: number;
}

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
>>>>>>> b798db6 (pickup points 1)

  // Optimized data loading with useCallback
  const loadData = useCallback(() => {
    try {
      // Load employees
<<<<<<< HEAD
      const savedEmployees = localStorage.getItem('employees')
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees)
        if (Array.isArray(parsedEmployees)) {
          setEmployees(parsedEmployees)
        }
      }

      // Load Shuttles
      const savedShuttles = localStorage.getItem('Shuttles')
      if (savedShuttles) {
        const parsedShuttles = JSON.parse(savedShuttles)
        if (Array.isArray(parsedShuttles)) {
          setShuttles(parsedShuttles)
=======
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (Array.isArray(parsedEmployees)) {
          setEmployees(parsedEmployees);
        }
      }

      // Load shuttles
      const savedShuttles = localStorage.getItem("Shuttles");
      if (savedShuttles) {
        const parsedShuttles = JSON.parse(savedShuttles);
        if (Array.isArray(parsedShuttles)) {
          setShuttles(parsedShuttles);
>>>>>>> b798db6 (pickup points 1)
        }
      }

      // Load assignments
<<<<<<< HEAD
      const savedAssignments = localStorage.getItem('ShuttleAssignments')
      if (savedAssignments) {
        const parsedAssignments = JSON.parse(savedAssignments)
        if (Array.isArray(parsedAssignments)) {
          setShuttleAssignments(parsedAssignments)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  // Load data from localStorage
  useEffect(() => {
    loadData()
  }, [loadData])

    // Save assignments to localStorage with useCallback for performance
  const saveAssignmentsToStorage = useCallback((assignments: ShuttleAssignment[]) => {
    try {
      localStorage.setItem('ShuttleAssignments', JSON.stringify(assignments))
    } catch (error) {
      console.error('Error saving assignments:', error)
    }
  }, [])

  // Optimized assignment generation with better algorithm
  const generateOptimizedAssignments = useCallback(() => {
    if (employees.length === 0 || Shuttles.length === 0) return
    
    setIsOptimizing(true)
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const newAssignments: ShuttleAssignment[] = []
      const ShuttleCapacityMap = new Map<string, number>()
      
      // Initialize capacity map for O(1) lookups
      Shuttles.forEach(Shuttle => {
        ShuttleCapacityMap.set(Shuttle.id, Shuttle.capacity)
      })
      
      // Sort employees by distance for better optimization
      const sortedEmployees = [...employees].sort((a, b) => a.distance_to_office - b.distance_to_office)
      
      // Sort Shuttles by distance for better matching
      const sortedShuttles = [...Shuttles].sort((a, b) => a.distance_to_office - b.distance_to_office)
      
      // Optimized assignment algorithm
      for (const employee of sortedEmployees) {
        let bestShuttle = null
        let minDistanceDiff = Infinity
        
        // Find best Shuttle with available capacity
        for (const Shuttle of sortedShuttles) {
          const currentCapacity = ShuttleCapacityMap.get(Shuttle.id) || 0
          if (currentCapacity > 0) {
            const distanceDiff = Math.abs(Shuttle.distance_to_office - employee.distance_to_office)
            if (distanceDiff < minDistanceDiff) {
              minDistanceDiff = distanceDiff
              bestShuttle = Shuttle
            }
          }
        }
        
=======
      const savedAssignments = localStorage.getItem("ShuttleAssignments");
      if (savedAssignments) {
        const parsedAssignments = JSON.parse(savedAssignments);
        if (Array.isArray(parsedAssignments)) {
          setShuttleAssignments(parsedAssignments);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
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
    if (employees.length === 0 || shuttles.length === 0) return;

    setIsOptimizing(true);

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const newAssignments: ShuttleAssignment[] = [];
      const shuttleCapacityMap = new Map<string, number>();

      // Initialize capacity map for O(1) lookups
      shuttles.forEach((shuttle) => {
        shuttleCapacityMap.set(shuttle.id, shuttle.capacity);
      });

      // Sort employees by distance for better optimization
      const sortedEmployees = [...employees].sort(
        (a, b) => a.distance_to_office - b.distance_to_office
      );

      // Sort shuttles by distance for better matching
      const sortedShuttles = [...shuttles].sort(
        (a, b) => a.distance_to_office - b.distance_to_office
      );

      // Optimized assignment algorithm
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

>>>>>>> b798db6 (pickup points 1)
        if (bestShuttle) {
          const assignment: ShuttleAssignment = {
            id: `assignment-${Date.now()}-${employee.id}`,
            employeeId: employee.id,
            employee: employee,
            ShuttleId: bestShuttle.id,
            Shuttle: bestShuttle,
<<<<<<< HEAD
            assignedDate: new Date().toISOString().split('T')[0],
            status: "active"
          }
          
          newAssignments.push(assignment)
          // Update capacity
          ShuttleCapacityMap.set(bestShuttle.id, (ShuttleCapacityMap.get(bestShuttle.id) || 0) - 1)
        }
      }
      
      setShuttleAssignments(newAssignments)
      saveAssignmentsToStorage(newAssignments)
      setIsOptimizing(false)
    })
  }, [employees, Shuttles, saveAssignmentsToStorage])

  // Optimized export function with useCallback
  const exportAssignments = useCallback(() => {
    if (ShuttleAssignments.length === 0) return
    
    const headers = ["Employee ID", "Employee Address", "Employee Coordinates", "Employee Distance to Office", "Shuttle Name", "Shuttle Morning Shift", "Shuttle Evening Shift", "Shuttle Capacity", "Shuttle Coordinates", "Shuttle Distance to Office", "Assigned Date", "Status"]
    
    // Prepare data for Excel
    const excelData = [
      headers,
      ...ShuttleAssignments.map((assignment) => [
=======
            assignedDate: new Date().toISOString().split("T")[0],
            status: "active",
          };

          newAssignments.push(assignment);
          // Update capacity
          shuttleCapacityMap.set(
            bestShuttle.id,
            (shuttleCapacityMap.get(bestShuttle.id) || 0) - 1
          );
        }
      }

      setShuttleAssignments(newAssignments);
      saveAssignmentsToStorage(newAssignments);
      setIsOptimizing(false);
    });
  }, [employees, shuttles, saveAssignmentsToStorage]);

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
>>>>>>> b798db6 (pickup points 1)
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
<<<<<<< HEAD
      ])
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shuttle Assignments")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Download the file
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Shuttle-assignments.xlsx"
    a.click()
    window.URL.revokeObjectURL(url)
  }, [ShuttleAssignments])

  // Memoized data processing for better performance
  const assignmentsByShuttle = useMemo(() => {
    return ShuttleAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.Shuttle.name]) {
        acc[assignment.Shuttle.name] = []
      }
      acc[assignment.Shuttle.name].push(assignment)
      return acc
    }, {} as Record<string, ShuttleAssignment[]>)
  }, [ShuttleAssignments])

  const assignmentsByEmployee = useMemo(() => {
    return ShuttleAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.employee.id]) {
        acc[assignment.employee.id] = []
      }
      acc[assignment.employee.id].push(assignment)
      return acc
    }, {} as Record<string, ShuttleAssignment[]>)
  }, [ShuttleAssignments])

  const stats = useMemo(() => {
    const totalEmployees = ShuttleAssignments.length
    const totalShuttles = Object.keys(assignmentsByShuttle).length
    const totalCapacity = Shuttles.reduce((sum, Shuttle) => sum + Shuttle.capacity, 0)
    const assignedCapacity = ShuttleAssignments.length
    
=======
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
      if (!acc[assignment.Shuttle.name]) {
        acc[assignment.Shuttle.name] = [];
      }
      acc[assignment.Shuttle.name].push(assignment);
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

>>>>>>> b798db6 (pickup points 1)
    return {
      totalEmployees,
      totalShuttles,
      totalCapacity,
<<<<<<< HEAD
      assignedCapacity
    }
  }, [ShuttleAssignments, assignmentsByShuttle, Shuttles])
=======
      assignedCapacity,
    };
  }, [shuttleAssignments, assignmentsByShuttle, shuttles]);
>>>>>>> b798db6 (pickup points 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h2 className="text-2xl font-bold tracking-tight">Shuttle Optimization Assignments</h2>
          <p className="text-muted-foreground">
            View and manage employees assigned to Shuttles
=======
          <h2 className="text-2xl font-bold tracking-tight">
            Shuttle Optimization Assignments
          </h2>
          <p className="text-muted-foreground">
            View and manage employees assigned to shuttles
>>>>>>> b798db6 (pickup points 1)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAssignments}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
<<<<<<< HEAD
          <Button onClick={generateOptimizedAssignments} disabled={isOptimizing || employees.length === 0 || Shuttles.length === 0}>
            {isOptimizing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
=======
          <Button
            onClick={generateOptimizedAssignments}
            disabled={
              isOptimizing || employees.length === 0 || shuttles.length === 0
            }
          >
            {isOptimizing ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
>>>>>>> b798db6 (pickup points 1)
            {isOptimizing ? "Optimizing..." : "Generate Assignments"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<<<<<<< HEAD
            <CardTitle className="text-sm font-medium">Assigned Employees</CardTitle>
=======
            <CardTitle className="text-sm font-medium">
              Assigned Employees
            </CardTitle>
>>>>>>> b798db6 (pickup points 1)
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedCapacity}</div>
<<<<<<< HEAD
            <p className="text-xs text-muted-foreground">of {employees.length} total</p>
=======
            <p className="text-xs text-muted-foreground">
              of {employees.length} total
            </p>
>>>>>>> b798db6 (pickup points 1)
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<<<<<<< HEAD
            <CardTitle className="text-sm font-medium">Active Shuttles</CardTitle>
=======
            <CardTitle className="text-sm font-medium">
              Active Shuttles
            </CardTitle>
>>>>>>> b798db6 (pickup points 1)
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShuttles}</div>
<<<<<<< HEAD
            <p className="text-xs text-muted-foreground">of {Shuttles.length} total</p>
=======
            <p className="text-xs text-muted-foreground">
              of {shuttles.length} total
            </p>
>>>>>>> b798db6 (pickup points 1)
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<<<<<<< HEAD
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity > 0 ? Math.round((stats.assignedCapacity / stats.totalCapacity) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">{stats.assignedCapacity}/{stats.totalCapacity} seats</p>
=======
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
>>>>>>> b798db6 (pickup points 1)
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "Shuttle" | "employee")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Shuttle" className="flex items-center gap-2">
=======
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "shuttle" | "employee")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="shuttle" className="flex items-center gap-2">
>>>>>>> b798db6 (pickup points 1)
            <Bus className="h-4 w-4" />
            By Shuttle
          </TabsTrigger>
          <TabsTrigger value="employee" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Employee
          </TabsTrigger>
        </TabsList>

<<<<<<< HEAD
        <TabsContent value="Shuttle" className="space-y-4">
          {Object.entries(assignmentsByShuttle).map(([ShuttleName, assignments]) => (
            <Card key={ShuttleName}>
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  {ShuttleName}
                </CardTitle>
                <CardDescription>
                  {assignments[0]?.Shuttle.name} • {assignments.length} employees
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
                        <TableCell className="font-medium">{assignment.employee.id}</TableCell>
                  <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[200px] truncate">{assignment.employee.address}</span>
                    </div>
                  </TableCell>
                        <TableCell className="font-mono text-sm">{assignment.employee.coordinates}</TableCell>
                        <TableCell>{assignment.employee.distance_to_office} km</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignment.Shuttle.morning_shift}</Badge>
                        </TableCell>
                  <TableCell>
                          <Badge variant="outline">{assignment.Shuttle.evening_shift}</Badge>
                  </TableCell>
                        <TableCell>{new Date(assignment.assignedDate).toLocaleDateString('en-US')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
          ))}
        </TabsContent>

        <TabsContent value="employee" className="space-y-4">
          {Object.entries(assignmentsByEmployee).map(([employeeId, assignments]) => (
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
                    {assignments[0]?.employee.coordinates} • {assignments[0]?.employee.distance_to_office} km to office
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shuttle Name</TableHead>
                        <TableHead>Morning Shift</TableHead>
                        <TableHead>Evening Shift</TableHead>
                        <TableHead>Shuttle Capacity</TableHead>
                        <TableHead>Shuttle Distance</TableHead>
=======
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
>>>>>>> b798db6 (pickup points 1)
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
<<<<<<< HEAD
                          <TableCell className="font-medium">{assignment.Shuttle.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.Shuttle.morning_shift}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.Shuttle.evening_shift}</Badge>
                          </TableCell>
                          <TableCell>{assignment.Shuttle.capacity}</TableCell>
                          <TableCell>{assignment.Shuttle.distance_to_office} km</TableCell>
                          <TableCell>{new Date(assignment.assignedDate).toLocaleDateString('en-US')}</TableCell>
=======
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
>>>>>>> b798db6 (pickup points 1)
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
<<<<<<< HEAD
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
})
=======
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
>>>>>>> b798db6 (pickup points 1)
