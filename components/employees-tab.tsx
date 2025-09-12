"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Upload, Download, Trash2, Edit, Search } from "lucide-react"
import * as XLSX from 'xlsx'
import { toast } from "sonner"

interface Employee {
  id: string
  address: string
  coordinates: string
  distance_to_office: number
}

export const EmployeesTab = memo(function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({})
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null)

  // Load data from local storage on component mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees')
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees)
        if (Array.isArray(parsedEmployees)) {
          setEmployees(parsedEmployees)
        } else {
          // If no saved data, use default data
          const defaultEmployees: Employee[] = [
            {
              id: "1",
              address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
              coordinates: "41.0782,29.0174",
              distance_to_office: 2.5,
            },
            {
              id: "2",
              address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
              coordinates: "41.0821,29.0321",
              distance_to_office: 1.8,
            },
          ]
          setEmployees(defaultEmployees)
          localStorage.setItem('employees', JSON.stringify(defaultEmployees))
        }
      } catch (error) {
        console.error('Error loading saved employees:', error)
        // If error, use default data
        const defaultEmployees: Employee[] = [
          {
            id: "1",
            address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
            coordinates: "41.0782,29.0174",
            distance_to_office: 2.5,
          },
          {
            id: "2",
            address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
            coordinates: "41.0821,29.0321",
            distance_to_office: 1.8,
          },
        ]
        setEmployees(defaultEmployees)
        localStorage.setItem('employees', JSON.stringify(defaultEmployees))
      }
    } else {
      // If no saved data, use default data
      const defaultEmployees: Employee[] = [
        {
          id: "1",
          address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
          coordinates: "41.0782,29.0174",
          distance_to_office: 2.5,
        },
        {
          id: "2",
          address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
          coordinates: "41.0821,29.0321",
          distance_to_office: 1.8,
        },
      ]
      setEmployees(defaultEmployees)
      localStorage.setItem('employees', JSON.stringify(defaultEmployees))
    }
  }, [])

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Memoized filtered employees for better performance
  const filteredEmployees = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return employees
    }
    const searchLower = debouncedSearchQuery.toLowerCase()
    return employees.filter((employee) => {
      return (
        String(employee.id).toLowerCase().includes(searchLower) ||
        String(employee.address).toLowerCase().includes(searchLower) ||
        String(employee.coordinates).toLowerCase().includes(searchLower) ||
        String(employee.distance_to_office).toLowerCase().includes(searchLower)
      )
    })
  }, [debouncedSearchQuery, employees])

  // Save data to local storage whenever employees change
  const saveEmployeesToStorage = useCallback((updatedEmployees: Employee[]) => {
    try {
      localStorage.setItem('employees', JSON.stringify(updatedEmployees))
      console.log('Employees saved to localStorage:', updatedEmployees)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      toast.error("Error saving data")
    }
  }, [])

  const handleAddEmployee = () => {
    if (newEmployee.id && newEmployee.address) {
      const employee: Employee = {
        id: newEmployee.id,
        address: newEmployee.address,
        coordinates: newEmployee.coordinates || "",
        distance_to_office: newEmployee.distance_to_office || 0,
      }
      
      const updatedEmployees = [...employees, employee]
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
      
      setNewEmployee({})
      setIsAddDialogOpen(false)
      toast.success("Employee added successfully")
    }
  }

  const handleEditEmployee = () => {
    if (editingEmployee && editingEmployee.id && editingEmployee.address) {
      const updatedEmployees = employees.map(emp => 
        emp.id === editingEmployee.id ? editingEmployee : emp
      )
      
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
      
      setEditingEmployee(null)
      setIsEditDialogOpen(false)
      toast.success("Employee updated successfully")
    }
  }

  const openDeleteDialog = (employee: Employee) => {
    setDeletingEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteEmployee = () => {
    if (deletingEmployee) {
      const updatedEmployees = employees.filter((emp) => emp.id !== deletingEmployee.id)
      setEmployees(updatedEmployees)
      saveEmployeesToStorage(updatedEmployees)
      
      setDeletingEmployee(null)
      setIsDeleteDialogOpen(false)
      toast.success("Employee deleted successfully")
    }
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee({ ...employee })
    setIsEditDialogOpen(true)
  }

  const handleExportExcel = () => {
    const headers = ["ID", "Address", "Coordinates", "Distance to Office"]
    const data = [
      headers,
      ...filteredEmployees.map((emp) => [
        emp.id, 
        emp.address, 
        emp.coordinates, 
        emp.distance_to_office
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Employees")
    
    // Auto-size columns
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...filteredEmployees.map(emp => {
          const values = [emp.id, emp.address, emp.coordinates, emp.distance_to_office.toString()]
          return values[index]?.length || 0
        })
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, "employees_export.xlsx")
    toast.success("Excel file exported successfully")
  }

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

          if (jsonData.length < 2) {
            toast.error("Excel file must contain at least headers and one data row")
            return
          }

          const headers = jsonData[0]
          const importedEmployees: Employee[] = jsonData
            .slice(1)
            .filter((row) => row.some(cell => cell && cell.toString().trim()))
            .map((row, index) => {
              return {
                id: row[0] || `imported-${Date.now()}-${index}`,
                address: row[1] || "",
                coordinates: row[2] || "",
                distance_to_office: parseFloat(row[3]) || 0,
              }
            })

          const updatedEmployees = [...employees, ...importedEmployees]
          setEmployees(updatedEmployees)
          saveEmployeesToStorage(updatedEmployees)
          
          toast.success(`Successfully imported ${importedEmployees.length} employees`)
        } catch (error) {
          toast.error("Error reading Excel file. Please ensure it's a valid Excel file.")
          console.error("Excel import error:", error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">Manage employees and their locations for service optimization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="excel-import" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
              <input id="excel-import" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
            </label>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Enter the employee details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="id" className="text-right">
                    ID
                  </Label>
                  <Input
                    id="id"
                    value={newEmployee.id || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={newEmployee.address || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="coordinates" className="text-right">
                    Coordinates
                  </Label>
                  <Input
                    id="coordinates"
                    placeholder="41.0782,29.0174"
                    value={newEmployee.coordinates || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, coordinates: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="distance" className="text-right">
                    Distance to Office
                  </Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={newEmployee.distance_to_office || ""}
                    onChange={(e) => setNewEmployee({ ...newEmployee, distance_to_office: parseFloat(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddEmployee}>Add Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-id" className="text-right">
                ID
              </Label>
              <Input
                id="edit-id"
                value={editingEmployee?.id || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, id: e.target.value } : null)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-address" className="text-right">
                Address
              </Label>
              <Input
                id="edit-address"
                value={editingEmployee?.address || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, address: e.target.value } : null)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-coordinates" className="text-right">
                Coordinates
              </Label>
              <Input
                id="edit-coordinates"
                placeholder="41.0782,29.0174"
                value={editingEmployee?.coordinates || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, coordinates: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-distance_to_office" className="text-right">
                Distance(km)
              </Label>
              <Input
                id="edit-distance_to_office"
                type="number"
                step="0.1"
                placeholder="2.5"
                value={editingEmployee?.distance_to_office || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, distance_to_office: parseFloat(e.target.value) || 0 } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEmployee}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee <strong>{deletingEmployee?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The employee will be permanently removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>Delete Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>All registered employees in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="min-w-[300px]">Address</TableHead>
                <TableHead className="min-w-[150px] pl-30">Coordinates</TableHead>
                <TableHead className="min-w-[120px] pr-30 ">Distance to Office (km)</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{employee.address}</TableCell>
                  <TableCell className="font-mono text-sm pl-30">{employee.coordinates}</TableCell>
                  <TableCell className="max-w-[120px] truncate pr-30">{employee.distance_to_office}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(employee)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
})
