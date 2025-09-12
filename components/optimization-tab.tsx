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

interface Service {
  id: string
  name: string
  morning_shift: string
  evening_shift: string
  capacity: number
  map_url: string
  coordinates: string
  distance_to_office: number
}

interface ServiceAssignment {
  id: string
  employeeId: string
  employee: Employee
  serviceId: string
  service: Service
  assignedDate: string
  status: "active" | "inactive"
}

export const OptimizationTab = memo(function OptimizationTab() {
  const [viewMode, setViewMode] = useState<"service" | "employee">("service")
  const [employees, setEmployees] = useState<Employee[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [serviceAssignments, setServiceAssignments] = useState<ServiceAssignment[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)

  // Optimized data loading with useCallback
  const loadData = useCallback(() => {
    try {
      // Load employees
      const savedEmployees = localStorage.getItem('employees')
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees)
        if (Array.isArray(parsedEmployees)) {
          setEmployees(parsedEmployees)
        }
      }

      // Load services
      const savedServices = localStorage.getItem('services')
      if (savedServices) {
        const parsedServices = JSON.parse(savedServices)
        if (Array.isArray(parsedServices)) {
          setServices(parsedServices)
        }
      }

      // Load assignments
      const savedAssignments = localStorage.getItem('serviceAssignments')
      if (savedAssignments) {
        const parsedAssignments = JSON.parse(savedAssignments)
        if (Array.isArray(parsedAssignments)) {
          setServiceAssignments(parsedAssignments)
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
  const saveAssignmentsToStorage = useCallback((assignments: ServiceAssignment[]) => {
    try {
      localStorage.setItem('serviceAssignments', JSON.stringify(assignments))
    } catch (error) {
      console.error('Error saving assignments:', error)
    }
  }, [])

  // Optimized assignment generation with better algorithm
  const generateOptimizedAssignments = useCallback(() => {
    if (employees.length === 0 || services.length === 0) return
    
    setIsOptimizing(true)
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const newAssignments: ServiceAssignment[] = []
      const serviceCapacityMap = new Map<string, number>()
      
      // Initialize capacity map for O(1) lookups
      services.forEach(service => {
        serviceCapacityMap.set(service.id, service.capacity)
      })
      
      // Sort employees by distance for better optimization
      const sortedEmployees = [...employees].sort((a, b) => a.distance_to_office - b.distance_to_office)
      
      // Sort services by distance for better matching
      const sortedServices = [...services].sort((a, b) => a.distance_to_office - b.distance_to_office)
      
      // Optimized assignment algorithm
      for (const employee of sortedEmployees) {
        let bestService = null
        let minDistanceDiff = Infinity
        
        // Find best service with available capacity
        for (const service of sortedServices) {
          const currentCapacity = serviceCapacityMap.get(service.id) || 0
          if (currentCapacity > 0) {
            const distanceDiff = Math.abs(service.distance_to_office - employee.distance_to_office)
            if (distanceDiff < minDistanceDiff) {
              minDistanceDiff = distanceDiff
              bestService = service
            }
          }
        }
        
        if (bestService) {
          const assignment: ServiceAssignment = {
            id: `assignment-${Date.now()}-${employee.id}`,
            employeeId: employee.id,
            employee: employee,
            serviceId: bestService.id,
            service: bestService,
            assignedDate: new Date().toISOString().split('T')[0],
            status: "active"
          }
          
          newAssignments.push(assignment)
          // Update capacity
          serviceCapacityMap.set(bestService.id, (serviceCapacityMap.get(bestService.id) || 0) - 1)
        }
      }
      
      setServiceAssignments(newAssignments)
      saveAssignmentsToStorage(newAssignments)
      setIsOptimizing(false)
    })
  }, [employees, services, saveAssignmentsToStorage])

  // Optimized export function with useCallback
  const exportAssignments = useCallback(() => {
    if (serviceAssignments.length === 0) return
    
    const headers = ["Employee ID", "Employee Address", "Employee Coordinates", "Employee Distance to Office", "Service Name", "Service Morning Shift", "Service Evening Shift", "Service Capacity", "Service Coordinates", "Service Distance to Office", "Assigned Date", "Status"]
    
    // Prepare data for Excel
    const excelData = [
      headers,
      ...serviceAssignments.map((assignment) => [
        assignment.employee.id,
        assignment.employee.address,
        assignment.employee.coordinates,
        assignment.employee.distance_to_office,
        assignment.service.name,
        assignment.service.morning_shift,
        assignment.service.evening_shift,
        assignment.service.capacity,
        assignment.service.coordinates,
        assignment.service.distance_to_office,
        assignment.assignedDate,
        assignment.status,
      ])
    ]

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Service Assignments")

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Download the file
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "service-assignments.xlsx"
    a.click()
    window.URL.revokeObjectURL(url)
  }, [serviceAssignments])

  // Memoized data processing for better performance
  const assignmentsByService = useMemo(() => {
    return serviceAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.service.name]) {
        acc[assignment.service.name] = []
      }
      acc[assignment.service.name].push(assignment)
      return acc
    }, {} as Record<string, ServiceAssignment[]>)
  }, [serviceAssignments])

  const assignmentsByEmployee = useMemo(() => {
    return serviceAssignments.reduce((acc, assignment) => {
      if (!acc[assignment.employee.id]) {
        acc[assignment.employee.id] = []
      }
      acc[assignment.employee.id].push(assignment)
      return acc
    }, {} as Record<string, ServiceAssignment[]>)
  }, [serviceAssignments])

  const stats = useMemo(() => {
    const totalEmployees = serviceAssignments.length
    const totalServices = Object.keys(assignmentsByService).length
    const totalCapacity = services.reduce((sum, service) => sum + service.capacity, 0)
    const assignedCapacity = serviceAssignments.length
    
    return {
      totalEmployees,
      totalServices,
      totalCapacity,
      assignedCapacity
    }
  }, [serviceAssignments, assignmentsByService, services])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Optimization Assignments</h2>
          <p className="text-muted-foreground">
            View and manage employees assigned to services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAssignments}>
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button onClick={generateOptimizedAssignments} disabled={isOptimizing || employees.length === 0 || services.length === 0}>
            {isOptimizing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            {isOptimizing ? "Optimizing..." : "Generate Assignments"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assignedCapacity}</div>
            <p className="text-xs text-muted-foreground">of {employees.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">of {services.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity > 0 ? Math.round((stats.assignedCapacity / stats.totalCapacity) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">{stats.assignedCapacity}/{stats.totalCapacity} seats</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "service" | "employee")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="service" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            By Service
          </TabsTrigger>
          <TabsTrigger value="employee" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            By Employee
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service" className="space-y-4">
          {Object.entries(assignmentsByService).map(([serviceName, assignments]) => (
            <Card key={serviceName}>
        <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  {serviceName}
                </CardTitle>
                <CardDescription>
                  {assignments[0]?.service.name} • {assignments.length} employees
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
                          <Badge variant="outline">{assignment.service.morning_shift}</Badge>
                        </TableCell>
                  <TableCell>
                          <Badge variant="outline">{assignment.service.evening_shift}</Badge>
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
                        <TableHead>Service Name</TableHead>
                        <TableHead>Morning Shift</TableHead>
                        <TableHead>Evening Shift</TableHead>
                        <TableHead>Service Capacity</TableHead>
                        <TableHead>Service Distance</TableHead>
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.service.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.service.morning_shift}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{assignment.service.evening_shift}</Badge>
                          </TableCell>
                          <TableCell>{assignment.service.capacity}</TableCell>
                          <TableCell>{assignment.service.distance_to_office} km</TableCell>
                          <TableCell>{new Date(assignment.assignedDate).toLocaleDateString('en-US')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
})
