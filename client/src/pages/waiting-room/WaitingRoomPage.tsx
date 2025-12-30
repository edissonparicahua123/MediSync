import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Users,
    UserCheck,
    Clock,
    Loader2,
    Search,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Timer,
    UserPlus,
} from 'lucide-react'
import { appointmentsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'

interface WaitingPatient {
    id: string
    patient: any
    doctor: any
    appointmentDate: string
    startTime: string
    status: string
    checkInTime?: string
    waitingTime?: number
    priority?: 'NORMAL' | 'URGENT' | 'EMERGENCY'
}

export default function WaitingRoomPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([])
    const [showCheckIn, setShowCheckIn] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null)
    const [todayAppointments, setTodayAppointments] = useState<any[]>([])

    useEffect(() => {
        loadTodayAppointments()
        // Refresh every 30 seconds
        const interval = setInterval(loadTodayAppointments, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadTodayAppointments = async () => {
        try {
            setLoading(true)
            const today = new Date().toISOString().split('T')[0]
            const res = await appointmentsAPI.getAll({ date: today, limit: 100 })
            const appointments = res.data.data || res.data || []

            // Separate waiting patients (checked in but not called)
            const waiting = appointments
                .filter((a: any) => a.status === 'CHECKED_IN' || a.status === 'CONFIRMED')
                .map((a: any) => ({
                    ...a,
                    checkInTime: a.checkInTime || a.updatedAt,
                    waitingTime: a.checkInTime
                        ? differenceInMinutes(new Date(), new Date(a.checkInTime))
                        : 0,
                    priority: a.priority || 'NORMAL',
                }))
                .sort((a: any, b: any) => {
                    // Sort by priority first, then by waiting time
                    const priorityOrder: Record<string, number> = { EMERGENCY: 0, URGENT: 1, NORMAL: 2 }
                    const aPriority = priorityOrder[a.priority as string] ?? 2
                    const bPriority = priorityOrder[b.priority as string] ?? 2
                    if (aPriority !== bPriority) {
                        return aPriority - bPriority
                    }
                    return (b.waitingTime || 0) - (a.waitingTime || 0)
                })

            setWaitingPatients(waiting)
            setTodayAppointments(appointments)
        } catch (error) {
            console.error('Error loading appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCheckIn = async (appointment: any) => {
        try {
            await appointmentsAPI.updateStatus(appointment.id, 'CHECKED_IN')
            toast({
                title: 'Check-in realizado',
                description: `${appointment.patient?.firstName} ${appointment.patient?.lastName} registrado`,
            })
            loadTodayAppointments()
            setShowCheckIn(false)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo realizar el check-in',
                variant: 'destructive',
            })
        }
    }

    const handleCallPatient = async (patient: WaitingPatient) => {
        try {
            await appointmentsAPI.updateStatus(patient.id, 'IN_PROGRESS')
            toast({
                title: 'Paciente llamado',
                description: `${patient.patient?.firstName} ha sido llamado`,
            })
            loadTodayAppointments()
        } catch (error) {
            toast({
                title: 'Error',
                variant: 'destructive',
            })
        }
    }

    const handleNoShow = async (patient: WaitingPatient) => {
        try {
            await appointmentsAPI.updateStatus(patient.id, 'NO_SHOW')
            toast({
                title: 'Marcado como no presentado',
            })
            loadTodayAppointments()
        } catch (error) {
            toast({
                title: 'Error',
                variant: 'destructive',
            })
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'EMERGENCY':
                return 'bg-red-500 text-white'
            case 'URGENT':
                return 'bg-orange-500 text-white'
            default:
                return 'bg-blue-100 text-blue-800'
        }
    }

    const getWaitingTimeColor = (minutes: number) => {
        if (minutes > 30) return 'text-red-500'
        if (minutes > 15) return 'text-orange-500'
        return 'text-green-500'
    }

    const filteredPatients = waitingPatients.filter(
        (p) =>
            p.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pendingCheckIn = todayAppointments.filter(
        (a) => a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Sala de Espera</h1>
                    <p className="text-muted-foreground">Gestión de pacientes en espera</p>
                </div>
                <Button onClick={() => setShowCheckIn(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Check-in
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Espera</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{waitingPatients.length}</div>
                        <p className="text-xs text-muted-foreground">Pacientes aguardando</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Atendidos Hoy</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {todayAppointments.filter((a) => a.status === 'COMPLETED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Completados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo Prom. Espera</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {waitingPatients.length > 0
                                ? Math.round(
                                    waitingPatients.reduce((sum, p) => sum + (p.waitingTime || 0), 0) /
                                    waitingPatients.length
                                )
                                : 0} min
                        </div>
                        <p className="text-xs text-muted-foreground">Promedio actual</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes Check-in</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCheckIn.length}</div>
                        <p className="text-xs text-muted-foreground">Por registrar</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar paciente..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Waiting List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                        <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {patient.patient?.firstName} {patient.patient?.lastName}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Dr. {patient.doctor?.user?.firstName} {patient.doctor?.user?.lastName}
                                        </p>
                                    </div>
                                    <Badge className={getPriorityColor(patient.priority || 'NORMAL')}>
                                        {patient.priority === 'EMERGENCY'
                                            ? 'Emergencia'
                                            : patient.priority === 'URGENT'
                                                ? 'Urgente'
                                                : 'Normal'}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>Cita: {patient.startTime}</span>
                                    </div>
                                    <div
                                        className={`flex items-center gap-1 ${getWaitingTimeColor(
                                            patient.waitingTime || 0
                                        )}`}
                                    >
                                        <Timer className="h-4 w-4" />
                                        <span>{patient.waitingTime || 0} min esperando</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleCallPatient(patient)}
                                    >
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Llamar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleNoShow(patient)}
                                    >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="col-span-full">
                        <CardContent className="p-12 text-center">
                            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Sin pacientes en espera</h3>
                            <p className="text-muted-foreground">
                                Los pacientes aparecerán aquí después del check-in
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Check-in Dialog */}
            <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Check-in de Paciente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {pendingCheckIn.length > 0 ? (
                            pendingCheckIn.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                                >
                                    <div>
                                        <p className="font-semibold">
                                            {apt.patient?.firstName} {apt.patient?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {apt.startTime} - Dr. {apt.doctor?.user?.firstName}
                                        </p>
                                    </div>
                                    <Button onClick={() => handleCheckIn(apt)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Check-in
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No hay citas pendientes de check-in</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
