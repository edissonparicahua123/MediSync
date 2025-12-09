import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { appointmentsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    FileText,
    Bell,
    Loader2,
    Edit,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'

export default function AppointmentDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('details')

    // Cargar datos de la cita
    const { data: appointmentData, isLoading } = useQuery({
        queryKey: ['appointment', id],
        queryFn: () => appointmentsAPI.getOne(id!),
        enabled: !!id,
    })

    const appointment = appointmentData?.data

    // Datos simulados para historial y notificaciones
    // Datos simulados para historial y notificaciones
    const mockHistory = [
        {
            id: '1',
            date: new Date(),
            user: 'Dr. Smith',
            action: 'Cita creada',
            details: 'Cita inicial programada',
        },
        {
            id: '2',
            date: new Date(Date.now() - 3600000),
            user: 'Recepcionista',
            action: 'Estado cambiado',
            details: 'De SCHEDULED a CONFIRMED',
        },
    ]

    const mockNotifications = [
        {
            id: '1',
            type: 'email',
            date: new Date(),
            recipient: 'paciente@example.com',
            status: 'enviado',
            message: 'Confirmación de cita',
        },
        {
            id: '2',
            type: 'sms',
            date: new Date(Date.now() - 7200000),
            recipient: '+1234567890',
            status: 'enviado',
            message: 'Recordatorio de cita',
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-muted-foreground">Cita no encontrada</p>
                <Button onClick={() => navigate('/appointments')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Citas
                </Button>
            </div>
        )
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />
            case 'CANCELLED':
                return <XCircle className="h-5 w-5 text-red-500" />
            case 'CONFIRMED':
                return <CheckCircle2 className="h-5 w-5 text-blue-500" />
            default:
                return <Clock className="h-5 w-5 text-orange-500" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/appointments')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Detalles de la Cita</h1>
                        <p className="text-muted-foreground">
                            {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'PPpp', { locale: es }) : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </div>

            {/* Appointment Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Paciente</p>
                                <p className="font-medium text-lg">
                                    {appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Desconocido'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Doctor</p>
                                <p className="font-medium">
                                    {appointment.doctor ? `Dr. ${appointment.doctor.user?.firstName} ${appointment.doctor.user?.lastName}` : 'Desconocido'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                                <p className="font-medium">
                                    {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'PPpp', { locale: es }) : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duración</p>
                                <p className="font-medium">1 hora</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Estado</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {getStatusIcon(appointment.status)}
                                    <span className="font-medium">{appointment.status}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Motivo</p>
                                <p className="font-medium">{appointment.reason || 'Chequeo General'}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Wait Time Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hora Programada</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {appointment.appointmentDate ? format(new Date(appointment.appointmentDate), 'HH:mm') : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">Hora original de cita</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo de Espera</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">15 min</div>
                        <p className="text-xs text-muted-foreground">Tiempo de espera promedio</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo de Consulta</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45 min</div>
                        <p className="text-xs text-muted-foreground">Duración de la consulta</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">
                        <FileText className="h-4 w-4 mr-2" />
                        Detalles
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <Calendar className="h-4 w-4 mr-2" />
                        Historial
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notificaciones
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Details */}
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de la Cita</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">ID Cita</p>
                                    <p className="font-medium">{appointment.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Creada El</p>
                                    <p className="font-medium">
                                        {appointment.createdAt ? format(new Date(appointment.createdAt), 'PPpp', { locale: es }) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Motivo</p>
                                    <p className="font-medium">{appointment.reason || 'Chequeo General'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Notas</p>
                                    <p className="font-medium">{appointment.notes || 'Sin notas'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: History */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Cambios</CardTitle>
                            <CardDescription>Rastrea todos los cambios realizados a esta cita</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockHistory.map((change) => (
                                    <div key={change.id} className="flex gap-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{change.action}</p>
                                                    <p className="text-sm text-muted-foreground">{change.details}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        por {change.user}
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(change.date, 'PPp', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Notifications */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notificaciones Enviadas</CardTitle>
                            <CardDescription>Todas las notificaciones relacionadas a esta cita</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockNotifications.map((notification) => (
                                    <div key={notification.id} className="flex gap-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <Bell className="h-5 w-5 text-green-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{notification.message}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.type.toUpperCase()} a {notification.recipient}
                                                    </p>
                                                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                        {notification.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(notification.date, 'PPp', { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
