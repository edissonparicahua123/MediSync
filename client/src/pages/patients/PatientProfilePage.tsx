import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { patientsAPI, appointmentsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    User,
    FileText,
    Calendar,
    Pill,
    FlaskConical,
    AlertTriangle,
    StickyNote,
    Paperclip,
    Loader2,
    Phone,
    Mail,
    MapPin,
    Shield,
    Edit,
    Download,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

export default function PatientProfilePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('general')

    // Cargar datos del paciente
    const { data: patientData, isLoading } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientsAPI.getOne(id!),
        enabled: !!id,
    })

    // Cargar citas del paciente
    const { data: appointmentsData } = useQuery({
        queryKey: ['patient-appointments', id],
        queryFn: () => appointmentsAPI.getAll(),
        enabled: !!id,
    })

    const patient = patientData?.data
    const allAppointments = appointmentsData?.data?.data || []
    const patientAppointments = allAppointments.filter((apt: any) => apt.patientId === id)

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return 'N/A'
        const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
        return age
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-muted-foreground">Patient not found</p>
                <Button onClick={() => navigate('/patients')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patients
                </Button>
            </div>
        )
    }

    const pastAppointments = patientAppointments.filter((apt: any) =>
        new Date(apt.appointmentDate) < new Date() || apt.status === 'COMPLETED'
    )
    const futureAppointments = patientAppointments.filter((apt: any) =>
        new Date(apt.appointmentDate) >= new Date() && apt.status !== 'COMPLETED'
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/patients')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {patient.firstName} {patient.lastName}
                        </h1>
                        <p className="text-muted-foreground">
                            Patient ID: {patient.documentNumber || patient.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Records
                    </Button>
                    <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Patient Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                            {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.address || 'No address'}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Gender</p>
                                    <p className="font-medium">{patient.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Age</p>
                                    <p className="font-medium">{calculateAge(patient.dateOfBirth)} years</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Blood Type</p>
                                    <p className="font-medium">{patient.bloodType || 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Insurance</p>
                                        <p className="font-medium">{patient.insuranceProvider || 'None'}</p>
                                        {patient.insuranceNumber && (
                                            <p className="text-xs text-muted-foreground">#{patient.insuranceNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                        {patient.status || 'ACTIVE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="general">
                        <User className="h-4 w-4 mr-2" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <FileText className="h-4 w-4 mr-2" />
                        History
                    </TabsTrigger>
                    <TabsTrigger value="appointments">
                        <Calendar className="h-4 w-4 mr-2" />
                        Appointments
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions">
                        <Pill className="h-4 w-4 mr-2" />
                        Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="lab">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Lab Results
                    </TabsTrigger>
                    <TabsTrigger value="emergency">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergencies
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                        <StickyNote className="h-4 w-4 mr-2" />
                        Notes
                    </TabsTrigger>
                    <TabsTrigger value="files">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Files
                    </TabsTrigger>
                </TabsList>

                {/* Tab: General Information */}
                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">First Name</p>
                                        <p className="font-medium">{patient.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Name</p>
                                        <p className="font-medium">{patient.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">
                                            {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Gender</p>
                                        <p className="font-medium">{patient.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Type</p>
                                        <p className="font-medium">{patient.bloodType || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Document Number</p>
                                        <p className="font-medium">{patient.documentNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{patient.email || 'No email'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Phone</p>
                                    <p className="font-medium">{patient.phone || 'No phone'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Address</p>
                                    <p className="font-medium">{patient.address || 'No address'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Emergency Contact</p>
                                    <p className="font-medium">{patient.emergencyContact || 'Not provided'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Insurance Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Provider</p>
                                    <p className="font-medium">{patient.insuranceProvider || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Policy Number</p>
                                    <p className="font-medium">{patient.insuranceNumber || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Medical Alerts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Allergies</p>
                                        <p className="font-medium">{patient.allergies || 'None reported'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Chronic Conditions</p>
                                        <p className="font-medium">None reported</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Medical History */}
                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical History</CardTitle>
                            <CardDescription>Complete medical history and records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    No medical history records available yet.
                                </p>
                                <Button>Add Medical Record</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Appointments */}
                <TabsContent value="appointments" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Future Appointments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Appointments ({futureAppointments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {futureAppointments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                                    ) : (
                                        futureAppointments.map((apt: any) => (
                                            <div key={apt.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{apt.reason || 'General Checkup'}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy HH:mm')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Dr. {apt.doctor?.user?.firstName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Past Appointments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Past Appointments ({pastAppointments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pastAppointments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No past appointments</p>
                                    ) : (
                                        pastAppointments.slice(0, 5).map((apt: any) => (
                                            <div key={apt.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{apt.reason || 'General Checkup'}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Dr. {apt.doctor?.user?.firstName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                                        {apt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Prescriptions */}
                <TabsContent value="prescriptions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Prescriptions</CardTitle>
                            <CardDescription>Active and past prescriptions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No prescriptions available</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Lab Results */}
                <TabsContent value="lab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Laboratory Results</CardTitle>
                            <CardDescription>Test results and reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No lab results available</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Emergencies */}
                <TabsContent value="emergency">
                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Records</CardTitle>
                            <CardDescription>Previous emergency visits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No emergency records</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Notes */}
                <TabsContent value="notes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Doctor's Notes</CardTitle>
                            <CardDescription>Clinical notes and observations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No notes available</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Files */}
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attached Documents</CardTitle>
                            <CardDescription>Medical documents and files</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">No files attached</p>
                                <Button>
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
