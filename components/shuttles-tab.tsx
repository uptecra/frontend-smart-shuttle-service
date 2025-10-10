"use client";

import type React from "react";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Bus,
  Search,
} from "lucide-react";
import { toast } from "sonner";

// XLSX type declaration for dynamic import
type XLSXModule = typeof import("xlsx");

interface Shuttle {
  id: string;
  service_name?: string;
  driver_name?: string;
  driver_phone?: string;
  morning_shift: string;
  evening_shift: string;
  capacity: number;
  map_url: string;
}

interface ShuttlesTabProps {
  setActiveTab?: (tab: string) => void;
}

export const ShuttlesTab = memo(function ShuttlesTab({
  setActiveTab,
}: ShuttlesTabProps) {
  const [Shuttles, setShuttles] = useState<Shuttle[]>([]);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingShuttle, setDeletingShuttle] = useState<Shuttle | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [skipInvalidRows, setSkipInvalidRows] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [hasInvalidRows, setHasInvalidRows] = useState(false);

  // Helper function to save Shuttles to localStorage with useCallback
  const saveShuttlesToStorage = useCallback((ShuttlesToSave: Shuttle[]) => {
    localStorage.setItem("Shuttles", JSON.stringify(ShuttlesToSave));
  }, []);

  // Load data from local storage on component mount
  useEffect(() => {
    const loadShuttles = () => {
      const savedShuttles = localStorage.getItem("Shuttles");
      if (savedShuttles) {
        try {
          const parsedShuttles = JSON.parse(savedShuttles);
          if (Array.isArray(parsedShuttles)) {
            setShuttles(parsedShuttles);
          }
        } catch (error) {
          console.error("Error loading saved Shuttles:", error);
        }
      }
    };

    loadShuttles();

    // Listen for shuttle updates
    const handleShuttlesUpdate = () => {
      loadShuttles();
    };

    window.addEventListener("shuttlesUpdated", handleShuttlesUpdate);
    return () =>
      window.removeEventListener("shuttlesUpdated", handleShuttlesUpdate);
  }, []);

  // Save data to local storage whenever Shuttles change
  useEffect(() => {
    if (Shuttles.length > 0) {
      localStorage.setItem("Shuttles", JSON.stringify(Shuttles));
    }
  }, [Shuttles]);

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered Shuttles for better performance
  const filteredShuttles = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return Shuttles;
    }
    const searchLower = debouncedSearchQuery.toLowerCase();
    return Shuttles.filter((Shuttle) => {
      return (
        String(Shuttle.service_name || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(Shuttle.driver_name || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(Shuttle.driver_phone || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(Shuttle.morning_shift).toLowerCase().includes(searchLower) ||
        String(Shuttle.evening_shift).toLowerCase().includes(searchLower) ||
        String(Shuttle.capacity).toLowerCase().includes(searchLower) ||
        String(Shuttle.map_url).toLowerCase().includes(searchLower)
      );
    });
  }, [debouncedSearchQuery, Shuttles]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleEditShuttle = (Shuttle: Shuttle) => {
    // Navigate to add-shuttle page with edit data
    const editData = encodeURIComponent(JSON.stringify(Shuttle));
    if (typeof window !== "undefined") {
      window.location.hash = `add-shuttle?edit=${editData}`;
    }
  };

  const openDeleteDialog = (Shuttle: Shuttle) => {
    setDeletingShuttle(Shuttle);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteShuttle = () => {
    if (deletingShuttle) {
      const updatedShuttles = Shuttles.filter(
        (Shuttle) => Shuttle.id !== deletingShuttle.id
      );
      setShuttles(updatedShuttles);
      saveShuttlesToStorage(updatedShuttles);
      toast.success("Deleted successfully 🎉", {
        description: `${
          deletingShuttle.service_name || "Shuttle"
        } has been removed from your list.`,
      });
      setDeletingShuttle(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      // Dynamic import for XLSX to avoid SSR issues
      const XLSX: XLSXModule = await import("xlsx");

      const headers = [
        "Service Name",
        "Driver Name",
        "Driver Phone",
        "Morning Shift",
        "Evening Shift",
        "Capacity",
        // "Map URL",
      ];
      const data = [
        headers,
        ...Shuttles.map((Shuttle) => [
          Shuttle.service_name || "",
          Shuttle.driver_name || "",
          Shuttle.driver_phone || "",
          Shuttle.morning_shift,
          Shuttle.evening_shift,
          Shuttle.capacity,
          Shuttle.map_url,
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Shuttles");

      // Auto-size columns
      const colWidths = headers.map((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...Shuttles.map((Shuttle) => {
            const values = [
              Shuttle.service_name || "",
              Shuttle.driver_name || "",
              Shuttle.driver_phone || "",
              Shuttle.morning_shift,
              Shuttle.evening_shift,
              Shuttle.capacity.toString(),
              Shuttle.map_url,
            ];
            return values[index]?.length || 0;
          })
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      ws["!cols"] = colWidths;

      XLSX.writeFile(wb, "shuttles.xlsx");
      toast.success("Exported successfully 🎉", {
        description: "Shuttle data has been exported to Excel file.",
      });
    } catch (error) {
      console.error("Error exporting Excel file:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file);
    if (file) {
      setImportFile(file);

      // Pre-analyze the file to check for invalid rows
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Dynamic import for XLSX to avoid SSR issues
          const XLSX: XLSXModule = await import("xlsx");

          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as string[][];

          if (jsonData.length < 2) {
            console.error(
              "Excel file must contain at least headers and one data row"
            );
            toast.error(
              "Excel file must contain at least headers and one data row"
            );
            return;
          }

          const headers = jsonData[0];
          console.log("Excel headers found:", headers);

          // Helper function to find column index
          const getColumnIndex = (
            headerName: string,
            alternatives: string[] = []
          ) => {
            const searchTerms = [headerName, ...alternatives];

            for (const term of searchTerms) {
              const index = headers.findIndex(
                (header) =>
                  header &&
                  header.toString().toLowerCase().trim() ===
                    term.toLowerCase().trim()
              );
              if (index >= 0) {
                return index;
              }
            }
            return -1;
          };

          // Check if there are any rows with missing capacity data
          const hasInvalidRows = jsonData.slice(1).some((row) => {
            const capacityIndex = getColumnIndex("Capacity", [
              "capacity",
              "Kapasite",
              "Yolcu Sayısı",
              "Yolcu Sayisi",
              "Seat",
              "Koltuk",
            ]);
            const capacity = capacityIndex >= 0 ? row[capacityIndex] : "";
            return (
              !capacity ||
              capacity.toString().trim() === "" ||
              isNaN(Number(capacity))
            );
          });

          setHasInvalidRows(hasInvalidRows);

          // Only open dialog if there are invalid rows
          if (hasInvalidRows) {
            setIsImportDialogOpen(true);
          } else {
            // If no invalid rows, proceed directly with import
            handleImportExcel(file);
          }

          console.log("Import dialog opened, hasInvalidRows:", hasInvalidRows);
        } catch (error) {
          console.error("Error analyzing file:", error);
          toast.error("Error reading Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.log("No file selected");
    }
  };

  const handleImportExcel = async (file?: File) => {
    const fileToImport = file || importFile;
    if (!fileToImport) {
      console.log("No import file selected");
      return;
    }

    console.log("Starting Excel import with file:", fileToImport.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Dynamic import for XLSX to avoid SSR issues
        const XLSX: XLSXModule = await import("xlsx");

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (jsonData.length < 2) {
          console.error(
            "Excel file must contain at least headers and one data row"
          );
          toast.error(
            "Excel file must contain at least headers and one data row"
          );
          return;
        }

        const headers = jsonData[0];
        console.log("Excel headers found:", headers);

        // Create a mapping function to find column index by header name
        const getColumnIndex = (
          headerName: string,
          alternatives: string[] = []
        ) => {
          const searchTerms = [headerName, ...alternatives];

          for (const term of searchTerms) {
            const index = headers.findIndex(
              (header) =>
                header &&
                header.toString().toLowerCase().trim() ===
                  term.toLowerCase().trim()
            );
            if (index >= 0) {
              console.log(`Found "${term}" at index:`, index);
              return index;
            }
          }

          console.log(`Not found: ${searchTerms.join(", ")}`);
          return -1;
        };

        // Get the next available ID starting from 1
        const existingIds = Shuttles.map((s) => Number.parseInt(s.id)).filter(
          (id) => !isNaN(id)
        );
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

        const allProcessedShuttles = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell && cell.toString().trim()))
          .map((row, index) => {
            // Find column indices by header names with alternatives
            const serviceNameIndex = getColumnIndex("Service Name", [
              "name", // Excel'deki gerçek başlık
              "Servis Adı",
              "Servis Adi",
              "Service",
              "Servis",
              "Ad",
              "Name",
            ]);
            const driverNameIndex = getColumnIndex("Driver Name", [
              "Şoför Adı",
              "Sofor Adi",
              "Driver",
              "Şoför",
              "Sofor",
              "Ad Soyad",
            ]);
            const driverPhoneIndex = getColumnIndex("Driver Phone", [
              "Şoför Telefon",
              "Sofor Telefon",
              "Phone",
              "Telefon",
              "Tel",
              "GSM",
            ]);
            const morningShiftIndex = getColumnIndex("Morning Shift", [
              "morning_st", // Excel'deki gerçek başlık
              "Sabah Vardiya",
              "Morning",
              "Sabah",
              "Başlangıç",
              "Baslangic",
            ]);
            const eveningShiftIndex = getColumnIndex("Evening Shift", [
              "evening_shi", // Excel'deki gerçek başlık
              "Akşam Vardiya",
              "Evening",
              "Akşam",
              "Aksam",
              "Bitiş",
              "Bitis",
            ]);
            const capacityIndex = getColumnIndex("Capacity", [
              "capacity", // Excel'deki gerçek başlık
              "Kapasite",
              "Yolcu Sayısı",
              "Yolcu Sayisi",
              "Seat",
              "Koltuk",
            ]);
            const mapUrlIndex = getColumnIndex("Map URL", [
              "map_url", // Excel'deki gerçek başlık
              "Map Link",
              "Harita URL",
              "Harita Link",
              "URL",
              "Link",
              "Map",
              "Harita",
            ]);

            const capacityRaw = capacityIndex >= 0 ? row[capacityIndex] : null;
            const capacityValue = capacityRaw
              ? Number.parseInt(capacityRaw.toString())
              : null;

            const shuttle = {
              id: String(maxId + index + 1), // Auto-increment ID
              service_name:
                serviceNameIndex >= 0 ? row[serviceNameIndex] || "" : "",
              driver_name:
                driverNameIndex >= 0 ? row[driverNameIndex] || "" : "",
              driver_phone:
                driverPhoneIndex >= 0 ? row[driverPhoneIndex] || "" : "",
              morning_shift:
                morningShiftIndex >= 0
                  ? row[morningShiftIndex] || "08:00"
                  : "08:00",
              evening_shift:
                eveningShiftIndex >= 0
                  ? row[eveningShiftIndex] || "18:00"
                  : "18:00",
              capacity: capacityValue,
              map_url: mapUrlIndex >= 0 ? row[mapUrlIndex] || "" : "",
            };

            console.log(`Row ${index + 1} data:`, {
              serviceNameIndex,
              serviceNameValue:
                serviceNameIndex >= 0 ? row[serviceNameIndex] : "NOT_FOUND",
              mapUrlIndex,
              mapUrlValue: mapUrlIndex >= 0 ? row[mapUrlIndex] : "NOT_FOUND",
              capacityValue,
              shuttle,
            });

            return shuttle;
          });

        // Filter out shuttles with invalid capacity (empty, null, undefined, NaN or <= 0)
        let invalidCapacityCount = 0;
        const validCapacityShuttles = allProcessedShuttles.filter((shuttle) => {
          const isValidCapacity =
            shuttle.capacity !== null &&
            shuttle.capacity !== undefined &&
            !isNaN(shuttle.capacity) &&
            shuttle.capacity > 0;
          if (!isValidCapacity) {
            invalidCapacityCount++;
            console.log(`Skipping shuttle with invalid capacity:`, {
              serviceName: shuttle.service_name,
              capacity: shuttle.capacity,
              row: shuttle,
            });
          }
          return isValidCapacity;
        });

        // Check if all rows have invalid capacity
        if (validCapacityShuttles.length === 0) {
          toast.error(
            "No shuttles with valid capacity data found. Please ensure at least one shuttle has capacity information."
          );
          setIsImportDialogOpen(false);
          setImportFile(null);

          // Reset file input
          const fileInput = document.getElementById(
            "Shuttle-excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          return;
        }

        // Check if checkbox is not checked and there are invalid capacity rows
        if (!skipInvalidRows && invalidCapacityCount > 0) {
          toast.error(
            `Found ${invalidCapacityCount} shuttle(s) with invalid capacity. Please enable "Skip invalid rows" to continue or fix the data.`
          );

          // Reset file input and close dialog so same file can be imported again
          const fileInput = document.getElementById(
            "Shuttle-excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          setIsImportDialogOpen(false);
          setImportFile(null);
          setSkipInvalidRows(false);
          return;
        }

        // Filter out duplicate shuttles
        let duplicateCount = 0;
        const importedShuttles: Shuttle[] = (
          validCapacityShuttles as Shuttle[]
        ).filter((shuttle) => {
          // Check if shuttle already exists in current Shuttles list
          const isDuplicate = Shuttles.some(
            (existing) =>
              existing.service_name === shuttle.service_name &&
              existing.driver_name === shuttle.driver_name &&
              existing.driver_phone === shuttle.driver_phone
          );
          if (isDuplicate) {
            duplicateCount++;
            console.log(`Skipping duplicate shuttle:`, {
              serviceName: shuttle.service_name,
              driverName: shuttle.driver_name,
              driverPhone: shuttle.driver_phone,
            });
          }
          return !isDuplicate;
        });

        // Check if all valid shuttles are duplicates
        if (importedShuttles.length === 0 && validCapacityShuttles.length > 0) {
          toast.error(
            `All ${duplicateCount} shuttle(s) already exist in the system. No new data to import.`
          );
          setIsImportDialogOpen(false);
          setImportFile(null);

          // Reset file input
          const fileInput = document.getElementById(
            "Shuttle-excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          return;
        }

        const updatedShuttles = [...Shuttles, ...importedShuttles];
        setShuttles(updatedShuttles);
        saveShuttlesToStorage(updatedShuttles);

        // Show success toast with information about skipped rows
        const totalSkipped = invalidCapacityCount + duplicateCount;
        if (totalSkipped > 0) {
          const reasons = [];
          if (invalidCapacityCount > 0) {
            reasons.push(`${invalidCapacityCount} invalid capacity`);
          }
          if (duplicateCount > 0) {
            reasons.push(`${duplicateCount} duplicate`);
          }
          toast.success("Import completed with warnings ⚠️", {
            description: `${
              importedShuttles.length
            } shuttles imported successfully. ${totalSkipped} rows skipped (${reasons.join(
              ", "
            )}).`,
          });
        } else {
          toast.success("Import successful 🎉", {
            description: `${importedShuttles.length} shuttles have been imported successfully.`,
          });
        }

        // Reset states
        setIsImportDialogOpen(false);
        setImportFile(null);
        setSkipInvalidRows(false);
        setHasInvalidRows(false);

        // Reset file input
        const fileInput = document.getElementById(
          "Shuttle-excel-import"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } catch (error) {
        console.error(
          "Error reading Excel file. Please ensure it's a valid Excel file.",
          error
        );
        toast.error(
          "Failed to import Excel file. Please ensure it's a valid Excel file."
        );

        // Reset file input
        const fileInput = document.getElementById(
          "Shuttle-excel-import"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(fileToImport);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Shuttle Management
          </h2>
          <p className="text-muted-foreground">
            Manage shuttles and routes for employee transportation
          </p>
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
              <input
                id="Shuttle-excel-import"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
          <Button
            onClick={() => {
              // Clear URL hash to ensure fresh form
              window.location.hash = "add-shuttle";
              setActiveTab?.("add-shuttle");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Shuttle
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shuttles
            </CardTitle>
            <Bus className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Shuttles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Capacity
            </CardTitle>
            <Bus className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Shuttles.reduce((sum, s) => sum + s.capacity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Employees
            </CardTitle>
            <Bus className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Not implemented yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Seats
            </CardTitle>
            <Bus className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Shuttles.reduce((sum, s) => sum + s.capacity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All seats available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Drivers
            </CardTitle>
            <Bus className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Shuttles.filter((s) => s.driver_name).length}
            </div>
            <p className="text-xs text-muted-foreground">Drivers assigned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shuttles ({filteredShuttles.length})</CardTitle>
              <CardDescription>
                All shuttle Shuttles in the system
              </CardDescription>
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
                <TableHead>ID</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Driver Phone</TableHead>
                <TableHead>Morning Shift</TableHead>
                <TableHead>Evening Shift</TableHead>
                <TableHead>Capacity</TableHead>
                {/* <TableHead>Map URL</TableHead> */}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShuttles.map((Shuttle) => (
                <TableRow key={Shuttle.id}>
                  <TableCell className="font-medium truncate max-w-[100px]">
                    {Shuttle.id}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    {Shuttle.service_name || "-"}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px]">
                    {Shuttle.driver_name || "-"}
                  </TableCell>
                  <TableCell className="truncate max-w-[120px]">
                    {Shuttle.driver_phone || "-"}
                  </TableCell>
                  <TableCell>{Shuttle.morning_shift}</TableCell>
                  <TableCell>{Shuttle.evening_shift}</TableCell>
                  <TableCell>{Shuttle.capacity}</TableCell>
                  {/* <TableCell className="max-w-[150px] truncate">
                    {Shuttle.map_url ? (
                      <a
                        href={Shuttle.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {Shuttle.map_url}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell> */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/shuttles/${Shuttle.id}`)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditShuttle(Shuttle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(Shuttle)}
                      >
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Shuttle{" "}
              <strong>
                {deletingShuttle?.service_name || deletingShuttle?.id}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The Shuttle will be permanently
              removed from the system.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShuttle}>
              Delete Shuttle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Excel Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Excel File</DialogTitle>
            <DialogDescription>
              {hasInvalidRows
                ? "Some rows have missing capacity data. You can choose to skip them."
                : "Import shuttles from Excel file."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {hasInvalidRows && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-invalid-shuttles"
                  checked={skipInvalidRows}
                  onCheckedChange={(checked) =>
                    setSkipInvalidRows(checked as boolean)
                  }
                />
                <Label
                  htmlFor="skip-invalid-shuttles"
                  className="text-sm font-medium"
                >
                  Skip invalid rows (rows without capacity will be skipped)
                </Label>
              </div>
            )}
            {importFile && (
              <div className="text-sm text-muted-foreground">
                Selected file: {importFile.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
                setSkipInvalidRows(false);
                setHasInvalidRows(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Import button clicked, importFile:", importFile);
                console.log("Skip invalid rows:", skipInvalidRows);
                handleImportExcel();
              }}
            >
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
