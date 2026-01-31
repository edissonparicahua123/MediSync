import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Receipt,
    Plus,
    Search,
    Loader2,
    DollarSign,
    Eye,
    Download,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    QrCode,
} from 'lucide-react'
import { billingAPI, patientsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import QRCode from 'qrcode'

import InvoiceModal from '@/components/modals/InvoiceModal'

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('invoices')
    const [generatorOpen, setGeneratorOpen] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const { toast } = useToast()

    // Modal State
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)

    // Filtros
    const [filters, setFilters] = useState({
        status: 'all',
        paymentMethod: 'all',
    })

    // Generator State
    const [invoiceData, setInvoiceData] = useState({
        patientId: '',
        patientName: '',
        services: [] as any[],
        medications: [] as any[],
        procedures: [] as any[],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
    })

    // Item definitions
    const availableServices = [
        { id: '1', name: 'Consulta General', price: 50 },
        { id: '2', name: 'Visita de Seguimiento', price: 30 },
        { id: '3', name: 'Atención de Emergencia', price: 150 },
    ]

    const availableMedications = [
        { id: '1', name: 'Paracetamol 500mg', price: 5 },
        { id: '2', name: 'Amoxicilina 500mg', price: 15 },
        { id: '3', name: 'Insulina 100UI/ml', price: 45 },
    ]

    const availableProcedures = [
        { id: '1', name: 'Análisis de Sangre', price: 25 },
        { id: '2', name: 'Rayos-X', price: 80 },
        { id: '3', name: 'ECG', price: 60 },
    ]

    const [patients, setPatients] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [invoicesRes, patientsRes] = await Promise.all([
                billingAPI.getInvoices(),
                patientsAPI.getAll()
            ])
            setInvoices(invoicesRes.data?.data || [])
            // Handle both direct array and paginated response for patients
            setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.data || [])
        } catch (error: any) {
            console.error('Error loading data:', error)
            toast({
                title: 'Error',
                description: 'Error al cargar datos de facturación',
                variant: 'destructive',
            })
            setInvoices([])
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals
    useEffect(() => {
        const subtotal =
            invoiceData.services.reduce((sum, s) => sum + s.price, 0) +
            invoiceData.medications.reduce((sum, m) => sum + m.price, 0) +
            invoiceData.procedures.reduce((sum, p) => sum + p.price, 0)

        const tax = subtotal * 0.10 // 10% tax
        const total = subtotal + tax - invoiceData.discount

        setInvoiceData(prev => ({
            ...prev,
            subtotal,
            tax,
            total,
        }))
    }, [invoiceData.services, invoiceData.medications, invoiceData.procedures, invoiceData.discount])

    // Generate QR Code
    useEffect(() => {
        if (invoiceData.total > 0) {
            const qrData = JSON.stringify({
                invoiceId: `INV-${Date.now()}`,
                patient: invoiceData.patientName,
                total: invoiceData.total.toFixed(2),
                date: new Date().toISOString(),
            })

            QRCode.toDataURL(qrData, { width: 200 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error(err))
        }
    }, [invoiceData.total, invoiceData.patientName])

    const handleViewInvoice = (invoice: any) => {
        setSelectedInvoice(invoice)
        setShowInvoiceModal(true)
    }

    const handleDownloadInvoice = (invoice: any) => {
        const printContent = `
            <html>
                <head>
                    <title>Factura #${invoice.invoiceNumber || invoice.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .details { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .totals { text-align: right; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Factura Médica</h1>
                        <h3>#${invoice.invoiceNumber || invoice.id}</h3>
                    </div>
                    <div class="details">
                        <p><strong>Paciente:</strong> ${invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : 'Desconocido'}</p>
                        <p><strong>Fecha:</strong> ${new Date(invoice.createdAt || invoice.invoiceDate).toLocaleDateString()}</p>
                        <p><strong>Estado:</strong> ${invoice.status}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoice.items?.map((item: any) => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${Number(item.unitPrice).toFixed(2)}</td>
                                    <td>$${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="totals">
                        <p><strong>Subtotal:</strong> $${Number(invoice.subtotal).toFixed(2)}</p>
                        <p><strong>Impuestos:</strong> $${Number(invoice.tax).toFixed(2)}</p>
                        <p><strong>Descuento:</strong> -$${Number(invoice.discount).toFixed(2)}</p>
                        <h3>Total: $${Number(invoice.total).toFixed(2)}</h3>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `
        const printWindow = window.open('', '', 'width=800,height=600')
        if (printWindow) {
            printWindow.document.write(printContent)
            printWindow.document.close()
        }
    }

    const handleToggleService = (service: any) => {
        setInvoiceData(prev => {
            const exists = prev.services.find(s => s.id === service.id)
            if (exists) {
                return { ...prev, services: prev.services.filter(s => s.id !== service.id) }
            } else {
                return { ...prev, services: [...prev.services, service] }
            }
        })
    }

    const handleToggleMedication = (medication: any) => {
        setInvoiceData(prev => {
            const exists = prev.medications.find(m => m.id === medication.id)
            if (exists) {
                return { ...prev, medications: prev.medications.filter(m => m.id !== medication.id) }
            } else {
                return { ...prev, medications: [...prev.medications, medication] }
            }
        })
    }

    const handleToggleProcedure = (procedure: any) => {
        setInvoiceData(prev => {
            const exists = prev.procedures.find(p => p.id === procedure.id)
            if (exists) {
                return { ...prev, procedures: prev.procedures.filter(p => p.id !== procedure.id) }
            } else {
                return { ...prev, procedures: [...prev.procedures, procedure] }
            }
        })
    }

    const handleGenerateInvoice = async () => {
        if (!invoiceData.patientId) {
            toast({
                title: 'Error',
                description: 'Por favor seleccione un paciente',
                variant: 'destructive',
            })
            return
        }

        if (invoiceData.services.length === 0 && invoiceData.medications.length === 0 && invoiceData.procedures.length === 0) {
            toast({
                title: 'Error',
                description: 'Por favor seleccione al menos un ítem',
                variant: 'destructive',
            })
            return
        }

        try {
            const allItems = [
                ...invoiceData.services.map(s => ({ ...s, type: 'SERVICE', quantity: 1 })),
                ...invoiceData.medications.map(m => ({ ...m, type: 'MEDICATION', quantity: 1 })),
                ...invoiceData.procedures.map(p => ({ ...p, type: 'PROCEDURE', quantity: 1 }))
            ]

            const payload = {
                patientId: invoiceData.patientId,
                items: allItems,
                subtotal: invoiceData.subtotal,
                tax: invoiceData.tax,
                discount: invoiceData.discount,
                total: invoiceData.total,
                // paymentMethod is not sent as per schema limitation, default to PENDING/CASH later
            }

            await billingAPI.createInvoice(payload)

            toast({
                title: 'Factura Generada',
                description: `Factura creada exitosamente para ${invoiceData.patientName}`,
            })

            // Reset form
            setInvoiceData({
                patientId: '',
                patientName: '',
                services: [],
                medications: [],
                procedures: [],
                subtotal: 0,
                tax: 0,
                discount: 0,
                total: 0,
            })
            setGeneratorOpen(false)
            loadData()
        } catch (error: any) {
            console.error('Error creating invoice:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo crear la factura',
                variant: 'destructive',
            })
        }
    }

    // Filtrar facturas
    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice: any) => {
            const searchMatch = searchTerm === '' ||
                (invoice.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (invoice.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()))

            const statusMatch = filters.status === 'all' || invoice.status === filters.status
            // Payment method filtering is complex now, skipping for MVP or checking nested payments
            const paymentMatch = true // filters.paymentMethod === 'all' || ...

            return searchMatch && statusMatch && paymentMatch
        })
    }, [invoices, searchTerm, filters])

    // Estadísticas
    const stats = useMemo(() => {
        const total = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0)
        const paid = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + Number(inv.total || 0), 0)
        const pending = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + Number(inv.total || 0), 0)
        const overdue = invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + Number(inv.total || 0), 0)

        return { total, paid, pending, overdue }
    }, [invoices])

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PAID: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            OVERDUE: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
        }
        return colors[status] || colors.PENDING
    }

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            PAID: 'PAGADO',
            PENDING: 'PENDIENTE',
            OVERDUE: 'VENCIDO',
            CANCELLED: 'CANCELADO',
        }
        return texts[status] || status
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-600" />
            case 'OVERDUE':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

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
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 border border-white/20">
                        <Receipt className="h-8 w-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Facturación</h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Gestión de facturas y seguimiento de pagos
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => setGeneratorOpen(true)}
                    className="h-11 rounded-xl px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 font-bold text-sm shadow-lg shadow-emerald-500/30 text-white border-t border-white/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Generar Factura
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Ingresos Totales</CardTitle>
                        <div className="p-2 bg-slate-500/10 rounded-lg">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.total.toFixed(2)}</div>
                        <p className="text-xs text-slate-400 mt-1 font-semibold">Todas las facturas</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Pagado</CardTitle>
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.paid.toFixed(2)}</div>
                        <p className="text-xs text-green-400 mt-1 font-semibold">Pagos recolectados</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Pendiente</CardTitle>
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.pending.toFixed(2)}</div>
                        <p className="text-xs text-yellow-500 mt-1 font-semibold">Esperando pago</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-md border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">Vencido</CardTitle>
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <XCircle className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">${stats.overdue.toFixed(2)}</div>
                        <p className="text-xs text-red-500 mt-1 font-semibold">Pasada fecha vencimiento</p>
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
                                placeholder="Buscar por paciente o número de factura..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-green-500/50 focus:bg-black/30 transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                        <SelectTrigger className="w-[180px] h-11 bg-black/20 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="all">Todos los Estados</SelectItem>
                            <SelectItem value="PAID">Pagado</SelectItem>
                            <SelectItem value="PENDING">Pendiente</SelectItem>
                            <SelectItem value="OVERDUE">Vencido</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.paymentMethod} onValueChange={(v) => setFilters({ ...filters, paymentMethod: v })}>
                        <SelectTrigger className="w-[180px] h-11 bg-black/20 border-white/10 text-white rounded-xl">
                            <SelectValue placeholder="Método de Pago" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                            <SelectItem value="all">Todos los Métodos</SelectItem>
                            <SelectItem value="Cash">Efectivo</SelectItem>
                            <SelectItem value="Credit Card">Tarjeta de Crédito</SelectItem>
                            <SelectItem value="Insurance">Seguro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden p-0">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-white/5">
                            <TableHead className="text-slate-300 font-bold">Factura #</TableHead>
                            <TableHead className="text-slate-300 font-bold">Paciente</TableHead>
                            <TableHead className="text-slate-300 font-bold">Servicios</TableHead>
                            <TableHead className="text-slate-300 font-bold">Fecha</TableHead>
                            <TableHead className="text-slate-300 font-bold">Monto Total</TableHead>
                            <TableHead className="text-slate-300 font-bold">Estado</TableHead>
                            <TableHead className="text-slate-300 font-bold">Método de Pago</TableHead>
                            <TableHead className="text-right text-slate-300 font-bold">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-16 text-slate-500">
                                    <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-lg font-medium">No se encontraron facturas</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((invoice: any) => (
                                <TableRow key={invoice.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium text-white">{invoice.invoiceNumber || invoice.id}</TableCell>
                                    <TableCell className="text-slate-300">
                                        {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : 'Desconocido'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] text-xs text-slate-400">
                                            {invoice.items && invoice.items.length > 0
                                                ? invoice.items.map((i: any) => i.description).join(', ')
                                                : 'Sin detalles'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">{format(new Date(invoice.createdAt || invoice.invoiceDate || new Date()), 'MMM dd, yyyy', { locale: es })}</TableCell>
                                    <TableCell className="font-bold text-emerald-400">${Number(invoice.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(invoice.status)}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${invoice.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                    invoice.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                                        invoice.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                            'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                                }`}>
                                                {getStatusText(invoice.status)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-slate-500" />
                                            {invoice.payments && invoice.payments.length > 0
                                                ? invoice.payments[0].paymentMethod
                                                : 'Pendiente'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice)} className="h-8 w-8 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)} className="h-8 w-8 hover:bg-green-500/20 hover:text-green-300 rounded-lg">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Invoice Generator Dialog */}
            <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f172a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                                <Plus className="h-5 w-5 text-white" />
                            </div>
                            Generar Nueva Factura
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Seleccione servicios, medicamentos y procedimientos para crear una factura
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Patient Info */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Paciente</Label>
                            <Select
                                value={invoiceData.patientId}
                                onValueChange={(value) => {
                                    const patient = patients.find(p => p.id === value);
                                    setInvoiceData({
                                        ...invoiceData,
                                        patientId: value,
                                        patientName: patient ? `${patient.firstName} ${patient.lastName}` : ''
                                    })
                                }}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10 text-white h-10 rounded-xl">
                                    <SelectValue placeholder="Seleccionar paciente" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f172a] border-white/10 text-white">
                                    {patients.map((patient: any) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.firstName} {patient.lastName} - {patient.documentNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Services */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Servicios</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableServices.map(service => (
                                    <div key={service.id} className="flex items-center space-x-2 p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <Checkbox
                                            checked={invoiceData.services.some(s => s.id === service.id)}
                                            onCheckedChange={() => handleToggleService(service)}
                                            className="border-white/20 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{service.name}</p>
                                            <p className="text-sm text-green-400 font-bold">${service.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Medicamentos</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableMedications.map(medication => (
                                    <div key={medication.id} className="flex items-center space-x-2 p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <Checkbox
                                            checked={invoiceData.medications.some(m => m.id === medication.id)}
                                            onCheckedChange={() => handleToggleMedication(medication)}
                                            className="border-white/20 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{medication.name}</p>
                                            <p className="text-sm text-green-400 font-bold">${medication.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Procedures */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Procedimientos</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableProcedures.map(procedure => (
                                    <div key={procedure.id} className="flex items-center space-x-2 p-3 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <Checkbox
                                            checked={invoiceData.procedures.some(p => p.id === procedure.id)}
                                            onCheckedChange={() => handleToggleProcedure(procedure)}
                                            className="border-white/20 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-white">{procedure.name}</p>
                                            <p className="text-sm text-green-400 font-bold">${procedure.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">Descuento ($)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={invoiceData.discount}
                                onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                                className="bg-black/20 border-white/10 text-white rounded-xl"
                            />
                        </div>

                        {/* Summary */}
                        <Card className="bg-emerald-900/10 border border-emerald-500/20">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-slate-300">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Impuesto (10%):</span>
                                        <span className="font-medium">${invoiceData.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-300">
                                        <span>Descuento:</span>
                                        <span className="font-medium text-red-400">-${invoiceData.discount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-between text-xl font-bold text-white">
                                        <span>Total:</span>
                                        <span className="text-emerald-400">${invoiceData.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* QR Code */}
                                {qrCodeUrl && invoiceData.total > 0 && (
                                    <div className="mt-6 flex flex-col items-center p-4 bg-white rounded-xl w-fit mx-auto">
                                        <Label className="mb-2 flex items-center gap-2 text-black font-bold">
                                            <QrCode className="h-4 w-4" />
                                            QR de Pago
                                        </Label>
                                        <img src={qrCodeUrl} alt="Payment QR Code" className="w-32 h-32" />
                                        <p className="text-xs text-slate-600 mt-2 font-medium">
                                            Escanear para pagar ${invoiceData.total.toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button onClick={handleGenerateInvoice} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-500/20 h-11 font-bold">
                                <Receipt className="h-4 w-4 mr-2" />
                                Generar Factura
                            </Button>
                            <Button variant="outline" onClick={() => setGeneratorOpen(false)} className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl h-11">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Modal for Viewing/Editing Invoice */}
            <InvoiceModal
                open={showInvoiceModal}
                onOpenChange={setShowInvoiceModal}
                invoice={selectedInvoice}
                onSuccess={loadData}
            />
        </main>
    )
}
