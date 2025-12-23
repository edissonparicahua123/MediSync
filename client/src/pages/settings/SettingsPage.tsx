import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Settings as SettingsIcon,
    User,
    Palette,
    Users,
    Bell,
    Shield,
    Server,
    Save,
    Upload,
    Eye,
    LogOut,
    Download,
    Activity,
    CheckCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { usersAPI, systemAPI } from '@/services/api'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account')
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()

    // Account Settings
    const [accountData, setAccountData] = useState({
        name: '',
        userId: '',
        email: '',
        avatar: '',
    })

    // Theme Settings
    const [themeSettings, setThemeSettings] = useState({
        theme: 'light',
        primaryColor: '#3b82f6',
        font: 'inter',
        dashboardLayout: 'grid',
    })

    // Notification Settings
    const [notifications, setNotifications] = useState({
        email: true,
        emergency: true,
        appointments: true,
        laboratory: true,
        pharmacy: false,
    })

    // Security Settings
    const [security, setSecurity] = useState({
        twoFactor: false,
    })

    // Active Sessions (Mock for now as backend doesn't support session tracking yet)
    const [activeSessions] = useState([
        {
            id: '1',
            device: 'Chrome en Windows',
            location: 'Local',
            ip: '127.0.0.1',
            lastActive: new Date(),
            current: true,
        },
    ])

    // Recent Activity (Mock)
    const [recentActivity] = useState([
        {
            id: '1',
            action: 'Inicio de Sesión',
            timestamp: new Date(),
            ip: '127.0.0.1',
        },
    ])

    // System Status
    const [systemStatus, setSystemStatus] = useState({
        server: 'offline',
        database: 'offline',
        api: 'offline',
        uptime: '0s',
        version: '1.0.0',
        lastBackup: new Date(),
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [profileRes, systemRes] = await Promise.all([
                usersAPI.getProfile(),
                systemAPI.getStatus()
            ])

            const user = profileRes.data
            // Populate Account Data
            setAccountData({
                name: `${user.firstName} ${user.lastName}`,
                userId: user.id,
                email: user.email,
                avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
            })

            // Populate Preferences (Theme/Notifications)
            if (user.preferences) {
                if (user.preferences.theme) setThemeSettings(user.preferences.theme)
                if (user.preferences.notifications) setNotifications(user.preferences.notifications)
                if (user.preferences.security) setSecurity(user.preferences.security)
            }

            // Populate System Status
            const sys = systemRes.data
            setSystemStatus({
                server: sys.server,
                database: sys.database,
                api: sys.api,
                uptime: `${Math.floor(sys.uptime / 60)} min`, // Simple fmt
                version: sys.version,
                lastBackup: new Date(), // Mock backup date
            })

        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'No se pudo cargar la configuración',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAccount = async () => {
        try {
            // Split name
            const [firstName, ...lastNameParts] = accountData.name.split(' ')
            const lastName = lastNameParts.join(' ')

            await usersAPI.updateProfile({
                firstName,
                lastName,
                email: accountData.email,
                avatar: accountData.avatar,
            })

            toast({
                title: 'Cuenta Actualizada',
                description: 'La configuración de su cuenta ha sido guardada',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error al actualizar cuenta',
                variant: 'destructive',
            })
        }
    }

    const handleSavePreferences = async (section: 'theme' | 'notifications' | 'security') => {
        try {
            const preferences = {
                theme: section === 'theme' ? themeSettings : undefined,
                notifications: section === 'notifications' ? notifications : undefined,
                security: section === 'security' ? security : undefined,
            }
            // Need to merge with existing preferences?
            // The API patch typically merges top-level, but JSON merge depends on backend logic.
            // For simplicity, we send the whole preferences object constructed from state.

            const fullPreferences = {
                theme: themeSettings,
                notifications: notifications,
                security: security
            }

            await usersAPI.updateProfile({
                preferences: fullPreferences
            })

            toast({
                title: 'Preferencias Actualizadas',
                description: 'Sus preferencias han sido guardadas',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error al guardar preferencias',
                variant: 'destructive',
            })
        }
    }

    const handleEnable2FA = () => {
        const newSecurity = { ...security, twoFactor: !security.twoFactor }
        setSecurity(newSecurity)
        // Auto-save security pref
        // Ideally calling handleSavePreferences('security') but state update is async.
        // We will just show toast and let user click save, or save immediately after state update (difficult here).
        // Let's defer save to a explicit save or use effect. For now, just toggling UI.
    }

    const handleLogoutAllDevices = () => {
        toast({
            title: 'Sesiones Terminadas',
            description: 'Se ha cerrado sesión en todos los demás dispositivos (Simulado)',
        })
    }

    const handleCreateBackup = () => {
        toast({
            title: 'Respaldo Iniciado',
            description: 'Se está creando el respaldo de la base de datos',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                    <p className="text-muted-foreground">
                        Gestiona tu cuenta y preferencias del sistema
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="account">
                        <User className="h-4 w-4 mr-2" />
                        Cuenta
                    </TabsTrigger>
                    <TabsTrigger value="personalization">
                        <Palette className="h-4 w-4 mr-2" />
                        Personalización
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                        <Users className="h-4 w-4 mr-2" />
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notificaciones
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Seguridad
                    </TabsTrigger>
                    <TabsTrigger value="system">
                        <Server className="h-4 w-4 mr-2" />
                        Sistema
                    </TabsTrigger>
                </TabsList>

                {/* 1. Account Configuration */}
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Perfil</CardTitle>
                            <CardDescription>Actualiza tu información personal</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={accountData.avatar} />
                                    <AvatarFallback>{accountData.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Cambiar Foto
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre Completo</Label>
                                    <Input
                                        value={accountData.name}
                                        onChange={(e) =>
                                            setAccountData({ ...accountData, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={accountData.email}
                                        onChange={(e) =>
                                            setAccountData({ ...accountData, email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <Button onClick={handleSaveAccount}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cambiar Contraseña</CardTitle>
                            <CardDescription>Actualiza tu contraseña</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Contraseña Actual</Label>
                                <Input type="password" />
                            </div>
                            <div>
                                <Label>Nueva Contraseña</Label>
                                <Input type="password" />
                            </div>
                            <div>
                                <Label>Confirmar Nueva Contraseña</Label>
                                <Input type="password" />
                            </div>
                            <Button>Actualizar Contraseña</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. Personalization */}
                <TabsContent value="personalization" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Tema (Persistente)</CardTitle>
                            <CardDescription>Personaliza la apariencia</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Modo de Tema</Label>
                                <Select
                                    value={themeSettings.theme}
                                    onValueChange={(value) =>
                                        setThemeSettings({ ...themeSettings, theme: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Claro</SelectItem>
                                        <SelectItem value="dark">Oscuro</SelectItem>
                                        <SelectItem value="auto">Auto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Diseño del Panel</Label>
                                <Select
                                    value={themeSettings.dashboardLayout}
                                    onValueChange={(value) =>
                                        setThemeSettings({ ...themeSettings, dashboardLayout: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grid">Cuadrícula</SelectItem>
                                        <SelectItem value="list">Lista</SelectItem>
                                        <SelectItem value="compact">Compacto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => handleSavePreferences('theme')}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Preferencias
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. Role Preferences (Placeholder) */}
                <TabsContent value="roles" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos Predeterminados</CardTitle>
                            <CardDescription>Esta funcionalidad estará disponible pronto.</CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>

                {/* 4. Notifications */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Preferencias de Notificación</CardTitle>
                            <CardDescription>Gestiona cómo recibes notificaciones</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Notificaciones por Correo</p>
                                </div>
                                <Switch
                                    checked={notifications.email}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, email: checked })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Alertas de Emergencia</p>
                                </div>
                                <Switch
                                    checked={notifications.emergency}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, emergency: checked })
                                    }
                                />
                            </div>
                            <Button onClick={() => handleSavePreferences('notifications')}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Preferencias
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 5. Security */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Seguridad</CardTitle>
                            <CardDescription>Configuración de seguridad de cuenta</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Habilitar 2FA</p>
                                    <p className="text-sm text-muted-foreground">
                                        Requerir código adicional (Simulado)
                                    </p>
                                </div>
                                <Switch checked={security.twoFactor} onCheckedChange={handleEnable2FA} />
                            </div>
                            <Button onClick={() => handleSavePreferences('security')}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Seguridad
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 6. System */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado del Servidor</CardTitle>
                            <CardDescription>Salud en tiempo real del sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>Servidor</span>
                                    <Badge className={systemStatus.server === 'online' ? "bg-green-600" : "bg-red-600"}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.server}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Base de Datos</span>
                                    <Badge className={systemStatus.database === 'online' ? "bg-green-600" : "bg-red-600"}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.database}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tiempo de Actividad</span>
                                    <span className="font-mono text-sm">{systemStatus.uptime}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
