import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { billingAPI, patientsAPI } from '@/services/api'
import { Loader2, Plus, Trash2 } from 'lucide-react'

// Schema for invoice items
const invoiceItemSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.coerce.number().min(0, 'Price cannot be negative'),
})

const invoiceSchema = z.object({
    patientId: z.string().min(1, 'Patient is required'),
    invoiceNumber: z.string().min(1, 'Invoice number is required'),
    invoiceDate: z.string().min(1, 'Date is required'),
    dueDate: z.string().optional(),
    status: z.string().default('PENDING'),
    items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
    tax: z.coerce.number().min(0).default(0),
    discount: z.coerce.number().min(0).default(0),
    notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    invoice?: any
    onSuccess: () => void
}

export default function InvoiceModal({
    open,
    onOpenChange,
    invoice,
    onSuccess,
}: InvoiceModalProps) {
    const { toast } = useToast()
    const [patients, setPatients] = useState<any[]>([])
    const [loadingPatients, setLoadingPatients] = useState(false)

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            patientId: '',
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            status: 'PENDING',
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            tax: 0,
            discount: 0,
            notes: '',
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    useEffect(() => {
        if (open) {
            loadPatients()
            if (invoice) {
                // If editing, map existing data
                form.reset({
                    patientId: invoice.patientId,
                    invoiceNumber: invoice.invoiceNumber,
                    invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
                    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                    status: invoice.status,
                    items: invoice.items && invoice.items.length > 0 ? invoice.items.map((i: any) => ({
                        description: i.description,
                        quantity: i.quantity,
                        unitPrice: Number(i.unitPrice),
                    })) : [{ description: '', quantity: 1, unitPrice: 0 }],
                    tax: Number(invoice.tax || 0),
                    discount: Number(invoice.discount || 0),
                    notes: invoice.notes || '',
                })
            } else {
                // Generate a temporary invoice number or let user input
                const tempInvoiceNum = `INV-${Date.now().toString().slice(-6)}`
                form.reset({
                    patientId: '',
                    invoiceNumber: tempInvoiceNum,
                    invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: '',
                    status: 'PENDING',
                    items: [{ description: '', quantity: 1, unitPrice: 0 }],
                    tax: 0,
                    discount: 0,
                    notes: '',
                })
            }
        }
    }, [open, invoice, form])

    const loadPatients = async () => {
        try {
            setLoadingPatients(true)
            const response = await patientsAPI.getAll()
            setPatients(response.data.data || [])
        } catch (error) {
            console.error('Failed to load patients', error)
        } finally {
            setLoadingPatients(false)
        }
    }

    const calculateSubtotal = (items: any[]) => {
        return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    }

    const watchItems = form.watch('items')
    const watchTax = form.watch('tax')
    const watchDiscount = form.watch('discount')
    const subtotal = calculateSubtotal(watchItems)
    const total = subtotal + watchTax - watchDiscount

    const onSubmit = async (data: InvoiceFormData) => {
        try {
            const formattedData = {
                ...data,
                invoiceDate: new Date(data.invoiceDate).toISOString(),
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
                subtotal: subtotal,
                total: total,
            }

            if (invoice) {
                await billingAPI.updateInvoice(invoice.id, formattedData)
                toast({
                    title: 'Success',
                    description: 'Invoice updated successfully',
                })
            } else {
                await billingAPI.createInvoice(formattedData)
                toast({
                    title: 'Success',
                    description: 'Invoice created successfully',
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{invoice ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
                    <DialogDescription>
                        {invoice
                            ? 'Update invoice details and items.'
                            : 'Create a new invoice for a patient.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Header Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                                {patients.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.firstName} {p.lastName}
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
                                name="invoiceNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="INV-001" {...field} />
                                        </FormControl>
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
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="PAID">Paid</SelectItem>
                                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="invoiceDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Invoice Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Items Section */}
                        <div className="border rounded-md p-4 bg-slate-50">
                            <h3 className="font-medium mb-3">Invoice Items</h3>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Description</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Service or Item" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem className="w-24">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unitPrice`}
                                            render={({ field }) => (
                                                <FormItem className="w-32">
                                                    <FormLabel className={index !== 0 ? "sr-only" : ""}>Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                            </Button>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-full md:w-1/3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Subtotal:</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tax"
                                    render={({ field }) => (
                                        <FormItem className="flex justify-between items-center gap-4">
                                            <FormLabel className="whitespace-nowrap">Tax ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" className="text-right w-24 h-8" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem className="flex justify-between items-center gap-4">
                                            <FormLabel className="whitespace-nowrap">Discount ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" className="text-right w-24 h-8" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Payment instructions or additional notes..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || loadingPatients}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {invoice ? 'Save Changes' : 'Create Invoice'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
