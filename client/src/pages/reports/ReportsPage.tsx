import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FileText,
    Download,
    Loader2,
    Calendar,
    Users,
    AlertTriangle,
    Pill,
    DollarSign,
    TrendingUp,
    BarChart3,
    Brain,
} from 'lucide-react'
import { reportsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function ReportsPage() {
    const [loading, setLoading] = useState(true)
    const [activeReport, setActiveReport] = useState('appointments')
    const [dateRange, setDateRange] = useState('month')
    const { toast } = useToast()

    // Datos de reportes
    const [reportsData, setReportsData] = useState<any>({
        appointments: [],
        newPatients: [],
        emergencies: [],
        medications: [],
        economic: {},
        doctors: [],
        comparison: [],
        aiPredictions: [],
    })

    useEffect(() => {
        loadReports()
    }, [dateRange])

    const loadReports = async () => {
        try {
            setLoading(true)

            const [
                appointmentsRes,
                patientsRes,
                financeRes,
                medicationsRes,
                doctorsRes,
                emergenciesRes,
                comparisonRes,
                aiPredictionsRes
            ] = await Promise.all([
                reportsAPI.getAppointmentStats(),
                reportsAPI.getPatientStats(),
                reportsAPI.getFinancialStats(),
                reportsAPI.getMedicationStats(),
                reportsAPI.getDoctorStats(),
                reportsAPI.getEmergencyStats(),
                reportsAPI.getComparisonStats(),
                reportsAPI.getAiPredictions()
            ])

            setReportsData({
                appointments: appointmentsRes.data,
                newPatients: patientsRes.data,
                emergencies: emergenciesRes.data,
                medications: medicationsRes.data,
                economic: financeRes.data,
                doctors: doctorsRes.data,
                comparison: comparisonRes.data,
                aiPredictions: aiPredictionsRes.data,
            })

        } catch (error: any) {
            console.error(error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar reportes',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Exportar a PDF
    const exportToPDF = (reportType: string) => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(20)
        doc.text('MediSync - Reporte Médico', 14, 20)
        doc.setFontSize(12)
        doc.text(`Tipo de Reporte: ${getReportTitle(reportType)}`, 14, 30)
        doc.text(`Generado: ${format(new Date(), 'PPpp', { locale: es })}`, 14, 37)

        let tableData: any[] = []
        let columns: any[] = []

        // Preparar datos según el tipo de reporte
        switch (reportType) {
            case 'appointments':
                columns = ['Mes', 'Total', 'Completadas', 'Canceladas']
                tableData = reportsData.appointments.map((item: any) => [
                    item.month,
                    item.total,
                    item.completed,
                    item.cancelled,
                ])
                break
            case 'newPatients':
                columns = ['Mes', 'Nuevos Pacientes']
                tableData = reportsData.newPatients.map((item: any) => [
                    item.month,
                    item.count,
                ])
                break
            case 'emergencies':
                columns = ['Tipo', 'Cantidad', 'Tiempo Prom. (min)']
                tableData = reportsData.emergencies.map((item: any) => [
                    item.type,
                    item.count,
                    item.avgTime,
                ])
                break
            case 'medications':
                columns = ['Medicamento', 'Cantidad', 'Costo ($)']
                tableData = reportsData.medications.map((item: any) => [
                    item.name,
                    item.quantity,
                    item.cost,
                ])
                break
            case 'doctors':
                columns = ['Doctor', 'Pacientes', 'Satisfacción', 'Ingresos ($)']
                tableData = reportsData.doctors.map((item: any) => [
                    item.name,
                    item.patients,
                    item.satisfaction,
                    item.revenue,
                ])
                break
        }

        autoTable(doc, {
            head: [columns],
            body: tableData,
            startY: 45,
        })

        doc.save(`${reportType}_reporte_${format(new Date(), 'yyyy-MM-dd')}.pdf`)

        toast({
            title: 'PDF Exportado',
            description: 'El reporte ha sido exportado a PDF exitosamente',
        })
    }

    // Exportar a Excel
    const exportToExcel = (reportType: string) => {
        let data: any[] = []

        // Preparar datos según el tipo de reporte
        switch (reportType) {
            case 'appointments':
                data = reportsData.appointments
                break
            case 'newPatients':
                data = reportsData.newPatients
                break
            case 'emergencies':
                data = reportsData.emergencies
                break
            case 'medications':
                data = reportsData.medications
                break
            case 'economic':
                data = reportsData.economic.monthlyBreakdown
                break
            case 'doctors':
                data = reportsData.doctors
                break
            case 'comparison':
                data = reportsData.comparison
                break
            case 'aiPredictions':
                data = reportsData.aiPredictions
                break
        }

        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, reportType)
        XLSX.writeFile(wb, `${reportType}_reporte_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)

        toast({
            title: 'Excel Exportado',
            description: 'El reporte ha sido exportado a Excel exitosamente',
        })
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

    const getReportTitle = (type: string) => {
        const titles: Record<string, string> = {
            appointments: 'Citas por Mes',
            newPatients: 'Nuevos Pacientes',
            emergencies: 'Casos de Emergencia',
            medications: 'Medicamentos Consumidos',
            economic: 'Resumen Económico',
            doctors: 'Rendimiento de Doctores',
            comparison: 'Comparación Mensual',
            aiPredictions: 'Predicciones IA',
        }
        return titles[type] || type
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
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes y Analítica</h1>
                        <p className="text-muted-foreground">
                            Reportes completos con exportación a PDF y Excel
                        </p>
                    </div>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Rango de Fechas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Última Semana</SelectItem>
                        <SelectItem value="month">Último Mes</SelectItem>
                        <SelectItem value="quarter">Último Trimestre</SelectItem>
                        <SelectItem value="year">Último Año</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Report Types Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'appointments' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('appointments')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <p className="font-semibold">Citas</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'newPatients' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('newPatients')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Users className="h-8 w-8 text-green-600" />
                            <p className="font-semibold">Pacientes Nuevos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'emergencies' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('emergencies')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                            <p className="font-semibold">Emergencias</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'medications' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('medications')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Pill className="h-8 w-8 text-purple-600" />
                            <p className="font-semibold">Medicamentos</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'economic' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('economic')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <DollarSign className="h-8 w-8 text-green-600" />
                            <p className="font-semibold">Económico</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'doctors' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('doctors')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <TrendingUp className="h-8 w-8 text-blue-600" />
                            <p className="font-semibold">Rendimiento Doctores</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'comparison' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('comparison')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                            <p className="font-semibold">Comparativa</p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all ${activeReport === 'aiPredictions' ? 'border-primary shadow-lg' : ''}`}
                    onClick={() => setActiveReport('aiPredictions')}
                >
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <Brain className="h-8 w-8 text-indigo-600" />
                            <p className="font-semibold">Predicciones IA</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Report Content */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>
                                {getReportTitle(activeReport)}
                            </CardTitle>
                            <CardDescription>
                                Análisis detallado y observaciones clave
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => exportToPDF(activeReport)}>
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => exportToExcel(activeReport)}>
                                <Download className="h-4 w-4 mr-2" />
                                Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* 1. Appointments Report */}
                    {activeReport === 'appointments' && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportsData.appointments}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend payload={[{ value: 'Total', type: 'square', color: '#3b82f6' }, { value: 'Completadas', type: 'square', color: '#10b981' }, { value: 'Canceladas', type: 'square', color: '#ef4444' }]} />
                                <Bar dataKey="total" fill="#3b82f6" name="Total" />
                                <Bar dataKey="completed" fill="#10b981" name="Completadas" />
                                <Bar dataKey="cancelled" fill="#ef4444" name="Canceladas" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 2. New Patients Report */}
                    {activeReport === 'newPatients' && (
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={reportsData.newPatients}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend payload={[{ value: 'Nuevos Pacientes', type: 'line', color: '#10b981' }]} />
                                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} name="Nuevos Pacientes" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}

                    {/* 3. Emergencies Report */}
                    {activeReport === 'emergencies' && (
                        <div className="grid grid-cols-2 gap-4">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={reportsData.emergencies}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {reportsData.emergencies.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={reportsData.emergencies}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="type" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend payload={[{ value: 'Tiempo Prom. (min)', type: 'square', color: '#f59e0b' }]} />
                                    <Bar dataKey="avgTime" fill="#f59e0b" name="Tiempo Prom. (min)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* 4. Medications Report */}
                    {activeReport === 'medications' && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportsData.medications}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend payload={[{ value: 'Cantidad', type: 'square', color: '#8b5cf6' }, { value: 'Costo ($)', type: 'square', color: '#10b981' }]} />
                                <Bar dataKey="quantity" fill="#8b5cf6" name="Cantidad" />
                                <Bar dataKey="cost" fill="#10b981" name="Costo ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 5. Economic Report */}
                    {activeReport === 'economic' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${reportsData.economic.totalRevenue?.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Gastos Totales</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            ${reportsData.economic.totalExpenses?.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Beneficio Neto</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${reportsData.economic.netProfit?.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Margen</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {reportsData.economic.profitMargin}%
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={reportsData.economic.monthlyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend payload={[{ value: 'Ingresos', type: 'line', color: '#10b981' }, { value: 'Gastos', type: 'line', color: '#ef4444' }]} />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Gastos" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* 6. Doctors Performance Report */}
                    {activeReport === 'doctors' && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportsData.doctors}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend payload={[{ value: 'Pacientes', type: 'square', color: '#3b82f6' }, { value: 'Satisfacción', type: 'square', color: '#f59e0b' }]} />
                                <Bar dataKey="patients" fill="#3b82f6" name="Pacientes" />
                                <Bar dataKey="satisfaction" fill="#f59e0b" name="Satisfacción" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 7. Monthly Comparison Report */}
                    {activeReport === 'comparison' && (
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={reportsData.comparison}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend payload={[{ value: 'Año Actual', type: 'square', color: '#10b981' }, { value: 'Año Anterior', type: 'square', color: '#94a3b8' }]} />
                                <Bar dataKey="current" fill="#10b981" name="Año Actual" />
                                <Bar dataKey="previous" fill="#94a3b8" name="Año Anterior" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 8. AI Predictions Report */}
                    {activeReport === 'aiPredictions' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <p className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    Previsión de Ingresos Potenciada por IA
                                </p>
                                <p className="text-xs text-indigo-700 mt-1">
                                    Basado en datos históricos y algoritmos de aprendizaje automático
                                </p>
                            </div>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={reportsData.aiPredictions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend payload={[{ value: 'Ingresos Predichos ($)', type: 'line', color: '#8b5cf6' }, { value: 'Confianza (%)', type: 'line', color: '#10b981' }]} />
                                    <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} name="Ingresos Predichos ($)" strokeDasharray="5 5" />
                                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confianza (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
