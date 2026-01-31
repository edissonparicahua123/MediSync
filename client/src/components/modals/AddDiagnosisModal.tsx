import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { patientsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    condition: z.string().min(2, 'La condición es requerida'),
    description: z.string().optional(),
    treatment: z.string().optional(),
    diagnosisDate: z.string().optional(),
    status: z.string().default('Active'),
})

interface AddDiagnosisModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patientId: string
    onSuccess: () => void
}

export default function AddDiagnosisModal({ open, onOpenChange, patientId, onSuccess }: AddDiagnosisModalProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            condition: '',
            description: '',
            treatment: '',
            diagnosisDate: new Date().toISOString().split('T')[0],
            status: 'Active',
        },
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true)
            // Map values to API expected format if needed
            // Assuming API expects: { diagnosis: string, notes: string, treatment: string, ... }
            // Based on previous read of medicalHistory mapping: record.condition || record.diagnosis

            await patientsAPI.addDiagnosis(patientId, {
                diagnosisName: values.condition,
                notes: `${values.description || ''}\n\nTratamiento Sugerido: ${values.treatment || 'Ninguno'}`,
                diagnosedDate: new Date(values.diagnosisDate!).toISOString(),
                status: values.status
            })

            toast({
                title: "Diagnóstico agregado",
                description: "El registro médico ha sido guardado exitosamente.",
            })
            form.reset()
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "No se pudo guardar el diagnóstico.",
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Registro Médico</DialogTitle>
                    <DialogDescription>
                        Agregue un nuevo diagnóstico o condición al historial del paciente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="condition"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Diagnóstico / Condición</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Hipertensión Arterial" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="diagnosisDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Diagnóstico</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="treatment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tratamiento Inicial</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Losartán 50mg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas / Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalles adicionales sobre el diagnóstico..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Registro
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
