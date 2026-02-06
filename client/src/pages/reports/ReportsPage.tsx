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


    const getDateRangeParams = (range: string) => {
        const now = new Date()
        let startDate = new Date()
        let endDate = new Date(now)

        switch (range) {
            case 'week':
                startDate.setDate(now.getDate() - 7)
                break
            case 'month':
                startDate.setMonth(now.getMonth() - 1)
                break
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3)
                break
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1)
                break
            default:
                startDate.setFullYear(now.getFullYear() - 1)
        }

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        }
    }

    const loadReports = async () => {
        try {
            setLoading(true)
            const params = getDateRangeParams(dateRange)

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
                reportsAPI.getAppointmentStats(params),
                reportsAPI.getPatientStats(params),
                reportsAPI.getFinancialStats(params),
                reportsAPI.getMedicationStats(params), // Medications usually stock based, but passing params in case
                reportsAPI.getDoctorStats(params),
                reportsAPI.getEmergencyStats(params),
                reportsAPI.getComparisonStats(params),
                reportsAPI.getAiPredictions(params)
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

    // Exportar a PDF (Ahora usa backend para todo)
    const exportToPDF = async (reportType: string) => {
        try {
            const params = getDateRangeParams(dateRange)
            // Utilizar el endpoint de exportación del backend si devuelve buffer PDF,
            // pero como el backend devuelve CSV/Excel, mantenemos generación PDF frontend
            // con los datos YA FILTRADOS que tenemos en state.
            // Si el cliente quiere PDF real del backend, habría que implementarlo allá.

            // Reutilizamos la lógica existente frontend pero con los datos ya filtrados en reportsData
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text('EdiCarex - Reporte Médico', 14, 20)
            doc.setFontSize(12)
            doc.text(`Tipo de Reporte: ${getReportTitle(reportType)}`, 14, 30)
            doc.text(`Rango: ${dateRange}`, 14, 37)
            doc.text(`Generado: ${format(new Date(), 'PPpp', { locale: es })}`, 14, 44)

            let tableData: any[] = []
            let columns: any[] = []

            switch (reportType) {
                case 'appointments':
                    columns = ['Mes', 'Total', 'Completadas', 'Canceladas']
                    tableData = reportsData.appointments.map((item: any) => [
                        item.month, item.total, item.completed, item.cancelled
                    ])
                    break
                case 'newPatients':
                    columns = ['Mes', 'Nuevos Pacientes']
                    tableData = reportsData.newPatients.map((item: any) => [
                        item.month, item.count
                    ])
                    break
                case 'emergencies':
                    columns = ['Tipo', 'Cantidad', 'Tiempo Prom. (min)']
                    tableData = reportsData.emergencies.map((item: any) => [
                        item.type, item.count, item.avgTime
                    ])
                    break
                case 'medications':
                    columns = ['Medicamento', 'Cantidad', 'Costo ($)']
                    tableData = reportsData.medications.map((item: any) => [
                        item.name, item.quantity, item.cost
                    ])
                    break
                case 'doctors':
                    columns = ['Doctor', 'Pacientes', 'Satisfacción', 'Ingresos ($)']
                    tableData = reportsData.doctors.map((item: any) => [
                        item.name, item.patients, item.satisfaction, item.revenue
                    ])
                    break
                case 'economic':
                    columns = ['Mes', 'Ingresos', 'Gastos']
                    tableData = reportsData.economic.monthlyBreakdown?.map((item: any) => [
                        item.month, item.revenue, item.expenses
                    ]) || []
                    break
            }

            autoTable(doc, {
                head: [columns],
                body: tableData,
                startY: 55,
            })

            doc.save(`${reportType}_reporte_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
            toast({ title: 'PDF Exportado', description: 'Reporte generado exitosamente' })

        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Error al generar PDF',
                variant: 'destructive',
            })
        }
    }

    // Exportar a Excel (Usando Backend para data real o Frontend como fallback)
    const exportToExcel = async (reportType: string) => {
        try {
            const params = getDateRangeParams(dateRange)
            // Intentar usar backend export primero para formatos complejos (CSV/Excel)
            const response = await reportsAPI.exportReport(reportType, params)

            // Crear Blob y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const contentDisposition = response.headers['content-disposition'];
            let fileName = `${reportType}_reporte.csv`;
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1];
            }
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);

            toast({ title: 'Exportación Exitosa', description: 'El archivo se ha descargado correctamente' })

        } catch (error) {
            console.warn("Backend export failed or not implemented for this type, falling back to frontend export", error)

            // Fallback to Frontend Export if Backend fails (para tipos no implementados en backend aun)
            let data: any[] = []
            switch (reportType) {
                case 'appointments': data = reportsData.appointments; break;
                case 'newPatients': data = reportsData.newPatients; break;
                case 'emergencies': data = reportsData.emergencies; break;
                case 'medications': data = reportsData.medications; break;
                case 'economic': data = reportsData.economic.monthlyBreakdown || []; break;
                case 'doctors': data = reportsData.doctors; break;
                case 'comparison': data = reportsData.comparison; break;
                case 'aiPredictions': data = reportsData.aiPredictions; break;
            }

            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, reportType)
            XLSX.writeFile(wb, `${reportType}_reporte_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
            toast({ title: 'Excel Exportado (Local)', description: 'Reporte generado localmente' })
        }
    }

    const COLORS = ['#dc2626', '#f97316', '#facc15', '#22c55e', '#3b82f6']

    const getReportTitle = (type: string) => {
        const titles: Record<string, string> = {
            appointments: 'Citas por Mes',
            newPatients: 'Nuevos Pacientes',
            emergencies: 'Casos de Emergencia',
            medications: 'Inventario Valorizado', // Changed to reflect source (Stock)
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
                    {/* 3. Emergencies Report */}
                    {activeReport === 'emergencies' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            {/* Donut Chart */}
                            <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                                <h3 className="text-sm font-medium text-zinc-400 mb-6 text-center">Distribución por Severidad</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={reportsData.emergencies}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="count"
                                            stroke="none"
                                        >
                                            {reportsData.emergencies.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: any, name: any, props: any) => [`${value} Pacientes`, props.payload.type]}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value, entry: any) => <span className="text-zinc-400 text-xs ml-1">{entry.payload.type}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Styled Bar Chart */}
                            <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800">
                                <h3 className="text-sm font-medium text-zinc-400 mb-6 text-center">Tiempos de Atención Promedio</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={reportsData.emergencies} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                        <XAxis
                                            dataKey="type"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                            tickFormatter={(value) => `${(value / 60).toFixed(0)}h`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                            formatter={(value: any) => {
                                                const hours = Math.floor(value / 60);
                                                const mins = value % 60;
                                                return [`${hours}h ${mins}m`, 'Tiempo Promedio'];
                                            }}
                                        />
                                        <Bar
                                            dataKey="avgTime"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                            className="fill-orange-500"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* 4. Medications Report */}
                    {/* 4. Medications Report */}
                    {activeReport === 'medications' && (
                        <div className="bg-zinc-950/50 rounded-xl p-6 border border-zinc-800">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-zinc-200">Inventario de Alto Valor</h3>
                                <p className="text-sm text-zinc-400">Top 5 medicamentos con mayor valoración económica en stock</p>
                            </div>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={reportsData.medications} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                        interval={0}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                        tickFormatter={(value) => `S/.${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value: any, name: string) => {
                                            if (name === 'Valor (S/.)') return [`S/.${value.toLocaleString()}`, 'Valor Total'];
                                            return [`${value} unid.`, 'Stock Disponible'];
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        formatter={(value) => <span className="text-zinc-400 text-sm font-medium ml-1">{value}</span>}
                                    />
                                    <Bar
                                        dataKey="quantity"
                                        fill="#8b5cf6"
                                        name="Cantidad"
                                        stackId="a"
                                        radius={[0, 0, 4, 4]} // Bottom rounded if stacked, but here distinct
                                        barSize={40}
                                    />
                                    <Bar
                                        dataKey="cost"
                                        fill="#10b981"
                                        name="Valor (S/.)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
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
