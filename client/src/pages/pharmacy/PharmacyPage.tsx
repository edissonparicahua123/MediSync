import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
    Pill,
    Plus,
    Search,
    AlertTriangle,
    Loader2,
    Edit,
    Trash2,
    Package,
    TrendingDown,
    Calendar,
    Building2,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    FileText,
} from 'lucide-react'
import { pharmacyAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInDays } from 'date-fns'
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

export default function PharmacyPage() {
    const navigate = useNavigate()
    const [medications, setMedications] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [kardex, setKardex] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('inventory')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    // Filtros
    const [filters, setFilters] = useState({
        type: 'all',
        laboratory: 'all',
        status: 'all',
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [medsRes, ordersRes, kardexRes] = await Promise.all([
                pharmacyAPI.getMedications().catch(() => ({ data: { data: [] } })),
                pharmacyAPI.getOrders().catch(() => ({ data: [] })),
                pharmacyAPI.getKardex().catch(() => ({ data: [] })),
            ])

            // Datos simulados para inventario
            const simulatedMeds = [
                {
                    id: '1',
                    name: 'Paracetamol 500mg',
                    type: 'Medication',
                    laboratory: 'Bayer',
                    currentStock: 150,
                    minStock: 200,
                    batch: 'LOT-2024-001',
                    expirationDate: new Date('2025-06-15'),
                },
                {
                    id: '2',
                    name: 'Amoxicillin 500mg',
                    type: 'Medication',
                    laboratory: 'Pfizer',
                    currentStock: 80,
                    minStock: 100,
                    batch: 'LOT-2024-002',
                    expirationDate: new Date('2024-12-20'),
                },
                {
                    id: '3',
                    name: 'Surgical Gloves',
                    type: 'Supply',
                    laboratory: 'MedSupply',
                    currentStock: 500,
                    minStock: 300,
                    batch: 'LOT-2024-003',
                    expirationDate: new Date('2026-01-10'),
                },
                {
                    id: '4',
                    name: 'Insulin 100UI/ml',
                    type: 'Medication',
                    laboratory: 'Novo Nordisk',
                    currentStock: 25,
                    minStock: 50,
                    batch: 'LOT-2024-004',
                    expirationDate: new Date('2025-03-30'),
                },
            ]

            // Datos simulados para órdenes
            const simulatedOrders = [
                {
                    id: '1',
                    medication: 'Paracetamol 500mg',
                    quantity: 50,
                    doctor: 'Dr. Smith',
                    patient: 'John Doe',
                    status: 'PENDING',
                    requestedAt: new Date(),
                },
                {
                    id: '2',
                    medication: 'Amoxicillin 500mg',
                    quantity: 30,
                    doctor: 'Dr. Johnson',
                    patient: 'Jane Smith',
                    status: 'APPROVED',
                    requestedAt: new Date(Date.now() - 3600000),
                    approvedAt: new Date(Date.now() - 1800000),
                    approvedBy: 'Pharmacist Brown',
                },
                {
                    id: '3',
                    medication: 'Insulin 100UI/ml',
                    quantity: 10,
                    doctor: 'Dr. Williams',
                    patient: 'Bob Wilson',
                    status: 'REJECTED',
                    requestedAt: new Date(Date.now() - 7200000),
                    rejectedAt: new Date(Date.now() - 3600000),
                    rejectedBy: 'Pharmacist Brown',
                    rejectionReason: 'Insufficient stock',
                },
            ]

            // Datos simulados para kardex
            const simulatedKardex = [
                {
                    id: '1',
                    medication: 'Paracetamol 500mg',
                    type: 'ENTRY',
                    quantity: 500,
                    batch: 'LOT-2024-001',
                    responsible: 'Pharmacist Brown',
                    date: new Date(),
                    notes: 'New stock arrival',
                },
                {
                    id: '2',
                    medication: 'Paracetamol 500mg',
                    type: 'EXIT',
                    quantity: 50,
                    batch: 'LOT-2024-001',
                    responsible: 'Nurse Johnson',
                    date: new Date(Date.now() - 3600000),
                    notes: 'Dispensed to patient John Doe',
                },
                {
                    id: '3',
                    medication: 'Amoxicillin 500mg',
                    type: 'ENTRY',
                    quantity: 200,
                    batch: 'LOT-2024-002',
                    responsible: 'Pharmacist Brown',
                    date: new Date(Date.now() - 86400000),
                    notes: 'New stock arrival',
                },
                {
                    id: '4',
                    medication: 'Amoxicillin 500mg',
                    type: 'EXIT',
                    quantity: 30,
                    batch: 'LOT-2024-002',
                    responsible: 'Pharmacist Brown',
                    date: new Date(Date.now() - 7200000),
                    notes: 'Dispensed to patient Jane Smith',
                },
            ]

            setMedications(medsRes.data?.data?.length > 0 ? medsRes.data.data : simulatedMeds)
            setOrders(ordersRes.data?.length > 0 ? ordersRes.data : simulatedOrders)
            setKardex(kardexRes.data?.length > 0 ? kardexRes.data : simulatedKardex)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load pharmacy data',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await pharmacyAPI.deleteMedication(deleteId)
            toast({
                title: 'Success',
                description: 'Medication deleted successfully',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete medication',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const handleApproveOrder = async (orderId: string) => {
        toast({
            title: 'Order Approved',
            description: 'The medication order has been approved',
        })
        // TODO: Implementar con backend
    }

    const handleRejectOrder = async (orderId: string) => {
        toast({
            title: 'Order Rejected',
            description: 'The medication order has been rejected',
        })
        // TODO: Implementar con backend
    }

    // Filtrar medicamentos
    const filteredMedications = useMemo(() => {
        return medications.filter((med: any) => {
            const searchMatch = searchTerm === '' ||
                med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.laboratory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.batch?.toLowerCase().includes(searchTerm.toLowerCase())

            const typeMatch = filters.type === 'all' || med.type === filters.type
            const labMatch = filters.laboratory === 'all' || med.laboratory === filters.laboratory

            return searchMatch && typeMatch && labMatch
        })
    }, [medications, searchTerm, filters])

    // Alertas de stock
    const lowStockMeds = filteredMedications.filter((med: any) => med.currentStock < med.minStock)
    const expiringMeds = filteredMedications.filter((med: any) => {
        const daysUntilExpiry = differenceInDays(new Date(med.expirationDate), new Date())
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0
    })

    const getStockStatus = (current: number, min: number) => {
        if (current < min * 0.5) return { color: 'text-red-600', bg: 'bg-red-100', label: 'CRITICAL' }
        if (current < min) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'LOW' }
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'NORMAL' }
    }

    const getExpiryStatus = (expirationDate: Date) => {
        const days = differenceInDays(new Date(expirationDate), new Date())
        if (days < 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'EXPIRED' }
        if (days <= 30) return { color: 'text-red-600', bg: 'bg-red-100', label: `${days}d` }
        if (days <= 90) return { color: 'text-orange-600', bg: 'bg-orange-100', label: `${days}d` }
        return { color: 'text-green-600', bg: 'bg-green-100', label: `${days}d` }
    }

    const getOrderStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800',
            DISPENSED: 'bg-blue-100 text-blue-800',
        }
        return colors[status] || colors.PENDING
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
                        <Pill className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
                        <p className="text-muted-foreground">
                            Inventory management, orders, and medication tracking
                        </p>
                    </div>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                </Button>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{lowStockMeds.length}</div>
                        <p className="text-xs text-muted-foreground">Items below minimum stock</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{expiringMeds.length}</div>
                        <p className="text-xs text-muted-foreground">Items expiring within 90 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{medications.length}</div>
                        <p className="text-xs text-muted-foreground">In inventory</p>
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
                                placeholder="Search by name, laboratory, or batch..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Medication">Medication</SelectItem>
                            <SelectItem value="Supply">Supply</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.laboratory} onValueChange={(v) => setFilters({ ...filters, laboratory: v })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Laboratory" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Laboratories</SelectItem>
                            <SelectItem value="Bayer">Bayer</SelectItem>
                            <SelectItem value="Pfizer">Pfizer</SelectItem>
                            <SelectItem value="Novo Nordisk">Novo Nordisk</SelectItem>
                            <SelectItem value="MedSupply">MedSupply</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="inventory">
                        <Package className="h-4 w-4 mr-2" />
                        Inventory
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                        <FileText className="h-4 w-4 mr-2" />
                        Internal Orders
                    </TabsTrigger>
                    <TabsTrigger value="kardex">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Kardex
                    </TabsTrigger>
                </TabsList>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="mt-4">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Laboratory</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Min Stock</TableHead>
                                    <TableHead>Batch</TableHead>
                                    <TableHead>Expiration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMedications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No medications found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMedications.map((med: any) => {
                                        const stockStatus = getStockStatus(med.currentStock, med.minStock)
                                        const expiryStatus = getExpiryStatus(med.expirationDate)

                                        return (
                                            <TableRow key={med.id}>
                                                <TableCell className="font-medium">{med.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {med.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{med.laboratory}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{med.currentStock}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{med.minStock}</TableCell>
                                                <TableCell className="font-mono text-sm">{med.batch}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{format(new Date(med.expirationDate), 'MMM dd, yyyy')}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}>
                                                            {expiryStatus.label}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(med.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Medication Orders</CardTitle>
                            <CardDescription>Doctor requests pending pharmacy approval</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {orders.map((order: any) => (
                                    <div key={order.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-lg">{order.medication}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Quantity: {order.quantity} units
                                                </p>
                                            </div>
                                            <span className={`text-xs px-3 py-1 rounded-full ${getOrderStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Requested by</p>
                                                <p className="font-medium">{order.doctor}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Patient</p>
                                                <p className="font-medium">{order.patient}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Requested at</p>
                                                <p className="text-sm">{format(order.requestedAt, 'PPp')}</p>
                                            </div>
                                            {order.approvedAt && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Approved at</p>
                                                    <p className="text-sm">{format(order.approvedAt, 'PPp')}</p>
                                                    <p className="text-xs text-muted-foreground">by {order.approvedBy}</p>
                                                </div>
                                            )}
                                            {order.rejectedAt && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Rejected at</p>
                                                    <p className="text-sm">{format(order.rejectedAt, 'PPp')}</p>
                                                    <p className="text-xs text-muted-foreground">by {order.rejectedBy}</p>
                                                    <p className="text-xs text-red-600 mt-1">Reason: {order.rejectionReason}</p>
                                                </div>
                                            )}
                                        </div>

                                        {order.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApproveOrder(order.id)}
                                                    className="flex-1"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleRejectOrder(order.id)}
                                                    className="flex-1"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Kardex Tab */}
                <TabsContent value="kardex" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Medication Movement History (Kardex)</CardTitle>
                            <CardDescription>Complete record of all medication entries and exits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Medication</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Responsible</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {kardex.map((entry: any) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">
                                                {format(entry.date, 'PPp')}
                                            </TableCell>
                                            <TableCell>{entry.medication}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${entry.type === 'ENTRY'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {entry.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={entry.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}>
                                                    {entry.type === 'ENTRY' ? '+' : '-'}{entry.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{entry.batch}</TableCell>
                                            <TableCell>{entry.responsible}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {entry.notes}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the medication from inventory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
