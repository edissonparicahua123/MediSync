import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useBedStore } from "@/stores/bedStore"
import { useToast } from "@/components/ui/use-toast"

const bedSchema = z.object({
    number: z.string().min(1, "El número de cama es requerido"),
    ward: z.string().min(1, "El área es requerida"),
    type: z.string().min(1, "El tipo es requerido"),
    status: z.enum(["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE", "RESERVED"]),
    notes: z.string().optional(),
})

interface BedModalProps {
    isOpen: boolean
    onClose: () => void
    bedToEdit?: any // If provided, we are in edit mode
}

export default function BedModal({ isOpen, onClose, bedToEdit }: BedModalProps) {
    const { addBed, updateBed } = useBedStore()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof bedSchema>>({
        resolver: zodResolver(bedSchema),
        defaultValues: {
            number: "",
            ward: "Emergencia",
            type: "Camilla",
            status: "AVAILABLE",
            notes: "",
        },
    })

    useEffect(() => {
        if (bedToEdit) {
            form.reset({
                number: bedToEdit.number,
                ward: bedToEdit.ward,
                type: bedToEdit.type,
                status: bedToEdit.status,
                notes: bedToEdit.notes || "",
            })
        } else {
            form.reset({
                number: "",
                ward: "Emergencia",
                type: "Camilla",
                status: "AVAILABLE",
                notes: "",
            })
        }
    }, [bedToEdit, isOpen, form])

    async function onSubmit(values: z.infer<typeof bedSchema>) {
        setIsLoading(true)
        try {
            if (bedToEdit) {
                await updateBed(bedToEdit.id, values)
                toast({ title: "Cama actualizada", description: "Los datos han sido guardados." })
            } else {
                await addBed(values)
                // Toast is handled in store for create, but we can add one here too or reply on store
            }
            onClose()
        } catch (error) {
            console.error(error)
            // Store handles error toasts usually, but we can double check
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{bedToEdit ? "Editar Cama" : "Nueva Cama"}</DialogTitle>
                    <DialogDescription>
                        Ingrese los detalles de la cama o camilla.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número / Identificador</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: CAM-001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ward"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Área</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione área" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Emergencia">Emergencia</SelectItem>
                                                <SelectItem value="UCI">UCI</SelectItem>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="Pediatría">Pediatría</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Camilla">Camilla</SelectItem>
                                                <SelectItem value="Cama Hospitalaria">Cama Hospitalaria</SelectItem>
                                                <SelectItem value="Cama UCI">Cama UCI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado Inicial</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Disponible</SelectItem>
                                            <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                                            <SelectItem value="CLEANING">Limpieza</SelectItem>
                                            <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                                            <SelectItem value="RESERVED">Reservada</SelectItem>
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
                                <FormItem>
                                    <FormLabel>Notas</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Información adicional..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar Cama"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
