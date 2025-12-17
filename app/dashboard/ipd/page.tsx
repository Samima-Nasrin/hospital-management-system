"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Bed, UserPlus } from "lucide-react"

interface BedInfo {
  id: string
  bed_number: string
  ward: string
  floor: string
  bed_type: string
  status: string
  assigned_at: string | null
  patients: {
    patient_id: string
    name: string
  } | null
}

interface Patient {
  id: string
  patient_id: string
  name: string
}

export default function IPDDashboard() {
  const [beds, setBeds] = useState<BedInfo[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isAssignBedOpen, setIsAssignBedOpen] = useState(false)
  const [selectedBed, setSelectedBed] = useState<string>("")
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const currentUser = sessionStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const user = JSON.parse(currentUser)
    if (user.role !== "IPD") {
      router.push("/")
      return
    }

    fetchBeds()
    fetchPatients()
  }, [router])

  const fetchBeds = async () => {
    try {
      const { data, error } = await supabase
        .from("beds")
        .select(
          `
          *,
          patients (
            patient_id,
            name
          )
        `,
        )
        .order("bed_number", { ascending: true })

      if (error) throw error
      setBeds(data || [])
    } catch (error) {
      console.error("Error fetching beds:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase.from("patients").select("id, patient_id, name")

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  const handleAssignBed = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBed || !selectedPatient) {
      alert("Please select both a bed and a patient")
      return
    }

    try {
      const { error } = await supabase
        .from("beds")
        .update({
          status: "Occupied",
          patient_id: selectedPatient,
          assigned_at: new Date().toISOString(),
        })
        .eq("id", selectedBed)

      if (error) throw error

      setIsAssignBedOpen(false)
      setSelectedBed("")
      setSelectedPatient("")
      fetchBeds()
    } catch (error) {
      console.error("Error assigning bed:", error)
      alert("Failed to assign bed")
    }
  }

  const handleReleaseBed = async (bedId: string) => {
    if (!confirm("Are you sure you want to release this bed?")) return

    try {
      const { error } = await supabase
        .from("beds")
        .update({
          status: "Available",
          patient_id: null,
          assigned_at: null,
        })
        .eq("id", bedId)

      if (error) throw error
      fetchBeds()
    } catch (error) {
      console.error("Error releasing bed:", error)
      alert("Failed to release bed")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Occupied":
        return "bg-red-100 text-red-800"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "General":
        return "bg-blue-100 text-blue-800"
      case "ICU":
        return "bg-purple-100 text-purple-800"
      case "Private":
        return "bg-indigo-100 text-indigo-800"
      case "Semi-Private":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const availableBeds = beds.filter((bed) => bed.status === "Available").length
  const occupiedBeds = beds.filter((bed) => bed.status === "Occupied").length
  const maintenanceBeds = beds.filter((bed) => bed.status === "Maintenance").length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IPD Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Inpatient department and bed management</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Beds</CardDescription>
              <CardTitle className="text-3xl">{beds.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-green-600">Available</CardDescription>
              <CardTitle className="text-3xl text-green-600">{availableBeds}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-red-600">Occupied</CardDescription>
              <CardTitle className="text-3xl text-red-600">{occupiedBeds}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-yellow-600">Maintenance</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{maintenanceBeds}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Bed Availability Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-xl">Bed Availability</CardTitle>
              </div>
              <CardDescription className="mt-1">Monitor and manage hospital bed allocation</CardDescription>
            </div>
            <Button
              onClick={() => setIsAssignBedOpen(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <UserPlus className="w-4 h-4" />
              Assign Bed
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bed Number</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {beds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No beds found
                      </TableCell>
                    </TableRow>
                  ) : (
                    beds.map((bed) => (
                      <TableRow key={bed.id}>
                        <TableCell className="font-medium">{bed.bed_number}</TableCell>
                        <TableCell>{bed.ward}</TableCell>
                        <TableCell>{bed.floor}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(bed.bed_type)}`}
                          >
                            {bed.bed_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bed.status)}`}
                          >
                            {bed.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {bed.patients ? (
                            <div>
                              <p className="font-medium text-sm">{bed.patients.name}</p>
                              <p className="text-xs text-gray-500">{bed.patients.patient_id}</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>{bed.assigned_at ? new Date(bed.assigned_at).toLocaleDateString() : "-"}</TableCell>
                        <TableCell className="text-right">
                          {bed.status === "Occupied" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReleaseBed(bed.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Release
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Assign Bed Dialog */}
      <Dialog open={isAssignBedOpen} onOpenChange={setIsAssignBedOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Bed to Patient</DialogTitle>
            <DialogDescription>Select an available bed and assign it to a patient</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignBed} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bed">Select Bed</Label>
              <Select value={selectedBed} onValueChange={setSelectedBed}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an available bed" />
                </SelectTrigger>
                <SelectContent>
                  {beds
                    .filter((bed) => bed.status === "Available")
                    .map((bed) => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.bed_number} - {bed.ward} ({bed.bed_type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.patient_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAssignBedOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Assign Bed
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
