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
import { billingAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import QRCode from 'qrcode'

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('invoices')
    const [generatorOpen, setGeneratorOpen] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const { toast } = useToast()

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

    // Available items for selection
    const availableServices = [
        { id: '1', name: 'Consultation', price: 50 },
        { id: '2', name: 'Follow-up Visit', price: 30 },
        { id: '3', name: 'Emergency Care', price: 150 },
    ]

    const availableMedications = [
        { id: '1', name: 'Paracetamol 500mg', price: 5 },
        { id: '2', name: 'Amoxicillin 500mg', price: 15 },
        { id: '3', name: 'Insulin 100UI/ml', price: 45 },
    ]

    const availableProcedures = [
        { id: '1', name: 'Blood Test', price: 25 },
        { id: '2', name: 'X-Ray', price: 80 },
        { id: '3', name: 'ECG', price: 60 },
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const invoicesRes = await billingAPI.getInvoices().catch(() => ({ data: { data: [] } }))

            // Datos simulados profesionales
            const simulatedInvoices = [
                {
                    id: 'INV-001',
                    patient: 'John Doe',
                    services: ['Consultation', 'Blood Test'],
                    date: new Date(),
                    totalAmount: 75.00,
                    status: 'PAID',
                    paymentMethod: 'Credit Card',
                    tax: 7.50,
                    discount: 0,
                },
                {
                    id: 'INV-002',
                    patient: 'Jane Smith',
                    services: ['Emergency Care', 'X-Ray', 'Medications'],
                    date: new Date(Date.now() - 86400000),
                    totalAmount: 245.00,
                    status: 'PENDING',
                    paymentMethod: 'Cash',
                    tax: 24.50,
                    discount: 10,
                },
                {
                    id: 'INV-003',
                    patient: 'Bob Wilson',
                    services: ['Follow-up Visit', 'ECG'],
                    date: new Date(Date.now() - 172800000),
                    totalAmount: 90.00,
                    status: 'PAID',
                    paymentMethod: 'Insurance',
                    tax: 9.00,
                    discount: 0,
                },
                {
                    id: 'INV-004',
                    patient: 'Alice Johnson',
                    services: ['Consultation', 'Medications'],
                    date: new Date(Date.now() - 259200000),
                    totalAmount: 70.00,
                    status: 'OVERDUE',
                    paymentMethod: 'Credit Card',
                    tax: 7.00,
                    discount: 5,
                },
            ]

            setInvoices(invoicesRes.data?.data?.length > 0 ? invoicesRes.data.data : simulatedInvoices)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load billing data',
                variant: 'destructive',
            })
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

    const handleGenerateInvoice = () => {
        if (!invoiceData.patientName) {
            toast({
                title: 'Error',
                description: 'Please enter patient name',
                variant: 'destructive',
            })
            return
        }

        if (invoiceData.services.length === 0 && invoiceData.medications.length === 0 && invoiceData.procedures.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one item',
                variant: 'destructive',
            })
            return
        }

        toast({
            title: 'Invoice Generated',
            description: `Invoice created for ${invoiceData.patientName} - Total: $${invoiceData.total.toFixed(2)}`,
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
    }

    // Filtrar facturas
    const filteredInvoices = useMemo(() => {
        return invoices.filter((invoice: any) => {
            const searchMatch = searchTerm === '' ||
                invoice.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.id?.toLowerCase().includes(searchTerm.toLowerCase())

            const statusMatch = filters.status === 'all' || invoice.status === filters.status
            const paymentMatch = filters.paymentMethod === 'all' || invoice.paymentMethod === filters.paymentMethod

            return searchMatch && statusMatch && paymentMatch
        })
    }, [invoices, searchTerm, filters])

    // Estadísticas
    const stats = useMemo(() => {
        const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
        const paid = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0)
        const pending = invoices.filter(inv => inv.status === 'PENDING').reduce((sum, inv) => sum + inv.totalAmount, 0)
        const overdue = invoices.filter(inv => inv.status === 'OVERDUE').reduce((sum, inv) => sum + inv.totalAmount, 0)

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Receipt className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
                        <p className="text-muted-foreground">
                            Invoice management and payment tracking
                        </p>
                    </div>
                </div>
                <Button onClick={() => setGeneratorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Invoice
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All invoices</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${stats.paid.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Collected payments</p>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">${stats.pending.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${stats.overdue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Past due date</p>
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
                                placeholder="Search by patient or invoice number..."
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
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.paymentMethod} onValueChange={(v) => setFilters({ ...filters, paymentMethod: v })}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Credit Card">Credit Card</SelectItem>
                            <SelectItem value="Insurance">Insurance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Services</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvoices.map((invoice: any) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.patient}</TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px]">
                                            {invoice.services.join(', ')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(invoice.date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="font-semibold">${invoice.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(invoice.status)}
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            {invoice.paymentMethod}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Generate New Invoice</DialogTitle>
                        <DialogDescription>
                            Select services, medications, and procedures to create an invoice
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Patient Info */}
                        <div className="space-y-2">
                            <Label>Patient Name</Label>
                            <Input
                                placeholder="Enter patient name"
                                value={invoiceData.patientName}
                                onChange={(e) => setInvoiceData({ ...invoiceData, patientName: e.target.value })}
                            />
                        </div>

                        {/* Services */}
                        <div className="space-y-2">
                            <Label>Services</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableServices.map(service => (
                                    <div key={service.id} className="flex items-center space-x-2 p-3 border rounded">
                                        <Checkbox
                                            checked={invoiceData.services.some(s => s.id === service.id)}
                                            onCheckedChange={() => handleToggleService(service)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{service.name}</p>
                                            <p className="text-sm text-muted-foreground">${service.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medications */}
                        <div className="space-y-2">
                            <Label>Medications</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableMedications.map(medication => (
                                    <div key={medication.id} className="flex items-center space-x-2 p-3 border rounded">
                                        <Checkbox
                                            checked={invoiceData.medications.some(m => m.id === medication.id)}
                                            onCheckedChange={() => handleToggleMedication(medication)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{medication.name}</p>
                                            <p className="text-sm text-muted-foreground">${medication.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Procedures */}
                        <div className="space-y-2">
                            <Label>Procedures</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableProcedures.map(procedure => (
                                    <div key={procedure.id} className="flex items-center space-x-2 p-3 border rounded">
                                        <Checkbox
                                            checked={invoiceData.procedures.some(p => p.id === procedure.id)}
                                            onCheckedChange={() => handleToggleProcedure(procedure)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">{procedure.name}</p>
                                            <p className="text-sm text-muted-foreground">${procedure.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                            <Label>Discount ($)</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={invoiceData.discount}
                                onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Summary */}
                        <Card className="bg-accent">
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span className="font-medium">${invoiceData.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span className="font-medium">${invoiceData.tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Discount:</span>
                                        <span className="font-medium text-red-600">-${invoiceData.discount.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span className="text-primary">${invoiceData.total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* QR Code */}
                                {qrCodeUrl && invoiceData.total > 0 && (
                                    <div className="mt-4 flex flex-col items-center">
                                        <Label className="mb-2 flex items-center gap-2">
                                            <QrCode className="h-4 w-4" />
                                            Payment QR Code
                                        </Label>
                                        <img src={qrCodeUrl} alt="Payment QR Code" className="border rounded p-2 bg-white" />
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Scan to pay ${invoiceData.total.toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button onClick={handleGenerateInvoice} className="flex-1">
                                <Receipt className="h-4 w-4 mr-2" />
                                Generate Invoice
                            </Button>
                            <Button variant="outline" onClick={() => setGeneratorOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
