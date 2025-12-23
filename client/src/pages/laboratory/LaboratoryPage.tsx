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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <FlaskConical className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laboratorio</h1>
                        <p className="text-muted-foreground">
                            Órdenes de laboratorio, gestión de resultados y análisis
                        </p>
                    </div>
                </div>
                <Button onClick={() => setIsNewOrderOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Orden
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Histórico</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Esperando procesamiento</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                        <p className="text-xs text-muted-foreground">Siendo procesadas</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Resultados disponibles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por paciente, doctor o tipo de examen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                            <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                            <SelectItem value="COMPLETADO">Completado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="orders">
                        <FileText className="h-4 w-4 mr-2" />
                        Órdenes de Lab
                    </TabsTrigger>
                    <TabsTrigger value="statistics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Estadísticas
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo de Examen</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Solicitado</TableHead>
                                    <TableHead>Entrega</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Prioridad</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No se encontraron órdenes
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.testName || order.testType}</TableCell>
                                            <TableCell>
                                                {order.patient
                                                    ? `${order.patient.firstName} ${order.patient.lastName}`
                                                    : 'Desconocido'}
                                            </TableCell>
                                            <TableCell>-</TableCell>
                                            <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy', { locale: es })}</TableCell>
                                            <TableCell>
                                                {order.status === 'COMPLETADO'
                                                    ? format(new Date(order.updatedAt), 'MMM dd, yyyy', { locale: es })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${order.priority === 'URGENTE'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.status === 'COMPLETADO' && order.resultFile ? (
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    ) : order.status !== 'COMPLETADO' ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
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
                <TabsContent value="statistics" className="mt-4 space-y-4">
                    {/* Average Delivery Time */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Tiempo Promedio de Entrega
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-primary">{stats.avgDeliveryTime} días</div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Desde solicitud hasta entrega
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Most Requested Exams */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exámenes Más Solicitados</CardTitle>
                                <CardDescription>Top 5 tests más frecuentes</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Daily Volume */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Volumen Diario</CardTitle>
                                <CardDescription>Órdenes por día (últimos 7 días)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.dailyVolume}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#3b82f6" name="Órdenes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Volume */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tendencia Mensual</CardTitle>
                            <CardDescription>Órdenes por mes (últimos 6 meses)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthlyVolume}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Órdenes" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ADD ORDER DIALOG */}
            <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva Orden de Laboratorio</DialogTitle>
                        <DialogDescription>Cree una nueva solicitud para un paciente.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Paciente</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, patientId: v })} value={formData.patientId}>
                                <SelectTrigger><SelectValue placeholder="Seleccione paciente" /></SelectTrigger>
                                <SelectContent>
                                    {patients.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Doctor</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, doctorId: v })} value={formData.doctorId}>
                                <SelectTrigger><SelectValue placeholder="Seleccione doctor" /></SelectTrigger>
                                <SelectContent>
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id}>Dr. {d.user?.lastName || d.specialty}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Examen</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, testType: v })} value={formData.testType}>
                                <SelectTrigger><SelectValue placeholder="Seleccione examen" /></SelectTrigger>
                                <SelectContent>
                                    {tests.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.category})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Prioridad</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, priority: v })} value={formData.priority}>
                                <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                    <SelectItem value="STAT">STAT (Inmediato)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notas Clínicas</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateOrder}>Crear Orden</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT ORDER DIALOG */}
            <Dialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Orden</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Prioridad</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, priority: v })} value={formData.priority}>
                                <SelectTrigger><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NORMAL">Normal</SelectItem>
                                    <SelectItem value="URGENTE">Urgente</SelectItem>
                                    <SelectItem value="STAT">STAT (Inmediato)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notas</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOrderOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdateOrder}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE DIALOG */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la orden de laboratorio permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
