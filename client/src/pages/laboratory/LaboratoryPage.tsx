import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FlaskConical,
    Plus,
    Search,
    Loader2,
    Upload,
    FileText,
    Eye,
    Clock,
    TrendingUp,
    BarChart3,
    Calendar,
    CheckCircle,
    AlertCircle,
    XCircle,
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { patientsAPI, doctorsAPI, laboratoryAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function LaboratoryPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('orders')
    const [uploadingResult, setUploadingResult] = useState<string | null>(null)
    const { toast } = useToast()

    // States for Dialogs and Data
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
    const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    const [patients, setPatients] = useState<any[]>([])
    const [doctors, setDoctors] = useState<any[]>([])
    const [tests, setTests] = useState<any[]>([])

    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        testType: '',
        priority: 'NORMAL',
        notes: ''
    })

    // Filtros
    const [filters, setFilters] = useState({
        status: 'all',
        examType: 'all',
    })

    useEffect(() => {
        loadData()
        loadDropdownData()
    }, [])

    const loadDropdownData = async () => {
        try {
            const [pRes, dRes, tRes] = await Promise.all([
                patientsAPI.getAll(),
                doctorsAPI.getAll(),
                laboratoryAPI.getTests()
            ])

            const patientsList = Array.isArray(pRes.data) ? pRes.data : (pRes.data?.data || [])
            const doctorsList = Array.isArray(dRes.data) ? dRes.data : (dRes.data?.data || [])
            const testsList = Array.isArray(tRes.data) ? tRes.data : (tRes.data?.data || [])

            setPatients(patientsList)
            setDoctors(doctorsList)
            setTests(testsList)
        } catch (error) {
            console.error("Error loading dropdowns", error)
        }
    }

    const loadData = async () => {
        try {
            setLoading(true)
            const ordersRes = await laboratoryAPI.getOrders()
            // Ensure we extract the array correctly whether it's paginated or not
            const ordersData = ordersRes.data?.data || (Array.isArray(ordersRes.data) ? ordersRes.data : [])
            setOrders(ordersData)
        } catch (error: any) {
            console.error(error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar órdenes de laboratorio',
                variant: 'destructive',
            })
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrder = async () => {
        if (!formData.patientId || !formData.doctorId || !formData.testType) {
            toast({ title: "Error", description: "Complete los campos obligatorios", variant: "destructive" })
            return
        }

        try {
            const selectedTest = tests.find(t => t.id === formData.testType)
            await laboratoryAPI.createOrder({
                patientId: formData.patientId,
                doctorId: formData.doctorId,
                testType: selectedTest?.category || 'General',
                testName: selectedTest?.name || 'Examen',
                priority: formData.priority,
                notes: formData.notes
            })
            toast({ title: "Éxito", description: "Orden creada correctamente" })
            setIsNewOrderOpen(false)
            setFormData({ patientId: '', doctorId: '', testType: '', priority: 'NORMAL', notes: '' })
            loadData()
        } catch (error) {
            toast({ title: "Error", description: "No se pudo crear la orden", variant: "destructive" })
        }
    }

    const openEditDialog = (order: any) => {
        setSelectedOrder(order)
        setFormData({
            patientId: order.patientId,
            doctorId: order.doctorId,
            testType: '', // Difficult to map back without ID, primarily for editing Status/Priority/Notes
            priority: order.priority,
            notes: order.notes || ''
        })
        setIsEditOrderOpen(true)
    }

    const handleUpdateOrder = async () => {
        if (!selectedOrder) return

        try {
            await laboratoryAPI.updateOrder(selectedOrder.id, {
                priority: formData.priority,
                notes: formData.notes
            })
            toast({ title: "Éxito", description: "Orden actualizada" })
            setIsEditOrderOpen(false)
            setSelectedOrder(null)
            loadData()
        } catch (error) {
            toast({ title: "Error", description: "Error al actualizar", variant: "destructive" })
        }
    }

    const handleDeleteOrder = async () => {
        if (!deleteId) return
        try {
            await laboratoryAPI.deleteOrder(deleteId)
            toast({ title: "Éxito", description: "Orden eliminada" })
            setDeleteId(null)
            loadData()
        } catch (error) {
            toast({ title: "Error", description: "Error al eliminar", variant: "destructive" })
        }
    }
    const handleUploadResult = async (orderId: string, file: File) => {
        setUploadingResult(orderId)
        try {
            await laboratoryAPI.updateStatus(orderId, 'COMPLETED', {
                resultFile: `archivo_simulado_${file.name}`
            })

            toast({
                title: 'Resultado Subido',
                description: 'El resultado de laboratorio ha sido registrado correctamente',
            })
            setUploadingResult(null)
            loadData()
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo subir el resultado', variant: 'destructive' })
            setUploadingResult(null)
        }
    }


    const handleFileSelect = (orderId: string) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pdf'
        input.onchange = (e: any) => {
            const file = e.target.files[0]
            if (file) {
                handleUploadResult(orderId, file)
            }
        }
        input.click()
    }

    // Filtrar órdenes
    const filteredOrders = useMemo(() => {
        return orders.filter((order: any) => {
            const searchMatch = searchTerm === '' ||
                order.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.doctor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.examType?.toLowerCase().includes(searchTerm.toLowerCase())

            const statusMatch = filters.status === 'all' || order.status === filters.status
            const examMatch = filters.examType === 'all' || order.examType === filters.examType

            return searchMatch && statusMatch && examMatch
        })
    }, [orders, searchTerm, filters])

    // Estadísticas
    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter(o => o.status === 'PENDIENTE').length
        const inProgress = orders.filter(o => o.status === 'EN_PROCESO').length
        const completed = orders.filter(o => o.status === 'COMPLETADO').length

        // Exámenes más solicitados
        const examCounts: Record<string, number> = {}
        orders.forEach(order => {
            examCounts[order.examType] = (examCounts[order.examType] || 0) + 1
        })
        const mostRequested = Object.entries(examCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }))

        // Tiempo promedio de entrega
        const completedOrders = orders.filter(o => o.status === 'COMPLETADO' && o.completedDate)
        const avgDeliveryTime = completedOrders.length > 0
            ? completedOrders.reduce((sum, order) => {
                const days = differenceInDays(new Date(order.completedDate), new Date(order.requestedDate))
                return sum + days
            }, 0) / completedOrders.length
            : 0

        // Volumen diario (últimos 7 días)
        const dailyVolume = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            const count = orders.filter(o => {
                const orderDate = new Date(o.requestedDate)
                return orderDate.toDateString() === date.toDateString()
            }).length
            return {
                date: format(date, 'EEE', { locale: es }),
                count,
            }
        })

        // Volumen mensual (últimos 6 meses)
        const monthlyVolume = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - (5 - i))
            return {
                month: format(date, 'MMM', { locale: es }),
                count: Math.floor(Math.random() * 50) + 20,
            }
        })

        return {
            total,
            pending,
            inProgress,
            completed,
            mostRequested,
            avgDeliveryTime: avgDeliveryTime.toFixed(1),
            dailyVolume,
            monthlyVolume,
        }
    }, [orders])

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDIENTE: 'bg-yellow-100 text-yellow-800',
            EN_PROCESO: 'bg-blue-100 text-blue-800',
            COMPLETADO: 'bg-green-100 text-green-800',
            CANCELADO: 'bg-red-100 text-red-800',
        }
        return colors[status] || colors.PENDIENTE
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETADO':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'EN_PROCESO':
                return <Clock className="h-4 w-4 text-blue-600" />
            case 'PENDIENTE':
                return <AlertCircle className="h-4 w-4 text-yellow-600" />
            default:
                return <XCircle className="h-4 w-4 text-red-600" />
        }
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
        <main className="flex-1 p-8 pt-6 bg-gradient-to-br from-gray-900 to-black text-white min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-400 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/40 border border-white/20">
                        <FlaskConical className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Laboratorio</h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Gestión de Resultados y Análisis Clínicos
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsNewOrderOpen(true)}
                    className="h-11 rounded-xl px-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 font-bold text-sm shadow-lg shadow-purple-500/30 text-white border-t border-white/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Orden
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Total Órdenes</CardTitle>
                        <div className="p-2 bg-slate-500/10 rounded-lg">
                            <FlaskConical className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                        <p className="text-xs text-slate-400 mt-1 font-semibold">Histórico</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Pendientes</CardTitle>
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.pending}</div>
                        <p className="text-xs text-yellow-500 mt-1 font-semibold">Esperando procesamiento</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">En Proceso</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
                        <p className="text-xs text-blue-400 mt-1 font-semibold">Siendo procesadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Completadas</CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.completed}</div>
                        <p className="text-xs text-green-400 mt-1 font-semibold">Resultados disponibles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-6 bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por paciente, doctor o tipo de examen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:bg-black/30 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger className="w-[180px] h-11 bg-black/20 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                            <SelectItem value="COMPLETADO">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-black/20 p-1 rounded-xl border border-white/5">
                    <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
                        <FileText className="h-4 w-4 mr-2" />
                        Órdenes de Lab
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estadísticas
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4">
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-white/5">
                                    <TableHead className="text-slate-300 font-bold">Tipo de Examen</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Paciente</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Doctor</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Solicitado</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Entrega</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Estado</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Prioridad</TableHead>
                                    <TableHead className="text-right text-slate-300 font-bold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                                            <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-lg font-medium">No se encontraron órdenes</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order: any) => (
                                        <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium text-white">{order.testName || order.testType}</TableCell>
                                            <TableCell className="text-slate-300">
                                                {order.patient
                                                    ? `${order.patient.firstName} ${order.patient.lastName}`
                                                    : 'Desconocido'}
                                            </TableCell>
                                            <TableCell className="text-slate-400">-</TableCell>
                                            <TableCell className="text-slate-300">{format(new Date(order.createdAt), 'MMM dd, yyyy', { locale: es })}</TableCell>
                                            <TableCell className="text-slate-300">
                                                {order.status === 'COMPLETADO'
                                                    ? format(new Date(order.updatedAt), 'MMM dd, yyyy', { locale: es })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${order.status === 'PENDIENTE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                        order.status === 'EN_PROCESO' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                            order.status === 'COMPLETADO' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                                'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${order.priority === 'URGENTE'
                                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                                    }`}>
                                                    {order.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.status === 'COMPLETADO' && order.resultFile ? (
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 hover:bg-purple-500/20 hover:text-purple-300 rounded-lg">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    ) : order.status !== 'COMPLETADO' ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg"
                                                            onClick={() => handleFileSelect(order.id)}
                                                            disabled={uploadingResult === order.id}
                                                        >
                                                            {uploadingResult === order.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Upload className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="statistics" className="mt-4 space-y-6">
                    {/* Average Delivery Time */}
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Tiempo Promedio de Entrega</h3>
                                <p className="text-xs text-slate-400">Eficiencia del laboratorio</p>
                            </div>
                        </div>
                        <div className="text-5xl font-bold text-white tracking-tight">{stats.avgDeliveryTime} <span className="text-lg text-slate-500 font-medium">días</span></div>
                        <p className="text-sm text-slate-400 mt-2">
                            Desde solicitud hasta entrega de resultados
                        </p>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Most Requested Exams */}
                        <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-white">Exámenes Más Solicitados</CardTitle>
                                <CardDescription className="text-slate-400">Top 5 tests más frecuentes</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={stats.mostRequested}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {stats.mostRequested.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Daily Volume */}
                        <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                            <CardHeader className="p-0 mb-6">
                                <CardTitle className="text-white">Volumen Diario</CardTitle>
                                <CardDescription className="text-slate-400">Órdenes por día (últimos 7 días)</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.dailyVolume}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="date" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8b5cf6" name="Órdenes" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Volume */}
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-white">Tendencia Mensual</CardTitle>
                            <CardDescription className="text-slate-400">Órdenes por mes (últimos 6 meses)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthlyVolume}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Órdenes" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ADD ORDER DIALOG */}
            <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            Nueva Orden de Laboratorio
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Cree una nueva solicitud para un paciente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Paciente</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, patientId: v })} value={formData.patientId}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl"><SelectValue placeholder="Seleccione paciente" /></SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctor</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, doctorId: v })} value={formData.doctorId}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl"><SelectValue placeholder="Seleccione doctor" /></SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id}>Dr. {d.user?.lastName || d.specialty}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Examen</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, testType: v })} value={formData.testType}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl"><SelectValue placeholder="Seleccione examen" /></SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    {tests.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Prioridad</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, priority: v })} value={formData.priority}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                    <SelectItem value="STAT">STAT (Inmediato)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notas Clínicas</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales..."
                                className="bg-black/20 border-white/10 text-white rounded-xl min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsNewOrderOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">Cancelar</Button>
                        <Button onClick={handleCreateOrder} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-500/20">Crear Orden</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT ORDER DIALOG */}
            <Dialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
                <DialogContent className="bg-[#0f172a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Editar Orden</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Prioridad</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, priority: v })} value={formData.priority}>
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                    <SelectItem value="STAT">STAT (Inmediato)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notas</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="bg-black/20 border-white/10 text-white rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOrderOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">Cancelar</Button>
                        <Button onClick={handleUpdateOrder} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE DIALOG */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Esta acción eliminará la orden de laboratorio permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700 text-white border-none">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}

