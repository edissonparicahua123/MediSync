import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Stethoscope,
    Plus,
    Search,
    Loader2,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Phone,
} from 'lucide-react'
import { doctorsAPI, appointmentsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import DoctorModal from '@/components/modals/DoctorModal'
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
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DoctorsPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [doctors, setDoctors] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [doctorsRes, appointmentsRes] = await Promise.all([
                doctorsAPI.getAll(),
                appointmentsAPI.getAll().catch(() => ({ data: { data: [] } })),
            ])
            setDoctors(doctorsRes.data.data || [])
            setAppointments(appointmentsRes.data?.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar doctores',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await doctorsAPI.delete(deleteId)
            toast({
                title: 'Éxito',
                description: 'Doctor eliminado correctamente',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar doctor',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const handleEdit = (doctor: any) => {
        setSelectedDoctor(doctor)
        setModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedDoctor(null)
        setModalOpen(true)
    }

    const handleSuccess = () => {
        loadData()
        setModalOpen(false)
    }

    const handleViewProfile = (doctorId: string) => {
        navigate(`/doctors/${doctorId}`)
    }

    // Calcular pacientes atendidos hoy por doctor
    const getPatientsToday = (doctorId: string) => {
        return appointments.filter((apt: any) => {
            try {
                return apt.doctorId === doctorId &&
                    isToday(new Date(apt.appointmentDate)) &&
                    apt.status === 'COMPLETED'
            } catch {
                return false
            }
        }).length
    }

    // Obtener estado del doctor
    const getDoctorStatus = (doctor: any) => {
        const todayAppointments = appointments.filter((apt: any) => {
            try {
                return apt.doctorId === doctor.id && isToday(new Date(apt.appointmentDate))
            } catch {
                return false
            }
        })

        const activeAppointments = todayAppointments.filter((apt: any) =>
            apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
        )

        if (!doctor.isAvailable) return { status: 'NO DISPONIBLE', color: 'text-gray-500', bgColor: 'bg-gray-100' }
        if (activeAppointments.length > 0) return { status: 'OCUPADO', color: 'text-orange-500', bgColor: 'bg-orange-100' }
        return { status: 'DISPONIBLE', color: 'text-green-500', bgColor: 'bg-green-100' }
    }

    const filteredDoctors = doctors.filter((doctor: any) =>
        `${doctor.user?.firstName} ${doctor.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.licenseNumber?.includes(searchTerm)
    )

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
                    <h1 className="text-3xl font-bold tracking-tight">Doctores</h1>
                    <p className="text-muted-foreground">
                        Gestionar personal médico y horarios • {filteredDoctors.length} total
                    </p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Doctor
                </Button>
            </div>

            {/* Search Bar */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, especialidad o número de licencia..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </Card>

            {/* Doctors Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Foto</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Especialidad</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Pacientes Hoy</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDoctors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No se encontraron doctores
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDoctors.map((doctor: any) => {
                                const statusInfo = getDoctorStatus(doctor)
                                const patientsToday = getPatientsToday(doctor.id)

                                return (
                                    <TableRow key={doctor.id} className="hover:bg-accent/50">
                                        <TableCell>
                                            {doctor.user?.avatar ? (
                                                <img
                                                    src={doctor.user.avatar}
                                                    alt={`${doctor.user.firstName} ${doctor.user.lastName}`}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                                    {doctor.user?.firstName?.[0]}{doctor.user?.lastName?.[0]}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div>
                                                <p>Dr. {doctor.user?.firstName} {doctor.user?.lastName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Licencia: {doctor.licenseNumber}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                                {doctor.specialization || 'General'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>Lun-Vie</p>
                                                <p className="text-xs text-muted-foreground">8:00 AM - 5:00 PM</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {statusInfo.status === 'DISPONIBLE' && <CheckCircle2 className={`h-4 w-4 ${statusInfo.color}`} />}
                                                {statusInfo.status === 'OCUPADO' && <Clock className={`h-4 w-4 ${statusInfo.color}`} />}
                                                {statusInfo.status === 'NO DISPONIBLE' && <XCircle className={`h-4 w-4 ${statusInfo.color}`} />}
                                                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                                    {statusInfo.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-primary">{patientsToday}</span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">pacientes</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span>{doctor.user?.phone || 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewProfile(doctor.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(doctor)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteId(doctor.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal */}
            <DoctorModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                doctor={selectedDoctor}
                onSuccess={handleSuccess}
            />

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del doctor.
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
