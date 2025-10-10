"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Download, Trash2, Edit, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";
import { toast } from "sonner";

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

export const EmployeesTab = memo(function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  const [pendingToggle, setPendingToggle] = useState<{
    employeeId: string;
    next: boolean;
  } | null>(null);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [skipInvalidRows, setSkipInvalidRows] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [hasInvalidRows, setHasInvalidRows] = useState(false);

  // Load employees function - shuttle tab'ındaki gibi
  const loadEmployees = useCallback(() => {
    console.log("loadEmployees called - reloading from localStorage");
    const savedEmployees = localStorage.getItem("employees");
    if (savedEmployees) {
      try {
        const parsedEmployees = JSON.parse(savedEmployees);
        if (Array.isArray(parsedEmployees)) {
          const normalized = parsedEmployees.map((e: Employee) => ({
            ...e,
            active: e.active ?? true,
          }));
          console.log("Setting employees state with:", normalized);
          setEmployees(normalized);
          localStorage.setItem("employees", JSON.stringify(normalized));
        }
      } catch (error) {
        console.error("Error loading saved employees:", error);
      }
    } else {
      console.log("No employees found in localStorage");
    }
  }, []);

  // Load data from local storage on component mount
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Listen for external updates (e.g., AddEmployeeTab saving to localStorage)
  useEffect(() => {
    const handleUpdated = () => {
      // Reload employees from localStorage
      const savedEmployees = localStorage.getItem("employees");
      if (savedEmployees) {
        try {
          const parsedEmployees = JSON.parse(savedEmployees);
          if (Array.isArray(parsedEmployees)) {
            const normalized = parsedEmployees.map((e: Employee) => ({
              ...e,
              active: e.active ?? true,
            }));
            setEmployees(normalized);
          }
        } catch (error) {
          console.error("Error loading saved employees:", error);
        }
      }
    };
    window.addEventListener("employeesUpdated", handleUpdated);
    return () => window.removeEventListener("employeesUpdated", handleUpdated);
  }, []);

  // Debounced search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoized filtered employees for better performance
  const filteredEmployees = useMemo(() => {
    if (debouncedSearchQuery.trim() === "") {
      return employees;
    }
    const searchLower = debouncedSearchQuery.toLowerCase();
    return employees.filter((employee) => {
      return (
        String(employee.id).toLowerCase().includes(searchLower) ||
        String(employee.name || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(employee.email || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(employee.phone || "")
          .toLowerCase()
          .includes(searchLower) ||
        String(employee.address).toLowerCase().includes(searchLower) ||
        String(employee.coordinates).toLowerCase().includes(searchLower) ||
        String(employee.distance_to_office).toLowerCase().includes(searchLower)
      );
    });
  }, [debouncedSearchQuery, employees]);

  // Save data to local storage whenever employees change
  const saveEmployeesToStorage = useCallback((updatedEmployees: Employee[]) => {
    try {
      localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      console.log("Employees saved to localStorage:", updatedEmployees);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast.error("Error saving data");
    }
  }, []);

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
      };

      const updatedEmployees = [...employees, employee];
      setEmployees(updatedEmployees);
      saveEmployeesToStorage(updatedEmployees);

      setNewEmployee({});
      setIsAddDialogOpen(false);
      toast.success("Employee added successfully");
    }
  };

  const handleEditEmployee = () => {
    if (editingEmployee && editingEmployee.id && editingEmployee.address) {
      const updatedEmployees = employees.map((emp) =>
        emp.id === editingEmployee.id ? editingEmployee : emp
      );

      setEmployees(updatedEmployees);
      saveEmployeesToStorage(updatedEmployees);

      setEditingEmployee(null);
      setIsEditDialogOpen(false);
      toast.success("Employee updated successfully");
    }
  };

  const openDeleteDialog = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const applyActiveUpdate = (employeeId: string, next: boolean) => {
    const target = employees.find((e) => e.id === employeeId);
    const updated = employees.map((e) =>
      e.id === employeeId ? { ...e, active: next } : e
    );
    setEmployees(updated);
    saveEmployeesToStorage(updated);
    if (next) {
      toast.success("Activated successfully ✅", {
        description: `${
          target?.name || target?.id || "Employee"
        } is now active.`,
      });
    }
  };

  const toggleActive = (employeeId: string, next: boolean) => {
    const target = employees.find((e) => e.id === employeeId);
    const current = target?.active ?? true;
    // If turning off, ask confirmation via dialog
    if (current && !next) {
      setPendingToggle({ employeeId, next });
      setIsToggleDialogOpen(true);
      return;
    }
    applyActiveUpdate(employeeId, next);
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      applyActiveUpdate(pendingToggle.employeeId, pendingToggle.next);
      setPendingToggle(null);
      setIsToggleDialogOpen(false);
    }
  };

  const cancelToggle = () => {
    setPendingToggle(null);
    setIsToggleDialogOpen(false);
  };

  const handleDeleteEmployee = () => {
    if (deletingEmployee) {
      const updatedEmployees = employees.filter(
        (emp) => emp.id !== deletingEmployee.id
      );
      setEmployees(updatedEmployees);
      saveEmployeesToStorage(updatedEmployees);

      setDeletingEmployee(null);
      setIsDeleteDialogOpen(false);
      toast.success("Employee deleted successfully");
    }
  };

  const openEditDialog = (employee: Employee) => {
    // Navigate to add-employee tab with employee data
    const employeeData = encodeURIComponent(JSON.stringify(employee));
    window.location.hash = `add-employee?edit=${employeeData}`;
  };

  const handleExportExcel = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Coordinates",
      "Distance to Office",
    ];
    const data = [
      headers,
      ...filteredEmployees.map((emp) => [
        emp.id,
        emp.name || "",
        emp.email || "",
        emp.phone || "",
        emp.address,
        emp.coordinates,
        emp.distance_to_office,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Auto-size columns
    const colWidths = headers.map((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...filteredEmployees.map((emp) => {
          const values = [
            emp.id,
            emp.name || "",
            emp.email || "",
            emp.phone || "",
            emp.address,
            emp.coordinates,
            emp.distance_to_office.toString(),
          ];
          const value = values[index];
          return (
            (typeof value === "string" ? value : String(value)).length || 0
          );
        })
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, "employees_export.xlsx");
    toast.success("Excel file exported successfully");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("File selected:", file);
    if (file) {
      setImportFile(file);

      // Pre-analyze the file to check for invalid rows
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as string[][];

          if (jsonData.length < 2) {
            toast.error(
              "Excel file must contain at least headers and one data row"
            );
            return;
          }

          const headers = jsonData[0];
          const isNewFormat = headers.length >= 7;

          // Check if there are any rows with missing addresses
          const hasInvalidRows = jsonData.slice(1).some((row) => {
            const address = isNewFormat ? row[4] || "" : row[1] || "";
            return !address || address.trim() === "";
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

  const handleImportExcel = (file?: File) => {
    const fileToImport = file || importFile;
    if (!fileToImport) {
      console.log("No import file selected");
      return;
    }

    console.log("Starting Excel import with file:", fileToImport.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (jsonData.length < 2) {
          toast.error(
            "Excel file must contain at least headers and one data row"
          );
          setIsImportDialogOpen(false);
          setImportFile(null);
          return;
        }

        const headers = jsonData[0];
        // Find the highest existing ID to continue numbering
        let maxId = 0;
        employees.forEach((emp) => {
          const idNum = parseInt(emp.id, 10);
          if (!isNaN(idNum) && idNum > maxId) {
            maxId = idNum;
          }
        });

        const importedEmployees: Employee[] = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell && cell.toString().trim()))
          .map((row, index) => {
            // Support both old and new formats by checking header count
            const isNewFormat = headers.length >= 7;
            const address = isNewFormat ? row[4] || "" : row[1] || "";
            return {
              id: String(maxId + index + 1),
              name: isNewFormat ? row[1] || "" : "",
              email: isNewFormat ? row[2] || "" : "",
              phone: isNewFormat ? row[3] || "" : "",
              address: address,
              coordinates: isNewFormat ? row[5] || "" : row[2] || "",
              distance_to_office:
                parseFloat(isNewFormat ? (row[6] as any) : (row[3] as any)) ||
                0,
            };
          });

        // Filter out employees without address
        const employeesWithAddress = importedEmployees.filter(
          (emp) => emp.address && emp.address.trim() !== ""
        );

        const employeesWithoutAddress = importedEmployees.filter(
          (emp) => !emp.address || emp.address.trim() === ""
        );

        // Check for duplicate data (same name, email, phone, address combination)
        const duplicateEmployees: Employee[] = [];
        const newEmployees: Employee[] = [];

        console.log(
          "Checking for duplicates against",
          employees.length,
          "existing employees"
        );

        employeesWithAddress.forEach((importedEmp, index) => {
          console.log(`Checking employee ${index + 1}:`, {
            name: importedEmp.name,
            email: importedEmp.email,
            phone: importedEmp.phone,
            address: importedEmp.address,
          });

          const isDuplicate = employees.some((existingEmp) => {
            const isDup =
              existingEmp.name === importedEmp.name &&
              existingEmp.email === importedEmp.email &&
              existingEmp.phone === importedEmp.phone &&
              existingEmp.address === importedEmp.address;
            if (isDup) {
              console.log(
                "Found duplicate with existing employee:",
                existingEmp
              );
            }
            return isDup;
          });

          if (isDuplicate) {
            duplicateEmployees.push(importedEmp);
            console.log("Added to duplicates");
          } else {
            newEmployees.push(importedEmp);
            console.log("Added to new employees");
          }
        });

        if (employeesWithAddress.length === 0) {
          toast.error(
            "No employees with valid address data found. Please ensure at least one employee has address information."
          );
          setIsImportDialogOpen(false);
          setImportFile(null);

          // Reset file input
          const fileInput = document.getElementById(
            "excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          return;
        }

        if (!skipInvalidRows && employeesWithoutAddress.length > 0) {
          toast.error(
            `Found ${employeesWithoutAddress.length} employee(s) without address. Please enable "Skip invalid rows" to continue or fix the data.`
          );

          // Reset file input and close dialog so same file can be imported again
          const fileInput = document.getElementById(
            "excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          setIsImportDialogOpen(false);
          setImportFile(null);
          setSkipInvalidRows(false);
          return;
        }

        // Check if all valid employees (with address) are duplicates
        if (newEmployees.length === 0 && employeesWithAddress.length > 0) {
          toast.error(
            `All ${duplicateEmployees.length} employee(s) already exist in the system. No new data to import.`
          );
          setIsImportDialogOpen(false);
          setImportFile(null);
          setSkipInvalidRows(false);

          // Reset file input
          const fileInput = document.getElementById(
            "excel-import"
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          return;
        }

        console.log("=== IMPORT SUMMARY ===");
        console.log("New employees to import:", newEmployees.length);
        console.log("Duplicate employees found:", duplicateEmployees.length);
        console.log(
          "Employees without address:",
          employeesWithoutAddress.length
        );
        console.log(
          "Total employees with address:",
          employeesWithAddress.length
        );
        console.log("Existing employees count:", employees.length);

        const updatedEmployees = [...employees, ...newEmployees];
        console.log("Updated employees total:", updatedEmployees.length);

        setEmployees(updatedEmployees);
        saveEmployeesToStorage(updatedEmployees);

        // Prepare scenario-specific success message
        console.log("=== MESSAGE CONSTRUCTION ===");
        console.log("newEmployees.length:", newEmployees.length);
        console.log("duplicateEmployees.length:", duplicateEmployees.length);
        console.log(
          "employeesWithoutAddress.length:",
          employeesWithoutAddress.length
        );

        let successMessage = "";
        const totalProcessed =
          newEmployees.length +
          duplicateEmployees.length +
          employeesWithoutAddress.length;

        // Scenario 1: All new employees, no issues - NO POPUP
        if (
          newEmployees.length > 0 &&
          duplicateEmployees.length === 0 &&
          employeesWithoutAddress.length === 0
        ) {
          // No popup for clean imports - just silently import
          console.log("Clean import - no popup needed");
        }
        // Scenario 2: Some new, some duplicates, no missing addresses
        else if (
          newEmployees.length > 0 &&
          duplicateEmployees.length > 0 &&
          employeesWithoutAddress.length === 0
        ) {
          successMessage = `Successfully imported ${newEmployees.length} new employees. Skipped ${duplicateEmployees.length} duplicate(s) that already exist in the system.`;
        }
        // Scenario 3: Some new, some missing addresses, no duplicates
        else if (
          newEmployees.length > 0 &&
          duplicateEmployees.length === 0 &&
          employeesWithoutAddress.length > 0
        ) {
          const skippedRows = employeesWithoutAddress.map((emp) => {
            const originalIndex = importedEmployees.findIndex(
              (e) => e.id === emp.id
            );
            return originalIndex + 2; // +2 because Excel rows start from 1 and we skip header
          });
          successMessage = `Successfully imported ${
            newEmployees.length
          } new employees. Skipped rows ${skippedRows.join(
            ", "
          )} due to missing address data.`;
        }
        // Scenario 4: Mixed - new, duplicates, and missing addresses
        else if (
          newEmployees.length > 0 &&
          (duplicateEmployees.length > 0 || employeesWithoutAddress.length > 0)
        ) {
          const skippedReasons = [];

          if (duplicateEmployees.length > 0) {
            skippedReasons.push(`${duplicateEmployees.length} duplicate(s)`);
          }

          if (employeesWithoutAddress.length > 0) {
            const skippedRows = employeesWithoutAddress.map((emp) => {
              const originalIndex = importedEmployees.findIndex(
                (e) => e.id === emp.id
              );
              return originalIndex + 2;
            });
            skippedReasons.push(
              `rows ${skippedRows.join(", ")} missing address`
            );
          }

          successMessage = `Successfully imported ${
            newEmployees.length
          } new employees. Skipped: ${skippedReasons.join(", ")}.`;
        }
        // Fallback scenario - no popup for clean imports
        else {
          console.log("Fallback scenario - clean import, no popup");
        }

        // Only show popup if there were issues (duplicates or missing addresses)
        if (
          duplicateEmployees.length > 0 ||
          employeesWithoutAddress.length > 0
        ) {
          console.log("Final success message:", successMessage);
          toast.success(successMessage);
        } else {
          console.log("Clean import - no popup shown");
          // Show success toast for clean import
          toast.success("Import successful 🎉", {
            description: `${newEmployees.length} employees have been imported successfully.`,
          });
        }

        setIsImportDialogOpen(false);
        setImportFile(null);
        setSkipInvalidRows(false);
        setHasInvalidRows(false);

        // Reset file input
        const fileInput = document.getElementById(
          "excel-import"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      } catch (error) {
        toast.error(
          "Error reading Excel file. Please ensure it's a valid Excel file."
        );
        console.error("Excel import error:", error);
        setIsImportDialogOpen(false);
        setImportFile(null);

        // Reset file input
        const fileInput = document.getElementById(
          "excel-import"
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = "";
        }
      }
    };
    reader.readAsArrayBuffer(fileToImport);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Employee Management
          </h2>
          <p className="text-muted-foreground">
            Manage employees and their locations for shuttle optimization
          </p>
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
              <input
                id="excel-import"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileSelect}
              />
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
            <DialogDescription>
              Update the employee details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label htmlFor="edit-id" className="sm:text-right text-left">
                ID
              </Label>
              <div className="sm:col-span-3 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                {editingEmployee?.id || ""}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label
                htmlFor="edit-name"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Name Surname
              </Label>
              <Input
                id="edit-name"
                value={editingEmployee?.name || ""}
                onChange={(e) =>
                  setEditingEmployee(
                    editingEmployee
                      ? { ...editingEmployee, name: e.target.value }
                      : null
                  )
                }
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label
                htmlFor="edit-email"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editingEmployee?.email || ""}
                onChange={(e) =>
                  setEditingEmployee(
                    editingEmployee
                      ? { ...editingEmployee, email: e.target.value }
                      : null
                  )
                }
                className="sm:col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label
                htmlFor="edit-phone"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Phone
              </Label>
              <Input
                id="edit-phone"
                value={editingEmployee?.phone || ""}
                onChange={(e) =>
                  setEditingEmployee(
                    editingEmployee
                      ? { ...editingEmployee, phone: e.target.value }
                      : null
                  )
                }
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
                onChange={(e) =>
                  setEditingEmployee(
                    editingEmployee
                      ? { ...editingEmployee, address: e.target.value }
                      : null
                  )
                }
                className="sm:col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-3 sm:gap-4">
              <Label
                htmlFor="edit-coordinates"
                className="sm:text-right text-left"
              >
                Coordinates
              </Label>
              <Input
                id="edit-coordinates"
                placeholder="41.0782,29.0174"
                value={editingEmployee?.coordinates || ""}
                onChange={(e) =>
                  setEditingEmployee(
                    editingEmployee
                      ? { ...editingEmployee, coordinates: e.target.value }
                      : null
                  )
                }
                className="sm:col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
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
              Are you sure you want to delete employee{" "}
              <strong>{deletingEmployee?.id}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The employee will be permanently
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
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employees ({filteredEmployees.length})</CardTitle>
              <CardDescription>
                All registered employees in the system
              </CardDescription>
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
                  <TableHead className="px-2 py-1 truncate">Status</TableHead>
                  <TableHead className="px-2 py-1 truncate">ID</TableHead>
                  <TableHead className="px-2 py-1 truncate">Name</TableHead>
                  <TableHead className="px-2 py-1 truncate">Email</TableHead>
                  <TableHead className="px-2 py-1 truncate">Phone</TableHead>
                  <TableHead className="px-2 py-1 truncate">Address</TableHead>
                  <TableHead className="px-2 py-1 truncate">
                    Coordinates
                  </TableHead>
                  <TableHead className="px-2 py-1 truncate">
                    Distance (km)
                  </TableHead>
                  <TableHead className="px-2 py-1 truncate">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="px-2 py-1">
                      <Switch
                        checked={employee.active ?? true}
                        onCheckedChange={(v) => toggleActive(employee.id, v)}
                      />
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 truncate"
                      title={String(employee.id)}
                    >
                      {employee.id}
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 truncate"
                      title={employee.name || ""}
                    >
                      {employee.name}
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 max-w-[120px] truncate"
                      title={employee.email || ""}
                    >
                      {employee.email}
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 max-w-[120px] truncate"
                      title={employee.phone || ""}
                    >
                      {employee.phone}
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 max-w-[240px] truncate"
                      title={employee.address}
                    >
                      {employee.address}
                    </TableCell>
                    <TableCell
                      className="font-mono px-2 py-1 max-w-[110px] truncate"
                      title={employee.coordinates}
                    >
                      {employee.coordinates}
                    </TableCell>
                    <TableCell
                      className="px-2 py-1 tabular-nums truncate"
                      title={String(employee.distance_to_office)}
                    >
                      {Number(employee.distance_to_office).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-2 py-1">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(employee)}
                        >
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
      <AlertDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Set employee inactive?</AlertDialogTitle>
            <AlertDialogDescription>
              This employee will be excluded from optimization. Are you sure you
              want to set them to inactive?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelToggle}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              Yes, set inactive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Excel Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Excel File</DialogTitle>
            <DialogDescription>
              {hasInvalidRows
                ? "Some rows have missing address data. You can choose to skip them."
                : "Import employees from Excel file."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {hasInvalidRows && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skip-invalid"
                  checked={skipInvalidRows}
                  onCheckedChange={(checked) =>
                    setSkipInvalidRows(checked as boolean)
                  }
                />
                <Label htmlFor="skip-invalid" className="text-sm font-medium">
                  Skip invalid rows (rows without address will be skipped)
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
