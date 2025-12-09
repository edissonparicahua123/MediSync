import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FlaskConical, Plus, Search, Loader2, Edit, Trash2 } from 'lucide-react'
import { laboratoryAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import LabOrderModal from '@/components/modals/LabOrderModal'
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

export default function LaboratoryPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            setLoading(true)
            const response = await laboratoryAPI.getOrders()
            setOrders(response.data.data || [])
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

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await laboratoryAPI.deleteOrder(deleteId)
            toast({
                title: 'Success',
                description: 'Lab order deleted successfully',
            })
            loadOrders()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete lab order',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const filteredOrders = orders.filter(order =>
        order.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.testType?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        inProgress: orders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FlaskConical className="h-8 w-8" />
                        Laboratory
                    </h1>
                    <p className="text-muted-foreground mt-1">Lab orders and test results</p>
                </div>
                <Button onClick={() => {
                    setSelectedOrder(null)
                    setModalOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Lab Order
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search lab orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Order ID</th>
                                <th className="text-left p-3">Patient</th>
                                <th className="text-left p-3">Test Type</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        No lab orders found
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-accent">
                                        <td className="p-3 font-mono text-sm">
                                            {order.id.slice(0, 8)}...
                                        </td>
                                        <td className="p-3">
                                            {order.patient?.firstName} {order.patient?.lastName}
                                        </td>
                                        <td className="p-3">{order.testType}</td>
                                        <td className="p-3">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${order.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'IN_PROGRESS'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedOrder(order)
                                                        setModalOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteId(order.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <LabOrderModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                order={selectedOrder}
                onSuccess={loadOrders}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the lab order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
