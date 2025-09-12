"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import * as XLSX from 'xlsx'
import { toast } from "sonner"

interface Employee {
  id: string
  name?: string
  email?: string
  phone?: string
  address: string
  coordinates: string
  distance_to_office: number
  active?: boolean
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
  const [pendingToggle, setPendingToggle] = useState<{ employeeId: string; next: boolean } | null>(null)
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false)

  // Load data from local storage on component mount
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees')
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees)
        if (Array.isArray(parsedEmployees)) {
          // Backfill missing active state to true
          const normalized = parsedEmployees.map((e: Employee) => ({...e, active: e.active ?? true}))
          setEmployees(normalized)
          localStorage.setItem('employees', JSON.stringify(normalized))
        } else {
          // If no saved data, use default data
          const defaultEmployees: Employee[] = [
            {
              id: "1",
              name: "Ahmet Yılmaz",
              email: "ahmet.yilmaz@example.com",
              phone: "+90 532 000 0001",
              address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
              coordinates: "41.0782,29.0174",
              distance_to_office: 2.5,
              active: true,
            },
            {
              id: "2",
              name: "Ayşe Demir",
              email: "ayse.demir@example.com",
              phone: "+90 532 000 0002",
              address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
              coordinates: "41.0821,29.0321",
              distance_to_office: 1.8,
              active: true,
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
            name: "Ahmet Yılmaz",
            email: "ahmet.yilmaz@example.com",
            phone: "+90 532 000 0001",
            address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
            coordinates: "41.0782,29.0174",
            distance_to_office: 2.5,
            active: true,
          },
          {
            id: "2",
            name: "Ayşe Demir",
            email: "ayse.demir@example.com",
            phone: "+90 532 000 0002",
            address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
            coordinates: "41.0821,29.0321",
            distance_to_office: 1.8,
            active: true,
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
          name: "Ahmet Yılmaz",
          email: "ahmet.yilmaz@example.com",
          phone: "+90 532 000 0001",
          address: "Levazım Mah. Koru Sok. No:2 Beşiktaş/İstanbul",
          coordinates: "41.0782,29.0174",
          distance_to_office: 2.5,
        },
        {
          id: "2",
          name: "Ayşe Demir",
          email: "ayse.demir@example.com",
          phone: "+90 532 000 0002",
          address: "Etiler Mah. Nispetiye Cad. No:15 Beşiktaş/İstanbul",
          coordinates: "41.0821,29.0321",
          distance_to_office: 1.8,
        },
      ]
      setEmployees(defaultEmployees)
      localStorage.setItem('employees', JSON.stringify(defaultEmployees))
    }
  }, [])

  // Listen for external updates (e.g., AddEmployeeTab saving to localStorage)
  useEffect(() => {
    const handleUpdated = () => {
      try {
        const saved = localStorage.getItem('employees')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setEmployees(parsed)
          }
        }
      } catch (e) {
        console.error('Failed to refresh employees from storage', e)
      }
    }
    window.addEventListener('employeesUpdated', handleUpdated)
    return () => window.removeEventListener('employeesUpdated', handleUpdated)
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
        String(employee.name || "").toLowerCase().includes(searchLower) ||
        String(employee.email || "").toLowerCase().includes(searchLower) ||
        String(employee.phone || "").toLowerCase().includes(searchLower) ||
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
        name: newEmployee.name || "",
        email: newEmployee.email || "",
        phone: newEmployee.phone || "",
        address: newEmployee.address,
        coordinates: newEmployee.coordinates || "",
        distance_to_office: newEmployee.distance_to_office || 0,
        active: true,
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

  const applyActiveUpdate = (employeeId: string, next: boolean) => {
    const target = employees.find(e => e.id === employeeId)
    const updated = employees.map(e => e.id === employeeId ? { ...e, active: next } : e)
    setEmployees(updated)
    saveEmployeesToStorage(updated)
    if (next) {
      toast.success("Activated successfully ✅", {
        description: `${target?.name || target?.id || "Employee"} is now active.`,
      })
    }
  }

  const toggleActive = (employeeId: string, next: boolean) => {
    const target = employees.find(e => e.id === employeeId)
    const current = target?.active ?? true
    // If turning off, ask confirmation via dialog
    if (current && !next) {
      setPendingToggle({ employeeId, next })
      setIsToggleDialogOpen(true)
      return
    }
    applyActiveUpdate(employeeId, next)
  }

  const confirmToggle = () => {
    if (pendingToggle) {
      applyActiveUpdate(pendingToggle.employeeId, pendingToggle.next)
      setPendingToggle(null)
      setIsToggleDialogOpen(false)
    }
  }

  const cancelToggle = () => {
    setPendingToggle(null)
    setIsToggleDialogOpen(false)
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
    // Navigate to add-employee tab with employee data
    const employeeData = encodeURIComponent(JSON.stringify(employee))
    window.location.hash = `add-employee?edit=${employeeData}`
  }

  const handleExportExcel = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Address", "Coordinates", "Distance to Office"]
    const data = [
      headers,
      ...filteredEmployees.map((emp) => [
        emp.id,
        emp.name || "",
        emp.email || "",
        emp.phone || "",
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
          const values = [
            emp.id,
            emp.name || "",
            emp.email || "",
            emp.phone || "",
            emp.address,
            emp.coordinates,
            emp.distance_to_office.toString()
          ]
          const value = values[index]
          return (typeof value === 'string' ? value : String(value)).length || 0
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
              // Support both old and new formats by checking header count
              const isNewFormat = headers.length >= 7
              return {
                id: row[0] || `imported-${Date.now()}-${index}`,
                name: isNewFormat ? (row[1] || "") : "",
                email: isNewFormat ? (row[2] || "") : "",
                phone: isNewFormat ? (row[3] || "") : "",
                address: isNewFormat ? (row[4] || "") : (row[1] || ""),
                coordinates: isNewFormat ? (row[5] || "") : (row[2] || ""),
                distance_to_office: parseFloat(isNewFormat ? (row[6] as any) : (row[3] as any)) || 0,
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
          <p className="text-muted-foreground">Manage employees and their locations for Shuttle optimization</p>
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
          <Button asChild>
            <a href="#add-employee">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </a>
          </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-id" className="sm:text-right text-left">
                ID
              </Label>
              <Input
                id="edit-id"
                value={editingEmployee?.id || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, id: e.target.value } : null)}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-name" className="sm:text-right text-left whitespace-nowrap">
                Name Surname
              </Label>
              <Input
                id="edit-name"
                value={editingEmployee?.name || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, name: e.target.value } : null)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-email" className="sm:text-right text-left whitespace-nowrap">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editingEmployee?.email || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, email: e.target.value } : null)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-phone" className="sm:text-right text-left whitespace-nowrap">
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={editingEmployee?.phone || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, phone: e.target.value } : null)}
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-address" className="sm:text-right text-left">
                Address
              </Label>
              <Input
                id="edit-address"
                value={editingEmployee?.address || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, address: e.target.value } : null)}
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-coordinates" className="sm:text-right text-left">
                Coordinates
              </Label>
              <Input
                id="edit-coordinates"
                placeholder="41.0782,29.0174"
                value={editingEmployee?.coordinates || ""}
                onChange={(e) => setEditingEmployee(editingEmployee ? { ...editingEmployee, coordinates: e.target.value } : null)}
                className="sm:col-span-3"
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
                  className="pl-10 w-40 sm:w-64 h-8 text-xs sm:text-sm"
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
        <CardContent className="overflow-x-auto">
          <div className="min-w-[900px] text-xs sm:text-sm">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="px-2 py-1 truncate">ID</TableHead>
                <TableHead className="px-2 py-1 truncate">Name</TableHead>
                <TableHead className="px-2 py-1 truncate">Email</TableHead>
                <TableHead className="px-2 py-1 truncate">Phone</TableHead>
                <TableHead className="px-2 py-1 truncate">Address</TableHead>
                <TableHead className="px-2 py-1 truncate">Coordinates</TableHead>
                <TableHead className="px-2 py-1 truncate">Distance (km)</TableHead>
                <TableHead className="px-2 py-1 truncate">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="px-2 py-1 truncate" title={String(employee.id)}>{employee.id}</TableCell>
                  <TableCell className="px-2 py-1 truncate" title={employee.name || ''}>{employee.name}</TableCell>
                  <TableCell className="px-2 py-1 max-w-[120px] truncate" title={employee.email || ''}>{employee.email}</TableCell>
                  <TableCell className="px-2 py-1 max-w-[120px] truncate" title={employee.phone || ''}>{employee.phone}</TableCell>
                  <TableCell className="px-2 py-1 max-w-[240px] truncate" title={employee.address}>{employee.address}</TableCell>
                  <TableCell className="font-mono px-2 py-1 max-w-[110px] truncate" title={employee.coordinates}>{employee.coordinates}</TableCell>
                  <TableCell className="px-2 py-1 tabular-nums truncate" title={String(employee.distance_to_office)}>{Number(employee.distance_to_office).toFixed(2)}</TableCell>
                  <TableCell className="px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Switch checked={employee.active ?? true} onCheckedChange={(v) => toggleActive(employee.id, v)} />
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
          </div>
        </CardContent>
      </Card>

      {/* Confirm Inactive Dialog */}
      <AlertDialog open={isToggleDialogOpen} onOpenChange={setIsToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set employee inactive?</AlertDialogTitle>
            <AlertDialogDescription>
              This employee will be excluded from optimization. Are you sure you want to set them to inactive?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelToggle}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>Yes, set inactive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
