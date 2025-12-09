import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Plus, Search, Loader2, Edit, Trash2, Clock, MapPin } from 'lucide-react'
import { appointmentsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import AppointmentModal from '@/components/modals/AppointmentModal'
import { format } from 'date-fns'
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

export default function AppointmentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const response = await appointmentsAPI.getAll()
            setAppointments(response.data.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load appointments',
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
                title: 'Success',
                description: 'Appointment deleted successfully',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete appointment',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
            case 'CONFIRMED': return 'bg-green-100 text-green-800'
            case 'COMPLETED': return 'bg-gray-100 text-gray-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const filteredAppointments = appointments.filter(apt =>
        apt.patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor?.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctor?.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="h-8 w-8" />
                        Appointments
                    </h1>
                    <p className="text-muted-foreground mt-1">Schedule and manage patient visits</p>
                </div>
                <Button onClick={() => {
                    setSelectedAppointment(null)
                    setModalOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by patient or doctor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Date & Time</th>
                                <th className="text-left p-3">Patient</th>
                                <th className="text-left p-3">Doctor</th>
                                <th className="text-left p-3">Type</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Priority</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                                        No appointments found
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((apt) => (
                                    <tr key={apt.id} className="border-b hover:bg-accent">
                                        <td className="p-3">
                                            <div className="font-medium flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {format(new Date(apt.appointmentDate), 'MMM d, yyyy')}
                                            </div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(apt.appointmentDate), 'h:mm a')}
                                            </div>
                                        </td>
                                        <td className="p-3 font-medium">
                                            {apt.patient?.firstName} {apt.patient?.lastName}
                                        </td>
                                        <td className="p-3">
                                            Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                                            <div className="text-xs text-muted-foreground">{apt.doctor?.specialization}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className="capitalize">{apt.type?.toLowerCase().replace('_', ' ')}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(apt.status)}`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${apt.priority === 'HIGH' || apt.priority === 'CRITICAL' || apt.priority === 'URGENT'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}>
                                                {apt.priority}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedAppointment(apt)
                                                        setModalOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteId(apt.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AppointmentModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                appointment={selectedAppointment}
                onSuccess={loadData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the appointment.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
