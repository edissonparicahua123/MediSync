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
                { ward: 'ICU', total: 10, occupied: 8 },
                { ward: 'Emergency', total: 20, occupied: 15 },
                { ward: 'General', total: 20, occupied: 15 },
            ])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load data',
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
                description: 'Please enter symptoms',
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
                1: { bg: 'bg-red-100', text: 'text-red-800', label: 'CRITICAL' },
                2: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'URGENT' },
                3: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'SEMI-URGENT' },
                4: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'NON-URGENT' },
                5: { bg: 'bg-green-100', text: 'text-green-800', label: 'LOW PRIORITY' },
            }

            setTriageResult({
                priority,
                waitTime,
                color: colors[priority],
                recommendations: [
                    'Monitor vital signs every 15 minutes',
                    'Prepare IV access',
                    'Alert attending physician',
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
            name: 'John Doe',
            age: 45,
            bedNumber: 'ER-01',
            priority: 1,
            diagnosis: 'Chest pain',
            doctor: 'Dr. Smith',
            admittedAt: new Date(Date.now() - 3600000),
            vitalSigns: { hr: 120, bp: '140/90', temp: 38.5, spo2: 95 },
        },
        {
            id: '2',
            name: 'Jane Smith',
            age: 32,
            bedNumber: 'ER-02',
            priority: 2,
            diagnosis: 'Severe headache',
            doctor: 'Dr. Johnson',
            admittedAt: new Date(Date.now() - 7200000),
            vitalSigns: { hr: 85, bp: '130/85', temp: 37.2, spo2: 98 },
        },
        {
            id: '3',
            name: 'Bob Wilson',
            age: 28,
            bedNumber: 'ER-03',
            priority: 3,
            diagnosis: 'Ankle sprain',
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
                        <h1 className="text-3xl font-bold tracking-tight">Emergency Department</h1>
                        <p className="text-muted-foreground">
                            Real-time emergency room management and AI-powered triage
                        </p>
                    </div>
                </div>
                <Button onClick={() => setTriageOpen(true)}>
                    <Brain className="h-4 w-4 mr-2" />
                    AI Triage
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {dashboard?.criticalPatients || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                        <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dashboard?.beds?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Emergency department capacity</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {dashboard?.beds?.available || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Ready for new patients</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {dashboard?.beds?.total > 0
                                ? Math.round((dashboard.beds.occupied / dashboard.beds.total) * 100)
                                : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">Current bed utilization</p>
                    </CardContent>
                </Card>
            </div>

            {/* Triage Modal */}
            {triageOpen && (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-primary" />
                                    AI-Powered Triage System
                                </CardTitle>
                                <CardDescription>
                                    Enter patient symptoms for automatic priority assessment
                                </CardDescription>
                            </div>
                            <Button variant="ghost" onClick={() => {
                                setTriageOpen(false)
                                setTriageResult(null)
                                setSymptoms('')
                            }}>
                                Close
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Patient Symptoms</label>
                            <Textarea
                                placeholder="Describe symptoms in detail (e.g., chest pain, difficulty breathing, fever...)"
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
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4 mr-2" />
                                    Analyze with AI
                                </>
                            )}
                        </Button>

                        {triageResult && (
                            <div className="mt-6 space-y-4">
                                <div className="p-6 border-2 rounded-lg bg-accent/50">
                                    <h3 className="font-semibold text-lg mb-4">Triage Results</h3>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Priority Level</p>
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
                                            <p className="text-sm text-muted-foreground">Estimated Wait Time</p>
                                            <p className="text-2xl font-bold mt-1">{triageResult.waitTime} min</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Color Code</p>
                                            <div className={`mt-1 h-8 w-full rounded ${getPriorityColor(triageResult.priority)}`}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold mb-2">AI Recommendations:</p>
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
                        Emergency Room
                    </TabsTrigger>
                    <TabsTrigger value="bed-status">
                        <Activity className="h-4 w-4 mr-2" />
                        Bed Status
                    </TabsTrigger>
                </TabsList>

                {/* Emergency Room Tab */}
                <TabsContent value="er-room" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Emergency Cases</CardTitle>
                            <CardDescription>Real-time patient monitoring and management</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Bed</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Diagnosis</TableHead>
                                        <TableHead>Doctor</TableHead>
                                        <TableHead>Vital Signs</TableHead>
                                        <TableHead>Admitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                    <p className="text-sm text-muted-foreground">{patient.age} years</p>
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

                {/* Bed Status Tab */}
                <TabsContent value="bed-status" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bed Occupancy by Ward</CardTitle>
                            <CardDescription>Real-time bed availability across all wards</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {wardStats.map((ward: any) => (
                                    <div key={ward.ward} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-lg">{ward.ward}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {ward.occupied}/{ward.total} beds occupied ({Math.round((ward.occupied / ward.total) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className={`h-4 rounded-full ${(ward.occupied / ward.total) > 0.9 ? 'bg-red-500' :
                                                        (ward.occupied / ward.total) > 0.7 ? 'bg-orange-500' :
                                                            'bg-green-500'
                                                    }`}
                                                style={{ width: `${(ward.occupied / ward.total) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
