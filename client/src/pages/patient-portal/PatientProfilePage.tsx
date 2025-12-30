import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Bell,
    Save,
    Loader2,
    Camera,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'

export default function PatientProfilePage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    const [profile, setProfile] = useState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: '',
        dateOfBirth: '',
        bloodType: '',
        emergencyContact: '',
        emergencyPhone: '',
    })

    const [notifications, setNotifications] = useState({
        emailReminders: true,
        smsReminders: false,
        labResults: true,
        appointments: true,
        billing: true,
    })

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    })

    const handleSaveProfile = async () => {
        setLoading(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000))
        toast({
            title: 'Perfil actualizado',
            description: 'Tus datos han sido guardados correctamente',
        })
        setLoading(false)
    }

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast({
                title: 'Error',
                description: 'Las contraseñas no coinciden',
                variant: 'destructive',
            })
            return
        }

        if (passwords.new.length < 6) {
            toast({
                title: 'Error',
                description: 'La contraseña debe tener al menos 6 caracteres',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        await new Promise(r => setTimeout(r, 1000))
        toast({
            title: 'Contraseña actualizada',
            description: 'Tu contraseña ha sido cambiada',
        })
        setPasswords({ current: '', new: '', confirm: '' })
        setLoading(false)
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{profile.firstName} {profile.lastName}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                </div>
            </div>

            <Tabs defaultValue="personal">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                </TabsList>

                {/* Personal Info Tab */}
                <TabsContent value="personal" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={profile.firstName}
                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellido</Label>
                                    <Input
                                        value={profile.lastName}
                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Correo Electrónico
                                </Label>
                                <Input
                                    type="email"
                                    value={profile.email}
                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Teléfono
                                </Label>
                                <Input
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Dirección
                                </Label>
                                <Input
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha de Nacimiento</Label>
                                    <Input
                                        type="date"
                                        value={profile.dateOfBirth}
                                        onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Sangre</Label>
                                    <Input
                                        value={profile.bloodType}
                                        onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                                        placeholder="Ej: A+, O-, AB+"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-semibold mb-3">Contacto de Emergencia</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Nombre</Label>
                                        <Input
                                            value={profile.emergencyContact}
                                            onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teléfono</Label>
                                        <Input
                                            value={profile.emergencyPhone}
                                            onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveProfile} disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Preferencias de Notificación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Recordatorios por Email</p>
                                    <p className="text-sm text-muted-foreground">Recibe recordatorios de citas por correo</p>
                                </div>
                                <Switch
                                    checked={notifications.emailReminders}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, emailReminders: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Recordatorios por SMS</p>
                                    <p className="text-sm text-muted-foreground">Recibe recordatorios por mensaje de texto</p>
                                </div>
                                <Switch
                                    checked={notifications.smsReminders}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, smsReminders: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Resultados de Laboratorio</p>
                                    <p className="text-sm text-muted-foreground">Notificar cuando los resultados estén listos</p>
                                </div>
                                <Switch
                                    checked={notifications.labResults}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, labResults: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Citas</p>
                                    <p className="text-sm text-muted-foreground">Notificaciones sobre citas programadas</p>
                                </div>
                                <Switch
                                    checked={notifications.appointments}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, appointments: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Facturación</p>
                                    <p className="text-sm text-muted-foreground">Alertas de pagos pendientes</p>
                                </div>
                                <Switch
                                    checked={notifications.billing}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, billing: checked })
                                    }
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleSaveProfile} disabled={loading}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Preferencias
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Seguridad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Contraseña Actual</Label>
                                <Input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nueva Contraseña</Label>
                                <Input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Confirmar Nueva Contraseña</Label>
                                <Input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleChangePassword} disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Shield className="h-4 w-4 mr-2" />
                                    )}
                                    Cambiar Contraseña
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
