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

            // Simular datos profesionales para cada reporte
            const simulatedData = {
                // 1. Reporte de citas por mes
                appointments: [
                    { month: 'Jan', total: 145, completed: 120, cancelled: 25 },
                    { month: 'Feb', total: 168, completed: 142, cancelled: 26 },
                    { month: 'Mar', total: 192, completed: 165, cancelled: 27 },
                    { month: 'Apr', total: 178, completed: 155, cancelled: 23 },
                    { month: 'May', total: 205, completed: 180, cancelled: 25 },
                    { month: 'Jun', total: 220, completed: 195, cancelled: 25 },
                ],

                // 2. Reporte de pacientes nuevos
                newPatients: [
                    { month: 'Jan', count: 45 },
                    { month: 'Feb', count: 52 },
                    { month: 'Mar', count: 68 },
                    { month: 'Apr', count: 55 },
                    { month: 'May', count: 72 },
                    { month: 'Jun', count: 80 },
                ],

                // 3. Reporte de emergencias
                emergencies: [
                    { type: 'Critical', count: 45, avgTime: 5 },
                    { type: 'Urgent', count: 120, avgTime: 15 },
                    { type: 'Semi-Urgent', count: 200, avgTime: 30 },
                    { type: 'Non-Urgent', count: 150, avgTime: 60 },
                ],

                // 4. Reporte de medicamentos consumidos
                medications: [
                    { name: 'Paracetamol', quantity: 1500, cost: 7500 },
                    { name: 'Amoxicillin', quantity: 800, cost: 12000 },
                    { name: 'Insulin', quantity: 300, cost: 13500 },
                    { name: 'Ibuprofen', quantity: 1200, cost: 6000 },
                    { name: 'Aspirin', quantity: 900, cost: 4500 },
                ],

                // 5. Reporte económico general
                economic: {
                    totalRevenue: 485000,
                    totalExpenses: 320000,
                    netProfit: 165000,
                    profitMargin: 34,
                    monthlyBreakdown: [
                        { month: 'Jan', revenue: 75000, expenses: 50000 },
                        { month: 'Feb', revenue: 78000, expenses: 52000 },
                        { month: 'Mar', revenue: 82000, expenses: 54000 },
                        { month: 'Apr', revenue: 80000, expenses: 53000 },
                        { month: 'May', revenue: 85000, expenses: 55000 },
                        { month: 'Jun', revenue: 85000, expenses: 56000 },
                    ],
                },

                // 6. Reporte de doctores por rendimiento
                doctors: [
                    { name: 'Dr. Smith', patients: 245, satisfaction: 4.8, revenue: 125000 },
                    { name: 'Dr. Johnson', patients: 220, satisfaction: 4.7, revenue: 110000 },
                    { name: 'Dr. Williams', patients: 198, satisfaction: 4.9, revenue: 105000 },
                    { name: 'Dr. Brown', patients: 185, satisfaction: 4.6, revenue: 95000 },
                    { name: 'Dr. Davis', patients: 165, satisfaction: 4.5, revenue: 85000 },
                ],

                // 7. Reporte comparativo mensual
                comparison: [
                    { month: 'Jan', current: 75000, previous: 68000 },
                    { month: 'Feb', current: 78000, previous: 72000 },
                    { month: 'Mar', current: 82000, previous: 75000 },
                    { month: 'Apr', current: 80000, previous: 77000 },
                    { month: 'May', current: 85000, previous: 79000 },
                    { month: 'Jun', current: 85000, previous: 80000 },
                ],

                // 8. Reporte de IA (predicciones)
                aiPredictions: [
                    { month: 'Jul', predicted: 88000, confidence: 85 },
                    { month: 'Aug', predicted: 92000, confidence: 82 },
                    { month: 'Sep', predicted: 95000, confidence: 80 },
                    { month: 'Oct', predicted: 90000, confidence: 78 },
                    { month: 'Nov', predicted: 93000, confidence: 75 },
                    { month: 'Dec', predicted: 98000, confidence: 73 },
                ],
            }

            setReportsData(simulatedData)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load reports',
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
        doc.text('MediSync - Medical Report', 14, 20)
        doc.setFontSize(12)
        doc.text(`Report Type: ${reportType}`, 14, 30)
        doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 37)

        let tableData: any[] = []
        let columns: any[] = []

        // Preparar datos según el tipo de reporte
        switch (reportType) {
            case 'appointments':
                columns = ['Month', 'Total', 'Completed', 'Cancelled']
                tableData = reportsData.appointments.map((item: any) => [
                    item.month,
                    item.total,
                    item.completed,
                    item.cancelled,
                ])
                break
            case 'newPatients':
                columns = ['Month', 'New Patients']
                tableData = reportsData.newPatients.map((item: any) => [
                    item.month,
                    item.count,
                ])
                break
            case 'emergencies':
                columns = ['Type', 'Count', 'Avg Time (min)']
                tableData = reportsData.emergencies.map((item: any) => [
                    item.type,
                    item.count,
                    item.avgTime,
                ])
                break
            case 'medications':
                columns = ['Medication', 'Quantity', 'Cost ($)']
                tableData = reportsData.medications.map((item: any) => [
                    item.name,
                    item.quantity,
                    item.cost,
                ])
                break
            case 'doctors':
                columns = ['Doctor', 'Patients', 'Satisfaction', 'Revenue ($)']
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

        doc.save(`${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)

        toast({
            title: 'PDF Exported',
            description: 'Report has been exported to PDF successfully',
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
        XLSX.writeFile(wb, `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)

        toast({
            title: 'Excel Exported',
            description: 'Report has been exported to Excel successfully',
        })
    }

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
                        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                        <p className="text-muted-foreground">
                            Comprehensive reports with PDF and Excel export
                        </p>
                    </div>
                </div>
                <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="quarter">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
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
                            <p className="font-semibold">Appointments</p>
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
                            <p className="font-semibold">New Patients</p>
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
                            <p className="font-semibold">Emergencies</p>
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
                            <p className="font-semibold">Medications</p>
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
                            <p className="font-semibold">Economic</p>
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
                            <p className="font-semibold">Doctor Performance</p>
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
                            <p className="font-semibold">Monthly Comparison</p>
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
                            <p className="font-semibold">AI Predictions</p>
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
                                {activeReport === 'appointments' && 'Appointments by Month'}
                                {activeReport === 'newPatients' && 'New Patients Report'}
                                {activeReport === 'emergencies' && 'Emergency Cases Report'}
                                {activeReport === 'medications' && 'Medications Consumed'}
                                {activeReport === 'economic' && 'Economic Overview'}
                                {activeReport === 'doctors' && 'Doctor Performance Report'}
                                {activeReport === 'comparison' && 'Monthly Comparison'}
                                {activeReport === 'aiPredictions' && 'AI Predictions & Forecasting'}
                            </CardTitle>
                            <CardDescription>
                                Detailed analysis and insights
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
                                <Legend />
                                <Bar dataKey="total" fill="#3b82f6" name="Total" />
                                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                                <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
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
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} name="New Patients" />
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
                                    <Legend />
                                    <Bar dataKey="avgTime" fill="#f59e0b" name="Avg Time (min)" />
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
                                <Legend />
                                <Bar dataKey="quantity" fill="#8b5cf6" name="Quantity" />
                                <Bar dataKey="cost" fill="#10b981" name="Cost ($)" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 5. Economic Report */}
                    {activeReport === 'economic' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            ${reportsData.economic.totalRevenue.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Total Expenses</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            ${reportsData.economic.totalExpenses.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Net Profit</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            ${reportsData.economic.netProfit.toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm text-muted-foreground">Profit Margin</p>
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
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
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
                                <Legend />
                                <Bar dataKey="patients" fill="#3b82f6" name="Patients" />
                                <Bar dataKey="satisfaction" fill="#f59e0b" name="Satisfaction" />
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
                                <Legend />
                                <Bar dataKey="current" fill="#10b981" name="Current Year" />
                                <Bar dataKey="previous" fill="#94a3b8" name="Previous Year" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}

                    {/* 8. AI Predictions Report */}
                    {activeReport === 'aiPredictions' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                <p className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                    <Brain className="h-4 w-4" />
                                    AI-Powered Revenue Forecasting
                                </p>
                                <p className="text-xs text-indigo-700 mt-1">
                                    Based on historical data and machine learning algorithms
                                </p>
                            </div>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={reportsData.aiPredictions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={3} name="Predicted Revenue ($)" strokeDasharray="5 5" />
                                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
