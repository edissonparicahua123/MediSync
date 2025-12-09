import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Loader2,
    Activity,
    AlertTriangle,
    Calendar,
} from 'lucide-react'
import { analyticsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ComposedChart,
} from 'recharts'

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState('12months')
    const { toast } = useToast()

    // Datos de analytics
    const [analyticsData, setAnalyticsData] = useState<any>({
        heatmap: [],
        saturation: [],
        areaComparison: [],
        patientCycle: [],
        capacity: [],
        historical: [],
    })

    useEffect(() => {
        loadAnalytics()
    }, [timeRange])

    const loadAnalytics = async () => {
        try {
            setLoading(true)

            // Simular datos profesionales para analytics
            const simulatedData = {
                // 1. Heatmap de horas de alta demanda (7 días x 24 horas)
                heatmap: generateHeatmapData(),

                // 2. Predicción de saturación
                saturation: [
                    { hour: '8:00', current: 45, predicted: 52, capacity: 60 },
                    { hour: '9:00', current: 58, predicted: 65, capacity: 60 },
                    { hour: '10:00', current: 55, predicted: 62, capacity: 60 },
                    { hour: '11:00', current: 52, predicted: 58, capacity: 60 },
                    { hour: '12:00', current: 48, predicted: 54, capacity: 60 },
                    { hour: '13:00', current: 42, predicted: 48, capacity: 60 },
                    { hour: '14:00', current: 50, predicted: 56, capacity: 60 },
                    { hour: '15:00', current: 54, predicted: 60, capacity: 60 },
                    { hour: '16:00', current: 56, predicted: 63, capacity: 60 },
                    { hour: '17:00', current: 52, predicted: 58, capacity: 60 },
                ],

                // 3. Comparación de áreas
                areaComparison: [
                    { area: 'Emergency', patients: 245, revenue: 125000, satisfaction: 4.2 },
                    { area: 'Cardiology', patients: 198, revenue: 145000, satisfaction: 4.8 },
                    { area: 'Pediatrics', patients: 312, revenue: 98000, satisfaction: 4.9 },
                    { area: 'Surgery', patients: 156, revenue: 235000, satisfaction: 4.5 },
                    { area: 'Radiology', patients: 289, revenue: 112000, satisfaction: 4.6 },
                    { area: 'Laboratory', patients: 425, revenue: 78000, satisfaction: 4.7 },
                ],

                // 4. Ciclo de pacientes
                patientCycle: [
                    { stage: 'Registration', count: 1250, avgTime: 5 },
                    { stage: 'Triage', count: 1200, avgTime: 10 },
                    { stage: 'Consultation', count: 1150, avgTime: 25 },
                    { stage: 'Treatment', count: 980, avgTime: 45 },
                    { stage: 'Billing', count: 950, avgTime: 8 },
                    { stage: 'Discharge', count: 920, avgTime: 12 },
                ],

                // 5. Cupos vs Disponibilidad
                capacity: [
                    { day: 'Mon', available: 120, booked: 95, walkins: 15 },
                    { day: 'Tue', available: 120, booked: 102, walkins: 12 },
                    { day: 'Wed', available: 120, booked: 108, walkins: 8 },
                    { day: 'Thu', available: 120, booked: 98, walkins: 14 },
                    { day: 'Fri', available: 120, booked: 112, walkins: 6 },
                    { day: 'Sat', available: 80, booked: 65, walkins: 10 },
                    { day: 'Sun', available: 60, booked: 42, walkins: 8 },
                ],

                // 6. Histórico de 12 meses
                historical: [
                    { month: 'Jan', patients: 1245, revenue: 125000, appointments: 1450 },
                    { month: 'Feb', patients: 1298, revenue: 132000, appointments: 1520 },
                    { month: 'Mar', patients: 1356, revenue: 145000, appointments: 1680 },
                    { month: 'Apr', patients: 1289, revenue: 138000, appointments: 1590 },
                    { month: 'May', patients: 1423, revenue: 152000, appointments: 1720 },
                    { month: 'Jun', patients: 1467, revenue: 158000, appointments: 1780 },
                    { month: 'Jul', patients: 1512, revenue: 165000, appointments: 1850 },
                    { month: 'Aug', patients: 1489, revenue: 162000, appointments: 1820 },
                    { month: 'Sep', patients: 1534, revenue: 168000, appointments: 1890 },
                    { month: 'Oct', patients: 1578, revenue: 175000, appointments: 1920 },
                    { month: 'Nov', patients: 1623, revenue: 182000, appointments: 1980 },
                    { month: 'Dec', patients: 1689, revenue: 195000, appointments: 2050 },
                ],
            }

            setAnalyticsData(simulatedData)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load analytics',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Generar datos de heatmap
    const generateHeatmapData = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const data = []

        for (let hour = 8; hour <= 18; hour++) {
            const row: any = { hour: `${hour}:00` }
            days.forEach(day => {
                // Simular demanda más alta en horas pico (9-11 y 15-17)
                let demand = Math.floor(Math.random() * 30) + 20
                if ((hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 17)) {
                    demand += 30
                }
                // Menos demanda los fines de semana
                if (day === 'Sat' || day === 'Sun') {
                    demand = Math.floor(demand * 0.6)
                }
                row[day] = demand
            })
            data.push(row)
        }
        return data
    }

    // Calcular estadísticas
    const stats = {
        totalPatients: analyticsData.historical.reduce((sum: number, m: any) => sum + m.patients, 0),
        totalRevenue: analyticsData.historical.reduce((sum: number, m: any) => sum + m.revenue, 0),
        avgSaturation: Math.round(
            analyticsData.saturation.reduce((sum: number, h: any) => sum + (h.current / h.capacity * 100), 0) /
            analyticsData.saturation.length
        ),
        avgCapacityUsage: Math.round(
            analyticsData.capacity.reduce((sum: number, d: any) => sum + (d.booked / d.available * 100), 0) /
            analyticsData.capacity.length
        ),
    }

    // Obtener color del heatmap
    const getHeatmapColor = (value: number) => {
        if (value >= 70) return '#ef4444' // Rojo - Alta demanda
        if (value >= 50) return '#f59e0b' // Naranja - Media-Alta
        if (value >= 30) return '#3b82f6' // Azul - Media
        return '#10b981' // Verde - Baja
    }

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
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
                        <p className="text-muted-foreground">
                            Professional insights with predictive analytics
                        </p>
                    </div>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="12months">Last 12 Months</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last 12 months</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Last 12 months</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Saturation</CardTitle>
                        <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.avgSaturation}%</div>
                        <p className="text-xs text-muted-foreground">Current capacity usage</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Capacity Usage</CardTitle>
                        <Calendar className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.avgCapacityUsage}%</div>
                        <p className="text-xs text-muted-foreground">Weekly average</p>
                    </CardContent>
                </Card>
            </div>

            {/* 1. Heatmap de horas de alta demanda */}
            <Card>
                <CardHeader>
                    <CardTitle>Peak Hours Heatmap</CardTitle>
                    <CardDescription>Patient demand by day and hour</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left text-sm font-medium">Hour</th>
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                        <th key={day} className="p-2 text-center text-sm font-medium">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.heatmap.map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="p-2 text-sm font-medium">{row.hour}</td>
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                            <td key={day} className="p-1">
                                                <div
                                                    className="h-12 w-full rounded flex items-center justify-center text-white text-sm font-semibold"
                                                    style={{ backgroundColor: getHeatmapColor(row[day]) }}
                                                >
                                                    {row[day]}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            <span>Low (0-30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span>Medium (30-50)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500"></div>
                            <span>High (50-70)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span>Critical (70+)</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 2. Predicción de saturación */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Saturation Prediction
                        </CardTitle>
                        <CardDescription>Current vs predicted capacity usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={analyticsData.saturation}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="capacity" fill="#94a3b8" name="Capacity" />
                                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current" />
                                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Comparación de áreas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Area Comparison</CardTitle>
                        <CardDescription>Performance by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={analyticsData.areaComparison}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="area" />
                                <PolarRadiusAxis />
                                <Radar name="Patients" dataKey="patients" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name="Satisfaction" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Tooltip />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4. Ciclo de pacientes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Journey Cycle</CardTitle>
                        <CardDescription>Patient flow through stages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.patientCycle}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="stage" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8b5cf6" name="Patients" />
                                <Bar dataKey="avgTime" fill="#f59e0b" name="Avg Time (min)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 5. Cupos vs Disponibilidad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Capacity vs Availability</CardTitle>
                        <CardDescription>Weekly appointment slots</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.capacity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="available" fill="#94a3b8" name="Available" />
                                <Bar dataKey="booked" fill="#10b981" name="Booked" />
                                <Bar dataKey="walkins" fill="#3b82f6" name="Walk-ins" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 6. Histórico de 12 meses */}
            <Card>
                <CardHeader>
                    <CardTitle>12-Month Historical Trends</CardTitle>
                    <CardDescription>Comprehensive yearly overview</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={analyticsData.historical}>
                            <defs>
                                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="patients" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPatients)" name="Patients" />
                            <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAppointments)" name="Appointments" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height={300} className="mt-6">
                        <LineChart data={analyticsData.historical}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Revenue ($)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
