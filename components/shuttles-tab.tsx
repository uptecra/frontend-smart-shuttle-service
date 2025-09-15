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

export const ShuttlesTab = memo(function ShuttlesTab() {
  const [Shuttles, setShuttles] = useState<Shuttle[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingShuttle, setEditingShuttle] = useState<Shuttle | null>(null)
  const [deletingShuttle, setDeletingShuttle] = useState<Shuttle | null>(null)
  const [newShuttle, setNewShuttle] = useState<Partial<Shuttle>>({})

  // Helper function to save Shuttles to localStorage with useCallback
  const saveShuttlesToStorage = useCallback((ShuttlesToSave: Shuttle[]) => {
    localStorage.setItem('Shuttles', JSON.stringify(ShuttlesToSave))
  }, [])

  // Load data from local storage on component mount
  useEffect(() => {
    const savedShuttles = localStorage.getItem('Shuttles')
    if (savedShuttles) {
      try {
        const parsedShuttles = JSON.parse(savedShuttles)
        if (Array.isArray(parsedShuttles) && parsedShuttles.length > 0) {
          setShuttles(parsedShuttles)
        }
      } catch (error) {
        console.error('Error loading saved Shuttles:', error)
      }
    }
  }, [])

  // Save data to local storage whenever Shuttles change
  useEffect(() => {
    if (Shuttles.length > 0) {
      localStorage.setItem('Shuttles', JSON.stringify(Shuttles))
    }
  }, [Shuttles])

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Memoized filtered Shuttles for better performance
  const filteredShuttles = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return Shuttles
    }
    const searchLower = debouncedSearchQuery.toLowerCase()
    return Shuttles.filter((Shuttle) => {
      return (
        String(Shuttle.name).toLowerCase().includes(searchLower) ||
        String(Shuttle.morning_shift).toLowerCase().includes(searchLower) ||
        String(Shuttle.evening_shift).toLowerCase().includes(searchLower) ||
        String(Shuttle.capacity).toLowerCase().includes(searchLower) ||
        String(Shuttle.map_url).toLowerCase().includes(searchLower) ||
        String(Shuttle.coordinates).toLowerCase().includes(searchLower) ||
        String(Shuttle.distance_to_office).toLowerCase().includes(searchLower)
      )
    })
  }, [debouncedSearchQuery, Shuttles])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleAddShuttle = () => {
    if (newShuttle.name) {
      const Shuttle: Shuttle = {
        id: Date.now().toString(),
        name: newShuttle.name,
        morning_shift: newShuttle.morning_shift || "08:00",
        evening_shift: newShuttle.evening_shift || "18:00",
        capacity: newShuttle.capacity || 40,
        map_url: newShuttle.map_url || "",
        coordinates: newShuttle.coordinates || "",
        distance_to_office: newShuttle.distance_to_office || 0,
      }
      const updatedShuttles = [...Shuttles, Shuttle]
      setShuttles(updatedShuttles)
      saveShuttlesToStorage(updatedShuttles)
      setNewShuttle({})
      setIsAddDialogOpen(false)
    }
  }

  const handleEditShuttle = (Shuttle: Shuttle) => {
    setEditingShuttle(Shuttle)
    setIsEditDialogOpen(true)
  }

  const handleUpdateShuttle = () => {
    if (editingShuttle) {
      const updatedShuttles = Shuttles.map(Shuttle => 
        Shuttle.id === editingShuttle.id ? editingShuttle : Shuttle
      )
      setShuttles(updatedShuttles)
      saveShuttlesToStorage(updatedShuttles)
      setEditingShuttle(null)
      setIsEditDialogOpen(false)
    }
  }

  const openDeleteDialog = (Shuttle: Shuttle) => {
    setDeletingShuttle(Shuttle)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteShuttle = () => {
    if (deletingShuttle) {
      const updatedShuttles = Shuttles.filter((Shuttle) => Shuttle.id !== deletingShuttle.id)
      setShuttles(updatedShuttles)
      saveShuttlesToStorage(updatedShuttles)
      setDeletingShuttle(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleExportExcel = () => {
    const headers = ["Shuttle Name", "Morning Shift", "Evening Shift", "Capacity", "Map URL", "Start Location Coordinate", "Distance to Office (km)"]
    const data = [
      headers,
      ...Shuttles.map((Shuttle) => [
        Shuttle.name,
        Shuttle.morning_shift,
        Shuttle.evening_shift,
        Shuttle.capacity,
        Shuttle.map_url,
        Shuttle.coordinates,
        Shuttle.distance_to_office,
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Shuttles")
    
    // Auto-size columns
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...Shuttles.map(Shuttle => {
          const values = [Shuttle.name, Shuttle.morning_shift, Shuttle.evening_shift, Shuttle.capacity.toString(), Shuttle.map_url, Shuttle.coordinates, Shuttle.distance_to_office.toString()]
          return values[index]?.length || 0
        })
      )
      return { wch: Math.min(maxLength + 2, 50) }
    })
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, "shuttle_Shuttles.xlsx")
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
          const importedShuttles: Shuttle[] = jsonData
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

          const updatedShuttles = [...Shuttles, ...importedShuttles]
          setShuttles(updatedShuttles)
          saveShuttlesToStorage(updatedShuttles)
        } catch (error) {
          console.error("Error reading Excel file. Please ensure it's a valid Excel file.", error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const resetNewShuttle = () => {
    setNewShuttle({})
    setIsAddDialogOpen(false)
  }

  const resetEditShuttle = () => {
    setEditingShuttle(null)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shuttle Management</h2>
          <p className="text-muted-foreground">Manage shuttle Shuttles and routes for employee transportation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" asChild>
            <label htmlFor="Shuttle-excel-import" className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Import Excel
              <input id="Shuttle-excel-import" type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
            </label>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Shuttle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Shuttle</DialogTitle>
                <DialogDescription>Enter the Shuttle details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="Shuttle-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="Shuttle-name"
                    value={newShuttle.name || ""}
                    onChange={(e) => setNewShuttle({ ...newShuttle, name: e.target.value })}
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
                    value={newShuttle.morning_shift || ""}
                    onChange={(e) => setNewShuttle({ ...newShuttle, morning_shift: e.target.value })}
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
                    value={newShuttle.evening_shift || ""}
                    onChange={(e) => setNewShuttle({ ...newShuttle, evening_shift: e.target.value })}
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
                    value={newShuttle.capacity || ""}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      if (!isNaN(value)) {
                        setNewShuttle({ ...newShuttle, capacity: value })
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
                    value={newShuttle.map_url || ""}
                    onChange={(e) => setNewShuttle({ ...newShuttle, map_url: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="coordinates" className="text-right">
                    Coordinates
                  </Label>
                  <Input
                    id="coordinates"
                    value={newShuttle.coordinates || ""}
                    onChange={(e) => setNewShuttle({ ...newShuttle, coordinates: e.target.value })}
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
                    value={newShuttle.distance_to_office || ""}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value)
                      if (!isNaN(value)) {
                        setNewShuttle({ ...newShuttle, distance_to_office: value })
                      }
                    }}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddShuttle}>Add Shuttle</Button>
                <Button variant="outline" onClick={resetNewShuttle}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shuttles</CardTitle>
            <Bus className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Shuttles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Bus className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Shuttles.reduce((sum, s) => sum + s.capacity, 0)}</div>
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
            <div className="text-2xl font-bold">{Shuttles.reduce((sum, s) => sum + s.capacity, 0)}</div>
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
              {Shuttles.length > 0 ? (Shuttles.reduce((sum, s) => sum + s.distance_to_office, 0) / Shuttles.length).toFixed(1) : "0.0"} km
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shuttles ({filteredShuttles.length})</CardTitle>
              <CardDescription>All shuttle Shuttles in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Shuttles..."
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
                <TableHead>Shuttle Name</TableHead>
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
              {filteredShuttles.map((Shuttle) => (
                <TableRow key={Shuttle.id}>
                  <TableCell className="font-medium">{Shuttle.name}</TableCell>
                  <TableCell>{Shuttle.morning_shift}</TableCell>
                  <TableCell>{Shuttle.evening_shift}</TableCell>
                  <TableCell>{Shuttle.capacity}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    <a href={Shuttle.map_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {Shuttle.map_url}
                    </a>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{Shuttle.coordinates}</TableCell>
                  <TableCell>{Shuttle.distance_to_office} km</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditShuttle(Shuttle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(Shuttle)}>
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

      {/* Edit Shuttle Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Shuttle</DialogTitle>
            <DialogDescription>Update the Shuttle details below.</DialogDescription>
          </DialogHeader>
          {editingShuttle && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingShuttle.name}
                  onChange={(e) => setEditingShuttle({ ...editingShuttle, name: e.target.value })}
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
                  value={editingShuttle.morning_shift}
                  onChange={(e) => setEditingShuttle({ ...editingShuttle, morning_shift: e.target.value })}
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
                  value={editingShuttle.evening_shift}
                  onChange={(e) => setEditingShuttle({ ...editingShuttle, evening_shift: e.target.value })}
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
                  value={editingShuttle.capacity || ""}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value)
                    if (!isNaN(value)) {
                      setEditingShuttle({ ...editingShuttle, capacity: value })
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
                  value={editingShuttle.map_url || ""}
                  onChange={(e) => setEditingShuttle({ ...editingShuttle, map_url: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-coordinates" className="text-right">
                  Coordinates
                </Label>
                <Input
                  id="edit-coordinates"
                  value={editingShuttle.coordinates || ""}
                  onChange={(e) => setEditingShuttle({ ...editingShuttle, coordinates: e.target.value })}
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
                  value={editingShuttle.distance_to_office || ""}
                  onChange={(e) => {
                    const value = Number.parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setEditingShuttle({ ...editingShuttle, distance_to_office: value })
                    }
                  }}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateShuttle}>Update Shuttle</Button>
            <Button variant="outline" onClick={resetEditShuttle}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Shuttle</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Shuttle <strong>{deletingShuttle?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The Shuttle will be permanently removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteShuttle}>Delete Shuttle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
