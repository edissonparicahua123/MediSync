import { useState } from 'react'
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
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodType: z.string().optional(),
    phone: z.string().min(10, 'Phone must be at least 10 characters'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
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
        } : {
            firstName: '',
            lastName: '',
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
        },
    })

    const onSubmit = async (data: PatientFormData) => {
        try {
            setLoading(true)
            if (patient) {
                await patientsAPI.update(patient.id, data)
                toast({
                    title: 'Success',
                    description: 'Patient updated successfully',
                })
            } else {
                await patientsAPI.create(data)
                toast({
                    title: 'Success',
                    description: 'Patient created successfully',
                })
            }
            onOpenChange(false)
            form.reset()
            onSuccess?.()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save patient',
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
                    <DialogTitle>{patient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                    <DialogDescription>
                        {patient ? 'Update patient information' : 'Enter patient details to create a new record'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
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
                                            <FormLabel>Last Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Doe" {...field} />
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
                                            <FormLabel>Date of Birth *</FormLabel>
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
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bloodType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blood Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select blood type" />
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
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+1 (555) 123-4567" {...field} />
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
                                                <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="New York" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="NY" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Medical Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Medical Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="allergies"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Allergies</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="List any known allergies..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="chronicConditions"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Chronic Conditions</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="List any chronic conditions..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {patient ? 'Update Patient' : 'Create Patient'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
