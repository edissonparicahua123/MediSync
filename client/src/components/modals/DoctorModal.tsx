import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { doctorsAPI } from '@/services/api'
import { Loader2 } from 'lucide-react'

// Schema for doctor form
const doctorSchema = z.object({
    // User fields
    firstName: z.string().min(2, 'El nombre es requerido'),
    lastName: z.string().min(2, 'El apellido es requerido'),
    email: z.string().email('Correo electrónico inválido'),
    phone: z.string().min(10, 'El teléfono es requerido'),
    address: z.string().optional(),
    avatar: z.string().optional(),

    // Doctor fields
    specialization: z.string().min(2, 'La especialidad es requerida'),
    licenseNumber: z.string().min(5, 'El número de licencia es requerido'),
    consultationFee: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'La tarifa debe ser un número positivo',
    }),
    yearsExperience: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'La experiencia debe ser un número positivo',
    }),
    bio: z.string().optional(),
    isAvailable: z.boolean().default(true),
})

type DoctorFormData = z.infer<typeof doctorSchema>

interface DoctorModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    doctor?: any // If provided, we are editing
    onSuccess: () => void
}

export default function DoctorModal({
    open,
    onOpenChange,
    doctor,
    onSuccess,
}: DoctorModalProps) {
    const { toast } = useToast()

    const form = useForm<DoctorFormData>({
        resolver: zodResolver(doctorSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            avatar: '',
            specialization: '',
            licenseNumber: '',
            consultationFee: '',
            yearsExperience: '',
            bio: '',
            isAvailable: true,
        },
    })

    // Reset/Populate form when opening/closing or changing doctor
    useEffect(() => {
        if (open) {
            if (doctor) {
                form.reset({
                    firstName: doctor.user?.firstName || '',
                    lastName: doctor.user?.lastName || '',
                    email: doctor.user?.email || '',
                    phone: doctor.user?.phone || '',
                    address: doctor.user?.address || '',
                    avatar: doctor.user?.avatar || '',
                    specialization: doctor.specialization || '',
                    licenseNumber: doctor.licenseNumber || '',
                    consultationFee: doctor.consultationFee ? String(doctor.consultationFee) : '',
                    yearsExperience: doctor.yearsExperience ? String(doctor.yearsExperience) : '',
                    bio: doctor.bio || '',
                    isAvailable: doctor.isAvailable ?? true,
                })
            } else {
                form.reset({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    address: '',
                    avatar: '',
                    specialization: '',
                    licenseNumber: '',
                    consultationFee: '',
                    yearsExperience: '',
                    bio: '',
                    isAvailable: true,
                })
            }
        }
    }, [open, doctor, form])

    const onSubmit = async (data: DoctorFormData) => {
        try {
            // Convert types for API
            const payload = {
                ...data,
                consultationFee: Number(data.consultationFee),
                yearsExperience: Number(data.yearsExperience),
            }

            if (doctor) {
                await doctorsAPI.update(doctor.id, payload)
                toast({
                    title: 'Éxito',
                    description: 'Doctor actualizado correctamente',
                })
            } else {
                await doctorsAPI.create(payload)
                toast({
                    title: 'Éxito',
                    description: 'Doctor creado correctamente',
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
                    <DialogTitle>{doctor ? 'Editar Doctor' : 'Agregar Nuevo Doctor'}</DialogTitle>
                    <DialogDescription>
                        {doctor
                            ? 'Actualizar información y configuración del doctor.'
                            : 'Crear un nuevo perfil de doctor. También se creará una cuenta de usuario.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Information */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-2">Información Personal</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
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
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pérez" {...field} />
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
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="doctor@medisync.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Dirección</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Principal 123, Oficina 301" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Foto (URL)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/photo.jpg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Professional Information */}
                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-lg font-medium mb-2">Detalles Profesionales</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="specialization"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Especialidad</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Cardiología" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="licenseNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de Licencia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="MD-12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="yearsExperience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Años de Experiencia</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="5" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="consultationFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarifa de Consulta ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="150.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm md:col-span-2">
                                        <div className="space-y-0.5">
                                            <FormLabel>Disponibilidad</FormLabel>
                                            <DialogDescription>
                                                Mostrar al doctor como disponible para nuevas citas.
                                            </DialogDescription>
                                        </div>
                                        <FormControl>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {field.value ? 'Disponible' : 'No Disponible'}
                                                </span>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Biografía</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Breve trayectoria profesional..."
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
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {doctor ? 'Guardar Cambios' : 'Crear Doctor'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
