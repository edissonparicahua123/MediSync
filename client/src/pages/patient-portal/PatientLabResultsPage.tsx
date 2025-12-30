import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    FlaskConical,
    Download,
    Eye,
    Loader2,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react'
import { laboratoryAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PatientLabResultsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [labOrders, setLabOrders] = useState<any[]>([])
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        loadLabOrders()
    }, [])

    const loadLabOrders = async () => {
        try {
            setLoading(true)
            const res = await laboratoryAPI.getOrders({ limit: 50 })
            setLabOrders(res.data.data || res.data || [])
        } catch (error) {
            console.error('Error loading lab orders:', error)
            toast({
                title: 'Error',
                description: 'No se pudieron cargar los resultados',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            case 'PENDING':
                return <Clock className="h-5 w-5 text-yellow-500" />
            case 'IN_PROGRESS':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />
        }
    }

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDING: 'Pendiente',
            IN_PROGRESS: 'En Proceso',
            COMPLETED: 'Completado',
            CANCELLED: 'Cancelado',
        }
        return labels[status] || status
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
                    <h1 className="text-3xl font-bold text-foreground">Resultados de Laboratorio</h1>
                    <p className="text-muted-foreground">Consulta tus análisis y resultados</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completados</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {labOrders.filter(o => o.status === 'COMPLETED').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Resultados disponibles</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {labOrders.filter(o => o.status === 'PENDING').length}
                        </div>
                        <p className="text-xs text-muted-foreground">En proceso</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Análisis</CardTitle>
                        <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{labOrders.length}</div>
                        <p className="text-xs text-muted-foreground">Historial completo</p>
                    </CardContent>
                </Card>
            </div>

            {/* Lab Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Análisis</CardTitle>
                </CardHeader>
                <CardContent>
                    {labOrders.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo de Análisis</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {labOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            {format(new Date(order.createdAt), 'PPP', { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FlaskConical className="h-4 w-4 text-purple-500" />
                                                {order.testName || order.testType || 'Análisis'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(order.status)}
                                                <span>{getStatusLabel(order.status)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {order.status === 'COMPLETED' ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowResults(true)
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Ver
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    Esperando resultados...
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12">
                            <FlaskConical className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">No hay análisis</h3>
                            <p className="text-muted-foreground">
                                No tienes resultados de laboratorio aún
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Dialog */}
            <Dialog open={showResults} onOpenChange={setShowResults}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resultados del Análisis
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha</p>
                                    <p className="font-medium">
                                        {format(new Date(selectedOrder.createdAt), 'PPP', { locale: es })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tipo</p>
                                    <p className="font-medium">
                                        {selectedOrder.testName || selectedOrder.testType}
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Resultados</h4>
                                {selectedOrder.results && selectedOrder.results.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Parámetro</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead>Referencia</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.results.map((result: any, i: number) => (
                                                <TableRow key={i}>
                                                    <TableCell>{result.parameter}</TableCell>
                                                    <TableCell className="font-mono">
                                                        {result.value} {result.unit}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {result.referenceRange}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-muted-foreground text-center py-4">
                                        Los resultados detallados estarán disponibles pronto
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
