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
    // Mail,
    Clock,
    DollarSign,
    Brain,
    Image as ImageIcon,
    Download,
    Upload,
    CheckCircle,
    Calendar,
    Activity,
    LayoutDashboard,
    Stethoscope,
    Bed,
    AlertTriangle,
    Pill,
    FlaskConical,
    Receipt,
    FileText,
    BarChart3,
    UserCog,
    MessageSquare,
    Sliders,
    Trash2,
    Key,
    Pencil,
    User,
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
    // ROLES & DEFAULT PERMISSIONS MAPPING
    // Form states for New/Edit User
    // ROLES & DEFAULT PERMISSIONS MAPPING
    const ROLE_DEFAULTS: Record<string, string[]> = {
        'ADMIN': ['ALL'],
        'DOCTOR': ['DASHBOARD', 'PATIENTS', 'DOCTORS', 'APPOINTMENTS', 'WAITING_ROOM', 'BEDS', 'EMERGENCY', 'LAB_RESULTS', 'PRESCRIPTIONS', 'REPORTS', 'AI', 'MESSAGES'],
        'NURSE': ['DASHBOARD', 'PATIENTS', 'BEDS', 'EMERGENCY', 'VITALS', 'TRIAGE', 'MESSAGES'],
        'RECEPTIONIST': ['DASHBOARD', 'PATIENTS', 'DOCTORS', 'APPOINTMENTS', 'WAITING_ROOM', 'MESSAGES'],
        'LAB': ['DASHBOARD', 'PATIENTS', 'LAB_RESULTS', 'REPORTS', 'MESSAGES'],
        'PHARMACY': ['DASHBOARD', 'PATIENTS', 'PRESCRIPTIONS', 'REPORTS', 'MESSAGES'],
        'HR': ['DASHBOARD', 'HR', 'ANALYTICS', 'REPORTS', 'MESSAGES'],
        'BILLING': ['DASHBOARD', 'PATIENTS', 'BILLING', 'REPORTS', 'MESSAGES'],
        'MANAGEMENT': ['DASHBOARD', 'REPORTS', 'ANALYTICS', 'MESSAGES'],
        'AUDIT': ['DASHBOARD', 'AUDIT', 'SYSTEM', 'REPORTS', 'MESSAGES'],
    }

    const ROLE_DISPLAY_NAMES: Record<string, string> = {
        'ADMIN': 'Administrador',
        'DOCTOR': 'Médico / Doctor',
        'NURSE': 'Enfermero/a',
        'RECEPTIONIST': 'Recepcionista / Admisión',
        'LAB': 'Laboratorio',
        'PHARMACY': 'Farmacia',
        'HR': 'Recursos Humanos',
        'BILLING': 'Facturación / Caja',
        'MANAGEMENT': 'Dirección / Gerencia',
        'AUDIT': 'Auditoría / TI',
        'PATIENT': 'Paciente'
    };

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
            // Try to find the name of this default role to set default perms
            const roleName = adminData.roles?.[0]?.name?.toUpperCase() || ''
            const defaultPerms = ROLE_DEFAULTS[roleName] || []

            setUserData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                roleId: defaultRole,
                status: 'ACTIVE',
                permissions: defaultPerms
            })
        }
        setUserModalOpen(true)
    }

    // Auto-fill permissions when Role changes (only if no existing permissions or user confirms - simpler: just suggestion as requested)
    useEffect(() => {
        if (userModalOpen && !selectedUser && userData.roleId) {
            const role = adminData.roles.find((r: any) => r.id === userData.roleId)
            if (role) {
                const roleName = role.name.toUpperCase()
                const suggestedPerms = ROLE_DEFAULTS[roleName]
                if (suggestedPerms) {
                    setUserData(prev => ({ ...prev, permissions: suggestedPerms }))
                }
            }
        }
    }, [userData.roleId, userModalOpen]) // Depend on roleId changes while modal is open

    const handleResetPassword = async (userId: string) => {
        const newPassword = window.prompt('Ingresa la nueva contraseña para este usuario:');
        if (!newPassword) return; // Cancelled

        try {
            await usersAPI.update(userId, { password: newPassword });
            toast({
                title: 'Contraseña Actualizada',
                description: 'La contraseña ha sido cambiada exitosamente.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cambiar la contraseña',
                variant: 'destructive',
            });
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

        try {
            await usersAPI.delete(userId);
            toast({
                title: 'Usuario Eliminado',
                description: 'El usuario ha sido eliminado correctamente del sistema.',
            });
            loadAdminData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar usuario',
                variant: 'destructive',
            })
        }
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
            'Admin': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 ring-purple-500/40',
            'Doctor': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/40',
            'Nurse': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 ring-green-500/40',
            'Receptionist': 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400 ring-orange-500/40',
            'ADMIN': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-400 ring-purple-500/40', // Fallback caps
            'DOCTOR': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/40',
        }
        const match = Object.keys(colors).find(key => roleName?.includes(key))
        return match ? colors[match] : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400 ring-gray-500/40'
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
        <div className="space-y-8 p-6 pb-20 bg-muted/10 min-h-screen">
            {/* Header Pro - SOLID */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border border-red-200 dark:border-red-800">
                        <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sistema</h1>
                        <p className="text-muted-foreground mt-1 text-base">
                            Control centralizado de seguridad, usuarios y configuraciones
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-muted rounded-md border border-border text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        v2.5.0 Enterprise
                    </div>
                </div>
            </div>

            {/* Tabs Pro - SOLID */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-card p-1 rounded-lg border border-border h-auto w-full justify-start shadow-sm">
                    <TabsTrigger value="users" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 rounded-md px-6 py-3 transition-all flex-1 md:flex-none border border-transparent">
                        <Users className="h-4 w-4 mr-2" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 rounded-md px-6 py-3 transition-all flex-1 md:flex-none border border-transparent">
                        <Settings className="h-4 w-4 mr-2" />
                        Configuración
                    </TabsTrigger>
                    <TabsTrigger value="backups" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary/20 rounded-md px-6 py-3 transition-all flex-1 md:flex-none border border-transparent">
                        <Database className="h-4 w-4 mr-2" />
                        Respaldos
                    </TabsTrigger>
                </TabsList>

                {/* A. Users Tab */}
                <TabsContent value="users" className="mt-6">
                    <Card className="border-t-4 border-t-blue-500 shadow-md bg-card">
                        <CardHeader className="border-b border-border bg-muted/10 px-6 py-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-xl text-blue-700 dark:text-blue-400">Directorio de Usuarios</CardTitle>
                                    <CardDescription>Gestiona el acceso y roles del personal médico</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar usuario..."
                                            className="pl-9 bg-background border-border focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <Button onClick={() => handleOpenUserModal(null)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nuevo Usuario
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-b border-border">
                                        <TableHead className="pl-6 h-12 font-semibold text-foreground">Usuario / Email</TableHead>
                                        <TableHead className="font-semibold text-foreground">Rol Asignado</TableHead>
                                        <TableHead className="font-semibold text-foreground">Estado</TableHead>
                                        <TableHead className="text-right pr-6 font-semibold text-foreground">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.users
                                        .filter((user: any) => {
                                            const rName = user.role?.name || user.role || '';
                                            return String(rName).toUpperCase() !== 'PATIENT';
                                        })
                                        .map((user: any) => {
                                            const getSafeRoleName = (r: any) => {
                                                if (!r) return 'Sin Rol';
                                                let rName = (typeof r === 'object' ? r.name : r) || '';
                                                rName = String(rName).toUpperCase().trim();
                                                if (rName === 'UNDEFINED' || rName === 'NULL' || rName === '') return 'Sin Rol';
                                                return ROLE_DISPLAY_NAMES[rName] || rName;
                                            }

                                            return (
                                                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {user.firstName} {user.lastName}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground font-light">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${getRoleBadge(user.role?.name)}`}>
                                                            {getSafeRoleName(user.role)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500'}`} />
                                                            <span className={`text-sm font-medium ${user.isActive ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                                                                onClick={() => handleOpenUserModal(user)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 hover:bg-orange-500/10 hover:text-orange-600 transition-colors"
                                                                onClick={() => handleResetPassword(user.id)}
                                                            >
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                                                onClick={() => handleDeleteUser(user.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* B. System Settings Tab */}
                <TabsContent value="settings" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* LEFT COLUMN: Identity & Operations */}
                        <div className="space-y-6">
                            {/* Logo & Basic Info */}
                            <Card className="h-full border-t-4 border-t-indigo-500 shadow-md bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                            <ImageIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">Identidad Institucional</CardTitle>
                                            <CardDescription>Información básica de la organización</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start gap-6">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative group">
                                                <img
                                                    src={adminData.settings.logo || 'https://via.placeholder.com/150'}
                                                    alt="Logo"
                                                    className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-muted/10 object-contain p-2 hover:border-indigo-500 transition-colors"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                    <Upload className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8">
                                                Cambiar Logo
                                            </Button>
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Nombre de la Institución</Label>
                                                <Input
                                                    value={adminData.settings.hospitalName || ''}
                                                    onChange={(e) => updateSetting('hospitalName', e.target.value)}
                                                    className="font-medium text-lg h-11 bg-background border-border focus:border-indigo-500"
                                                    placeholder="Ej. Centro Médico Central"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Dirección Física</Label>
                                                <Input
                                                    value={adminData.settings.address || ''}
                                                    onChange={(e) => updateSetting('address', e.target.value)}
                                                    className="bg-background border-border focus:border-indigo-500"
                                                    placeholder="Ej. Av. Principal 123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Teléfono de Contacto</Label>
                                            <Input
                                                value={adminData.settings.phone || ''}
                                                onChange={(e) => updateSetting('phone', e.target.value)}
                                                className="bg-background border-border focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Email de Soporte</Label>
                                            <Input
                                                type="email"
                                                value={adminData.settings.email || ''}
                                                onChange={(e) => updateSetting('email', e.target.value)}
                                                className="bg-background border-border focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Parameters */}
                            <Card className="border-t-4 border-t-green-500 shadow-md bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-green-700 dark:text-green-400">Facturación y Finanzas</CardTitle>
                                            <CardDescription>Configuración fiscal y monetaria</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wide">Moneda Base</Label>
                                            <Select
                                                value={billing.currency || 'USD'}
                                                onValueChange={(v) => updateSetting('billing.currency', v)}
                                            >
                                                <SelectTrigger className="bg-background border-border focus:border-green-500">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                                                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                                    <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Impuesto (%)</Label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={billing.taxRate || ''}
                                                    onChange={(e) => updateSetting('billing.taxRate', Number(e.target.value))}
                                                    className="pr-8"
                                                />
                                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Prefijo Factura</Label>
                                            <Input
                                                value={billing.invoicePrefix || ''}
                                                onChange={(e) => updateSetting('billing.invoicePrefix', e.target.value)}
                                                placeholder="FACT-"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Hours & AI */}
                        <div className="space-y-6">
                            {/* Hospital Hours */}
                            <Card className="border-t-4 border-t-orange-500 shadow-md bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-semibold text-orange-700 dark:text-orange-400">Horarios de Atención</CardTitle>
                                            <CardDescription>Gestión de turnos operativos</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-1">
                                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                                            const dayHours = hours[day] || { open: '', close: '', enabled: false };
                                            return (
                                                <div key={day} className="flex items-center gap-4 py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors">
                                                    <div className="w-28 font-medium text-sm text-foreground/80 capitalize">
                                                        {({
                                                            'monday': 'Lunes', 'tuesday': 'Martes', 'wednesday': 'Miércoles',
                                                            'thursday': 'Jueves', 'friday': 'Viernes', 'saturday': 'Sábado',
                                                            'sunday': 'Domingo'
                                                        } as Record<string, string>)[day] || day}
                                                    </div>
                                                    <Switch
                                                        checked={!!dayHours.enabled}
                                                        onCheckedChange={(c) => updateSetting(`openingHours.${day}.enabled`, c)}
                                                    />
                                                    <div className="flex-1 flex gap-2 items-center">
                                                        <Input
                                                            type="time"
                                                            value={dayHours.open || ''}
                                                            onChange={(e) => updateSetting(`openingHours.${day}.open`, e.target.value)}
                                                            className="h-8 text-sm bg-background border-border"
                                                            disabled={!dayHours.enabled}
                                                        />
                                                        <span className="text-xs text-muted-foreground">a</span>
                                                        <Input
                                                            type="time"
                                                            value={dayHours.close || ''}
                                                            onChange={(e) => updateSetting(`openingHours.${day}.close`, e.target.value)}
                                                            className="h-8 text-sm bg-background border-border"
                                                            disabled={!dayHours.enabled}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* AI Configuration */}
                            <Card className="border-t-4 border-t-purple-500 shadow-md bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                                                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-purple-700 dark:text-purple-400">Motor de Inteligencia Artificial</CardTitle>
                                                <CardDescription>Configuración de modelos y asistencia</CardDescription>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={!!ai.enabled}
                                            onCheckedChange={(c) => updateSetting('ai.enabled', c)}
                                            className="data-[state=checked]:bg-purple-600"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Modelo Principal</Label>
                                            <Select
                                                value={ai.model || 'GPT-4'}
                                                onValueChange={(v) => updateSetting('ai.model', v)}
                                                disabled={!ai.enabled}
                                            >
                                                <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GPT-4">GPT-4 Turbo</SelectItem>
                                                    <SelectItem value="GPT-3.5">GPT-3.5 Turbo</SelectItem>
                                                    <SelectItem value="Claude">Claude 3 Opus</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-muted-foreground">Nivel de Creatividad</Label>
                                            <Select disabled={!ai.enabled} defaultValue="balanced">
                                                <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Equilibrado" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="precise">Preciso (Médico)</SelectItem>
                                                    <SelectItem value="balanced">Equilibrado</SelectItem>
                                                    <SelectItem value="creative">Creativo (Marketing)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2 border-t border-border">
                                        <Label className="text-sm font-semibold text-muted-foreground">Módulos Activos</Label>
                                        <div className="flex items-center justify-between p-3 rounded-md bg-background border border-border">
                                            <div className="flex items-center gap-3">
                                                <Stethoscope className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Asistente de Triage Clínico</span>
                                            </div>
                                            <Switch
                                                checked={!!ai.features?.triage}
                                                onCheckedChange={(c) => updateSetting('ai.features.triage', c)}
                                                disabled={!ai.enabled}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-md bg-background border border-border">
                                            <div className="flex items-center gap-3">
                                                <Activity className="h-4 w-4 text-primary" />
                                                <span className="text-sm">Soporte al Diagnóstico</span>
                                            </div>
                                            <Switch
                                                checked={!!ai.features?.diagnosis}
                                                onCheckedChange={(c) => updateSetting('ai.features.diagnosis', c)}
                                                disabled={!ai.enabled}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="backups" className="mt-6">
                    <Card className="border-t-4 border-t-cyan-500 shadow-md bg-card">
                        <CardHeader className="border-b border-border bg-muted/10 px-6 py-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl text-cyan-700 dark:text-cyan-400">Respaldos de Seguridad</CardTitle>
                                    <CardDescription>Historial de copias de seguridad de la base de datos</CardDescription>
                                </div>
                                <Button onClick={handleCreateBackup} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm">
                                    <Database className="h-4 w-4 mr-2" />
                                    Nuevo Respaldo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-b border-border">
                                        <TableHead className="pl-6 h-12 font-semibold text-foreground">Nombre del Archivo</TableHead>
                                        <TableHead className="font-semibold text-foreground">Tipo de Respaldo</TableHead>
                                        <TableHead className="font-semibold text-foreground">Tamaño</TableHead>
                                        <TableHead className="font-semibold text-foreground">Fecha de Creación</TableHead>
                                        <TableHead className="font-semibold text-foreground">Estado</TableHead>
                                        <TableHead className="text-right pr-6 font-semibold text-foreground">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.backups.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                                No hay respaldos disponibles
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        adminData.backups.map((backup: any) => (
                                            <TableRow key={backup.id} className="hover:bg-muted/20 transition-colors border-b border-border last:border-0">
                                                <TableCell className="pl-6 font-medium font-mono text-sm">
                                                    {backup.name}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${backup.type === 'FULL'
                                                        ? 'bg-blue-500/10 text-blue-700 ring-blue-700/30 dark:text-blue-400 dark:ring-blue-400/30'
                                                        : 'bg-purple-500/10 text-purple-700 ring-purple-700/30 dark:text-purple-400 dark:ring-purple-400/30'
                                                        }`}>
                                                        {backup.type === 'FULL' ? 'COMPLETO' : 'INCREMENTAL'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{backup.size}</TableCell>
                                                <TableCell className="text-muted-foreground">{format(new Date(backup.createdAt), 'PPp', { locale: es })}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-1.5 w-1.5 rounded-full ${backup.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                        <span className="text-sm">
                                                            {backup.status === 'COMPLETED' ? 'Completado' : backup.status}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-primary/10 hover:text-primary transition-colors"
                                                        onClick={() => handleRestoreBackup(backup.id)}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Restaurar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* User Modal */}
            <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
                <DialogContent className="max-w-5xl p-0 overflow-hidden bg-card border-border shadow-2xl">
                    <DialogHeader className="p-6 pb-2 border-b border-border/50 bg-muted/20">
                        <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                        <DialogDescription>
                            Complete el formulario para {selectedUser ? 'actualizar' : 'crear'} una cuenta de usuario.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col lg:flex-row h-[70vh]">
                        {/* LEFT COLUMN: Credentials */}
                        <div className="w-full lg:w-1/3 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
                            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-primary" />
                                Credenciales
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombre</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="Nombre del usuario"
                                        value={userData.firstName || ''}
                                        onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellido</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Apellido del usuario"
                                        value={userData.lastName || ''}
                                        onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        value={userData.email || ''}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password {selectedUser ? '(Deja en blanco para no cambiar)' : <span className="text-red-500 ml-1">* Obligatorio</span>}</Label>
                                    <Input
                                        type="password"
                                        placeholder="********"
                                        value={userData.password || ''}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rol</Label>
                                    <Select
                                        value={userData.roleId}
                                        onValueChange={(v) => setUserData({ ...userData, roleId: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {adminData.roles
                                                .filter((role: any) => String(role.name).toUpperCase() !== 'PATIENT')
                                                .map((role: any) => {
                                                    const displayName = ROLE_DISPLAY_NAMES[role.name.toUpperCase()] || role.name;

                                                    return (
                                                        <SelectItem key={role.id} value={role.id}>
                                                            {displayName}
                                                        </SelectItem>
                                                    )
                                                })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
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
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Permissions (Enchufadores) */}
                        <div className="w-full lg:w-2/3 p-6 bg-muted/5 overflow-y-auto">
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-primary" />
                                    Permisos Adicionales (Tipos Enchufadores)
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Active o desactive módulos específicos de forma granular.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { id: 'DASHBOARD', label: 'Panel Principal', icon: LayoutDashboard },
                                    { id: 'PATIENTS', label: 'Pacientes', icon: Users },
                                    { id: 'DOCTORS', label: 'Doctores', icon: Stethoscope },
                                    { id: 'APPOINTMENTS', label: 'Citas', icon: Calendar },
                                    { id: 'WAITING_ROOM', label: 'Sala de Espera', icon: Clock },
                                    { id: 'BEDS', label: 'Gestión de Camas', icon: Bed },
                                    { id: 'EMERGENCY', label: 'Emergencias / Triage', icon: AlertTriangle },
                                    { id: 'PRESCRIPTIONS', label: 'Farmacia', icon: Pill },
                                    { id: 'LAB_RESULTS', label: 'Laboratorio', icon: FlaskConical },
                                    { id: 'BILLING', label: 'Facturación / Caja', icon: Receipt },
                                    { id: 'REPORTS', label: 'Reportes', icon: FileText },
                                    { id: 'ANALYTICS', label: 'Analítica', icon: BarChart3 },
                                    { id: 'HR', label: 'Recursos Humanos', icon: UserCog },
                                    { id: 'AUDIT', label: 'Auditoría', icon: Shield },
                                    { id: 'SYSTEM', label: 'Configuración Sistema', icon: Settings },
                                    { id: 'AI', label: 'Inteligencia Artificial', icon: Brain },
                                    { id: 'MESSAGES', label: 'Mensajería', icon: MessageSquare },
                                    { id: 'SETTINGS', label: 'Mi Cuenta / Configuración', icon: UserCog },
                                ].map((perm) => (
                                    <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50 hover:border-primary/50 transition-colors shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-secondary/50">
                                                <perm.icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">{perm.label}</span>
                                        </div>
                                        <Switch
                                            checked={userData.permissions.includes(perm.id) || userData.permissions.includes('ALL')}
                                            disabled={userData.permissions.includes('ALL')}
                                            onCheckedChange={(checked) => {
                                                const newPerms = checked
                                                    ? [...userData.permissions, perm.id]
                                                    : userData.permissions.filter(p => p !== perm.id)
                                                setUserData({ ...userData, permissions: newPerms })
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t border-border/50 bg-background">
                        <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveUser}>
                            Guardar Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
