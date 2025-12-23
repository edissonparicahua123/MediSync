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
    // Mail,
    Clock,
    DollarSign,
    Brain,
    Image as ImageIcon,
    Download,
    Upload,
    CheckCircle,
} from 'lucide-react'
import { adminAPI, usersAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('users')
    const [userModalOpen, setUserModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const { toast } = useToast()

    // Form states for New/Edit User
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: '',
        status: 'ACTIVE',
        permissions: [] as string[]
    })

    // Data containers
    const [adminData, setAdminData] = useState<any>({
        users: [],
        roles: [],
        settings: {
            hospitalName: '',
            email: '',
            phone: '',
            address: '',
            logo: '',
            openingHours: {},
            billing: {},
            ai: { features: {} },
        },
        backups: [],
    })

    useEffect(() => {
        loadAdminData()
    }, [])

    const loadAdminData = async () => {
        try {
            setLoading(true)
            const [usersRes, rolesRes, orgRes, backupsRes] = await Promise.all([
                usersAPI.getAll({ limit: 100 }),
                usersAPI.getRoles(),
                adminAPI.getOrganization(),
                adminAPI.getBackups()
            ])

            setAdminData({
                users: usersRes.data.data,
                roles: rolesRes.data || [],
                settings: orgRes.data,
                backups: backupsRes.data,
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'Error al cargar datos de administración',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSaveUser = async () => {
        try {
            if (!userData.roleId) {
                toast({ title: 'Error', description: 'Selecciona un rol', variant: 'destructive' })
                return
            }

            const payload = {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                roleId: userData.roleId, // Should be UUID
                isActive: userData.status === 'ACTIVE',
                password: userData.password || undefined, // Only send if set
                preferences: { // Prisma User model stores preferences as Json
                    permissions: userData.permissions
                }
            }

            if (selectedUser) {
                await usersAPI.update(selectedUser.id, payload)
                toast({ title: 'Usuario Actualizado' })
            } else {
                if (!userData.password) {
                    toast({ title: 'Error', description: 'La contraseña es requerida', variant: 'destructive' })
                    return
                }
                await usersAPI.create(payload)
                toast({ title: 'Usuario Creado' })
            }
            setUserModalOpen(false)
            loadAdminData()
        } catch (error: any) {
            console.error(error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al guardar usuario',
                variant: 'destructive',
            })
        }
    }

    const handleOpenUserModal = (user: any = null) => {
        setSelectedUser(user)
        if (user) {
            setUserData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: '',
                roleId: user.roleId,
                status: user.isActive ? 'ACTIVE' : 'INACTIVE',
                permissions: user.preferences?.permissions || []
            })
        } else {
            // Default to first role if available
            const defaultRole = adminData.roles?.[0]?.id || ''
            setUserData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                roleId: defaultRole,
                status: 'ACTIVE',
                permissions: []
            })
        }
        setUserModalOpen(true)
    }

    const handleResetPassword = (userId: string) => {
        toast({
            title: 'Contraseña Restablecida',
            description: 'Email de restablecimiento enviado exitosamente (Simulado)',
        })
    }

    const handleCreateBackup = async () => {
        try {
            await adminAPI.createBackup()
            toast({
                title: 'Respaldo Creado',
                description: 'La copia de seguridad se ha completado',
            })
            loadAdminData()
        } catch (error) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    const handleRestoreBackup = (backupId: string) => {
        toast({
            title: 'Restauración Iniciada',
            description: 'Proceso de restauración iniciado (Simulado)',
        })
    }

    const handleSaveSettings = async () => {
        try {
            await adminAPI.updateOrganization(adminData.settings)
            toast({
                title: 'Configuración Guardada',
                description: 'Ajustes del sistema actualizados exitosamente',
            })
        } catch (error) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    // Helper to update deeply nested settings state
    const updateSetting = (path: string, value: any) => {
        const keys = path.split('.')
        setAdminData((prev: any) => {
            const newSettings = JSON.parse(JSON.stringify(prev.settings))
            let current = newSettings
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {}
                current = current[keys[i]]
            }
            current[keys[keys.length - 1]] = value
            return { ...prev, settings: newSettings }
        })
    }

    const getRoleBadge = (roleName: string) => {
        // Simple mapping based on Role Name
        const colors: Record<string, string> = {
            'Admin': 'bg-purple-100 text-purple-800',
            'Doctor': 'bg-blue-100 text-blue-800',
            'Nurse': 'bg-green-100 text-green-800',
            'Receptionist': 'bg-orange-100 text-orange-800',
            'ADMIN': 'bg-purple-100 text-purple-800', // Fallback caps
            'DOCTOR': 'bg-blue-100 text-blue-800',
        }
        const match = Object.keys(colors).find(key => roleName?.includes(key))
        return match ? colors[match] : colors['Receptionist']
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    // Use default hours if not present
    const hours = adminData.settings.openingHours || {}
    const billing = adminData.settings.billing || {}
    const ai = adminData.settings.ai || { features: {} }

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
                                <Button onClick={() => handleOpenUserModal(null)}>
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
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role?.name)}`}>
                                                    {user.role?.name || 'Sin Rol'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.isActive ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenUserModal(user)}
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
                                    src={adminData.settings.logo || 'https://via.placeholder.com/150'}
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
                                    <Input
                                        value={adminData.settings.hospitalName || ''}
                                        onChange={(e) => updateSetting('hospitalName', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Teléfono</Label>
                                    <Input
                                        value={adminData.settings.phone || ''}
                                        onChange={(e) => updateSetting('phone', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={adminData.settings.email || ''}
                                        onChange={(e) => updateSetting('email', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Dirección</Label>
                                    <Input
                                        value={adminData.settings.address || ''}
                                        onChange={(e) => updateSetting('address', e.target.value)}
                                    />
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
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                    const dayHours = hours[day] || { open: '', close: '', enabled: false };
                                    return (
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
                                            <Switch
                                                checked={!!dayHours.enabled}
                                                onCheckedChange={(c) => updateSetting(`openingHours.${day}.enabled`, c)}
                                            />
                                            <Input
                                                type="time"
                                                value={dayHours.open || ''}
                                                onChange={(e) => updateSetting(`openingHours.${day}.open`, e.target.value)}
                                                className="w-32"
                                                disabled={!dayHours.enabled}
                                            />
                                            <span>a</span>
                                            <Input
                                                type="time"
                                                value={dayHours.close || ''}
                                                onChange={(e) => updateSetting(`openingHours.${day}.close`, e.target.value)}
                                                className="w-32"
                                                disabled={!dayHours.enabled}
                                            />
                                        </div>
                                    );
                                })}
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
                                    <Input
                                        type="number"
                                        value={billing.taxRate || ''}
                                        onChange={(e) => updateSetting('billing.taxRate', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label>Moneda</Label>
                                    <Select
                                        value={billing.currency || 'USD'}
                                        onValueChange={(v) => updateSetting('billing.currency', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="PEN">PEN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Prefijo de Factura</Label>
                                    <Input
                                        value={billing.invoicePrefix || ''}
                                        onChange={(e) => updateSetting('billing.invoicePrefix', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                Configuración de Panel IA (Beta)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Habilitar Funciones IA</p>
                                </div>
                                <Switch
                                    checked={!!ai.enabled}
                                    onCheckedChange={(c) => updateSetting('ai.enabled', c)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Modelo IA</Label>
                                    <Select
                                        value={ai.model || 'GPT-4'}
                                        onValueChange={(v) => updateSetting('ai.model', v)}
                                    >
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
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">Funciones IA</p>
                                <div className="flex items-center justify-between">
                                    <span>Asistente de Triage</span>
                                    <Switch
                                        checked={!!ai.features?.triage}
                                        onCheckedChange={(c) => updateSetting('ai.features.triage', c)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Soporte de Diagnóstico</span>
                                    <Switch
                                        checked={!!ai.features?.diagnosis}
                                        onCheckedChange={(c) => updateSetting('ai.features.diagnosis', c)}
                                    />
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
                                    <CardDescription>Gestión del historial de copias de seguridad</CardDescription>
                                </div>
                                <Button onClick={handleCreateBackup}>
                                    <Database className="h-4 w-4 mr-2" />
                                    Crear Respaldo (Simulado)
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
                                            <TableCell>{format(new Date(backup.createdAt), 'PPp', { locale: es })}</TableCell>
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
                            Gestionar información del usuario
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nombre</Label>
                                <Input
                                    value={userData.firstName || ''}
                                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Apellido</Label>
                                <Input
                                    value={userData.lastName || ''}
                                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={userData.email || ''}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Password {selectedUser && '(Dejar en blanco para mantener actual)'}</Label>
                            <Input
                                type="password"
                                value={userData.password || ''}
                                onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Rol</Label>
                            <Select
                                value={userData.roleId}
                                onValueChange={(v) => setUserData({ ...userData, roleId: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {adminData.roles.map((role: any) => (
                                        <SelectItem key={role.id} value={role.id}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Estado</Label>
                            <Select
                                value={userData.status || 'ACTIVE'}
                                onValueChange={(v) => setUserData({ ...userData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Permisos Adicionales</Label>
                            <div className="space-y-2 mt-2">
                                {['PATIENTS', 'APPOINTMENTS', 'MEDICAL_RECORDS', 'BILLING', 'REPORTS'].map(perm => (
                                    <div key={perm} className="flex items-center justify-between">
                                        <span className="text-sm">{perm}</span>
                                        <Switch
                                            checked={userData.permissions.includes(perm)}
                                            onCheckedChange={(checked) => {
                                                const newPerms = checked
                                                    ? [...userData.permissions, perm]
                                                    : userData.permissions.filter(p => p !== perm)
                                                setUserData({ ...userData, permissions: newPerms })
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveUser}>
                            Guardar Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}
