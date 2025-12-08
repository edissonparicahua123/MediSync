import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { AlertTriangle, Bed, Users, Activity, Loader2 } from 'lucide-react'
import { emergencyAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function EmergencyPage() {
    const [dashboard, setDashboard] = useState<any>(null)
    const [criticalPatients, setCriticalPatients] = useState<any[]>([])
    const [wardStats, setWardStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [dashboardRes, patientsRes, wardsRes] = await Promise.all([
                emergencyAPI.getDashboard(),
                emergencyAPI.getCriticalPatients(),
                emergencyAPI.getWardStats()
            ])
            setDashboard(dashboardRes.data)
            setCriticalPatients(patientsRes.data)
            setWardStats(wardsRes.data)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load data',
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

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    Emergency Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Critical patients and bed management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-6 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Critical Patients</p>
                            <p className="text-3xl font-bold text-red-600">
                                {dashboard?.criticalPatients || 0}
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-red-600" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Beds</p>
                            <p className="text-3xl font-bold">{dashboard?.beds?.total || 0}</p>
                        </div>
                        <Bed className="h-8 w-8 text-blue-600" />
                    </div>
                </Card>

                <Card className="p-6 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Available Beds</p>
                            <p className="text-3xl font-bold text-green-600">
                                {dashboard?.beds?.available || 0}
                            </p>
                        </div>
                        <Activity className="h-8 w-8 text-green-600" />
                    </div>
                </Card>

                <Card className="p-6 border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Occupied Beds</p>
                            <p className="text-3xl font-bold text-orange-600">
                                {dashboard?.beds?.occupied || 0}
                            </p>
                        </div>
                        <Bed className="h-8 w-8 text-orange-600" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Critical Patients</h2>
                    <div className="space-y-3">
                        {criticalPatients.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No critical patients
                            </p>
                        ) : (
                            criticalPatients.slice(0, 5).map((appointment: any) => (
                                <div key={appointment.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">
                                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {appointment.reason}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-red-600">
                                            {appointment.priority}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Score: {appointment.triageScore || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Bed Status by Ward</h2>
                    <div className="space-y-4">
                        {wardStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No ward data available
                            </p>
                        ) : (
                            wardStats.map((ward: any) => (
                                <div key={ward.ward} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold">{ward.ward}</span>
                                        <span className="text-muted-foreground">
                                            {ward.occupied}/{ward.total} occupied
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${(ward.occupied / ward.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
