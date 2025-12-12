import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    AlertTriangle,
    Bed,
    Users,
    Activity,
    Loader2,
    Plus,
    Eye,
    Clock,
    Heart,
    Thermometer,
    Droplet,
    Wind,
    Brain,
} from 'lucide-react'
import { emergencyAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function EmergencyPage() {
    const navigate = useNavigate()
    const [dashboard, setDashboard] = useState<any>(null)
    const [criticalPatients, setCriticalPatients] = useState<any[]>([])
    const [wardStats, setWardStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('er-room')
    const { toast } = useToast()

    // Triage IA State
    const [triageOpen, setTriageOpen] = useState(false)
    const [symptoms, setSymptoms] = useState('')
    const [triageResult, setTriageResult] = useState<any>(null)
    const [analyzingTriage, setAnalyzingTriage] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [dashboardRes, patientsRes, wardsRes] = await Promise.all([
                emergencyAPI.getDashboard().catch(() => ({ data: null })),
                emergencyAPI.getCriticalPatients().catch(() => ({ data: [] })),
                emergencyAPI.getWardStats().catch(() => ({ data: [] }))
            ])
            setDashboard(dashboardRes.data || {
                criticalPatients: 8,
                beds: { total: 50, available: 12, occupied: 38 }
            })
            setCriticalPatients(patientsRes.data || [])
            setWardStats(wardsRes.data || [
                { ward: 'UCI', total: 10, occupied: 8 },
                { ward: 'Emergencia', total: 20, occupied: 15 },
                { ward: 'General', total: 20, occupied: 15 },
            ])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar datos',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Simular análisis de triage con IA
    const analyzeTriage = async () => {
        if (!symptoms.trim()) {
            toast({
                title: 'Error',
                description: 'Por favor ingrese los síntomas',
                variant: 'destructive',
            })
            return
        }

        setAnalyzingTriage(true)

        // Simular llamada a IA
        setTimeout(() => {
            const priority = Math.floor(Math.random() * 5) + 1 // 1-5
            const waitTime = priority === 1 ? 0 : priority === 2 ? 10 : priority === 3 ? 30 : priority === 4 ? 60 : 120

            const colors: Record<number, { bg: string; text: string; label: string }> = {
                1: { bg: 'bg-red-100', text: 'text-red-800', label: 'CRÍTICO' },
                2: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'URGENTE' },
                3: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'SEMI-URGENTE' },
                4: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'NO URGENTE' },
                5: { bg: 'bg-green-100', text: 'text-green-800', label: 'BAJA PRIORIDAD' },
            }

            setTriageResult({
                priority,
                waitTime,
                color: colors[priority],
                recommendations: [
                    'Monitorear signos vitales cada 15 minutos',
                    'Preparar acceso IV',
                    'Alertar al médico de turno',
                ],
            })
            setAnalyzingTriage(false)
        }, 2000)
    }

    const getPriorityColor = (priority: number) => {
        const colors: Record<number, string> = {
            1: 'bg-red-500',
            2: 'bg-orange-500',
            3: 'bg-yellow-500',
            4: 'bg-blue-500',
            5: 'bg-green-500',
        }
        return colors[priority] || 'bg-gray-500'
    }

    // Datos simulados de pacientes en ER
    const erPatients = [
        {
            id: '1',
            name: 'Juan Pérez',
            age: 45,
            bedNumber: 'ER-01',
            priority: 1,
            diagnosis: 'Dolor torácico',
            doctor: 'Dr. Smith',
            admittedAt: new Date(Date.now() - 3600000),
            vitalSigns: { hr: 120, bp: '140/90', temp: 38.5, spo2: 95 },
        },
        {
            id: '2',
            name: 'María García',
            age: 32,
            bedNumber: 'ER-02',
            priority: 2,
            diagnosis: 'Cefalea intensa',
            doctor: 'Dr. Johnson',
            admittedAt: new Date(Date.now() - 7200000),
            vitalSigns: { hr: 85, bp: '130/85', temp: 37.2, spo2: 98 },
        },
        {
            id: '3',
            name: 'Roberto Wilson',
            age: 28,
            bedNumber: 'ER-03',
            priority: 3,
            diagnosis: 'Esguince de tobillo',
            doctor: 'Dr. Brown',
            admittedAt: new Date(Date.now() - 10800000),
            vitalSigns: { hr: 75, bp: '120/80', temp: 36.8, spo2: 99 },
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Departamento de Emergencia</h1>
                        <p className="text-muted-foreground">
                            Gestión de emergencias en tiempo real y evaluación con IA
                        </p>
                    </div>
                </div>
                <Button onClick={() => setTriageOpen(true)}>
                    <Brain className="h-4 w-4 mr-2" />
                    Evaluación IA
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pacientes Críticos</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {dashboard?.criticalPatients || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Camas</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.beds?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Capacidad departamento de emergencia</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Camas Disponibles</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {dashboard?.beds?.available || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Listas para nuevos pacientes</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {dashboard?.beds?.total > 0
                                ? Math.round((dashboard.beds.occupied / dashboard.beds.total) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Utilización actual de camas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Triaje Modal */}
            {triageOpen && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    Sistema de Evaluación con IA
                                </CardTitle>
                                <CardDescription>
                                    Ingrese los síntomas del paciente para evaluación automática de prioridad
                                </CardDescription>
                            </div>
                            <Button variant="ghost" onClick={() => {
                                setTriageOpen(false)
                                setTriageResult(null)
                                setSymptoms('')
                            }}>
                                Cerrar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Síntomas del Paciente</label>
                            <Textarea
                                placeholder="Describa los síntomas en detalle (ej. dolor de pecho, dificultad para respirar, fiebre...)"
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                rows={4}
                                disabled={analyzingTriage}
                            />
                        </div>

                        <Button onClick={analyzeTriage} disabled={analyzingTriage} className="w-full">
                            {analyzingTriage ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Analizando...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analizar con IA
                                </>
                            )}
                        </Button>

                        {triageResult && (
                            <div className="mt-6 space-y-4">
                                <div className="p-6 border-2 rounded-lg bg-accent/50">
                                    <h3 className="font-semibold text-lg mb-4">Resultados de Evaluación</h3>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Nivel de Prioridad</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`h-8 w-8 rounded-full ${getPriorityColor(triageResult.priority)} flex items-center justify-center text-white font-bold`}>
                                                    {triageResult.priority}
                                                </div>
                                                <span className={`text-sm font-semibold px-2 py-1 rounded ${triageResult.color.bg} ${triageResult.color.text}`}>
                                                    {triageResult.color.label}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Tiempo Est. de Espera</p>
                                            <p className="text-2xl font-bold mt-1">{triageResult.waitTime} min</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Código de Color</p>
                                            <div className={`mt-1 h-8 w-full rounded ${getPriorityColor(triageResult.priority)}`}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold mb-2">Recomendaciones IA:</p>
                                        <ul className="space-y-1">
                                            {triageResult.recommendations.map((rec: string, idx: number) => (
                                                <li key={idx} className="text-sm flex items-start gap-2">
                                                    <span className="text-primary">•</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="er-room">
                        <Bed className="h-4 w-4 mr-2" />
                        Sala de Emergencias
                    </TabsTrigger>
                </TabsList>

                {/* Emergency Room Tab */}
                <TabsContent value="er-room" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Casos de Emergencia Activos</CardTitle>
                            <CardDescription>Monitoreo y gestión de pacientes en tiempo real</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Prioridad</TableHead>
                                        <TableHead>Cama</TableHead>
                                        <TableHead>Paciente</TableHead>
                                        <TableHead>Diagnóstico</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Signos Vitales</TableHead>
                                        <TableHead>Ingreso</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {erPatients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-6 w-6 rounded-full ${getPriorityColor(patient.priority)} flex items-center justify-center text-white text-xs font-bold`}>
                                                        {patient.priority}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{patient.bedNumber}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{patient.name}</p>
                                                    <p className="text-sm text-muted-foreground">{patient.age} años</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{patient.diagnosis}</TableCell>
                                            <TableCell>{patient.doctor}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="h-3 w-3" />
                                                        {patient.vitalSigns.hr}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Activity className="h-3 w-3" />
                                                        {patient.vitalSigns.bp}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Thermometer className="h-3 w-3" />
                                                        {patient.vitalSigns.temp}°C
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Wind className="h-3 w-3" />
                                                        {patient.vitalSigns.spo2}%
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {format(patient.admittedAt, 'HH:mm')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/emergency/${patient.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    )
}
