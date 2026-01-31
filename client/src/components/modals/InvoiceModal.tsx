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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f172a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{invoice ? 'Editar Factura' : 'Nueva Factura'}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {invoice
                            ? 'Actualice los detalles de la factura.'
                            : 'Cree una nueva factura para un paciente.'}
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
                                        <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Paciente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl">
                                                    <SelectValue placeholder="Seleccione paciente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#0f172a] border-white/10 text-white">
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
                                        <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Factura #</FormLabel>
                                        <FormControl>
                                            <Input placeholder="INV-001" {...field} className="bg-black/20 border-white/10 text-white rounded-xl" />
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
                                        <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl">
                                                    <SelectValue placeholder="Estado" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                                <SelectItem value="PAID">Pagado</SelectItem>
                                                <SelectItem value="OVERDUE">Vencido</SelectItem>
                                                <SelectItem value="CANCELLED">Cancelado</SelectItem>
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
                                        <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Fecha Emisión</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-black/20 border-white/10 text-white rounded-xl" />
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
                                        <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Vencimiento (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className="bg-black/20 border-white/10 text-white rounded-xl" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Items Section */}
                        <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                            <h3 className="font-bold mb-3 text-white uppercase text-sm tracking-widest">Items de Factura</h3>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-end">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className={`text-slate-400 text-xs uppercase ${index !== 0 ? "sr-only" : ""}`}>Descripción</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Servicio o Ítem" {...field} className="bg-black/20 border-white/10 text-white rounded-lg h-9" />
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
                                                    <FormLabel className={`text-slate-400 text-xs uppercase ${index !== 0 ? "sr-only" : ""}`}>Cant.</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="1" {...field} className="bg-black/20 border-white/10 text-white rounded-lg h-9" />
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
                                                    <FormLabel className={`text-slate-400 text-xs uppercase ${index !== 0 ? "sr-only" : ""}`}>Precio</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" min="0" step="0.01" {...field} className="bg-black/20 border-white/10 text-white rounded-lg h-9" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-9 w-9 rounded-lg"
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
                                className="mt-4 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider"
                                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                            >
                                <Plus className="h-3 w-3 mr-2" />
                                Agregar Item
                            </Button>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col items-end gap-2">
                            <div className="w-full md:w-1/3 space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center text-sm text-slate-300">
                                    <span>Subtotal:</span>
                                    <span className="font-medium text-white">${subtotal.toFixed(2)}</span>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="tax"
                                    render={({ field }) => (
                                        <FormItem className="flex justify-between items-center gap-4 space-y-0">
                                            <FormLabel className="whitespace-nowrap text-slate-300 font-normal">Impuesto ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" className="text-right w-24 h-8 bg-black/20 border-white/10 text-white" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="discount"
                                    render={({ field }) => (
                                        <FormItem className="flex justify-between items-center gap-4 space-y-0">
                                            <FormLabel className="whitespace-nowrap text-slate-300 font-normal">Descuento ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="0.01" className="text-right w-24 h-8 bg-black/20 border-white/10 text-white" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-between items-center text-lg font-bold border-t border-white/10 pt-2 mt-2">
                                    <span className="text-white">Total:</span>
                                    <span className="text-emerald-400">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300 font-bold uppercase text-xs tracking-wider">Notas</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Instrucciones de pago o notas adicionales..." {...field} className="bg-black/20 border-white/10 text-white rounded-xl" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || loadingPatients} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {invoice ? 'Guardar Cambios' : 'Crear Factura'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
