import { useState } from 'react'
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
    XCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account')
    const { toast } = useToast()

    // Account Settings
    const [accountData, setAccountData] = useState({
        name: 'Dr. Juan Pérez',
        email: 'juan.perez@medisync.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
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

    // Active Sessions
    const [activeSessions] = useState([
        {
            id: '1',
            device: 'Chrome en Windows',
            location: 'Nueva York, EE. UU.',
            ip: '192.168.1.100',
            lastActive: new Date(),
            current: true,
        },
        {
            id: '2',
            device: 'Safari en iPhone',
            location: 'Nueva York, EE. UU.',
            ip: '192.168.1.101',
            lastActive: new Date(Date.now() - 3600000),
            current: false,
        },
    ])

    // Recent Activity
    const [recentActivity] = useState([
        {
            id: '1',
            action: 'Inicio de Sesión',
            timestamp: new Date(),
            ip: '192.168.1.100',
        },
        {
            id: '2',
            action: 'Registro de paciente actualizado',
            timestamp: new Date(Date.now() - 1800000),
            ip: '192.168.1.100',
        },
        {
            id: '3',
            action: 'Reporte generado',
            timestamp: new Date(Date.now() - 3600000),
            ip: '192.168.1.100',
        },
    ])

    // System Status
    const [systemStatus] = useState({
        server: 'en línea',
        database: 'en línea',
        api: 'en línea',
        uptime: '15 días, 4 horas',
        version: '2.5.0',
        lastBackup: new Date(Date.now() - 86400000),
    })

    const handleSaveAccount = () => {
        toast({
            title: 'Cuenta Actualizada',
            description: 'La configuración de su cuenta ha sido guardada',
        })
    }

    const handleSaveTheme = () => {
        toast({
            title: 'Tema Actualizado',
            description: 'Sus preferencias de tema han sido guardadas',
        })
    }

    const handleSaveNotifications = () => {
        toast({
            title: 'Notificaciones Actualizadas',
            description: 'Sus preferencias de notificaciones han sido guardadas',
        })
    }

    const handleEnable2FA = () => {
        setSecurity({ ...security, twoFactor: !security.twoFactor })
        toast({
            title: security.twoFactor ? '2FA Desactivado' : '2FA Activado',
            description: security.twoFactor
                ? 'La autenticación de dos factores ha sido desactivada'
                : 'La autenticación de dos factores ha sido activada',
        })
    }

    const handleLogoutAllDevices = () => {
        toast({
            title: 'Sesiones Terminadas',
            description: 'Se ha cerrado sesión en todos los demás dispositivos',
        })
    }

    const handleCreateBackup = () => {
        toast({
            title: 'Respaldo Iniciado',
            description: 'Se está creando el respaldo de la base de datos',
        })
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Actividad Reciente</CardTitle>
                            <CardDescription>Tu actividad de cuenta reciente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Acción</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Dirección IP</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentActivity.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell>{activity.action}</TableCell>
                                            <TableCell>{format(activity.timestamp, 'PPp')}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {activity.ip}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. Personalization */}
                <TabsContent value="personalization" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración de Tema</CardTitle>
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
                                <Label>Color Primario</Label>
                                <div className="flex gap-2 mt-2">
                                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(
                                        (color) => (
                                            <button
                                                key={color}
                                                onClick={() =>
                                                    setThemeSettings({
                                                        ...themeSettings,
                                                        primaryColor: color,
                                                    })
                                                }
                                                className={`w-10 h-10 rounded-full border-2 ${themeSettings.primaryColor === color
                                                    ? 'border-black'
                                                    : 'border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        )
                                    )}
                                </div>
                            </div>
                            <div>
                                <Label>Fuente</Label>
                                <Select
                                    value={themeSettings.font}
                                    onValueChange={(value) =>
                                        setThemeSettings({ ...themeSettings, font: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inter">Inter</SelectItem>
                                        <SelectItem value="roboto">Roboto</SelectItem>
                                        <SelectItem value="poppins">Poppins</SelectItem>
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
                            <Button onClick={handleSaveTheme}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Tema
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Visibilidad de Módulos</CardTitle>
                            <CardDescription>Habilitar o deshabilitar módulos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                'Citas',
                                'Emergencia',
                                'Farmacia',
                                'Laboratorio',
                                'Facturación',
                                'Reportes',
                                'Analítica',
                                'RRHH',
                                'Mensajes',
                                'Funciones IA',
                            ].map((module) => (
                                <div key={module} className="flex items-center justify-between">
                                    <span>{module}</span>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. Role Preferences */}
                <TabsContent value="roles" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos Predeterminados por Rol</CardTitle>
                            <CardDescription>Configurar permisos predeterminados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Admin', 'Doctor', 'Enfermera(o)', 'Recepción'].map((role) => (
                                    <div key={role} className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-3">{role}</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                'Ver Pacientes',
                                                'Editar Pacientes',
                                                'Eliminar Pacientes',
                                                'Ver Reportes',
                                                'Generar Reportes',
                                                'Gestionar Facturación',
                                            ].map((permission) => (
                                                <div
                                                    key={permission}
                                                    className="flex items-center justify-between text-sm"
                                                >
                                                    <span>{permission}</span>
                                                    <Switch defaultChecked={role === 'Admin'} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Auto-Configuración por Área</CardTitle>
                            <CardDescription>Configuración automática por departamento</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['Emergencia', 'Cardiología', 'Pediatría', 'Cirugía'].map((area) => (
                                <div key={area} className="flex items-center justify-between">
                                    <span>Departamento de {area}</span>
                                    <Switch defaultChecked />
                                </div>
                            ))}
                        </CardContent>
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
                                    <p className="text-sm text-muted-foreground">
                                        Recibir notificaciones vía email
                                    </p>
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
                                    <p className="text-sm text-muted-foreground">
                                        Notificaciones críticas de emergencia
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.emergency}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, emergency: checked })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Alertas de Citas</p>
                                    <p className="text-sm text-muted-foreground">
                                        Recordatorios de próximas citas
                                    </p>
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
                                    <p className="font-medium">Alertas de Laboratorio</p>
                                    <p className="text-sm text-muted-foreground">
                                        Resultados de laboratorio y actualizaciones
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.laboratory}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, laboratory: checked })
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Alertas de Farmacia</p>
                                    <p className="text-sm text-muted-foreground">
                                        Alertas de medicación e inventario
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.pharmacy}
                                    onCheckedChange={(checked) =>
                                        setNotifications({ ...notifications, pharmacy: checked })
                                    }
                                />
                            </div>
                            <Button onClick={handleSaveNotifications}>
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
                            <CardTitle>Autenticación de Dos Factores</CardTitle>
                            <CardDescription>Agrega una capa extra de seguridad</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Habilitar 2FA</p>
                                    <p className="text-sm text-muted-foreground">
                                        Requerir un código además de tu contraseña
                                    </p>
                                </div>
                                <Switch checked={security.twoFactor} onCheckedChange={handleEnable2FA} />
                            </div>
                            {security.twoFactor && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        ✓ Autenticación de dos factores habilitada
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sesiones Activas</CardTitle>
                            <CardDescription>Gestiona tus sesiones activas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dispositivo</TableHead>
                                        <TableHead>Ubicación</TableHead>
                                        <TableHead>Dirección IP</TableHead>
                                        <TableHead>Último Activo</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {session.device}
                                                    {session.current && (
                                                        <Badge variant="outline">Actual</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{session.location}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {session.ip}
                                            </TableCell>
                                            <TableCell>{format(session.lastActive, 'PPp')}</TableCell>
                                            <TableCell>
                                                {!session.current && (
                                                    <Button variant="outline" size="sm">
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button variant="destructive" className="mt-4" onClick={handleLogoutAllDevices}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar sesión en otros dispositivos
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Auditoría de Acceso</CardTitle>
                            <CardDescription>Ver tu historial de acceso</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Registro de Auditoría Completo
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 6. System */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado del Servidor</CardTitle>
                            <CardDescription>Salud actual del sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>Servidor</span>
                                    <Badge className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.server}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Base de Datos</span>
                                    <Badge className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.database}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>API</span>
                                    <Badge className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.api}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tiempo de Actividad</span>
                                    <span className="font-mono text-sm">{systemStatus.uptime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Versión</span>
                                    <Badge variant="outline">v{systemStatus.version}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Respaldos</CardTitle>
                            <CardDescription>Gestión de respaldos de base de datos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Último Respaldo</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(systemStatus.lastBackup, 'PPp')}
                                    </p>
                                </div>
                                <Button onClick={handleCreateBackup}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Crear Respaldo
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Registros del Sistema</CardTitle>
                            <CardDescription>Ver registros de actividad del sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">
                                <Activity className="h-4 w-4 mr-2" />
                                Ver Registros
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
