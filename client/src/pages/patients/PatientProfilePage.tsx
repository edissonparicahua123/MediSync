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
                <p className="text-muted-foreground">Paciente no encontrado</p>
                <Button onClick={() => navigate('/patients')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Pacientes
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
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {patient.firstName} {patient.lastName}
                        </h1>
                        <p className="text-muted-foreground">
                            ID de Paciente: {patient.documentNumber || patient.id}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar Registros
                    </Button>
                    <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
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
                                    <span>{patient.phone || 'Sin teléfono'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.email || 'Sin email'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.address || 'Sin dirección'}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Género</p>
                                    <p className="font-medium">{patient.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Edad</p>
                                    <p className="font-medium">{calculateAge(patient.dateOfBirth)} años</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Tipo de Sangre</p>
                                    <p className="font-medium">{patient.bloodType || 'Desconocido'}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Seguro</p>
                                        <p className="font-medium">{patient.insuranceProvider || 'Ninguno'}</p>
                                        {patient.insuranceNumber && (
                                            <p className="text-xs text-muted-foreground">#{patient.insuranceNumber}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Estado</p>
                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                        {({
                                            'ACTIVE': 'ACTIVO',
                                            'INACTIVE': 'INACTIVO',
                                            'CRITICAL': 'CRÍTICO'
                                        } as Record<string, string>)[patient.status || 'ACTIVE'] || patient.status}
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
                        Historial
                    </TabsTrigger>
                    <TabsTrigger value="appointments">
                        <Calendar className="h-4 w-4 mr-2" />
                        Citas
                    </TabsTrigger>
                    <TabsTrigger value="prescriptions">
                        <Pill className="h-4 w-4 mr-2" />
                        Recetas
                    </TabsTrigger>
                    <TabsTrigger value="lab">
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Laboratorio
                    </TabsTrigger>
                    <TabsTrigger value="emergency">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Emergencias
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                        <StickyNote className="h-4 w-4 mr-2" />
                        Notas
                    </TabsTrigger>
                    <TabsTrigger value="files">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Archivos
                    </TabsTrigger>
                </TabsList>

                {/* Tab: General Information */}
                <TabsContent value="general" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nombre</p>
                                        <p className="font-medium">{patient.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Apellido</p>
                                        <p className="font-medium">{patient.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                                        <p className="font-medium">
                                            {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Género</p>
                                        <p className="font-medium">{patient.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tipo de Sangre</p>
                                        <p className="font-medium">{patient.bloodType || 'Desconocido'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Número de Documento</p>
                                        <p className="font-medium">{patient.documentNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{patient.email || 'Sin email'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Teléfono</p>
                                    <p className="font-medium">{patient.phone || 'Sin teléfono'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Dirección</p>
                                    <p className="font-medium">{patient.address || 'Sin dirección'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Contacto de Emergencia</p>
                                    <p className="font-medium">{patient.emergencyContact || 'No provisto'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Seguro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Proveedor</p>
                                    <p className="font-medium">{patient.insuranceProvider || 'Ninguno'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Número de Póliza</p>
                                    <p className="font-medium">{patient.insuranceNumber || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Alertas Médicas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Alergias</p>
                                        <p className="font-medium">{patient.allergies || 'Ninguna reportada'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Condiciones Crónicas</p>
                                        <p className="font-medium">Ninguna reportada</p>
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
                            <CardTitle>Historial Médico</CardTitle>
                            <CardDescription>Historial médico completo y registros</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    No hay registros de historial médico disponibles aún.
                                </p>
                                <Button>Agregar Registro Médico</Button>
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
                                <CardTitle>Próximas Citas ({futureAppointments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {futureAppointments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No hay citas próximas</p>
                                    ) : (
                                        futureAppointments.map((apt: any) => (
                                            <div key={apt.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{apt.reason || 'Chequeo General'}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy HH:mm')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Dr. {apt.doctor?.user?.firstName || 'Desconocido'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {({
                                                            'SCHEDULED': 'PROGRAMADA',
                                                            'CONFIRMED': 'CONFIRMADA',
                                                            'COMPLETED': 'COMPLETADA',
                                                            'CANCELLED': 'CANCELADA',
                                                            'NO_SHOW': 'NO ASISTIÓ'
                                                        } as Record<string, string>)[apt.status] || apt.status}
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
                                <CardTitle>Citas Pasadas ({pastAppointments.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {pastAppointments.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No hay citas pasadas</p>
                                    ) : (
                                        pastAppointments.slice(0, 5).map((apt: any) => (
                                            <div key={apt.id} className="p-3 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{apt.reason || 'Chequeo General'}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(apt.appointmentDate), 'MMM dd, yyyy')}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Dr. {apt.doctor?.user?.firstName || 'Desconocido'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                                        {({
                                                            'SCHEDULED': 'PROGRAMADA',
                                                            'CONFIRMED': 'CONFIRMADA',
                                                            'COMPLETED': 'COMPLETADA',
                                                            'CANCELLED': 'CANCELADA',
                                                            'NO_SHOW': 'NO ASISTIÓ'
                                                        } as Record<string, string>)[apt.status] || apt.status}
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
                            <CardTitle>Recetas</CardTitle>
                            <CardDescription>Recetas activas y pasadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No hay recetas disponibles</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Lab Results */}
                <TabsContent value="lab">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultados de Laboratorio</CardTitle>
                            <CardDescription>Resultados de pruebas e informes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No hay resultados de laboratorio disponibles</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Emergencies */}
                <TabsContent value="emergency">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registros de Emergencia</CardTitle>
                            <CardDescription>Visitas de emergencia previas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No hay registros de emergencia</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Notes */}
                <TabsContent value="notes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notas del Doctor</CardTitle>
                            <CardDescription>Notas clínicas y observaciones</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No hay notas disponibles</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Files */}
                <TabsContent value="files">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos Adjuntos</CardTitle>
                            <CardDescription>Documentos médicos y archivos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">No hay archivos adjuntos</p>
                                <Button>
                                    <Paperclip className="h-4 w-4 mr-2" />
                                    Subir Documento
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
