import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Receipt, Plus, Search, Loader2, DollarSign } from 'lucide-react'
import { billingAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function BillingPage() {
    const [invoices, setInvoices] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
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
                <Button>
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
                                            ${invoice.totalAmount?.toFixed(2)}
                                        </td>
                                        <td className="p-3">
                                            {new Date(invoice.issueDate).toLocaleDateString()}
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
                                            <Button variant="outline" size="sm">View</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
