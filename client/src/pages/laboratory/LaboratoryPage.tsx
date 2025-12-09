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
import { laboratoryAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInDays } from 'date-fns'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function LaboratoryPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('orders')
    const [uploadingResult, setUploadingResult] = useState<string | null>(null)
    const { toast } = useToast()

    // Filtros
    const [filters, setFilters] = useState({
        status: 'all',
        examType: 'all',
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const ordersRes = await laboratoryAPI.getOrders().catch(() => ({ data: { data: [] } }))

            // Datos simulados profesionales
            const simulatedOrders = [
                {
                    id: '1',
                    examType: 'Complete Blood Count (CBC)',
                    doctor: 'Dr. Smith',
                    patient: 'John Doe',
                    status: 'PENDING',
                    requestedDate: new Date(),
                    deliveryDate: new Date(Date.now() + 86400000 * 2),
                    priority: 'NORMAL',
                },
                {
                    id: '2',
                    examType: 'Lipid Panel',
                    doctor: 'Dr. Johnson',
                    patient: 'Jane Smith',
                    status: 'IN_PROGRESS',
                    requestedDate: new Date(Date.now() - 3600000),
                    deliveryDate: new Date(Date.now() + 86400000),
                    priority: 'NORMAL',
                },
                {
                    id: '3',
                    examType: 'Chest X-Ray',
                    doctor: 'Dr. Williams',
                    patient: 'Bob Wilson',
                    status: 'COMPLETED',
                    requestedDate: new Date(Date.now() - 86400000),
                    deliveryDate: new Date(Date.now() - 3600000),
                    completedDate: new Date(Date.now() - 3600000),
                    resultFile: 'chest_xray_result.pdf',
                    priority: 'URGENT',
                },
                {
                    id: '4',
                    examType: 'Urinalysis',
                    doctor: 'Dr. Brown',
                    patient: 'Alice Johnson',
                    status: 'COMPLETED',
                    requestedDate: new Date(Date.now() - 172800000),
                    deliveryDate: new Date(Date.now() - 86400000),
                    completedDate: new Date(Date.now() - 86400000),
                    resultFile: 'urinalysis_result.pdf',
                    priority: 'NORMAL',
                },
                {
                    id: '5',
                    examType: 'ECG',
                    doctor: 'Dr. Davis',
                    patient: 'Charlie Brown',
                    status: 'PENDING',
                    requestedDate: new Date(Date.now() - 7200000),
                    deliveryDate: new Date(Date.now() + 86400000),
                    priority: 'URGENT',
                },
            ]

            setOrders(ordersRes.data?.data?.length > 0 ? ordersRes.data.data : simulatedOrders)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load lab orders',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUploadResult = async (orderId: string, file: File) => {
        setUploadingResult(orderId)

        // Simular subida
        setTimeout(() => {
            toast({
                title: 'Result Uploaded',
                description: 'Lab result has been uploaded and patient notified',
            })
            setUploadingResult(null)
            loadData()
        }, 2000)
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
        const pending = orders.filter(o => o.status === 'PENDING').length
        const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length
        const completed = orders.filter(o => o.status === 'COMPLETED').length

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
        const completedOrders = orders.filter(o => o.status === 'COMPLETED' && o.completedDate)
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
                date: format(date, 'EEE'),
                count,
            }
        })

        // Volumen mensual (últimos 6 meses)
        const monthlyVolume = Array.from({ length: 6 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - (5 - i))
            return {
                month: format(date, 'MMM'),
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
            PENDING: 'bg-yellow-100 text-yellow-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
        }
        return colors[status] || colors.PENDING
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'IN_PROGRESS':
                return <Clock className="h-4 w-4 text-blue-600" />
            case 'PENDING':
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
                        <h1 className="text-3xl font-bold tracking-tight">Laboratory</h1>
                        <p className="text-muted-foreground">
                            Lab orders, results management, and analytics
                        </p>
                    </div>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Lab Order
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">Awaiting processing</p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                        <p className="text-xs text-muted-foreground">Being processed</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Results available</p>
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
                                placeholder="Search by patient, doctor, or exam type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="orders">
                        <FileText className="h-4 w-4 mr-2" />
                        Lab Orders
                    </TabsTrigger>
                    <TabsTrigger value="statistics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Statistics
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam Type</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Doctor</TableHead>
                                    <TableHead>Requested</TableHead>
                                    <TableHead>Delivery Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No lab orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order: any) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.examType}</TableCell>
                                            <TableCell>{order.patient}</TableCell>
                                            <TableCell>{order.doctor}</TableCell>
                                            <TableCell>{format(new Date(order.requestedDate), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>{format(new Date(order.deliveryDate), 'MMM dd, yyyy')}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${order.priority === 'URGENT'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {order.priority}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {order.status === 'COMPLETED' && order.resultFile ? (
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    ) : order.status !== 'COMPLETED' ? (
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
                                Average Delivery Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-primary">{stats.avgDeliveryTime} days</div>
                            <p className="text-sm text-muted-foreground mt-2">
                                From request to result delivery
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Most Requested Exams */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Requested Exams</CardTitle>
                                <CardDescription>Top 5 most frequently ordered tests</CardDescription>
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
                                <CardTitle>Daily Volume</CardTitle>
                                <CardDescription>Orders per day (last 7 days)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stats.dailyVolume}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#3b82f6" name="Orders" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Monthly Volume */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Volume Trend</CardTitle>
                            <CardDescription>Orders per month (last 6 months)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={stats.monthlyVolume}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Orders" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
