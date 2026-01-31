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
import { format, differenceInDays, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
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
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newItem, setNewItem] = useState({
        name: '',
        laboratory: '',
        stock: 0,
        minStock: 10,
        expiry: '',
        batch: '',
        type: 'Medicamento'
    })
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

            setMedications(medsRes.data?.data || [])
            setOrders(ordersRes.data || [])
            setKardex(kardexRes.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar datos de farmacia',
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
                title: 'Éxito',
                description: 'Medicamento eliminado correctamente',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar medicamento',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const handleSaveMedication = async () => {
        try {
            await pharmacyAPI.createMedication({
                name: newItem.name,
                manufacturer: newItem.laboratory,
                description: 'Nuevo medicamento',
                category: newItem.type,
                stock: newItem.stock,
                minStock: newItem.minStock,
                batch: newItem.batch,
                expiry: newItem.expiry
            })
            toast({ title: 'Éxito', description: 'Medicamento creado correctamente' })
            setIsAddDialogOpen(false)
            loadData()
            setNewItem({ name: '', laboratory: '', stock: 0, minStock: 10, expiry: '', batch: '', type: 'Medicamento' })
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo crear el medicamento', variant: 'destructive' })
        }
    }

    const handleApproveOrder = async (orderId: string) => {
        try {
            await pharmacyAPI.approveOrder(orderId)
            toast({
                title: 'Orden Aprobada',
                description: 'La orden de medicamento ha sido aprobada',
            })
            loadData()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo aprobar la orden',
                variant: 'destructive',
            })
        }
    }

    const handleRejectOrder = async (orderId: string) => {
        try {
            await pharmacyAPI.rejectOrder(orderId, 'Stock insuficiente') // Simple reason for now
            toast({
                title: 'Orden Rechazada',
                description: 'La orden de medicamento ha sido rechazada',
            })
            loadData()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo rechazar la orden',
                variant: 'destructive',
            })
        }
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
        if (current < min * 0.5) return { color: 'text-red-600', bg: 'bg-red-100', label: 'CRÍTICO' }
        if (current < min) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'BAJO' }
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'NORMAL' }
    }

    const getExpiryStatus = (expirationDate: Date) => {
        const days = differenceInDays(new Date(expirationDate), new Date())
        if (days < 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'VENCIDO' }
        if (days <= 30) return { color: 'text-red-600', bg: 'bg-red-100', label: `${days}d` }
        if (days <= 90) return { color: 'text-orange-600', bg: 'bg-orange-100', label: `${days}d` }
        return { color: 'text-green-600', bg: 'bg-green-100', label: `${days}d` }
    }

    const getOrderStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDIENTE: 'bg-yellow-100 text-yellow-800',
            APROBADO: 'bg-green-100 text-green-800',
            RECHAZADO: 'bg-red-100 text-red-800',
            DISPENSADO: 'bg-blue-100 text-blue-800',
        }
        return colors[status] || colors.PENDIENTE
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-green-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40 border border-white/20">
                        <Pill className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Farmacia</h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Gestión de Inventario y Órdenes
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="h-11 rounded-xl px-6 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 font-bold text-sm shadow-lg shadow-green-500/30 text-white border-t border-white/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Medicamento
                </Button>
            </div>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Stock Bajo</CardTitle>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white tracking-tight">{lowStockMeds.length}</div>
                        <p className="text-xs text-red-400 mt-1 font-semibold">Ítems con stock mínimo</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Vencen Pronto</CardTitle>
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white tracking-tight">{expiringMeds.length}</div>
                        <p className="text-xs text-orange-400 mt-1 font-semibold">Ítems que vencen en 90 días</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Total Ítems</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Package className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white tracking-tight">{medications.length}</div>
                        <p className="text-xs text-blue-400 mt-1 font-semibold">En inventario</p>
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
                                placeholder="Buscar por nombre, laboratorio o lote..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-black/30 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                        <SelectTrigger className="w-[180px] h-11 bg-black/20 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Medicamento">Medicamento</SelectItem>
                            <SelectItem value="Suministro">Suministro</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.laboratory} onValueChange={(v) => setFilters({ ...filters, laboratory: v })}>
                        <SelectTrigger className="w-[180px] h-11 bg-black/20 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Laboratorio" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Bayer">Bayer</SelectItem>
                            <SelectItem value="Pfizer">Pfizer</SelectItem>
                            <SelectItem value="Novo Nordisk">Novo Nordisk</SelectItem>
                            <SelectItem value="MedSupply">MedSupply</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-black/20 p-1 rounded-xl border border-white/5">
                    <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                        <Package className="h-4 w-4 mr-2" />
                        Inventario
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                        <FileText className="h-4 w-4 mr-2" />
                        Órdenes Internas
                    </TabsTrigger>
                    <TabsTrigger value="kardex" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium">
                        <TrendingDown className="h-4 w-4 mr-2" />
                        Kardex
                    </TabsTrigger>
                </TabsList>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="mt-4">
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden p-0">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-white/5">
                                    <TableHead className="text-slate-300 font-bold">Nombre</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Tipo</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Laboratorio</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Stock Actual</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Stock Min</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Lote</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Vencimiento</TableHead>
                                    <TableHead className="text-right text-slate-300 font-bold">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMedications.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                                            <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-lg font-medium">No se encontraron medicamentos</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMedications.map((med: any) => {
                                        const stockStatus = getStockStatus(med.currentStock, med.minStock)
                                        const expiryStatus = getExpiryStatus(med.expirationDate)

                                        return (
                                            <TableRow key={med.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                                <TableCell className="font-medium text-white">{med.name}</TableCell>
                                                <TableCell>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                        {med.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-slate-300">{med.laboratory}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-white">{med.currentStock}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${stockStatus.label === 'CRÍTICO' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : stockStatus.label === 'BAJO' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                                                            {stockStatus.label}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-400">{med.minStock}</TableCell>
                                                <TableCell className="font-mono text-xs text-slate-400 bg-black/20 px-2 py-1 rounded">{med.batch}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-slate-300">
                                                            {(() => {
                                                                const date = new Date(med.expirationDate);
                                                                return isValid(date)
                                                                    ? format(date, 'MMM dd, yyyy', { locale: es })
                                                                    : 'N/A';
                                                            })()}
                                                        </span>
                                                        <span className={`w-2 h-2 rounded-full ${expiryStatus.color === 'text-red-600' ? 'bg-red-500' : expiryStatus.color === 'text-orange-600' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400 rounded-lg"
                                                            onClick={() => setDeleteId(med.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
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
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-white">Órdenes Internas</h3>
                            <p className="max-w-md mx-auto mt-2 text-sm">
                                Gestione las solicitudes de medicamentos de los doctores desde aquí.
                            </p>
                        </div>
                    </Card>
                </TabsContent>

                {/* Kardex Tab */}
                <TabsContent value="kardex" className="mt-4">
                    <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl p-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <TrendingDown className="h-12 w-12 mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold text-white">Movimientos de Kardex</h3>
                            <p className="max-w-md mx-auto mt-2 text-sm">
                                Audit log detallado de todas las entradas y salidas de inventario.
                            </p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el medicamento del inventario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            {/* Add Medication Dialog */}
            <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <AlertDialogContent className="bg-[#0f172a] border-white/10 text-white sm:max-w-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl">
                            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            Agregar Nuevo Medicamento
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Ingrese los detalles del nuevo medicamento para el inventario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo</label>
                            <select
                                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
                                value={newItem.type}
                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                            >
                                <option value="Medicamento" className="bg-[#0f172a]">Medicamento</option>
                                <option value="Insumo" className="bg-[#0f172a]">Insumo</option>
                                <option value="Equipo" className="bg-[#0f172a]">Equipo</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre</label>
                            <Input
                                value={newItem.name}
                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                placeholder="Ej: Paracetamol 500mg"
                                className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Laboratorio</label>
                            <Input
                                value={newItem.laboratory}
                                onChange={(e) => setNewItem({ ...newItem, laboratory: e.target.value })}
                                placeholder="Ej: Bayer"
                                className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Inicial</label>
                                <Input
                                    type="number"
                                    value={newItem.stock}
                                    onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Mínimo</label>
                                <Input
                                    type="number"
                                    value={newItem.minStock}
                                    onChange={(e) => setNewItem({ ...newItem, minStock: parseInt(e.target.value) || 0 })}
                                    placeholder="10"
                                    className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Lote</label>
                                <Input
                                    value={newItem.batch || ''}
                                    onChange={(e) => setNewItem({ ...newItem, batch: e.target.value })}
                                    placeholder="Lote #123"
                                    className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Vencimiento</label>
                                <Input
                                    type="date"
                                    value={newItem.expiry}
                                    onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
                                    className="bg-black/20 border-white/10 text-white h-10 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveMedication} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20">Guardar Medicamento</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
