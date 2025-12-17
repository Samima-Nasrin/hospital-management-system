"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, LogOut, Calendar } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface Patient {
  id: string
  patient_id: string
  name: string
  age: number
  gender: string
  contact: string
  address: string
  symptoms: string
  blood_group: string
  emergency_contact: string
  created_at: string
}

interface User {
  role: string
}

export default function RegistrarDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    patient_id: "",
    name: "",
    age: "",
    gender: "",
    contact: "",
    address: "",
    symptoms: "",
    blood_group: "",
    emergency_contact: "",
    medical_history: "",
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const currentUser = sessionStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const user: User = JSON.parse(currentUser)
    if (user.role !== "Registrar") {
      router.push("/")
      return
    }

    fetchPatients()
    fetchDoctors()
  }, [router])

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("role", "Doctor")

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error("Error fetching doctors:", error)
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const currentUser = sessionStorage.getItem("currentUser")
      const user = currentUser ? JSON.parse(currentUser) : null

      const { error } = await supabase.from("patients").insert([
        {
          patient_id: formData.patient_id,
          name: formData.name,
          age: Number.parseInt(formData.age),
          gender: formData.gender,
          contact: formData.contact,
          address: formData.address,
          symptoms: formData.symptoms,
          blood_group: formData.blood_group,
          emergency_contact: formData.emergency_contact,
          medical_history: formData.medical_history,
          registered_by: user?.id,
        },
      ])

      if (error) throw error

      setIsAddPatientOpen(false)
      setFormData({
        patient_id: "",
        name: "",
        age: "",
        gender: "",
        contact: "",
        address: "",
        symptoms: "",
        blood_group: "",
        emergency_contact: "",
        medical_history: "",
      })
      fetchPatients()
    } catch (error) {
      console.error("Error adding patient:", error)
      alert("Failed to add patient")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

  // Generate doctor schedule data
  const doctorScheduleData = doctors.map((doctor) => ({
    name: doctor.name.split(" ").pop(),
    patients: Math.floor(Math.random() * 15) + 5,
  }))

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
              <h1 className="text-2xl font-bold text-gray-900">Registrar Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Patient registration and appointment management</p>
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
        {/* Patients Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-xl">Registered Patients</CardTitle>
              <CardDescription className="mt-1">View and manage patient records</CardDescription>
            </div>
            <Button
              onClick={() => setIsAddPatientOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="w-4 h-4" />
              Register Patient
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Symptoms</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.patient_id}</TableCell>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.contact}</TableCell>
                        <TableCell>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {patient.blood_group}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{patient.symptoms}</TableCell>
                        <TableCell>{new Date(patient.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Schedule Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Doctor Schedule</CardTitle>
            </div>
            <CardDescription>Patient appointments by doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                patients: {
                  label: "Patients",
                  color: "hsl(221, 83%, 53%)",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorScheduleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="patients" fill="hsl(221, 83%, 53%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>

      {/* Add Patient Dialog */}
      <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>Add a new patient to the hospital system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPatient} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient_id">Patient ID</Label>
                <Input
                  id="patient_id"
                  placeholder="e.g., PAT006"
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Medical History (Optional)</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Register Patient
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
