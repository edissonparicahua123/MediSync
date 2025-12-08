import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sliders, Save, Loader2 } from 'lucide-react'
import { adminAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function AdminPage() {
    const [configs, setConfigs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadConfigs()
    }, [])

    const loadConfigs = async () => {
        try {
            setLoading(true)
            const response = await adminAPI.getConfigs()
            setConfigs(response.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load configurations',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            toast({
                title: 'Success',
                description: 'Settings saved successfully',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to save settings',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    const serviceConfigs = configs.filter(c => ['CONSULTATION', 'LAB', 'PROCEDURE'].includes(c.category))

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Sliders className="h-8 w-8" />
                    System Administration
                </h1>
                <p className="text-muted-foreground mt-1">Manage system configuration and pricing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Service Pricing</h2>
                    <div className="space-y-4">
                        {serviceConfigs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No service configurations found
                            </p>
                        ) : (
                            serviceConfigs.map((service) => (
                                <div key={service.id} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{service.serviceName}</p>
                                        <p className="text-xs text-muted-foreground">{service.category}</p>
                                    </div>
                                    <Input
                                        type="number"
                                        defaultValue={service.price}
                                        className="w-32"
                                        step="0.01"
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Pricing
                    </Button>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">System Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Hospital Name</label>
                            <Input defaultValue="MediSync Enterprise Hospital" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Email</label>
                            <Input type="email" defaultValue="contact@medisync.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Phone</label>
                            <Input type="tel" defaultValue="+1 (555) 123-4567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Address</label>
                            <Input defaultValue="123 Medical Center Dr, City, State 12345" />
                        </div>
                    </div>
                    <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Settings
                    </Button>
                </Card>
            </div>
        </div>
    )
}
