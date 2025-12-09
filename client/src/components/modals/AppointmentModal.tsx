import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { appointmentsAPI, patientsAPI, doctorsAPI } from '@/services/api'
import { Loader2, CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const appointmentSchema = z.object({
    patientId: z.string().min(1, 'El paciente es requerido'),
    doctorId: z.string().min(1, 'El doctor es requerido'),
    appointmentDate: z.date({
        required_error: "La fecha es requerida",
    }),
    time: z.string().min(1, 'La hora es requerida'),
    type: z.string().min(1, 'El tipo es requerido'),
    reason: z.string().min(1, 'El motivo es requerido'),
    symptoms: z.string().optional(),
    status: z.string().default('SCHEDULED'),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    appointment?: any
    onSuccess: () => void
}

export default function AppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess,
}: AppointmentModalProps) {
    const { toast } = useToast()
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [loadingResources, setLoadingResources] = useState(false)

    const form = useForm<AppointmentFormData>({
        resolver: zodResolver(appointmentSchema),
        defaultValues: {
            patientId: '',
            doctorId: '',
            type: 'CHECKUP',
            reason: '',
            symptoms: '',
            status: 'SCHEDULED',
            time: '09:00',
        },
    })

    useEffect(() => {
        if (open) {
            fetchResources()
            if (appointment) {
                const date = new Date(appointment.appointmentDate)
                form.reset({
                    patientId: appointment.patientId,
                    doctorId: appointment.doctorId,
                    appointmentDate: date,
                    time: format(date, 'HH:mm'),
                    type: appointment.type || 'CHECKUP',
                    reason: appointment.reason || '',
                    symptoms: appointment.symptoms || '',
                    status: appointment.status || 'SCHEDULED',
                })
            } else {
                form.reset({
                    patientId: '',
                    doctorId: '',
                    type: 'CHECKUP',
                    reason: '',
                    symptoms: '',
                    status: 'SCHEDULED',
                    time: '09:00',
                })
            }
        }
    }, [open, appointment, form])

    const fetchResources = async () => {
        try {
            setLoadingResources(true)
            const [patientsRes, doctorsRes] = await Promise.all([
                patientsAPI.getAll(),
                doctorsAPI.getAll()
            ])
            setPatients(patientsRes.data.data || [])
            setDoctors(doctorsRes.data.data || [])
        } catch (error) {
            console.error('Failed to load resources', error)
            toast({
                title: 'Error',
                description: 'Error al cargar pacientes o doctores',
                variant: 'destructive',
            })
        } finally {
            setLoadingResources(false)
        }
    }

    const onSubmit = async (data: AppointmentFormData) => {
        try {
            // Combine date and time
            const DateTime = new Date(data.appointmentDate)
            const [hours, minutes] = data.time.split(':')
            DateTime.setHours(parseInt(hours), parseInt(minutes))

            const payload = {
                ...data,
                appointmentDate: DateTime.toISOString(),
            }

            if (appointment) {
                await appointmentsAPI.update(appointment.id, payload)
                toast({
                    title: 'Éxito',
                    description: 'Cita actualizada correctamente',
                })
            } else {
                await appointmentsAPI.create(payload)
                toast({
                    title: 'Éxito',
                    description: 'Cita programada correctamente',
                })
            }
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Algo salió mal',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{appointment ? 'Editar Cita' : 'Programar Cita'}</DialogTitle>
                    <DialogDescription>
                        {appointment
                            ? 'Actualizar detalles de la cita.'
                            : 'Crear una nueva cita. El triaje AI analizará los síntomas.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <FormField
                                control={form.control}
                                name="patientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paciente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar paciente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {patients.map((patient) => (
                                                    <SelectItem key={patient.id} value={patient.id}>
                                                        {patient.firstName} {patient.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="doctorId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Doctor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar doctor" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {doctors.map((doc) => (
                                                    <SelectItem key={doc.id} value={doc.id}>
                                                        Dr. {doc.user?.firstName} {doc.user?.lastName} ({doc.specialization})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="appointmentDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Fecha</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP", { locale: es })
                                                        ) : (
                                                            <span>Elegir fecha</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date()
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hora</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CHECKUP">Chequeo General</SelectItem>
                                                <SelectItem value="FOLLOW_UP">Seguimiento</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergencia</SelectItem>
                                                <SelectItem value="CONSULTATION">Consulta</SelectItem>
                                                <SelectItem value="SURGERY">Cirugía</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SCHEDULED">Programada</SelectItem>
                                                <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                                                <SelectItem value="COMPLETED">Completada</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelada</SelectItem>
                                                <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Motivo de la Visita</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Chequeo anual, Dolor de cabeza, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="symptoms"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Síntomas (Triaje AI)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describa los síntomas para análisis AI..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || loadingResources}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {appointment ? 'Guardar Cambios' : 'Programar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
