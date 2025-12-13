import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { patientsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

const patientSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    documentNumber: z.string().min(5, 'El documento es requerido'),
    photo: z.string().optional(),
    dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodType: z.string().optional(),
    phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    insuranceNumber: z.string().optional(),
    insuranceProvider: z.string().optional(),
    allergies: z.string().optional(),
    chronicConditions: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DECEASED', 'CRITICAL']),
})

type PatientFormData = z.infer<typeof patientSchema>

interface PatientModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patient?: any
    onSuccess?: () => void
}

export default function PatientModal({ open, onOpenChange, patient, onSuccess }: PatientModalProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const form = useForm<PatientFormData>({
        resolver: zodResolver(patientSchema),
        defaultValues: patient ? {
            ...patient,
            dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
            documentNumber: patient.documentNumber || '',
            photo: patient.photo || '',
            email: patient.email || '',
            bloodType: patient.bloodType || '',
            address: patient.address || '',
            city: patient.city || '',
            state: patient.state || '',
            zipCode: patient.zipCode || '',
            emergencyContact: patient.emergencyContact || '',
            emergencyPhone: patient.emergencyPhone || '',
            insuranceNumber: patient.insuranceNumber || '',
            insuranceProvider: patient.insuranceProvider || '',
            allergies: patient.allergies || '',
            chronicConditions: patient.chronicConditions || '',
            notes: patient.notes || '',
            status: patient.status || 'ACTIVE',
        } : {
            firstName: '',
            lastName: '',
            documentNumber: '',
            photo: '',
            dateOfBirth: '',
            gender: 'MALE' as const,
            bloodType: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            emergencyContact: '',
            emergencyPhone: '',
            insuranceNumber: '',
            insuranceProvider: '',
            allergies: '',
            chronicConditions: '',
            notes: '',
            status: 'ACTIVE',
        },
    })

    useEffect(() => {
        if (open) {
            if (patient) {
                form.reset({
                    ...patient,
                    firstName: patient.firstName || '',
                    lastName: patient.lastName || '',
                    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
                    documentNumber: patient.documentNumber || '',
                    photo: patient.photo || '',
                    gender: patient.gender || 'MALE',
                    bloodType: patient.bloodType || '',
                    phone: patient.phone || '',
                    email: patient.email || '',
                    address: patient.address || '',
                    city: patient.city || '',
                    state: patient.state || '',
                    zipCode: patient.zipCode || '',
                    emergencyContact: patient.emergencyContact || '',
                    emergencyPhone: patient.emergencyPhone || '',
                    insuranceNumber: patient.insuranceNumber || '',
                    insuranceProvider: patient.insuranceProvider || '',
                    allergies: patient.allergies || '',
                    chronicConditions: patient.chronicConditions || '',
                    notes: patient.notes || '',
                    status: patient.status || 'ACTIVE',
                })
            } else {
                form.reset({
                    firstName: '',
                    lastName: '',
                    documentNumber: '',
                    photo: '',
                    dateOfBirth: '',
                    gender: 'MALE',
                    bloodType: '',
                    phone: '',
                    email: '',
                    address: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    emergencyContact: '',
                    emergencyPhone: '',
                    insuranceNumber: '',
                    insuranceProvider: '',
                    allergies: '',
                    chronicConditions: '',
                    notes: '',
                    status: 'ACTIVE',
                })
            }
        }
    }, [open, patient, form])

    const onSubmit = async (data: PatientFormData) => {
        try {
            setLoading(true)

            // Sanitize data before sending
            const payload = {
                ...data,
                // Ensure date is properly formatted for backend (ISO-8601)
                dateOfBirth: new Date(data.dateOfBirth).toISOString(),
                // Convert empty strings to undefined for optional fields to avoid validation/DB errors
                email: data.email === '' ? undefined : data.email,
                photo: data.photo === '' ? undefined : data.photo,
                address: data.address === '' ? undefined : data.address,
                phone: data.phone, // Required
                documentNumber: data.documentNumber, // Required
                // Ensure status is included
                status: data.status,
                // Optional fields
                emergencyContact: data.emergencyContact === '' ? undefined : data.emergencyContact,
                emergencyPhone: data.emergencyPhone === '' ? undefined : data.emergencyPhone,
                insuranceProvider: data.insuranceProvider === '' ? undefined : data.insuranceProvider,
                insuranceNumber: data.insuranceNumber === '' ? undefined : data.insuranceNumber,
                bloodType: data.bloodType === '' ? undefined : data.bloodType,
                allergies: data.allergies === '' ? undefined : data.allergies,
                chronicConditions: data.chronicConditions === '' ? undefined : data.chronicConditions,
                notes: data.notes === '' ? undefined : data.notes,
            }

            if (patient) {
                await patientsAPI.update(patient.id, payload as any)
                toast({
                    title: 'Éxito',
                    description: 'Paciente actualizado correctamente',
                })
            } else {
                await patientsAPI.create(payload as any)
                toast({
                    title: 'Éxito',
                    description: 'Paciente creado correctamente',
                })
            }
            onOpenChange(false)
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            console.error('Error saving patient:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al guardar el paciente',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{patient ? 'Editar Paciente' : 'Agregar Nuevo Paciente'}</DialogTitle>
                    <DialogDescription>
                        {patient ? 'Actualizar información del paciente' : 'Ingresar detalles del paciente para crear un nuevo registro'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* 1. Datos Personales */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">1</span>
                                Datos Personales
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombres *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Juan" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Apellidos *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Pérez" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="documentNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>DNI / Documento *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="12345678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Nacimiento *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Género *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Masculino</SelectItem>
                                                    <SelectItem value="FEMALE">Femenino</SelectItem>
                                                    <SelectItem value="OTHER">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="photo"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Foto del paciente (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="URL de la imagen..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 2. Información de Contacto */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">2</span>
                                Información de Contacto
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+51 999 999 999" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correo electrónico</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="email@ejemplo.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Dirección</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Dirección completa" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="emergencyContact"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Contacto de Emergencia</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre y Teléfono de contacto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 3. Información Médica Básica */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">3</span>
                                Información Médica Básica
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bloodType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grupo Sanguíneo</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="A+">A+</SelectItem>
                                                    <SelectItem value="A-">A-</SelectItem>
                                                    <SelectItem value="B+">B+</SelectItem>
                                                    <SelectItem value="B-">B-</SelectItem>
                                                    <SelectItem value="AB+">AB+</SelectItem>
                                                    <SelectItem value="AB-">AB-</SelectItem>
                                                    <SelectItem value="O+">O+</SelectItem>
                                                    <SelectItem value="O-">O-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="allergies"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alergias</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ninguna o especificar..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 4. Seguro Médico */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">4</span>
                                Seguro Médico
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="insuranceProvider"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Aseguradora</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Pacifico, Rimac..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="insuranceNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Seguro</FormLabel>
                                            <FormControl>
                                                <Input placeholder="N° de Póliza o Afiliación" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* 5. Estado del Paciente */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">5</span>
                                Estado del Paciente
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
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
                                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                                    <SelectItem value="CRITICAL">Crítico</SelectItem>
                                                    <SelectItem value="DECEASED">Fallecido</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {patient ? 'Actualizar Paciente' : 'Crear Paciente'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form >
            </DialogContent >
        </Dialog >
    )
}
