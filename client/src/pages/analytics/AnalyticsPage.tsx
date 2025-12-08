import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react'
import { analyticsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function AnalyticsPage() {
    const [dashboard, setDashboard] = useState<any>(null)
    const [appointmentsByPriority, setAppointmentsByPriority] = useState<any[]>([])
    const [appointmentsByDay, setAppointmentsByDay] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [dashboardRes, priorityRes, dayRes] = await Promise.all([
                analyticsAPI.getDashboard(),
                analyticsAPI.getAppointmentsByPriority(),
                analyticsAPI.getAppointmentsByDay(7)
            ])
            setDashboard(dashboardRes.data)
            setAppointmentsByPriority(priorityRes.data || [])
            setAppointmentsByDay(dayRes.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load analytics',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const totalAppointments = appointmentsByPriority.reduce((sum, item) => sum + item._count, 0)

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-8 w-8" />
                    Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Data insights and metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">
                                ${dashboard?.revenue?.totalRevenue?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" />
                                This month: ${dashboard?.revenue?.thisMonthRevenue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Appointments</p>
                            <p className="text-2xl font-bold">{totalAppointments}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Today: {dashboard?.todayAppointments || 0}
                            </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Patients</p>
                            <p className="text-2xl font-bold">{dashboard?.patients?.total || 0}</p>
                            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" />
                                New: {dashboard?.patients?.newThisMonth || 0}
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-purple-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Revenue</p>
                            <p className="text-2xl font-bold">
                                ${dashboard?.revenue?.pendingRevenue?.toFixed(2) || '0.00'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Paid: {dashboard?.revenue?.paidInvoices || 0}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Appointments by Priority</h2>
                    <div className="space-y-4">
                        {appointmentsByPriority.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No data available</p>
                        ) : (
                            appointmentsByPriority.map((item) => {
                                const colors: any = {
                                    URGENT: 'bg-red-600',
                                    HIGH: 'bg-orange-600',
                                    NORMAL: 'bg-blue-600',
                                    LOW: 'bg-green-600',
                                }
                                return (
                                    <div key={item.priority}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium">{item.priority}</span>
                                            <span className="text-sm text-muted-foreground">{item._count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`${colors[item.priority] || 'bg-gray-600'} h-2 rounded-full`}
                                                style={{ width: `${(item._count / totalAppointments) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Appointments (Last 7 Days)</h2>
                    {appointmentsByDay.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No data available</p>
                    ) : (
                        <div className="h-64 flex items-end justify-between gap-2">
                            {appointmentsByDay.map((item, i) => {
                                const maxCount = Math.max(...appointmentsByDay.map(d => d.count))
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-primary rounded-t"
                                            style={{ height: `${(item.count / maxCount) * 100}%` }}
                                        ></div>
                                        <span className="text-xs mt-2 text-muted-foreground">
                                            {new Date(item.date).getDate()}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
