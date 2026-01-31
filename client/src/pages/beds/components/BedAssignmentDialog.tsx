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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, User, Calendar, CreditCard, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useBedStore } from '@/stores/bedStore'
import { usePatientStore } from '@/stores/patientStore'
import { format } from 'date-fns'

interface BedAssignmentDialogProps {
    isOpen: boolean
    onClose: () => void
    bedId: string | null
}

export default function BedAssignmentDialog({ isOpen, onClose, bedId }: BedAssignmentDialogProps) {
    const { assignPatient, beds } = useBedStore()
    const { patients, fetchPatients } = usePatientStore()
    const bed = beds.find(b => b.id === bedId)
    const safePatients = Array.isArray(patients) ? patients : []

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPatientId, setSelectedPatientId] = useState("")
    const [isSearching, setIsSearching] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        diagnosis: '',
        specialty: '',
        estimatedDischarge: '',
        notes: ''
    })

    useEffect(() => {
        if (isOpen) {
            fetchPatients()
            setSelectedPatientId("")
            setSearchTerm("")
            setIsSearching(false)
            setFormData({
                diagnosis: '',
                specialty: '',
                estimatedDischarge: '',
                notes: ''
            })
        }
    }, [isOpen, fetchPatients])

    const handleSubmit = async () => {
        if (!bedId || !selectedPatientId || !formData.diagnosis) return

        await assignPatient(bedId, {
            patientId: selectedPatientId,
            ...formData
        })
        onClose()
    }

    // Filter patients for inline search
    const filteredPatients = safePatients.filter(p => {
        if (!searchTerm) return false
        const searchLower = searchTerm.toLowerCase()
        const firstName = p.firstName?.toLowerCase() || ''
        const lastName = p.lastName?.toLowerCase() || ''
        const docNum = p.documentNumber || ''

        return (
            firstName.includes(searchLower) ||
            lastName.includes(searchLower) ||
            docNum.includes(searchLower)
        )
    }).slice(0, 5) // Limit to 5 results for UI cleanliness

    if (!bed) return null

    const selectedPatient = safePatients.find(p => p.id === selectedPatientId)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] border-none shadow-2xl bg-card">
                <DialogHeader className="border-b border-border/50 pb-4">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
                            <User className="h-5 w-5" />
                        </span>
                        Asignar Paciente
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Cama <span className="font-semibold text-foreground">{bed.number}</span> • {bed.ward}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Inline Patient Selection - Robust Implementation */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground/80">Seleccionar Paciente *</Label>

                        {!selectedPatient ? (
                            <div className="relative">
                                <div className="relative">
                                    <Input
                                        placeholder="Buscar por nombre o DNI..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setIsSearching(true)
                                        }}
                                        className="pl-10 h-12 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                </div>

                                {isSearching && searchTerm && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map((patient) => (
                                                <div
                                                    key={patient.id}
                                                    onClick={() => {
                                                        setSelectedPatientId(patient.id)
                                                        setSearchTerm("")
                                                        setIsSearching(false)
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-0 border-border/50"
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                        {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{patient.firstName} {patient.lastName}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <CreditCard className="h-3 w-3" /> {patient.documentNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                No se encontraron pacientes.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                                        {selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <CreditCard className="h-3 w-3" /> {selectedPatient.documentNumber}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedPatientId("")}
                                    className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    Cambiar
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialty">Especialidad</Label>
                            <Select
                                value={formData.specialty}
                                onValueChange={(val) => setFormData({ ...formData, specialty: val })}
                            >
                                <SelectTrigger className="bg-muted/30 border-muted-foreground/20">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Medicina General">Medicina General</SelectItem>
                                    <SelectItem value="Medicina Interna">Medicina Interna</SelectItem>
                                    <SelectItem value="Cirugía">Cirugía</SelectItem>
                                    <SelectItem value="Pediatría">Pediatría</SelectItem>
                                    <SelectItem value="Traumatología">Traumatología</SelectItem>
                                    <SelectItem value="Cardiología">Cardiología</SelectItem>
                                    <SelectItem value="Emergencia">Emergencia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discharge">Estimado de Alta</Label>
                            <div className="relative">
                                <Input
                                    id="discharge"
                                    type="date"
                                    className="pl-10 bg-muted/30 border-muted-foreground/20"
                                    value={formData.estimatedDischarge}
                                    onChange={(e) => setFormData({ ...formData, estimatedDischarge: e.target.value })}
                                />
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnóstico de Ingreso</Label>
                        <Textarea
                            id="diagnosis"
                            className="bg-muted/30 border-muted-foreground/20 min-h-[80px]"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            placeholder="Describa el diagnóstico principal de ingreso..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Observaciones / Alergias</Label>
                        <Input
                            id="notes"
                            className="bg-muted/30 border-muted-foreground/20"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Instrucciones especiales, alergias a medicamentos..."
                        />
                    </div>
                </div>

                <DialogFooter className="border-t border-border/50 pt-4 gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-muted">Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedPatientId || !formData.diagnosis}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        Confirmar Asignación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
