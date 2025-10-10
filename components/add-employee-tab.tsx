"use client";

import { useState, useEffect } from "react";
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

export default function AddEmployeeTab() {
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [generatedId, setGeneratedId] = useState<string>("");
  const [addressError, setAddressError] = useState(false);

  // Generate next available employee ID
  const generateNextEmployeeId = () => {
    try {
      const saved = localStorage.getItem("employees");
      const employees: Employee[] = saved ? JSON.parse(saved) : [];

      // Find the highest existing ID number (just numbers, no prefix)
      let maxId = 0;
      employees.forEach((emp) => {
        // Check if ID is just a number
        const idNum = parseInt(emp.id, 10);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      });

      // Return next ID as just a number
      return String(maxId + 1);
    } catch (error) {
      console.error("Error generating ID:", error);
      return "1";
    }
  };

  // Load employee data from URL hash params on mount and on hash changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyFromHash = () => {
      const raw = (window.location.hash || "").replace(/^#/, "");
      const [path, queryString] = raw.split("?");

      if (!queryString || path !== "add-employee") {
        // Add mode - reset form
        setIsEditMode(false);
        setNewEmployee({});
        setGeneratedId(generateNextEmployeeId());
        setAddressError(false);
        return;
      }

      const params = new URLSearchParams(queryString);
      const editData = params.get("edit");

      if (!editData) {
        // Add mode - reset form
        setIsEditMode(false);
        setNewEmployee({});
        setGeneratedId(generateNextEmployeeId());
        setAddressError(false);
        return;
      }

      try {
        const employee = JSON.parse(
          decodeURIComponent(editData)
        ) as Partial<Employee>;

        // Ensure types are normalized
        const normalized: Partial<Employee> = {
          ...employee,
          id: employee.id ? String(employee.id) : "",
          distance_to_office: employee.distance_to_office
            ? Number(employee.distance_to_office)
            : 0,
          active: employee.active ?? true,
        };

        setNewEmployee(normalized);
        setGeneratedId(employee.id ? String(employee.id) : "");
        setIsEditMode(true);
        setAddressError(false);
      } catch (error) {
        console.error("Failed to parse employee data from hash:", error);
        setIsEditMode(false);
        setNewEmployee({});
        setGeneratedId(generateNextEmployeeId());
        setAddressError(false);
      }
    };

    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  const handleCancel = () => {
    setNewEmployee({});
    setIsEditMode(false);
    setGeneratedId(generateNextEmployeeId());
    setAddressError(false);
    if (typeof window !== "undefined") {
      window.location.hash = "employees";
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmployee({ ...newEmployee, address: value });
    // Clear error state when user starts typing
    if (addressError && value.trim() !== "") {
      setAddressError(false);
    }
  };

  const handleAdd = () => {
    if (!newEmployee?.address || newEmployee.address.trim() === "") {
      setAddressError(true);
      toast.error("Please fill required field: Address");
      return;
    }
    setAddressError(false);

    try {
      const saved = localStorage.getItem("employees");
      const employees: Employee[] = saved ? JSON.parse(saved) : [];

      // Edit mode'da mevcut active değerini koru
      const existingEmployee = isEditMode
        ? employees.find((emp) => emp.id === newEmployee.id)
        : null;

      const employee: Employee = {
        id: isEditMode ? String(newEmployee.id) : generatedId,
        name: newEmployee.name || "",
        email: newEmployee.email || "",
        phone: newEmployee.phone || "",
        address: newEmployee.address || "",
        coordinates: newEmployee.coordinates || "",
        distance_to_office: newEmployee.distance_to_office || 0,
        active: isEditMode ? existingEmployee?.active ?? true : true,
      };

      let updated: Employee[];
      if (isEditMode) {
        // Update existing employee - employees-tab.tsx'deki gibi basit yaklaşım
        updated = employees.map((emp) =>
          emp.id === employee.id ? employee : emp
        );
      } else {
        // Add new employee
        updated = [...employees, employee];
      }

      localStorage.setItem("employees", JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("employeesUpdated"));
      }
      toast.success(
        isEditMode ? "Updated successfully 🎉" : "Added successfully 🎉",
        {
          description: `${employee.name || "Employee"} has been ${
            isEditMode ? "updated" : "added to your list"
          }.`,
        }
      );

      if (isEditMode) {
        // Edit mode'da sadece employees tab'ına dön
        if (typeof window !== "undefined") {
          window.location.hash = "employees";
        }
      } else {
        // Add mode'da formu temizle
        setNewEmployee({});
        setIsEditMode(false);
        setGeneratedId(generateNextEmployeeId());
        if (typeof window !== "undefined") {
          window.location.hash = "employees";
        }
      }
    } catch {
      toast.error("Failed to save employee");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {isEditMode ? "Edit Employee" : "Add Employee"}
        </h2>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update the employee details below."
            : "Enter the employee details below."}
        </p>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 py-2">
            {/* <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="id"
                className="sm:text-right text-left whitespace-nowrap"
              >
                ID
                <span className="text-xs text-muted-foreground">
                  (cannot be changed)
                </span>
              </Label>
              <div className="col-span-5 w-full px-3 py-2 bg-muted rounded-md text-sm font-mono">
                {isEditMode ? newEmployee.id || "" : generatedId}
              </div>
            </div> */}
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="name"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Name Surname
              </Label>
              <Input
                id="name"
                value={newEmployee.name || ""}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="col-span-5 w-full"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="email"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email || ""}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="col-span-5 w-full"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="phone"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Phone
              </Label>
              <Input
                id="phone"
                value={newEmployee.phone || ""}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
                className="col-span-5 w-full"
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="address"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Address
              </Label>
              <Input
                id="address"
                value={newEmployee.address || ""}
                onChange={handleAddressChange}
                className={`col-span-5 w-full ${
                  addressError ? "border-red-500 focus:border-red-500" : ""
                }`}
                required
              />
            </div>
            <div className="grid grid-cols-6 items-center gap-2 sm:gap-3">
              <Label
                htmlFor="coordinates"
                className="sm:text-right text-left whitespace-nowrap"
              >
                Coordinates
              </Label>
              <Input
                id="coordinates"
                placeholder="41.0782,29.0174"
                value={newEmployee.coordinates || ""}
                onChange={(e) =>
                  setNewEmployee({
                    ...newEmployee,
                    coordinates: e.target.value,
                  })
                }
                className="col-span-5 w-full"
                required
              />
            </div>

            <div className="grid grid-cols-6 items-center">
              <div></div>
              <div className="col-span-5">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAdd}>
                    {isEditMode ? "Update Employee" : "Add Employee"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
