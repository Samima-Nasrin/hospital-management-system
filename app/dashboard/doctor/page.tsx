"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LogOut, Calendar, User, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string | null
  patients: {
    patient_id: string
    name: string
    age: number
    gender: string
    contact: string
    symptoms: string
    blood_group: string
  }
}

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
  medical_history: string | null
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false)
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
    if (user.role !== "Doctor") {
      router.push("/")
      return
    }

    fetchAppointments(user.id)
    fetchPatients()
  }, [router])

  const fetchAppointments = async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          patients (
            patient_id,
            name,
            age,
            gender,
            contact,
            symptoms,
            blood_group
          )
        `,
        )
        .eq("doctor_id", doctorId)
        .gte("appointment_date", new Date().toISOString().split("T")[0])
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  const handleViewPatient = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (patient) {
      setSelectedPatient(patient)
      setIsPatientDetailOpen(true)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser")
    router.push("/")
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage appointments and patient records</p>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
            <TabsTrigger value="patients">Patient Details</TabsTrigger>
          </TabsList>

          {/* Daily Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Today's Schedule</CardTitle>
                </div>
                <CardDescription>Upcoming appointments and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            No appointments scheduled
                          </TableCell>
                        </TableRow>
                      ) : (
                        appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {appointment.appointment_time.substring(0, 5)}
                            </TableCell>
                            <TableCell>{new Date(appointment.appointment_date).toLocaleDateString()}</TableCell>
                            <TableCell>{appointment.patients.patient_id}</TableCell>
                            <TableCell>{appointment.patients.name}</TableCell>
                            <TableCell>{appointment.patients.age}</TableCell>
                            <TableCell>{appointment.patients.gender}</TableCell>
                            <TableCell className="max-w-xs truncate">{appointment.patients.symptoms}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  appointment.status === "Scheduled"
                                    ? "bg-blue-100 text-blue-800"
                                    : appointment.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {appointment.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Details Tab */}
          <TabsContent value="patients" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Patient Details</CardTitle>
                </div>
                <CardDescription>View complete patient profiles and medical history</CardDescription>
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
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Symptoms</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                {patient.blood_group}
                              </span>
                            </TableCell>
                            <TableCell>{patient.contact}</TableCell>
                            <TableCell className="max-w-xs truncate">{patient.symptoms}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPatient(patient.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Patient Detail Dialog */}
      <Dialog open={isPatientDetailOpen} onOpenChange={setIsPatientDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>Complete patient profile and medical information</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Patient ID</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{selectedPatient.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-base text-gray-900 mt-1">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="text-base text-gray-900 mt-1">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Blood Group</p>
                  <p className="text-base text-gray-900 mt-1">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {selectedPatient.blood_group}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Contact Number</p>
                <p className="text-base text-gray-900 mt-1">{selectedPatient.contact}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                <p className="text-base text-gray-900 mt-1">{selectedPatient.emergency_contact}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-base text-gray-900 mt-1">{selectedPatient.address}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Symptoms</p>
                <p className="text-base text-gray-900 mt-1">{selectedPatient.symptoms}</p>
              </div>

              {selectedPatient.medical_history && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Medical History</p>
                  <p className="text-base text-gray-900 mt-1">{selectedPatient.medical_history}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button onClick={() => setIsPatientDetailOpen(false)} className="bg-blue-600 hover:bg-blue-700">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
