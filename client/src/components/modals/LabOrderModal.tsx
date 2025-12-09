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

const labOrderSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    doctorId: z.string().optional(), // Can be optional if self-ordered or system ordered? Schema says nothing, let's assume optional or make it required if UI forces it
    testType: z.string().min(1, 'Test type is required'),
    priority: z.string().min(1, 'Priority is required'),
    notes: z.string().optional(),
    status: z.string().default('PENDING'),
})

type LabOrderFormData = z.infer<typeof labOrderSchema>

interface LabOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    order?: any
    onSuccess: () => void
}

export default function LabOrderModal({
    open,
    onOpenChange,
    order,
    onSuccess,
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
                    patientId: '',
                    doctorId: '',
                    testType: '',
                    priority: 'NORMAL',
                    notes: '',
                    status: 'PENDING',
                })
            }
        }
    }, [open, order, form])

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
                description: 'Failed to load necessary data',
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
                    title: 'Success',
                    description: 'Lab order updated successfully',
                })
            } else {
                await laboratoryAPI.createOrder(data)
                toast({
                    title: 'Success',
                    description: 'Lab order created successfully',
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
                    <DialogTitle>{order ? 'Edit Lab Order' : 'New Lab Order'}</DialogTitle>
                    <DialogDescription>
                        {order
                            ? 'Update lab order details.'
                            : 'Create a new laboratory test order.'}
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
                                        <FormLabel>Referring Doctor</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select doctor (optional)" />
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
                                        <FormLabel>Test Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select test" />
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
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NORMAL">Normal</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergency</SelectItem>
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
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
                                        <FormLabel>Notes / Instructions</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Clinical notes or specific instructions..."
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
                                {order ? 'Save Changes' : 'Create Order'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
