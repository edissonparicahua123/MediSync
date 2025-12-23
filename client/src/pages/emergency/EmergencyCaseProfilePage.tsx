import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    ArrowLeft,
    Heart,
    Activity,
    Thermometer,
    Wind,
    Droplet,
    Pill,
    FileText,
    Upload,
    Loader2,
    AlertCircle,
    Building2,
} from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'

export default function EmergencyCaseProfilePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('vitals')
    const [loading, setLoading] = useState(false)

    const [caseData, setCaseData] = useState<any>(null)
    const [vitalSigns, setVitalSigns] = useState<any[]>([])

    useEffect(() => {
        const fetchCaseData = async () => {
            if (!id) return;
            try {
                setLoading(true)
                const res = await import('@/services/api').then(m => m.emergencyAPI.getCase(id))
                const data = res.data

                setCaseData({
                    id: data.id,
                    patient: {
                        name: data.patientName,
                        age: data.patientAge,
                        gender: 'Unknown', // Not in EmergencyCase model
                        bloodType: 'Unknown',
                    },
                    admission: {
                        date: new Date(data.admissionDate),
                        bedNumber: data.bedNumber,
                        priority: data.triageLevel,
                        diagnosis: data.diagnosis,
                        chiefComplaint: data.chiefComplaint,
                    },
                    doctor: {
                        name: data.doctorName,
                        specialty: 'Emergency Medicine',
                    },
                })

                if (data.vitalSigns && typeof data.vitalSigns === 'object') {
                    setVitalSigns([{
                        time: new Date(data.updatedAt || data.createdAt),
                        heartRate: Math.round(data.vitalSigns.hr || 0),
                        bloodPressure: data.vitalSigns.bp || '--/--',
                        temperature: data.vitalSigns.temp ? Number(data.vitalSigns.temp).toFixed(1) : 0,
                        spo2: Math.round(data.vitalSigns.spo2 || 0),
                        respiratoryRate: 18, // Default if missing
                    }])
                }

            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'No se pudo cargar el caso',
                    variant: 'destructive'
                })
                navigate('/emergency')
            } finally {
                setLoading(false)
            }
        }
        fetchCaseData()
    }, [id, navigate, toast])

    // Empty states for missing tabs
    const medications: any[] = []
    const procedures: any[] = []
    const attachments: any[] = []

    if (loading || !caseData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/emergency')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Emergency Case Profile</h1>
                        <p className="text-muted-foreground">
                            {caseData.patient.name} • Bed {caseData.admission.bedNumber}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Building2 className="h-4 w-4 mr-2" />
                        Transfer to Ward
                    </Button>
                </div>
            </div>

            {/* Patient Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Patient</p>
                                <p className="font-medium text-lg">{caseData.patient.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {caseData.patient.age} years • {caseData.patient.gender}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Blood Type</p>
                                <p className="font-medium">{caseData.patient.bloodType}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Admission Time</p>
                                <p className="font-medium">{format(caseData.admission.date, 'PPpp')}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Bed Number</p>
                                <p className="font-medium">{caseData.admission.bedNumber}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Priority</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`h-6 w-6 rounded-full ${getPriorityColor(caseData.admission.priority)} flex items-center justify-center text-white text-xs font-bold`}>
                                        {caseData.admission.priority}
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                                        CRITICAL
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Diagnosis</p>
                                <p className="font-medium">{caseData.admission.diagnosis}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Attending Physician</p>
                                <p className="font-medium">{caseData.doctor.name}</p>
                                <p className="text-sm text-muted-foreground">{caseData.doctor.specialty}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chief Complaint */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        Chief Complaint
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{caseData.admission.chiefComplaint}</p>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="vitals">
                        <Heart className="h-4 w-4 mr-2" />
                        Vital Signs
                    </TabsTrigger>
                    <TabsTrigger value="medications">
                        <Pill className="h-4 w-4 mr-2" />
                        Medications
                    </TabsTrigger>
                    <TabsTrigger value="procedures">
                        <Activity className="h-4 w-4 mr-2" />
                        Procedures
                    </TabsTrigger>
                    <TabsTrigger value="attachments">
                        <FileText className="h-4 w-4 mr-2" />
                        Attachments
                    </TabsTrigger>
                </TabsList>

                {/* Vital Signs Tab */}
                <TabsContent value="vitals" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Vital Signs History</CardTitle>
                            <CardDescription>Real-time monitoring of patient vital signs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Heart className="h-4 w-4" />
                                                Heart Rate
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Blood Pressure
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-4 w-4" />
                                                Temperature
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Wind className="h-4 w-4" />
                                                SpO2
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center gap-2">
                                                <Droplet className="h-4 w-4" />
                                                Resp. Rate
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vitalSigns.map((vital, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                {format(vital.time, 'HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <span className={vital.heartRate > 100 ? 'text-red-600 font-semibold' : ''}>
                                                    {vital.heartRate} bpm
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={vital.bloodPressure.startsWith('14') || vital.bloodPressure.startsWith('15') ? 'text-orange-600 font-semibold' : ''}>
                                                    {vital.bloodPressure} mmHg
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={vital.temperature > 38 ? 'text-red-600 font-semibold' : ''}>
                                                    {vital.temperature}°C
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={vital.spo2 < 95 ? 'text-orange-600 font-semibold' : ''}>
                                                    {vital.spo2}%
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={vital.respiratoryRate > 20 ? 'text-orange-600 font-semibold' : ''}>
                                                    {vital.respiratoryRate} /min
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medications Tab */}
                <TabsContent value="medications" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Medications Administered</CardTitle>
                            <CardDescription>Complete medication administration record</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Medication</TableHead>
                                        <TableHead>Dose</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Administered By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {medications.map((med) => (
                                        <TableRow key={med.id}>
                                            <TableCell className="font-medium">
                                                {format(med.time, 'HH:mm')}
                                            </TableCell>
                                            <TableCell className="font-semibold">{med.name}</TableCell>
                                            <TableCell>{med.dose}</TableCell>
                                            <TableCell>{med.route}</TableCell>
                                            <TableCell>{med.administeredBy}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Procedures Tab */}
                <TabsContent value="procedures" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Procedures Performed</CardTitle>
                            <CardDescription>Diagnostic and therapeutic procedures</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {procedures.map((proc) => (
                                    <div key={proc.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-lg">{proc.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Performed by {proc.performedBy}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {format(proc.time, 'HH:mm')}
                                            </p>
                                        </div>
                                        <div className="mt-2 p-3 bg-accent rounded">
                                            <p className="text-sm font-medium">Result:</p>
                                            <p className="text-sm">{proc.result}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Attachments Tab */}
                <TabsContent value="attachments" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Attached Documents</CardTitle>
                                    <CardDescription>Medical records, images, and reports</CardDescription>
                                </div>
                                <Button>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload File
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {attachments.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {file.type} • {file.size} • {format(file.uploadedAt, 'PPp')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Hospitalization Referral */}
            <Card className="border-2 border-orange-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-orange-600" />
                        Hospitalization Referral
                    </CardTitle>
                    <CardDescription>Transfer patient to inpatient ward</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm">
                            Based on the current assessment and vital signs, this patient requires admission to:
                        </p>
                        <div className="p-4 bg-orange-50 rounded-lg">
                            <p className="font-semibold text-lg">Recommended Ward: Cardiac Care Unit (CCU)</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Reason: Acute coronary syndrome with elevated troponin levels
                            </p>
                        </div>
                        <Button className="w-full" size="lg">
                            <Building2 className="h-4 w-4 mr-2" />
                            Initiate Transfer to CCU
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
