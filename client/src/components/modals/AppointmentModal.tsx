import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
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
    patientId: z.string().min(1, 'Patient is required'),
    doctorId: z.string().min(1, 'Doctor is required'),
    appointmentDate: z.date({
        required_error: "Date is required",
    }),
    time: z.string().min(1, 'Time is required'),
    type: z.string().min(1, 'Type is required'),
    reason: z.string().min(1, 'Reason is required'),
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
                description: 'Failed to load patients or doctors',
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
                    title: 'Success',
                    description: 'Appointment updated successfully',
                })
            } else {
                await appointmentsAPI.create(payload)
                toast({
                    title: 'Success',
                    description: 'Appointment scheduled successfully',
                })
            }
            onSuccess()
            onOpenChange(false)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{appointment ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
                    <DialogDescription>
                        {appointment
                            ? 'Update appointment details.'
                            : 'Create a new appointment. AI triage will analyze symptoms.'}
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
                                        <FormLabel>Patient</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select patient" />
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
                                                    <SelectValue placeholder="Select doctor" />
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
                                        <FormLabel>Date</FormLabel>
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
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
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
                                        <FormLabel>Time</FormLabel>
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
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CHECKUP">General Checkup</SelectItem>
                                                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                                <SelectItem value="CONSULTATION">Consultation</SelectItem>
                                                <SelectItem value="SURGERY">Surgery</SelectItem>
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
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                <SelectItem value="NO_SHOW">No Show</SelectItem>
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
                                        <FormLabel>Reason for Visit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Annual physical, Headache, etc." {...field} />
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
                                        <FormLabel>Symptoms (AI Triage)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe symptoms for AI analysis..."
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || loadingResources}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {appointment ? 'Save Changes' : 'Schedule'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
