import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { patientsAPI } from '@/services/api'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

const noteSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    content: z.string().min(1, 'El contenido de la nota es requerido'),
})

interface AddNoteModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    patientId: string
    onSuccess: () => void
}

export function AddNoteModal({
    open,
    onOpenChange,
    patientId,
    onSuccess,
}: AddNoteModalProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof noteSchema>>({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    })

    const onSubmit = async (values: z.infer<typeof noteSchema>) => {
        try {
            setIsLoading(true)
            await patientsAPI.addNote(patientId, values)

            toast({
                title: 'Nota agregada',
                description: 'La nota clínica ha sido guardada correctamente.',
            })

            form.reset()
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Error adding note:', error)
            toast({
                title: 'Error',
                description: 'No se pudo guardar la nota. Intente nuevamente.',
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
                    <DialogTitle>Nueva Nota Clínica</DialogTitle>
                    <DialogDescription>
                        Agregue una nueva nota o observación al historial del paciente.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título / Motivo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Consulta de seguimiento, Observación diaria..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contenido</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describa los detalles clínicos, observaciones o evoluciones..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Nota
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
