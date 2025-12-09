import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Plus, Search, Loader2, DollarSign, Edit, Trash2 } from 'lucide-react'
import { billingAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import InvoiceModal from '@/components/modals/InvoiceModal'
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

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [invoicesRes, statsRes] = await Promise.all([
                billingAPI.getInvoices(),
                billingAPI.getStats()
            ])
            setInvoices(invoicesRes.data.data || [])
            setStats(statsRes.data)
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

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await billingAPI.deleteInvoice(deleteId)
            toast({
                title: 'Success',
                description: 'Invoice deleted successfully',
            })
            loadData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete invoice',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const filteredInvoices = invoices.filter(inv =>
        inv.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                        <Receipt className="h-8 w-8" />
                        Billing
                    </h1>
                    <p className="text-muted-foreground mt-1">Invoices and payments</p>
                </div>
                <Button onClick={() => {
                    setSelectedInvoice(null)
                    setModalOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Invoice
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">
                                ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Paid Invoices</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats?.paidInvoices || 0}
                            </p>
                        </div>
                        <Receipt className="h-8 w-8 text-green-600" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {stats?.pendingInvoices || 0}
                            </p>
                        </div>
                        <Receipt className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Overdue</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stats?.overdueInvoices || 0}
                            </p>
                        </div>
                        <Receipt className="h-8 w-8 text-red-600" />
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search invoices..."
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
                                <th className="text-left p-3">Invoice #</th>
                                <th className="text-left p-3">Patient</th>
                                <th className="text-left p-3">Amount</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b hover:bg-accent">
                                        <td className="p-3 font-mono text-sm">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="p-3">
                                            {invoice.patient?.firstName} {invoice.patient?.lastName}
                                        </td>
                                        <td className="p-3 font-semibold">
                                            ${Number(invoice.total || 0).toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${invoice.status === 'PAID'
                                                ? 'bg-green-100 text-green-800'
                                                : invoice.status === 'OVERDUE'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice)
                                                        setModalOpen(true)
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setDeleteId(invoice.id)}
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

            <InvoiceModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                invoice={selectedInvoice}
                onSuccess={loadData}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the invoice.
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
