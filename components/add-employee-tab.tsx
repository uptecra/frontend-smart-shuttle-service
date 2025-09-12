"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Employee {
  id: string
  name?: string
  email?: string
  phone?: string
  address: string
  coordinates: string
  distance_to_office: number
}

export default function AddEmployeeTab() {
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({})
  const [isEditMode, setIsEditMode] = useState(false)

  // Load employee data from URL hash params on mount and on hash changes
  useEffect(() => {
    if (typeof window === "undefined") return

    const applyFromHash = () => {
      const raw = (window.location.hash || "").replace(/^#/, "")
      const [, queryString] = raw.split("?")
      if (!queryString) {
        setIsEditMode(false)
        return
      }
      const params = new URLSearchParams(queryString)
      const editData = params.get("edit")
      if (!editData) {
        setIsEditMode(false)
        return
      }
      try {
        const employee = JSON.parse(decodeURIComponent(editData)) as Partial<Employee>
        // Ensure types are normalized
        const normalized: Partial<Employee> = {
          ...employee,
          id: employee.id ? String(employee.id) : "",
          distance_to_office: employee.distance_to_office ? Number(employee.distance_to_office) : 0,
        }
        setNewEmployee(normalized)
        setIsEditMode(true)
      } catch (error) {
        console.error("Failed to parse employee data from hash:", error)
        setIsEditMode(false)
      }
    }

    applyFromHash()
    window.addEventListener("hashchange", applyFromHash)
    return () => window.removeEventListener("hashchange", applyFromHash)
  }, [])

  const handleCancel = () => {
    setNewEmployee({})
    if (typeof window !== "undefined") {
      window.location.hash = "employees"
    }
  }

  const handleAdd = () => {
    if (!newEmployee?.id || !newEmployee?.address) {
      toast.error("Please fill required fields: ID and Address")
      return
    }

    try {
      const saved = localStorage.getItem("employees")
      const employees: Employee[] = saved ? JSON.parse(saved) : []

      const employee: Employee = {
        id: String(newEmployee.id),
        name: newEmployee.name || "",
        email: newEmployee.email || "",
        phone: newEmployee.phone || "",
        address: newEmployee.address || "",
        coordinates: newEmployee.coordinates || "",
        distance_to_office: newEmployee.distance_to_office || 0,
      }

      let updated: Employee[]
      if (isEditMode) {
        // Update existing employee
        updated = employees.map(emp => emp.id === employee.id ? employee : emp)
      } else {
        // Add new employee
        updated = [...employees, employee]
      }

      localStorage.setItem("employees", JSON.stringify(updated))
      // Verify write
      try {
        const check = localStorage.getItem("employees")
        const parsed = check ? JSON.parse(check) : []
        console.log("employees saved count:", Array.isArray(parsed) ? parsed.length : 0)
      } catch {}
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("employeesUpdated"))
      }
      toast.success(isEditMode ? "Updated successfully 🎉" : "Added successfully 🎉", {
        description: `${employee.name || "Employee"} has been ${isEditMode ? "updated" : "added to your list"}.`,
      })
      setNewEmployee({})
      setIsEditMode(false)
      if (typeof window !== "undefined") {
        window.location.hash = "employees"
      }
    } catch {
      toast.error("Failed to save employee")
    }
  }

  return (
    
    <div className="space-y-4">
       <div>
          <h2 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Employee" : "Add Employee"}</h2>
          <p className="text-muted-foreground">{isEditMode ? "Update the employee details below." : "Enter the employee details below."}</p>
        </div>
        
      <Card>
   
        <CardContent>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="id" className="sm:text-right text-left whitespace-nowrap">ID</Label>
              <Input id="id" value={newEmployee.id || ""} onChange={(e) => setNewEmployee({ ...newEmployee, id: e.target.value })} className="col-span-5 w-full" required />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="name" className="sm:text-right text-left whitespace-nowrap">Name Surname</Label>
              <Input id="name" value={newEmployee.name || ""} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className="col-span-5 w-full" />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="email" className="sm:text-right text-left whitespace-nowrap">Email</Label>
              <Input id="email" type="email" value={newEmployee.email || ""} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="col-span-5 w-full" />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="phone" className="sm:text-right text-left whitespace-nowrap">Phone</Label>
              <Input id="phone" value={newEmployee.phone || ""} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} className="col-span-5 w-full" />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="address" className="sm:text-right text-left whitespace-nowrap">Address</Label>
              <Input id="address" value={newEmployee.address || ""} onChange={(e) => setNewEmployee({ ...newEmployee, address: e.target.value })} className="col-span-5 w-full" required />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label htmlFor="coordinates" className="sm:text-right text-left whitespace-nowrap">Coordinates</Label>
              <Input id="coordinates" placeholder="41.0782,29.0174" value={newEmployee.coordinates || ""} onChange={(e) => setNewEmployee({ ...newEmployee, coordinates: e.target.value })} className="col-span-5 w-full" required />
            </div>
            
            <div className="grid grid-cols-6 items-center">
              <div></div>
              <div className="col-span-5">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleAdd}>{isEditMode ? "Update Employee" : "Add Employee"}</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


