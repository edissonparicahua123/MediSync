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
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number is required'),

    // Doctor fields
    specialization: z.string().min(2, 'Specialization is required'),
    licenseNumber: z.string().min(5, 'License number is required'),
    consultationFee: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Fee must be a positive number',
    }),
    yearsExperience: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: 'Experience must be a positive number',
    }),
    bio: z.string().optional(),
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
            specialization: '',
            licenseNumber: '',
            consultationFee: '',
            yearsExperience: '',
            bio: '',
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
                    specialization: doctor.specialization || '',
                    licenseNumber: doctor.licenseNumber || '',
                    consultationFee: doctor.consultationFee ? String(doctor.consultationFee) : '',
                    yearsExperience: doctor.yearsExperience ? String(doctor.yearsExperience) : '',
                    bio: doctor.bio || '',
                })
            } else {
                form.reset({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    specialization: '',
                    licenseNumber: '',
                    consultationFee: '',
                    yearsExperience: '',
                    bio: '',
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
                    title: 'Success',
                    description: 'Doctor updated successfully',
                })
            } else {
                await doctorsAPI.create(payload)
                toast({
                    title: 'Success',
                    description: 'Doctor created successfully',
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
                    <DialogTitle>{doctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                    <DialogDescription>
                        {doctor
                            ? 'Update doctor information and settings.'
                            : 'Create a new doctor profile. A user account will also be created.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Information */}
                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
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
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
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
                                        <FormLabel>Email</FormLabel>
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
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1 234 567 890" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Professional Information */}
                            <div className="md:col-span-2 mt-4">
                                <h3 className="text-lg font-medium mb-2">Professional Details</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="specialization"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specialization</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Cardiology" {...field} />
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
                                        <FormLabel>License Number</FormLabel>
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
                                        <FormLabel>Years of Experience</FormLabel>
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
                                        <FormLabel>Consultation Fee ($)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="150.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Biography</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief professional background..."
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
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {doctor ? 'Save Changes' : 'Create Doctor'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
