import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { laboratoryAPI, patientsAPI, doctorsAPI } from '@/services/api'
import { Loader2 } from 'lucide-react'

import { LabOrder } from '@/types/laboratory'

const labOrderSchema = z.object({
    patientId: z.string().min(1, 'Paciente es requerido'),
    doctorId: z.string().optional(),
    testType: z.string().min(1, 'Tipo de prueba es requerido'),
    priority: z.string().min(1, 'Prioridad es requerida'),
    notes: z.string().optional(),
    status: z.string().default('PENDING'),
})

type LabOrderFormData = z.infer<typeof labOrderSchema>

interface LabOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order?: LabOrder | null
    onSuccess: () => void
    defaultPatientId?: string
}

export default function LabOrderModal({
    open,
    onOpenChange,
    order,
    onSuccess,
    defaultPatientId,
}: LabOrderModalProps) {
    const { toast } = useToast()
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [tests, setTests] = useState<any[]>([])
    const [loadingResources, setLoadingResources] = useState(false)

    const form = useForm<LabOrderFormData>({
        resolver: zodResolver(labOrderSchema),
        defaultValues: {
            patientId: '',
            doctorId: '',
            testType: '',
            priority: 'NORMAL',
            notes: '',
            status: 'PENDING',
        },
    })

    useEffect(() => {
        if (open) {
            fetchResources()
            if (order) {
                form.reset({
                    patientId: order.patientId,
                    doctorId: order.doctorId || '',
                    testType: order.testType || '',
                    priority: order.priority || 'NORMAL',
                    notes: order.notes || '',
                    status: order.status || 'PENDING',
                })
            } else {
                form.reset({
                    patientId: defaultPatientId || '',
                    doctorId: '',
                    testType: '',
                    priority: 'NORMAL',
                    notes: '',
                    status: 'PENDING',
                })
            }
        }
    }, [open, order, form, defaultPatientId])

    const fetchResources = async () => {
        try {
            setLoadingResources(true)
            const [patientsRes, doctorsRes, testsRes] = await Promise.all([
                patientsAPI.getAll(),
                doctorsAPI.getAll(),
                laboratoryAPI.getTests()
            ])
            setPatients(patientsRes.data.data || [])
            setDoctors(doctorsRes.data.data || [])
            setTests(testsRes.data || [])
        } catch (error) {
            console.error('Failed to load resources', error)
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los datos necesarios',
                variant: 'destructive',
            })
        } finally {
            setLoadingResources(false)
        }
    }

    const onSubmit = async (data: LabOrderFormData) => {
        try {
            if (order) {
                await laboratoryAPI.updateOrder(order.id, data)
                toast({
                    title: 'Éxito',
                    description: 'Orden de laboratorio actualizada correctamente',
                })
            } else {
                await laboratoryAPI.createOrder(data)
                toast({
                    title: 'Éxito',
                    description: 'Orden de laboratorio creada correctamente',
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
                    <DialogTitle>{order ? 'Editar Orden de Laboratorio' : 'Nueva Orden de Laboratorio'}</DialogTitle>
                    <DialogDescription>
                        {order
                            ? 'Actualizar detalles de la orden.'
                            : 'Crear una nueva orden de prueba de laboratorio.'}
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
                                        <FormLabel>Médico Solicitante</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar médico (opcional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {doctors.map((doc) => (
                                                    <SelectItem key={doc.id} value={doc.id}>
                                                        Dr. {doc.user?.firstName} {doc.user?.lastName}
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
                                name="testType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Prueba</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar prueba" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tests.map((test) => (
                                                    <SelectItem key={test.id} value={test.name}>
                                                        {test.name}
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
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridad</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar prioridad" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="URGENT">Urgente</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergencia</SelectItem>
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
                                                    <SelectValue placeholder="Seleccionar estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                                <SelectItem value="COMPLETED">Completado</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Notas / Instrucciones</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Notas clínicas o instrucciones específicas..."
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
                                {order ? 'Guardar Cambios' : 'Crear Orden'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
