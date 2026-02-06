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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { laboratoryAPI, doctorsAPI, patientsAPI } from '@/services/api'
import { Loader2, TestTube2, AlertCircle } from 'lucide-react'

interface LabOrderModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultPatientId?: string
    defaultDoctorId?: string
    onSuccess?: () => void
}

export default function LabOrderModal({
    open,
    onOpenChange,
    defaultPatientId,
    defaultDoctorId,
    onSuccess
}: LabOrderModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [tests, setTests] = useState<any[]>([])

    // Form Data
    const [formData, setFormData] = useState({
        patientId: defaultPatientId || '',
        doctorId: defaultDoctorId || '',
        testType: '',
        priority: 'NORMAL',
        notes: ''
    })

    // Load initial data
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                try {
                    const [patientsRes, doctorsRes, testsRes] = await Promise.all([
                        patientsAPI.getAll(),
                        doctorsAPI.getAll(),
                        laboratoryAPI.getTests(),
                    ])

                    // Safely extract data handling potential { data: [...] } structure or direct array
                    const patientsList = Array.isArray(patientsRes.data) ? patientsRes.data : (patientsRes.data?.data || [])
                    const doctorsList = Array.isArray(doctorsRes.data) ? doctorsRes.data : (doctorsRes.data?.data || [])
                    const testsList = Array.isArray(testsRes.data) ? testsRes.data : (testsRes.data?.data || [])

                    setPatients(patientsList)
                    setDoctors(doctorsList)
                    setTests(testsList)

                    // Update local state if props change
                    setFormData(prev => ({
                        ...prev,
                        patientId: defaultPatientId || prev.patientId,
                        doctorId: defaultDoctorId || prev.doctorId
                    }))
                } catch (error) {
                    console.error("Error loading modal data", error)
                    toast({
                        title: "Error",
                        description: "No se pudieron cargar los datos necesarios.",
                        variant: "destructive"
                    })
                    // Ensure empty arrays on error to prevent map errors
                    setPatients([])
                    setDoctors([])
                    setTests([])
                }
            }
            loadData()
        }
    }, [open, defaultPatientId, defaultDoctorId])

    // Update form when defaults change
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            patientId: defaultPatientId || prev.patientId,
            doctorId: defaultDoctorId || prev.doctorId
        }))
    }, [defaultPatientId, defaultDoctorId])

    const handleSubmit = async () => {
        // Validation
        if (!formData.patientId || !formData.doctorId || !formData.testType) {
            toast({
                title: "Campos Incompletos",
                description: "Por favor seleccione paciente, médico y tipo de examen.",
                variant: "destructive"
            })
            return
        }

        try {
            setLoading(true)
            await laboratoryAPI.createOrder({
                ...formData,
                status: 'PENDING',
                orderDate: new Date().toISOString()
            })

            toast({
                title: "Orden Creada",
                description: "La orden de laboratorio ha sido registrada exitosamente.",
                className: "bg-green-600 text-white border-none"
            })

            if (onSuccess) onSuccess()
            onOpenChange(false)

            // Reset form (keeping defaults if present is tricky, better to just reset specific fields or let next open handle it)
            setFormData({
                patientId: defaultPatientId || '',
                doctorId: defaultDoctorId || '',
                testType: '',
                priority: 'NORMAL',
                notes: ''
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "No se pudo crear la orden.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <TestTube2 className="h-5 w-5 text-red-500" />
                        </div>
                        Nueva Orden de Análisis
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Complete los campos para registrar una nueva solicitud de laboratorio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Patient Selection - Disabled if default provided */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Paciente</Label>
                            <Select
                                value={formData.patientId}
                                onValueChange={(v) => setFormData({ ...formData, patientId: v })}
                                disabled={!!defaultPatientId}
                            >
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-red-500/20 text-zinc-100">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id} className="focus:bg-zinc-800 focus:text-zinc-100">
                                            {p.firstName} {p.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Doctor Selection */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Médico Solicitante</Label>
                            <Select
                                value={formData.doctorId}
                                onValueChange={(v) => setFormData({ ...formData, doctorId: v })}
                            >
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-red-500/20 text-zinc-100">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id} className="focus:bg-zinc-800 focus:text-zinc-100">
                                            Dr. {d.user?.lastName || d.specialty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Test Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Tipo de Examen</Label>
                        <Select
                            value={formData.testType}
                            onValueChange={(v) => setFormData({ ...formData, testType: v })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-red-500/20 text-zinc-100">
                                <SelectValue placeholder="Seleccionar análisis..." />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100 h-64">
                                {tests.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="focus:bg-zinc-800 focus:text-zinc-100">
                                        <span className="font-medium text-zinc-100">{t.name}</span>
                                        <span className="ml-2 text-xs text-zinc-500">[{t.category}]</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority Selection */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Nivel de Prioridad</Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(v) => setFormData({ ...formData, priority: v })}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-red-500/20 text-zinc-100">
                                <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                <SelectItem value="NORMAL" className="focus:bg-zinc-800 text-emerald-500 font-medium">
                                    NORMAL
                                </SelectItem>
                                <SelectItem value="URGENTE" className="focus:bg-zinc-800 text-orange-500 font-medium">
                                    URGENTE
                                </SelectItem>
                                <SelectItem value="STAT" className="focus:bg-zinc-800 text-red-500 font-bold">
                                    STAT (Inmediato)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Observaciones / Indicaciones</Label>
                        <Textarea
                            className="bg-zinc-900 border-zinc-800 focus:border-red-500/50 text-zinc-100 resize-none"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Notas clínicas relevantes, indicaciones especiales..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-zinc-900">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all font-medium"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <TestTube2 className="mr-2 h-4 w-4" />
                                Crear Orden
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
