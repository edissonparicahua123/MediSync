import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Pill, TrendingUp, Loader2, DollarSign } from 'lucide-react'
import { analyticsAPI, appointmentsAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function DashboardPage() {
    const [dashboard, setDashboard] = useState<any>(null)
    const [recentAppointments, setRecentAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [dashboardRes, appointmentsRes] = await Promise.all([
                analyticsAPI.getDashboard(),
                appointmentsAPI.getAll({ limit: 5 })
            ])
            setDashboard(dashboardRes.data)
            setRecentAppointments(appointmentsRes.data.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load dashboard',
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

    const stats = [
        {
            title: 'Total Patients',
            value: dashboard?.patients?.total || 0,
            icon: Users,
            change: `+${dashboard?.patients?.newThisMonth || 0} this month`
        },
        {
            title: 'Appointments Today',
            value: dashboard?.todayAppointments || 0,
            icon: Calendar,
            change: `${dashboard?.upcomingAppointments || 0} upcoming`
        },
        {
            title: 'Total Revenue',
            value: `$${dashboard?.revenue?.totalRevenue?.toFixed(2) || '0.00'}`,
            icon: DollarSign,
            change: `$${dashboard?.revenue?.thisMonthRevenue?.toFixed(2) || '0.00'} this month`
        },
        {
            title: 'Active Employees',
            value: dashboard?.employees?.active || 0,
            icon: TrendingUp,
            change: `${dashboard?.employees?.total || 0} total`
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of your hospital management system
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentAppointments.length === 0 ? (
                            <p className="text-muted-foreground">
                                No recent appointments.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {recentAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {appointment.patient?.firstName} {appointment.patient?.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {appointment.reason}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                                            </p>
                                            <span className={`text-xs px-2 py-1 rounded ${appointment.status === 'CONFIRMED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : appointment.status === 'SCHEDULED'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors">
                            <p className="font-medium">Create new patient record</p>
                            <p className="text-sm text-muted-foreground">Add a new patient to the system</p>
                        </button>
                        <button className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors">
                            <p className="font-medium">Schedule appointment</p>
                            <p className="text-sm text-muted-foreground">Book a new appointment</p>
                        </button>
                        <button className="w-full text-left p-3 hover:bg-accent rounded-lg transition-colors">
                            <p className="font-medium">Generate report</p>
                            <p className="text-sm text-muted-foreground">Create analytics reports</p>
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
