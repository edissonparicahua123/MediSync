import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarIcon, Plus, Search, Loader2, Edit, Trash2, Eye, TableIcon, Filter } from 'lucide-react'
import { appointmentsAPI, patientsAPI, doctorsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import AppointmentModal from '@/components/modals/AppointmentModal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import DoctorCalendar from '@/components/calendar/DoctorCalendar'

export default function AppointmentsPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [appointments, setAppointments] = useState<any[]>([])
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('calendar')
    const [showFilters, setShowFilters] = useState(false)
    const { toast } = useToast()

    // Filtros
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        doctorId: 'all',
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
                appointmentsAPI.getAll(),
                patientsAPI.getAll().catch(() => ({ data: { data: [] } })),
                doctorsAPI.getAll().catch(() => ({ data: { data: [] } })),
            ])
            setAppointments(appointmentsRes.data.data || [])
            setPatients(patientsRes.data?.data || [])
            setDoctors(doctorsRes.data?.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar citas',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await appointmentsAPI.delete(deleteId)
            toast({
                title: 'Éxito',
                description: 'Cita eliminada correctamente',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar cita',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const handleEdit = (appointment: any) => {
        setSelectedAppointment(appointment)
        setModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedAppointment(null)
        setModalOpen(true)
    }

    const handleSuccess = () => {
        loadData()
        setModalOpen(false)
    }

    const handleViewDetails = (appointmentId: string) => {
        navigate(`/appointments/${appointmentId}`)
    }

    // Filtrar citas
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt: any) => {
            // Búsqueda
            const searchMatch = searchTerm === '' ||
                apt.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctor?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.doctor?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())

            // Filtros
            const statusMatch = filters.status === 'all' || apt.status === filters.status
            const doctorMatch = filters.doctorId === 'all' || apt.doctorId === filters.doctorId

            return searchMatch && statusMatch && doctorMatch
        })
    }, [appointments, searchTerm, filters])

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            SCHEDULED: 'bg-blue-100 text-blue-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-gray-100 text-gray-800',
            CANCELLED: 'bg-red-100 text-red-800',
            NO_SHOW: 'bg-orange-100 text-orange-800',
        }
        return colors[status] || colors.SCHEDULED
    }

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            HIGH: 'bg-red-100 text-red-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-blue-100 text-blue-800',
        }
        return colors[priority] || colors.MEDIUM
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
                    <p className="text-muted-foreground">
                        Gestiona citas y horarios • {filteredAppointments.length} total
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Cita
                </Button>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por paciente, doctor, o motivo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                        <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                <SelectItem value="SCHEDULED">Programada</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                                <SelectItem value="COMPLETED">Completada</SelectItem>
                                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.doctorId} onValueChange={(v) => setFilters({ ...filters, doctorId: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Doctores</SelectItem>
                                {doctors.map((doctor: any) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Prioridades</SelectItem>
                                <SelectItem value="HIGH">Alta</SelectItem>
                                <SelectItem value="MEDIUM">Media</SelectItem>
                                <SelectItem value="LOW">Baja</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </Card>

            {/* Tabs: Calendar / Table */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="calendar">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Vista Calendario
                    </TabsTrigger>
                    <TabsTrigger value="table">
                        <TableIcon className="h-4 w-4 mr-2" />
                        Vista Tabla
                    </TabsTrigger>
                </TabsList>

                {/* Calendar View */}
                <TabsContent value="calendar" className="mt-4">
                    <DoctorCalendar
                        doctorId="all"
                        appointments={filteredAppointments}
                        onRefresh={loadData}
                    />
                </TabsContent>

                {/* Table View */}
                <TabsContent value="table" className="mt-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Motivo</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAppointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No se encontraron citas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAppointments.map((apt: any) => (
                                        <TableRow key={apt.id}>
                                            <TableCell>
                                                {apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Desconocido'}
                                            </TableCell>
                                            <TableCell>
                                                {apt.doctor ? `Dr. ${apt.doctor.user?.firstName} ${apt.doctor.user?.lastName}` : 'Desconocido'}
                                            </TableCell>
                                            <TableCell>
                                                {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'dd MMM yyyy', { locale: es }) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                {apt.appointmentDate ? format(new Date(apt.appointmentDate), 'HH:mm', { locale: es }) : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>
                                                    {apt.status === 'SCHEDULED' && 'Programada'}
                                                    {apt.status === 'CONFIRMED' && 'Confirmada'}
                                                    {apt.status === 'COMPLETED' && 'Completada'}
                                                    {apt.status === 'CANCELLED' && 'Cancelada'}
                                                    {apt.status === 'NO_SHOW' && 'No Asistió'}
                                                    {!['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(apt.status) && apt.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{apt.reason || 'Consulta General'}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityBadge(apt.priority || 'MEDIUM')}`}>
                                                    {apt.priority === 'HIGH' && 'Alta'}
                                                    {apt.priority === 'MEDIUM' && 'Media'}
                                                    {apt.priority === 'LOW' && 'Baja'}
                                                    {(!apt.priority || !['HIGH', 'MEDIUM', 'LOW'].includes(apt.priority)) && 'Media'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(apt.id)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(apt)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteId(apt.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal */}
            <AppointmentModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                appointment={selectedAppointment}
                onSuccess={handleSuccess}
            />

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente la cita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
