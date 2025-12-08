import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Pill, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
    const stats = [
        { title: 'Total Patients', value: '1,234', icon: Users, change: '+12%' },
        { title: 'Appointments Today', value: '45', icon: Calendar, change: '+5%' },
        { title: 'Medications', value: '567', icon: Pill, change: '-3%' },
        { title: 'Revenue', value: '$12,345', icon: TrendingUp, change: '+18%' },
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
                                    {stat.change} from last month
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
                        <p className="text-muted-foreground">
                            No appointments scheduled yet.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            • Create new patient record
                        </p>
                        <p className="text-sm text-muted-foreground">
                            • Schedule appointment
                        </p>
                        <p className="text-sm text-muted-foreground">
                            • Generate report
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
