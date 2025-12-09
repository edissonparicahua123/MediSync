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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { pharmacyAPI } from '@/services/api'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const medicationSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    genericName: z.string().min(2, 'Generic name is required'),
    description: z.string().optional(),
    manufacturer: z.string().min(2, 'Manufacturer is required'),
    unit: z.string().min(1, 'Unit is required'), // e.g., tablets, ml, mg
    type: z.string().min(1, 'Type is required'),

    // Initial stock fields (only for creation mostly, but can be edited)
    // For simplicity, we might want to manage stock separately or allow initial stock set here
    // Let's assume this modal is for Medication details, stock is managed via stock updates usually
    // But for MVP, let's allow editing base price and reorder level if we had it
    // Schema doesn't have reorderLevel in Medication, it has it in PharmacyStock?
    // Let's check schema: Medication has name, genericName, manufacturer, form, strength, etc.
    // Actually schema says:
    /*
      model Medication {
        id          String   @id @default(uuid())
        name        String
        genericName String
        description String?
        manufacturer String
        form        String   // TABLET, SYRUP, INJECTION, etc.
        strength    String   // 500mg, 10ml, etc.
        category    String?  // ANTIBIOTIC, PAINKILLER, etc.
    */
    form: z.string().min(1, 'Form is required'),
    strength: z.string().min(1, 'Strength is required'),
    category: z.string().optional(),
})

type MedicationFormData = z.infer<typeof medicationSchema>

interface MedicationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    medication?: any
    onSuccess: () => void
}

export default function MedicationModal({
    open,
    onOpenChange,
    medication,
    onSuccess,
}: MedicationModalProps) {
    const { toast } = useToast()

    const form = useForm<MedicationFormData>({
        resolver: zodResolver(medicationSchema),
        defaultValues: {
            name: '',
            genericName: '',
            description: '',
            manufacturer: '',
            unit: 'units', // Default
            type: 'TABLET',
            form: 'TABLET',
            strength: '',
            category: ''
        },
    })

    useEffect(() => {
        if (open) {
            if (medication) {
                form.reset({
                    name: medication.name || '',
                    genericName: medication.genericName || '',
                    description: medication.description || '',
                    manufacturer: medication.manufacturer || '',
                    unit: 'units', // Not in schema, ignore or mapped
                    type: medication.form || 'TABLET',
                    form: medication.form || 'TABLET',
                    strength: medication.strength || '',
                    category: medication.category || '',
                })
            } else {
                form.reset({
                    name: '',
                    genericName: '',
                    description: '',
                    manufacturer: '',
                    unit: 'units',
                    type: 'TABLET',
                    form: 'TABLET',
                    strength: '',
                    category: '',
                })
            }
        }
    }, [open, medication, form])

    const onSubmit = async (data: MedicationFormData) => {
        try {
            if (medication) {
                await pharmacyAPI.updateMedication(medication.id, data)
                toast({
                    title: 'Success',
                    description: 'Medication updated successfully',
                })
            } else {
                await pharmacyAPI.createMedication(data)
                toast({
                    title: 'Success',
                    description: 'Medication created successfully',
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
                    <DialogTitle>{medication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
                    <DialogDescription>
                        {medication
                            ? 'Update medication details.'
                            : 'Add a new medication to the inventory system.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Panadol" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="genericName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Generic Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Paracetamol" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="manufacturer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Manufacturer</FormLabel>
                                        <FormControl>
                                            <Input placeholder="GSK" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Painkiller, Antibiotic..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="form"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Form</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select form" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TABLET">Tablet</SelectItem>
                                                <SelectItem value="CAPSULE">Capsule</SelectItem>
                                                <SelectItem value="SYRUP">Syrup</SelectItem>
                                                <SelectItem value="INJECTION">Injection</SelectItem>
                                                <SelectItem value="OINTMENT">Ointment</SelectItem>
                                                <SelectItem value="DROPS">Drops</SelectItem>
                                                <SelectItem value="INHALER">Inhaler</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="strength"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Strength</FormLabel>
                                        <FormControl>
                                            <Input placeholder="500mg, 10ml..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Additional details..."
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
                                {medication ? 'Save Changes' : 'Create Medication'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
