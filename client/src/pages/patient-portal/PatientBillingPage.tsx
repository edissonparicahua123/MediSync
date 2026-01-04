import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DollarSign,
    CreditCard,
    FileText,
    Download,
    Loader2,
    CheckCircle,
    Clock,
    AlertCircle,
    Eye,
} from 'lucide-react'
import { billingAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PatientBillingPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState<any[]>([])
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [showInvoice, setShowInvoice] = useState(false)
    const [showPayment, setShowPayment] = useState(false)

    // Get current user
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        if (user.patientId) {
            loadInvoices()
        }
    }, [])

    const loadInvoices = async () => {
        try {
            setLoading(true)
            const res = await billingAPI.getInvoices({
                patientId: user.patientId,
                limit: 50
            })
            setInvoices(res.data.data || res.data || [])
        } catch (error) {
            console.error('Error loading invoices:', error)
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las facturas',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            PAID: 'bg-green-100 text-green-800',
            PARTIAL: 'bg-blue-100 text-blue-800',
            OVERDUE: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800',
        }
        const labels: Record<string, string> = {
            PENDING: 'Pendiente',
            PAID: 'Pagada',
            PARTIAL: 'Pago Parcial',
            OVERDUE: 'Vencida',
            CANCELLED: 'Cancelada',
        }
        return (
            <Badge className={styles[status] || 'bg-gray-100'}>
                {labels[status] || status}
            </Badge>
        )
    }

    const pendingTotal = invoices
        .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
        .reduce((sum, i) => sum + parseFloat(i.total || 0), 0)

    const handlePayment = () => {
        toast({
            title: 'Pago en proceso',
            description: 'Serás redirigido a la pasarela de pago...',
        })
        // In real app, redirect to payment gateway
        setTimeout(() => {
            setShowPayment(false)
            toast({
                title: 'Pago simulado',
                description: 'En producción, esto conectaría con una pasarela de pago real.',
            })
        }, 2000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Facturación</h1>
                    <p className="text-muted-foreground">Gestiona tus facturas y pagos</p>
                </div>
            </div>

            {/* Balance Card */}
            {pendingTotal > 0 && (
                <Card className="border-l-4 border-l-destructive">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                                <p className="text-4xl font-bold text-destructive">${pendingTotal.toFixed(2)}</p>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => setShowPayment(true)}
                            >
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pagar Ahora
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoices.filter(i => i.status === 'PAID').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Facturas liquidadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoices.filter(i => i.status === 'PENDING').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Por pagar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {invoices.filter(i => i.status === 'OVERDUE').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Requieren atención</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{invoices.length}</div>
                        <p className="text-xs text-muted-foreground">Historial completo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nº Factura</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-mono">
                                            {invoice.invoiceNumber || `INV-${invoice.id?.slice(0, 8)}`}
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(invoice.invoiceDate || invoice.createdAt), 'PP', { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.items?.[0]?.description || 'Servicios médicos'}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${parseFloat(invoice.total || 0).toFixed(2)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice)
                                                        setShowInvoice(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Sin facturas</h3>
                            <p className="text-muted-foreground">No tienes facturas registradas</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Invoice Detail Dialog */}
            <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalle de Factura</DialogTitle>
                    </DialogHeader>
                    {selectedInvoice && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-500">Factura Nº</p>
                                    <p className="font-mono font-bold">
                                        {selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id?.slice(0, 8)}`}
                                    </p>
                                </div>
                                {getStatusBadge(selectedInvoice.status)}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <span>
                                        {format(new Date(selectedInvoice.invoiceDate || selectedInvoice.createdAt), 'PPP', { locale: es })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span>${parseFloat(selectedInvoice.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Impuestos:</span>
                                    <span>${parseFloat(selectedInvoice.tax || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${parseFloat(selectedInvoice.total || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar PDF
                                </Button>
                                {selectedInvoice.status !== 'PAID' && (
                                    <Button onClick={() => {
                                        setShowInvoice(false)
                                        setShowPayment(true)
                                    }}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pagar
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Realizar Pago</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Monto a pagar</p>
                            <p className="text-3xl font-bold text-primary">
                                ${pendingTotal.toFixed(2)}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full h-14" onClick={handlePayment}>
                                <CreditCard className="h-5 w-5 mr-2" />
                                Pagar con Tarjeta
                            </Button>
                            <Button variant="outline" className="w-full h-14" onClick={handlePayment}>
                                <DollarSign className="h-5 w-5 mr-2" />
                                Transferencia Bancaria
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center">
                            Tus datos de pago están protegidos con encriptación SSL
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
