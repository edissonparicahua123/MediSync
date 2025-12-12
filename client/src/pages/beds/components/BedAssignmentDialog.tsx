import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useBedStore } from '@/stores/bedStore'

interface BedAssignmentDialogProps {
    isOpen: boolean
    onClose: () => void
    bedId: string | null
}

export default function BedAssignmentDialog({ isOpen, onClose, bedId }: BedAssignmentDialogProps) {
    const { assignPatient, beds } = useBedStore()
    const bed = beds.find(b => b.id === bedId)

    const [formData, setFormData] = useState({
        name: '',
        id: '',
        diagnosis: '',
        specialty: '',
        estimatedDischarge: '',
        notes: ''
    })

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                id: '',
                diagnosis: '',
                specialty: '',
                estimatedDischarge: '',
                notes: ''
            })
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (!bedId || !formData.name) return
        assignPatient(bedId, formData)
        onClose()
    }

    if (!bed) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Asignar Paciente a Cama {bed.number}</DialogTitle>
                    <DialogDescription>
                        Complete los datos del ingreso hospitalario.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Paciente *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="id">DNI / Identificación</Label>
                            <Input
                                id="id"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                placeholder="Opcional"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnóstico de Ingreso</Label>
                        <Input
                            id="diagnosis"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            placeholder="Ej. Neumonía adquirida en comunidad"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Especialidad</Label>
                            <Select
                                value={formData.specialty}
                                onValueChange={(val) => setFormData({ ...formData, specialty: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Medicina General">Medicina General</SelectItem>
                                    <SelectItem value="Medicina Interna">Medicina Interna</SelectItem>
                                    <SelectItem value="Cirugía">Cirugía</SelectItem>
                                    <SelectItem value="Pediatría">Pediatría</SelectItem>
                                    <SelectItem value="Traumatología">Traumatología</SelectItem>
                                    <SelectItem value="Cardiología">Cardiología</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discharge">Estimado de Alta</Label>
                            <Input
                                id="discharge"
                                type="date"
                                value={formData.estimatedDischarge}
                                onChange={(e) => setFormData({ ...formData, estimatedDischarge: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas Clínicas / Observaciones</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Instrucciones especiales, alergias, etc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit}>Confirmar Asignación</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
