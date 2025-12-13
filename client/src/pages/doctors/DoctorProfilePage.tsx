import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { doctorsAPI, appointmentsAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    User,
    Calendar,
    BarChart3,
    Award,
    FileText,
    Clock,
    Loader2,
    Phone,
    Mail,
    MapPin,
    Edit,
    CheckCircle2,
    XCircle,
} from 'lucide-react'
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import DoctorCalendar from '@/components/calendar/DoctorCalendar'

export default function DoctorProfilePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('general')

    // Cargar datos del doctor
    const { data: doctorData, isLoading } = useQuery({
        queryKey: ['doctor', id],
        queryFn: () => doctorsAPI.getOne(id!),
        enabled: !!id,
    })

    // Cargar citas del doctor
    const { data: appointmentsData, refetch: refetchAppointments } = useQuery({
        queryKey: ['doctor-appointments', id],
        queryFn: () => appointmentsAPI.getAll(),
        enabled: !!id,
    })

    const doctor = doctorData?.data
    const allAppointments = appointmentsData?.data?.data || []
    const doctorAppointments = allAppointments.filter((apt: any) => apt.doctorId === id)

    // Citas de hoy
    const todayAppointments = doctorAppointments.filter((apt: any) => {
        try {
            return isToday(new Date(apt.appointmentDate))
        } catch {
            return false
        }
    })

    // Estadísticas
    const completedAppointments = doctorAppointments.filter((apt: any) => apt.status === 'COMPLETED').length
    const cancelledAppointments = doctorAppointments.filter((apt: any) => apt.status === 'CANCELLED').length
    const upcomingAppointments = doctorAppointments.filter((apt: any) => {
        try {
            return new Date(apt.appointmentDate) > new Date() && apt.status !== 'CANCELLED'
        } catch {
            return false
        }
    }).length

    // Datos para gráficos
    const appointmentsByDay = eachDayOfInterval({
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date())
    }).map(day => ({
        day: format(day, 'EEE'),
        appointments: doctorAppointments.filter((apt: any) => {
            try {
                const aptDate = new Date(apt.appointmentDate)
                return aptDate.toDateString() === day.toDateString()
            } catch {
                return false
            }
        }).length
    }))

    const monthlyStats = Array.from({ length: 6 }, (_, i) => {
        const month = new Date()
        month.setMonth(month.getMonth() - (5 - i))
        return {
            month: format(month, 'MMM'),
            patients: Math.floor(Math.random() * 50) + 20,
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!doctor) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <p className="text-muted-foreground">Doctor no encontrado</p>
                <Button onClick={() => navigate('/doctors')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Doctores
                </Button>
            </div>
        )
    }

    const getStatusBadge = () => {
        const activeToday = todayAppointments.filter((apt: any) =>
            apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
        ).length

        if (!doctor.isAvailable) {
            return { text: 'NO DISPONIBLE', color: 'bg-gray-100 text-gray-800', icon: XCircle }
        }
        if (activeToday > 0) {
            return { text: 'OCUPADO', color: 'bg-orange-100 text-orange-800', icon: Clock }
        }
        return { text: 'DISPONIBLE', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
    }

    const statusBadge = getStatusBadge()
    const StatusIcon = statusBadge.icon

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/doctors')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h1>
                        <p className="text-muted-foreground">
                            {doctor.specialization || 'Médico General'} • Licencia: {doctor.licenseNumber}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Perfil
                    </Button>
                </div>
            </div>

            {/* Doctor Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        {/* Avatar */}
                        {doctor.user?.avatar ? (
                            <img
                                src={doctor.user.avatar}
                                alt={`${doctor.user.firstName} ${doctor.user.lastName}`}
                                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
                                {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                            </div>
                        )}

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{doctor.user?.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{doctor.user?.email || 'No email'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>Oficina 301, 3er Piso</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Especialidad</p>
                                    <p className="font-medium">{doctor.specialization || 'General'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Número de Licencia</p>
                                    <p className="font-medium">{doctor.licenseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Experiencia</p>
                                    <p className="font-medium">{doctor.yearsOfExperience || 5} años</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Estado</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StatusIcon className="h-4 w-4" />
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color}`}>
                                            {statusBadge.text}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pacientes Hoy</p>
                                    <p className="font-medium text-2xl">{todayAppointments.filter((a: any) => a.status === 'COMPLETED').length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Citas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{doctorAppointments.length}</div>
                        <p className="text-xs text-muted-foreground">{completedAppointments} completadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximas</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingAppointments}</div>
                        <p className="text-xs text-muted-foreground">Citas programadas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Cancelación</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {doctorAppointments.length > 0
                                ? ((cancelledAppointments / doctorAppointments.length) * 100).toFixed(1)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">{cancelledAppointments} canceladas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="general">
                        <User className="h-4 w-4 mr-2" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="schedule">
                        <Calendar className="h-4 w-4 mr-2" />
                        Horario
                    </TabsTrigger>
                    <TabsTrigger value="calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendario
                    </TabsTrigger>
                    <TabsTrigger value="today">
                        <Clock className="h-4 w-4 mr-2" />
                        Hoy
                    </TabsTrigger>
                    <TabsTrigger value="statistics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estadísticas
                    </TabsTrigger>
                    <TabsTrigger value="specialties">
                        <Award className="h-4 w-4 mr-2" />
                        Especialidades
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                        <FileText className="h-4 w-4 mr-2" />
                        Documentos
                    </TabsTrigger>
                    <TabsTrigger value="hours">
                        <Clock className="h-4 w-4 mr-2" />
                        Horas
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
                                        <p className="font-medium">{doctor.user?.firstName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Apellido</p>
                                        <p className="font-medium">{doctor.user?.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{doctor.user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Teléfono</p>
                                        <p className="font-medium">{doctor.user?.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Detalles Profesionales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Especialización</p>
                                    <p className="font-medium">{doctor.specialization || 'Médico General'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Número de Licencia</p>
                                    <p className="font-medium">{doctor.licenseNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Años de Experiencia</p>
                                    <p className="font-medium">{doctor.yearsOfExperience || 5} años</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Weekly Schedule */}
                <TabsContent value="schedule">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horario Semanal</CardTitle>
                            <CardDescription>Distribución de citas esta semana</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={appointmentsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="appointments" fill="#3b82f6" name="Citas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Interactive Calendar */}
                <TabsContent value="calendar">
                    <DoctorCalendar
                        doctorId={id!}
                        appointments={doctorAppointments}
                        onRefresh={refetchAppointments}
                    />
                </TabsContent>

                {/* Tab: Today's Appointments */}
                <TabsContent value="today">
                    <Card>
                        <CardHeader>
                            <CardTitle>Citas de Hoy ({todayAppointments.length})</CardTitle>
                            <CardDescription>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {todayAppointments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No hay citas programadas para hoy
                                    </p>
                                ) : (
                                    todayAppointments.map((apt: any) => (
                                        <div key={apt.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="font-medium">
                                                        {format(new Date(apt.appointmentDate), 'HH:mm')} - {apt.patient?.firstName} {apt.patient?.lastName}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{apt.reason || 'Chequeo General'}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
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
                </TabsContent>

                {/* Tab: Statistics */}
                <TabsContent value="statistics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas de Rendimiento</CardTitle>
                            <CardDescription>Volumen de pacientes en los últimos 6 meses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={2} name="Patients" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Specialties */}
                <TabsContent value="specialties">
                    <Card>
                        <CardHeader>
                            <CardTitle>Especialidades y Certificaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <Award className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{doctor.specialization || 'Medicina General'}</p>
                                        <p className="text-sm text-muted-foreground">Especialidad Primaria</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Documents */}
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos y Contratos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">No hay documentos disponibles</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Working Hours */}
                <TabsContent value="hours">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horas de Trabajo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => (
                                    <div key={day} className="flex justify-between items-center p-3 border rounded-lg">
                                        <span className="font-medium">{day}</span>
                                        <span className="text-sm text-muted-foreground">8:00 AM - 5:00 PM</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-3 border rounded-lg bg-muted">
                                    <span className="font-medium">Sábado</span>
                                    <span className="text-sm text-muted-foreground">Cerrado</span>
                                </div>
                                <div className="flex justify-between items-center p-3 border rounded-lg bg-muted">
                                    <span className="font-medium">Domingo</span>
                                    <span className="text-sm text-muted-foreground">Cerrado</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
