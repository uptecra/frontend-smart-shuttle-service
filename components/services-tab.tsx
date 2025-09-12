"use client"

import type React from "react"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Download, Trash2, Edit, Bus, Search } from "lucide-react"
import * as XLSX from 'xlsx'

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

export const ServicesTab = memo(function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState<Partial<Service>>({})

  // Helper function to save services to localStorage with useCallback
  const saveServicesToStorage = useCallback((servicesToSave: Service[]) => {
    localStorage.setItem('services', JSON.stringify(servicesToSave))
  }, [])

  // Load data from local storage on component mount
  useEffect(() => {
    const savedServices = localStorage.getItem('services')
    if (savedServices) {
      try {
        const parsedServices = JSON.parse(savedServices)
        if (Array.isArray(parsedServices) && parsedServices.length > 0) {
          setServices(parsedServices)
          return
        }
      } catch (error) {
        console.error('Error loading saved services:', error)
      }
    }
    
    // If no saved data or error, use default data
    const defaultServices: Service[] = [
    {
      id: "1",
        name: "Kadıköy - Zorlu Center",
        morning_shift: "07:30",
        evening_shift: "18:30",
      capacity: 45,
        map_url: "https://maps.google.com/kadikoy-zorlu",
        coordinates: "40.9909,29.0303",
        distance_to_office: 12.5,
    },
    {
      id: "2",
        name: "Beşiktaş - Zorlu Center",
        morning_shift: "08:00",
        evening_shift: "18:00",
      capacity: 35,
        map_url: "https://maps.google.com/besiktas-zorlu",
        coordinates: "41.0422,29.0083",
        distance_to_office: 3.2,
    },
    {
      id: "3",
        name: "Levent - Zorlu Center",
        morning_shift: "07:45",
        evening_shift: "18:15",
      capacity: 50,
        map_url: "https://maps.google.com/levent-zorlu",
        coordinates: "41.0668,29.0168",
        distance_to_office: 1.8,
      },
      {
        id: "4",
        name: "Etiler - Zorlu Center",
        morning_shift: "08:15",
        evening_shift: "17:45",
        capacity: 40,
        map_url: "https://maps.google.com/etiler-zorlu",
        coordinates: "41.0789,29.0321",
        distance_to_office: 2.1,
      },
      {
        id: "5",
        name: "Ortaköy - Zorlu Center",
        morning_shift: "08:30",
        evening_shift: "17:30",
        capacity: 30,
        map_url: "https://maps.google.com/ortakoy-zorlu",
        coordinates: "41.0473,29.0273",
        distance_to_office: 4.5,
      },
    ]
    setServices(defaultServices)
    saveServicesToStorage(defaultServices)
  }, [saveServicesToStorage])

  // Save data to local storage whenever services change
  useEffect(() => {
    if (services.length > 0) {
      localStorage.setItem('services', JSON.stringify(services))
    }
  }, [services])

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Memoized filtered services for better performance
  const filteredServices = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return services
    }
    const searchLower = debouncedSearchQuery.toLowerCase()
    return services.filter((service) => {
      return (
        String(service.name).toLowerCase().includes(searchLower) ||
        String(service.morning_shift).toLowerCase().includes(searchLower) ||
        String(service.evening_shift).toLowerCase().includes(searchLower) ||
        String(service.capacity).toLowerCase().includes(searchLower) ||
        String(service.map_url).toLowerCase().includes(searchLower) ||
        String(service.coordinates).toLowerCase().includes(searchLower) ||
        String(service.distance_to_office).toLowerCase().includes(searchLower)
      )
    })
  }, [debouncedSearchQuery, services])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleAddService = () => {
    if (newService.name) {
      const service: Service = {
        id: Date.now().toString(),
        name: newService.name,
        morning_shift: newService.morning_shift || "08:00",
        evening_shift: newService.evening_shift || "18:00",
        capacity: newService.capacity || 40,
        map_url: newService.map_url || "",
        coordinates: newService.coordinates || "",
        distance_to_office: newService.distance_to_office || 0,
      }
      const updatedServices = [...services, service]
      setServices(updatedServices)
      saveServicesToStorage(updatedServices)
      setNewService({})
      setIsAddDialogOpen(false)
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setIsEditDialogOpen(true)
  }

  const handleUpdateService = () => {
    if (editingService) {
      const updatedServices = services.map(service => 
        service.id === editingService.id ? editingService : service
      )
      setServices(updatedServices)
      saveServicesToStorage(updatedServices)
      setEditingService(null)
      setIsEditDialogOpen(false)
    }
  }

  const openDeleteDialog = (service: Service) => {
    setDeletingService(service)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteService = () => {
    if (deletingService) {
      const updatedServices = services.filter((service) => service.id !== deletingService.id)
      setServices(updatedServices)
      saveServicesToStorage(updatedServices)
      setDeletingService(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleExportExcel = () => {
    const headers = ["Service Name", "Morning Shift", "Evening Shift", "Capacity", "Map URL", "Start Location Coordinate", "Distance to Office (km)"]
    const data = [
      headers,
      ...services.map((service) => [
        service.name,
        service.morning_shift,
        service.evening_shift,
        service.capacity,
        service.map_url,
        service.coordinates,
        service.distance_to_office,
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Services")
    
    // Auto-size columns
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...services.map(service => {
          const values = [service.name, service.morning_shift, service.evening_shift, service.capacity.toString(), service.map_url, service.coordinates, service.distance_to_office.toString()]
          return values[index]?.length || 0
        })
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, "shuttle_services.xlsx")
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
            console.error("Excel file must contain at least headers and one data row")
            return
          }

          const headers = jsonData[0]
          const importedServices: Service[] = jsonData
            .slice(1)
            .filter((row) => row.some(cell => cell && cell.toString().trim()))
            .map((row, index) => {
              return {
                id: `imported-${Date.now()}-${index}`,
                name: row[0] || "",
                morning_shift: row[1] || "08:00",
                evening_shift: row[2] || "18:00",
                capacity: Number.parseInt(row[3]?.toString()) || 40,
                map_url: row[4] || "",
                coordinates: row[5] || "",
                distance_to_office: Number.parseFloat(row[6]?.toString()) || 0,
              }
            })

          const updatedServices = [...services, ...importedServices]
          setServices(updatedServices)
          saveServicesToStorage(updatedServices)
        } catch (error) {
          console.error("Error reading Excel file. Please ensure it's a valid Excel file.", error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const resetNewService = () => {
    setNewService({})
    setIsAddDialogOpen(false)
  }

  const resetEditService = () => {
    setEditingService(null)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Management</h2>
          <p className="text-muted-foreground">Manage shuttle services and routes for employee transportation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="service-excel-import" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
              <input id="service-excel-import" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
            </label>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>Enter the service details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="service-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="service-name"
                    value={newService.name || ""}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="morning-shift" className="text-right">
                    Morning Shift
                  </Label>
                  <Input
                    id="morning-shift"
                    type="time"
                    value={newService.morning_shift || ""}
                    onChange={(e) => setNewService({ ...newService, morning_shift: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="evening-shift" className="text-right">
                    Evening Shift
                  </Label>
                  <Input
                    id="evening-shift"
                    type="time"
                    value={newService.evening_shift || ""}
                    onChange={(e) => setNewService({ ...newService, evening_shift: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={newService.capacity || ""}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setNewService({ ...newService, capacity: value })
                      }
                    }}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="map-url" className="text-right">
                    Map URL
                  </Label>
                  <Input
                    id="map-url"
                    value={newService.map_url || ""}
                    onChange={(e) => setNewService({ ...newService, map_url: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="coordinates" className="text-right">
                    Coordinates
                  </Label>
                  <Input
                    id="coordinates"
                    value={newService.coordinates || ""}
                    onChange={(e) => setNewService({ ...newService, coordinates: e.target.value })}
                    className="col-span-3"
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
                    value={newService.distance_to_office || ""}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        setNewService({ ...newService, distance_to_office: value })
                      }
                    }}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddService}>Add Service</Button>
                <Button variant="outline" onClick={resetNewService}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Bus className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Bus className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.capacity, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Employees</CardTitle>
            <Bus className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Not implemented yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
            <Bus className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.reduce((sum, s) => sum + s.capacity, 0)}</div>
            <p className="text-xs text-muted-foreground">All seats available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Distance</CardTitle>
            <Bus className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0 ? (services.reduce((sum, s) => sum + s.distance_to_office, 0) / services.length).toFixed(1) : "0.0"} km
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Services ({filteredServices.length})</CardTitle>
              <CardDescription>All shuttle services in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
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
                <TableHead>Service Name</TableHead>
                <TableHead>Morning Shift</TableHead>
                <TableHead>Evening Shift</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Map URL </TableHead>
                <TableHead>Start Location Coordinate</TableHead>
                <TableHead>Distance to Office (km)</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.morning_shift}</TableCell>
                  <TableCell>{service.evening_shift}</TableCell>
                  <TableCell>{service.capacity}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <a href={service.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {service.map_url}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{service.coordinates}</TableCell>
                  <TableCell>{service.distance_to_office} km</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditService(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(service)}>
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

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service details below.</DialogDescription>
          </DialogHeader>
          {editingService && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-morning-shift" className="text-right">
                  Morning Shift
                </Label>
                <Input
                  id="edit-morning-shift"
                  type="time"
                  value={editingService.morning_shift}
                  onChange={(e) => setEditingService({ ...editingService, morning_shift: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-evening-shift" className="text-right">
                  Evening Shift
                </Label>
                <Input
                  id="edit-evening-shift"
                  type="time"
                  value={editingService.evening_shift}
                  onChange={(e) => setEditingService({ ...editingService, evening_shift: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">
                  Capacity
                </Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={editingService.capacity || ""}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setEditingService({ ...editingService, capacity: value })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-map-url" className="text-right">
                  Map URL
                </Label>
                <Input
                  id="edit-map-url"
                  value={editingService.map_url || ""}
                  onChange={(e) => setEditingService({ ...editingService, map_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-coordinates" className="text-right">
                  Coordinates
                </Label>
                <Input
                  id="edit-coordinates"
                  value={editingService.coordinates || ""}
                  onChange={(e) => setEditingService({ ...editingService, coordinates: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-distance" className="text-right">
                  Distance to Office
                </Label>
                <Input
                  id="edit-distance"
                  type="number"
                  step="0.1"
                  value={editingService.distance_to_office || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setEditingService({ ...editingService, distance_to_office: value })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateService}>Update Service</Button>
            <Button variant="outline" onClick={resetEditService}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete service <strong>{deletingService?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The service will be permanently removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteService}>Delete Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
