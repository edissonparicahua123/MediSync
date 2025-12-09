import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Shield,
    Plus,
    Loader2,
    Users,
    Settings,
    Database,
    Key,
    Mail,
    Clock,
    DollarSign,
    Brain,
    Image as ImageIcon,
    Download,
    Upload,
    CheckCircle,
} from 'lucide-react'
import { adminAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('users')
    const [userModalOpen, setUserModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const { toast } = useToast()

    // Datos de admin
    const [adminData, setAdminData] = useState<any>({
        users: [],
        settings: {},
        backups: [],
    })

    useEffect(() => {
        loadAdminData()
    }, [])

    const loadAdminData = async () => {
        try {
            setLoading(true)

            // Datos simulados profesionales
            const simulatedData = {
                // A. Usuarios
                users: [
                    {
                        id: '1',
                        name: 'Usuario Admin',
                        email: 'admin@medisync.com',
                        role: 'ADMIN',
                        status: 'ACTIVE',
                        permissions: ['ALL'],
                        lastLogin: new Date(),
                    },
                    {
                        id: '2',
                        name: 'Dr. John Smith',
                        email: 'john.smith@medisync.com',
                        role: 'DOCTOR',
                        status: 'ACTIVE',
                        permissions: ['PATIENTS', 'APPOINTMENTS', 'MEDICAL_RECORDS'],
                        lastLogin: new Date(Date.now() - 3600000),
                    },
                    {
                        id: '3',
                        name: 'Enf. Sarah',
                        email: 'sarah@medisync.com',
                        role: 'NURSE',
                        status: 'ACTIVE',
                        permissions: ['PATIENTS', 'APPOINTMENTS'],
                        lastLogin: new Date(Date.now() - 7200000),
                    },
                    {
                        id: '4',
                        name: 'Recepción Mike',
                        email: 'mike@medisync.com',
                        role: 'RECEPTIONIST',
                        status: 'ACTIVE',
                        permissions: ['APPOINTMENTS', 'BILLING'],
                        lastLogin: new Date(Date.now() - 86400000),
                    },
                ],

                // B. Configuraciones del sistema
                settings: {
                    logo: 'https://via.placeholder.com/150',
                    hospitalName: 'MediSync Enterprise Hospital',
                    email: 'contact@medisync.com',
                    phone: '+1 (555) 123-4567',
                    address: '123 Medical Center Dr, City, State 12345',
                    openingHours: {
                        monday: { open: '08:00', close: '20:00', enabled: true },
                        tuesday: { open: '08:00', close: '20:00', enabled: true },
                        wednesday: { open: '08:00', close: '20:00', enabled: true },
                        thursday: { open: '08:00', close: '20:00', enabled: true },
                        friday: { open: '08:00', close: '20:00', enabled: true },
                        saturday: { open: '09:00', close: '14:00', enabled: true },
                        sunday: { open: '00:00', close: '00:00', enabled: false },
                    },
                    billing: {
                        taxRate: 10,
                        currency: 'USD',
                        invoicePrefix: 'INV',
                        paymentMethods: ['Efectivo', 'Tarjeta de Crédito', 'Seguro'],
                    },
                    ai: {
                        enabled: true,
                        model: 'GPT-4',
                        temperature: 0.7,
                        maxTokens: 2000,
                        features: {
                            triage: true,
                            diagnosis: true,
                            predictions: true,
                        },
                    },
                },

                // C. Backups
                backups: [
                    {
                        id: '1',
                        name: 'backup_2024_12_08_full.sql',
                        type: 'FULL',
                        size: '2.5 GB',
                        createdAt: new Date(),
                        status: 'COMPLETED',
                    },
                    {
                        id: '2',
                        name: 'backup_2024_12_07_full.sql',
                        type: 'FULL',
                        size: '2.4 GB',
                        createdAt: new Date(Date.now() - 86400000),
                        status: 'COMPLETED',
                    },
                    {
                        id: '3',
                        name: 'backup_2024_12_06_incremental.sql',
                        type: 'INCREMENTAL',
                        size: '450 MB',
                        createdAt: new Date(Date.now() - 172800000),
                        status: 'COMPLETED',
                    },
                ],
            }

            setAdminData(simulatedData)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar datos de admin',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = (userId: string) => {
        toast({
            title: 'Contraseña Restablecida',
            description: 'Email de restablecimiento enviado exitosamente',
        })
    }

    const handleCreateBackup = () => {
        toast({
            title: 'Respaldo Iniciado',
            description: 'La copia de seguridad se está creando...',
        })
    }

    const handleRestoreBackup = (backupId: string) => {
        toast({
            title: 'Restauración Iniciada',
            description: 'Proceso de restauración iniciado',
        })
    }

    const handleSaveSettings = () => {
        toast({
            title: 'Configuración Guardada',
            description: 'Ajustes del sistema actualizados exitosamente',
        })
    }

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: 'bg-purple-100 text-purple-800',
            DOCTOR: 'bg-blue-100 text-blue-800',
            NURSE: 'bg-green-100 text-green-800',
            RECEPTIONIST: 'bg-orange-100 text-orange-800',
        }
        return colors[role] || colors.RECEPTIONIST
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-red-100 text-red-800',
            SUSPENDED: 'bg-orange-100 text-orange-800',
        }
        return colors[status] || colors.ACTIVE
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
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Administración del Sistema</h1>
                        <p className="text-muted-foreground">
                            Gestión de usuarios, configuración y copias de seguridad
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="users">
                        <Users className="h-4 w-4 mr-2" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuración
                    </TabsTrigger>
                    <TabsTrigger value="backups">
                        <Database className="h-4 w-4 mr-2" />
                        Respaldos
                    </TabsTrigger>
                </TabsList>

                {/* A. Users Tab */}
                <TabsContent value="users" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Gestión de Usuarios</CardTitle>
                                    <CardDescription>Gestionar usuarios, roles y permisos</CardDescription>
                                </div>
                                <Button onClick={() => setUserModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Usuario
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Último Acceso</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                                                    {({
                                                        'ADMIN': 'ADMIN',
                                                        'DOCTOR': 'DOCTOR',
                                                        'NURSE': 'ENFERMERA/O',
                                                        'RECEPTIONIST': 'RECEPCIÓN'
                                                    } as Record<string, string>)[user.role] || user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(user.status)}`}>
                                                    {({
                                                        'ACTIVE': 'ACTIVO',
                                                        'INACTIVE': 'INACTIVO',
                                                        'SUSPENDED': 'SUSPENDIDO'
                                                    } as Record<string, string>)[user.status] || user.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(user.lastLogin, 'PPp', { locale: es })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedUser(user)
                                                            setUserModalOpen(true)
                                                        }}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleResetPassword(user.id)}
                                                    >
                                                        <Key className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* B. System Settings Tab */}
                <TabsContent value="settings" className="mt-4 space-y-6">
                    {/* Logo & Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Logo e Información Básica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={adminData.settings.logo}
                                    alt="Logo del Hospital"
                                    className="w-24 h-24 rounded border"
                                />
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Subir Logo
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nombre del Hospital</Label>
                                    <Input defaultValue={adminData.settings.hospitalName} />
                                </div>
                                <div>
                                    <Label>Teléfono</Label>
                                    <Input defaultValue={adminData.settings.phone} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input type="email" defaultValue={adminData.settings.email} />
                                </div>
                                <div>
                                    <Label>Dirección</Label>
                                    <Input defaultValue={adminData.settings.address} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hospital Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Horario de Atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(adminData.settings.openingHours).map(([day, hours]: [string, any]) => (
                                    <div key={day} className="flex items-center gap-4">
                                        <div className="w-32">
                                            <span className="font-medium capitalize">
                                                {({
                                                    'monday': 'Lunes', 'tuesday': 'Martes', 'wednesday': 'Miércoles',
                                                    'thursday': 'Jueves', 'friday': 'Viernes', 'saturday': 'Sábado',
                                                    'sunday': 'Domingo'
                                                } as Record<string, string>)[day] || day}
                                            </span>
                                        </div>
                                        <Switch defaultChecked={hours.enabled} />
                                        <Input
                                            type="time"
                                            defaultValue={hours.open}
                                            className="w-32"
                                            disabled={!hours.enabled}
                                        />
                                        <span>a</span>
                                        <Input
                                            type="time"
                                            defaultValue={hours.close}
                                            className="w-32"
                                            disabled={!hours.enabled}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing Parameters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Parámetros de Facturación
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tasa de Impuesto (%)</Label>
                                    <Input type="number" defaultValue={adminData.settings.billing.taxRate} />
                                </div>
                                <div>
                                    <Label>Moneda</Label>
                                    <Select defaultValue={adminData.settings.billing.currency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Prefijo de Factura</Label>
                                    <Input defaultValue={adminData.settings.billing.invoicePrefix} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Configuración de Panel IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Habilitar Funciones IA</p>
                                    <p className="text-sm text-muted-foreground">
                                        Activar diagnósticos y predicciones impulsados por IA
                                    </p>
                                </div>
                                <Switch defaultChecked={adminData.settings.ai.enabled} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Modelo IA</Label>
                                    <Select defaultValue={adminData.settings.ai.model}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GPT-4">GPT-4</SelectItem>
                                            <SelectItem value="GPT-3.5">GPT-3.5</SelectItem>
                                            <SelectItem value="Claude">Claude</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Temperatura</Label>
                                    <Input type="number" step="0.1" defaultValue={adminData.settings.ai.temperature} />
                                </div>
                                <div>
                                    <Label>Máx Tokens</Label>
                                    <Input type="number" defaultValue={adminData.settings.ai.maxTokens} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">Funciones IA</p>
                                <div className="flex items-center justify-between">
                                    <span>Asistente de Triage</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.triage} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Soporte de Diagnóstico</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.diagnosis} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Analítica Predictiva</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.predictions} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={handleSaveSettings} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Guardar Toda la Configuración
                    </Button>
                </TabsContent>

                {/* C. Backups Tab */}
                <TabsContent value="backups" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Respaldos de Base de Datos</CardTitle>
                                    <CardDescription>Crear y restaurar copias de seguridad</CardDescription>
                                </div>
                                <Button onClick={handleCreateBackup}>
                                    <Database className="h-4 w-4 mr-2" />
                                    Crear Respaldo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Tamaño</TableHead>
                                        <TableHead>Creado El</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.backups.map((backup: any) => (
                                        <TableRow key={backup.id}>
                                            <TableCell className="font-medium font-mono text-sm">
                                                {backup.name}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${backup.type === 'FULL'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {backup.type === 'FULL' ? 'COMPLETO' : 'INCREMENTAL'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{backup.size}</TableCell>
                                            <TableCell>{format(backup.createdAt, 'PPp', { locale: es })}</TableCell>
                                            <TableCell>
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                    {backup.status === 'COMPLETED' ? 'COMPLETADO' : backup.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestoreBackup(backup.id)}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Restaurar
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Modal */}
            <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                        <DialogDescription>
                            Gestionar información del usuario, rol y permisos
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Nombre</Label>
                            <Input placeholder="Ingresar nombre" defaultValue={selectedUser?.name} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" placeholder="Ingresar email" defaultValue={selectedUser?.email} />
                        </div>
                        <div>
                            <Label>Rol</Label>
                            <Select defaultValue={selectedUser?.role || 'RECEPTIONIST'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                                    <SelectItem value="NURSE">Enfermera(o)</SelectItem>
                                    <SelectItem value="RECEPTIONIST">Recepción</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Permisos</Label>
                            <div className="space-y-2 mt-2">
                                {['PATIENTS', 'APPOINTMENTS', 'MEDICAL_RECORDS', 'BILLING', 'REPORTS'].map(perm => (
                                    <div key={perm} className="flex items-center justify-between">
                                        <span className="text-sm">
                                            {({
                                                'PATIENTS': 'PACIENTES',
                                                'APPOINTMENTS': 'CITAS',
                                                'MEDICAL_RECORDS': 'HISTORIA CLÍNICA',
                                                'BILLING': 'FACTURACIÓN',
                                                'REPORTS': 'REPORTES'
                                            } as Record<string, string>)[perm] || perm}
                                        </span>
                                        <Switch defaultChecked={selectedUser?.permissions?.includes(perm)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={() => {
                            toast({
                                title: 'Usuario Guardado',
                                description: 'Información de usuario actualizada exitosamente',
                            })
                            setUserModalOpen(false)
                            setSelectedUser(null)
                        }}>
                            Guardar Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}
