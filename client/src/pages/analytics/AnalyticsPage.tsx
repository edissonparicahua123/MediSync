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

            const [
                heatmapRes,
                saturationRes,
                areaRes,
                cycleRes,
                capacityRes,
                historicalRes
            ] = await Promise.all([
                analyticsAPI.getHeatmap(),
                analyticsAPI.getSaturation(),
                analyticsAPI.getAreaComparison(),
                analyticsAPI.getPatientCycle(),
                analyticsAPI.getCapacity(),
                analyticsAPI.getHistorical()
            ])

            setAnalyticsData({
                heatmap: heatmapRes.data,
                saturation: saturationRes.data,
                areaComparison: areaRes.data,
                patientCycle: cycleRes.data,
                capacity: capacityRes.data,
                historical: historicalRes.data,
            })

        } catch (error: any) {
            console.error(error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar analíticas',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
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
                        <h1 className="text-3xl font-bold tracking-tight">Analítica Avanzada</h1>
                        <p className="text-muted-foreground">
                            Análisis profesionales con analítica predictiva
                        </p>
                    </div>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Rango de Tiempo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7days">Últimos 7 Días</SelectItem>
                        <SelectItem value="30days">Últimos 30 Días</SelectItem>
                        <SelectItem value="12months">Últimos 12 Meses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Últimos 12 meses</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saturación Promedio</CardTitle>
                        <Activity className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.avgSaturation}%</div>
                        <p className="text-xs text-muted-foreground">Uso de capacidad actual</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uso de Capacidad</CardTitle>
                        <Calendar className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.avgCapacityUsage}%</div>
                        <p className="text-xs text-muted-foreground">Promedio semanal</p>
                    </CardContent>
                </Card>
            </div>

            {/* 1. Heatmap de horas de alta demanda */}
            <Card>
                <CardHeader>
                    <CardTitle>Mapa de Calor de Horas Pico</CardTitle>
                    <CardDescription>Demanda de pacientes por día y hora</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left text-sm font-medium">Hora</th>
                                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                                        <th key={day} className="p-2 text-center text-sm font-medium">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.heatmap.map((row: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="p-2 text-sm font-medium">{row.hour}</td>
                                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
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
                            <span>Baja (0-30)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span>Media (30-50)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-orange-500"></div>
                            <span>Alta (50-70)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            <span>Crítica (70+)</span>
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
                            Predicción de Saturación
                        </CardTitle>
                        <CardDescription>Uso de capacidad actual vs predicha</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={analyticsData.saturation}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="capacity" fill="#94a3b8" name="Capacidad" />
                                <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Predicha" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 3. Comparación de áreas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comparación de Áreas</CardTitle>
                        <CardDescription>Rendimiento por departamento</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={analyticsData.areaComparison}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="area" />
                                <PolarRadiusAxis />
                                <Radar name="Pacientes" dataKey="patients" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name="Satisfacción" dataKey="satisfaction" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
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
                        <CardTitle>Ciclo de Viaje del Paciente</CardTitle>
                        <CardDescription>Flujo de pacientes a través de etapas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.patientCycle}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="stage" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8b5cf6" name="Pacientes" />
                                <Bar dataKey="avgTime" fill="#f59e0b" name="Tiempo Prom. (min)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 5. Cupos vs Disponibilidad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Capacidad vs Disponibilidad</CardTitle>
                        <CardDescription>Cupos de citas semanales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.capacity}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="available" fill="#94a3b8" name="Disponible" />
                                <Bar dataKey="booked" fill="#10b981" name="Reservado" />
                                <Bar dataKey="walkins" fill="#3b82f6" name="Sin Cita" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 6. Histórico de 12 meses */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendencias Históricas de 12 Meses</CardTitle>
                    <CardDescription>Visión general anual completa</CardDescription>
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
                            <Area type="monotone" dataKey="patients" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPatients)" name="Pacientes" />
                            <Area type="monotone" dataKey="appointments" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAppointments)" name="Citas" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <ResponsiveContainer width="100%" height={300} className="mt-6">
                        <LineChart data={analyticsData.historical}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Ingresos ($)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
