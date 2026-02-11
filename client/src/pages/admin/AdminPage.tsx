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
import { Badge } from '@/components/ui/badge'
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
    CalendarCheck,
    Package,
    UserPlus,
    ShieldCheck,
    DatabaseBackup,
    Trash2,
    Key,
    Pencil,
    User,
    Cpu,
    HardDrive,
    Server,
    Fingerprint,
    Globe,
    CheckCircle2
} from 'lucide-react'
import { adminAPI, usersAPI, auditAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [maintenanceMode, setMaintenanceMode] = useState(false)
    const [userModalOpen, setUserModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [passwordModalOpen, setPasswordModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
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

    const PERMISSION_MAP: Record<string, { label: string, icon: any }> = {
        'DASHBOARD': { label: 'Panel de Control', icon: LayoutDashboard },
        'PATIENTS': { label: 'Gestión de Pacientes', icon: User },
        'DOCTORS': { label: 'Cuerpo Médico', icon: Stethoscope },
        'APPOINTMENTS': { label: 'Citas Médicas', icon: Calendar },
        'WAITING_ROOM': { label: 'Sala de Espera', icon: Clock },
        'BEDS': { label: 'Hospitalización / Camas', icon: Bed },
        'EMERGENCY': { label: 'Urgencias / Triage', icon: AlertTriangle },
        'LAB_RESULTS': { label: 'Laboratorio / Resultados', icon: FlaskConical },
        'PHARMACY': { label: 'Farmacia / Stock', icon: Pill },
        'BILLING': { label: 'Facturación / Caja', icon: Receipt },
        'HR': { label: 'Recursos Humanos', icon: Users },
        'ANALYTICS': { label: 'Analítica Avanzada', icon: BarChart3 },
        'REPORTS': { label: 'Reportes y PDF', icon: FileText },
        'MESSAGES': { label: 'Mensajería Interna', icon: MessageSquare },
        'AUDIT': { label: 'Logs de Auditoría', icon: Shield },
        'SYSTEM': { label: 'Configuración de Sistema', icon: Settings },
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
        systemStats: null,
        systemHealth: [],
    })

    useEffect(() => {
        loadAdminData()
    }, [])

    const loadAdminData = async () => {
        try {
            setLoading(true)
            const [usersRes, rolesRes, orgRes, backupsRes, auditRes, statsRes, healthRes] = await Promise.all([
                usersAPI.getAll({ limit: 100 }),
                usersAPI.getRoles(),
                adminAPI.getOrganization(),
                adminAPI.getBackups(),
                auditAPI.getAll({ limit: 5 }),
                adminAPI.getSystemStats(),
                adminAPI.getSystemHealth()
            ])

            setAdminData({
                users: usersRes.data.data,
                roles: rolesRes.data || [],
                settings: orgRes.data,
                backups: backupsRes.data,
                systemStats: statsRes.data,
                systemHealth: healthRes.data,
            })
            setRecentActivity(auditRes.data.data || [])
            setMaintenanceMode(orgRes.data.maintenanceMode || false)
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

    const handleResetPassword = async () => {
        if (!newPassword || !selectedUser) return;

        try {
            await usersAPI.update(selectedUser.id, { password: newPassword });
            toast({
                title: 'Contraseña Actualizada',
                description: 'La contraseña ha sido cambiada exitosamente.',
            });
            setPasswordModalOpen(false)
            setNewPassword('')
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cambiar la contraseña',
                variant: 'destructive',
            });
        }
    }

    const handleDeleteUser = async () => {
        if (!selectedUser && selectedUsers.length === 0) return;

        try {
            if (selectedUser) {
                await usersAPI.delete(selectedUser.id);
            } else {
                // Bulk delete
                await Promise.all(selectedUsers.map(id => usersAPI.delete(id)));
                setSelectedUsers([]);
            }

            toast({
                title: selectedUser ? 'Usuario Eliminado' : 'Usuarios Eliminados',
                description: 'La operación se completó correctamente.',
            });
            setDeleteModalOpen(false);
            loadAdminData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error en la operación',
                variant: 'destructive',
            })
        }
    }

    const handleExportUsers = () => {
        const usersToExport = selectedUsers.length > 0
            ? adminData.users.filter((u: any) => selectedUsers.includes(u.id))
            : adminData.users;

        const headers = ['Nombre', 'Apellido', 'Email', 'Rol', 'Estado'];
        const rows = usersToExport.map((u: any) => [
            u.firstName,
            u.lastName,
            u.email,
            u.role?.name || 'N/A',
            u.isActive ? 'Activo' : 'Inactivo'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `medisync_users_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({ title: 'Exportación Exitosa', description: 'El archivo CSV ha sido generado.' });
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

    const handleRestoreBackup = async (backupId: string) => {
        try {
            await adminAPI.restoreBackup(backupId)
            toast({
                title: 'Restauración Iniciada',
                description: 'La base de datos se está restaurando. El sistema podría reiniciarse.',
            })
        } catch (error) {
            toast({ title: 'Error al restaurar', variant: 'destructive' })
        }
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
            'Admin': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 ring-indigo-500/40',
            'Doctor': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400 ring-blue-500/40',
            'Nurse': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400 ring-cyan-500/40',
            'Receptionist': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 ring-emerald-500/40',
            'ADMIN': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-400 ring-indigo-500/40',
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
                    <div className="h-14 w-14 rounded-lg bg-edicarex flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Shield className="h-7 w-7 text-white" />
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
                        MediSync v2.5.0 Enterprise
                    </div>
                </div>
            </div>

            {/* Tabs Pro - SOLID */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 w-full max-w-3xl bg-muted/50 p-1 border border-border/50 rounded-xl mb-6">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-edicarex data-[state=active]:text-white transition-all duration-300">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Vista General
                    </TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-edicarex data-[state=active]:text-white transition-all duration-300">
                        <Users className="h-4 w-4 mr-2" />
                        Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-edicarex data-[state=active]:text-white transition-all duration-300">
                        <Settings className="h-4 w-4 mr-2" />
                        Sistema
                    </TabsTrigger>
                    <TabsTrigger value="backups" className="rounded-lg data-[state=active]:bg-edicarex data-[state=active]:text-white transition-all duration-300">
                        <Database className="h-4 w-4 mr-2" />
                        Respaldos
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="rounded-lg data-[state=active]:bg-edicarex data-[state=active]:text-white transition-all duration-300">
                        <Shield className="h-4 w-4 mr-2" />
                        Roles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* CPU Monitor */}
                        <Card className="bg-card border-border overflow-hidden group hover:border-blue-500 transition-all duration-300 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Carga del CPU</p>
                                        <h3 className="text-3xl font-bold tracking-tight text-blue-500">
                                            {adminData.systemStats?.infrastructure.cpu.usage || 0}%
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <Cpu className="h-6 w-6 text-blue-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                    <span>{adminData.systemStats?.infrastructure.cpu.cores} CORES</span>
                                    <span>{adminData.systemStats?.infrastructure.cpu.model.split(' ')[0]}</span>
                                </div>
                                <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${adminData.systemStats?.infrastructure.cpu.usage || 0}%` }}
                                        className="h-full bg-blue-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Memory Monitor */}
                        <Card className="bg-card border-border overflow-hidden group hover:border-purple-500 transition-all duration-300 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Memoria RAM</p>
                                        <h3 className="text-3xl font-bold tracking-tight text-purple-500">
                                            {adminData.systemStats?.infrastructure.memory.usagePercent || 0}%
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <HardDrive className="h-6 w-6 text-purple-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                    <span>TOTAL: {adminData.systemStats?.infrastructure.memory.total} GB</span>
                                    <span>LIBRE: {adminData.systemStats?.infrastructure.memory.free} GB</span>
                                </div>
                                <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${adminData.systemStats?.infrastructure.memory.usagePercent || 0}%` }}
                                        className="h-full bg-purple-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Database Health */}
                        <Card className="bg-card border-border overflow-hidden group hover:border-emerald-500 transition-all duration-300 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Base de Datos</p>
                                        <h3 className="text-3xl font-bold tracking-tight text-emerald-500">
                                            {adminData.systemStats?.database.counts.users || 0}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <Database className="h-6 w-6 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">{adminData.systemStats?.database.counts.patients} PACIENTES</Badge>
                                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">{adminData.systemStats?.database.counts.appointments} CITAS</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Uptime / Maintenance */}
                        <Card className="bg-card border-border overflow-hidden group hover:border-orange-500 transition-all duration-300 shadow-md">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tiempo de Actividad</p>
                                        <h3 className="text-xl font-black text-orange-500 uppercase">
                                            {adminData.systemStats?.infrastructure.uptime.days}d {adminData.systemStats?.infrastructure.uptime.hours}h {adminData.systemStats?.infrastructure.uptime.minutes}m
                                        </h3>
                                    </div>
                                    <div className="p-2 bg-orange-500/10 rounded-lg">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={maintenanceMode}
                                            onCheckedChange={async (checked) => {
                                                try {
                                                    await adminAPI.updateOrganization({ maintenanceMode: checked });
                                                    setMaintenanceMode(checked);
                                                    toast({
                                                        title: checked ? 'Modo Mantenimiento Activado' : 'Modo Mantenimiento Desactivado',
                                                        description: checked ? 'El sistema ahora es privado para administradores.' : 'El sistema vuelve a estar público.',
                                                    });
                                                } catch (error) {
                                                    toast({
                                                        title: 'Error',
                                                        description: 'No se pudo cambiar el estado de mantenimiento',
                                                        variant: 'destructive',
                                                    });
                                                }
                                            }}
                                        />
                                        <span className="text-[10px] font-bold text-muted-foreground">MODO MANT.</span>
                                    </div>
                                    {maintenanceMode && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Services Monitor */}
                        <Card className="md:col-span-2 border-border bg-card shadow-sm">
                            <CardHeader className="border-b border-border/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Server className="h-5 w-5 text-edicarex" />
                                            Monitor de Servicios CORE
                                        </CardTitle>
                                        <CardDescription>Estado de integración y latencia de sistemas externos</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black">
                                        <CheckCircle2 className="h-3 w-3" />
                                        SISTEMA ÍNTEGRO
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2">
                                    {adminData.systemHealth.map((service: any) => (
                                        <div key={service.id} className="p-6 flex items-center justify-between border-b border-r border-border/50 last:border-b-0 group hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl ${service.status === 'OPERATIONAL' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                    <Fingerprint className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-foreground">{service.name}</h4>
                                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">{service.type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-black text-foreground">{service.latency}ms</div>
                                                <div className="text-[9px] font-bold text-green-500 uppercase">ONLINE</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Environment Auditor */}
                        <div className="space-y-6">
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter">
                                        <Globe className="h-4 w-4 text-blue-500" />
                                        Auditor de Entorno
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Runtime</span>
                                        <span className="text-xs font-black text-edicarex">Node.js {adminData.systemStats?.infrastructure.nodeVersion}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Backend</span>
                                        <span className="text-xs font-black text-orange-500">NestJS Enterprise</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Platform</span>
                                        <span className="text-xs font-black">{adminData.systemStats?.infrastructure.platform} x64</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">API Version</span>
                                        <span className="text-xs font-black tracking-widest">v2.5.0-PRO</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-edicarex border-none shadow-xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Shield className="h-24 w-24 text-white" />
                                </div>
                                <CardContent className="p-6 relative z-10">
                                    <h4 className="text-white font-black text-lg mb-1">Estado de Seguridad</h4>
                                    <p className="text-white/70 text-xs mb-4">Firmas y protocolos validados hoy.</p>
                                    <div className="py-2 px-3 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-white" />
                                            <span className="text-xs font-black text-white">X-FRAME: DENY</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* A. Users Tab */}
                < TabsContent value="users" className="mt-0" >
                    <Card className="overflow-hidden border-none shadow-xl transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-edicarex" />
                        <CardHeader className="border-b border-border bg-muted/10 px-6 py-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <CardTitle className="text-xl text-edicarex">Directorio de Usuarios</CardTitle>
                                    <CardDescription>Gestiona el acceso y roles del personal médico</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar usuario..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 bg-background border-border focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {selectedUsers.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleExportUsers}
                                                    className="border-green-500/50 text-green-600 hover:bg-green-50"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Exportar ({selectedUsers.length})
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => setDeleteModalOpen(true)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                                        <TableHead className="w-12 pl-6">
                                            <input
                                                type="checkbox"
                                                className="rounded border-border"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsers(adminData.users.map((u: any) => u.id))
                                                    } else {
                                                        setSelectedUsers([])
                                                    }
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead className="h-12 font-semibold text-foreground">Usuario / Email</TableHead>
                                        <TableHead className="font-semibold text-foreground">Rol Asignado</TableHead>
                                        <TableHead className="font-semibold text-foreground">Estado</TableHead>
                                        <TableHead className="text-right pr-6 font-semibold text-foreground">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.users
                                        .filter((user: any) => {
                                            const rName = user.role?.name || user.role || '';
                                            const searchMatch = (
                                                user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                            );
                                            return String(rName).toUpperCase() !== 'PATIENT' && searchMatch;
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
                                                    <TableCell className="pl-6">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedUsers.includes(user.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedUsers([...selectedUsers, user.id])
                                                                } else {
                                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                                                }
                                                            }}
                                                            className="rounded border-border"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="py-4">
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
                                                            <span className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-edicarex shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-red-500'}`} />
                                                            <span className={`text-sm font-medium ${user.isActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-red-700 dark:text-red-400'}`}>
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
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setPasswordModalOpen(true);
                                                                }}
                                                            >
                                                                <Key className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setDeleteModalOpen(true);
                                                                }}
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
                </TabsContent >
                {/* B. System Settings Tab */}
                < TabsContent value="system" className="mt-6 space-y-6" >
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* LEFT COLUMN: Identity & Operations */}
                        <div className="space-y-6">
                            {/* Logo & Basic Info */}
                            <Card className="overflow-hidden border-none shadow-xl transition-all h-full">
                                <div className="absolute top-0 left-0 w-full h-1 bg-edicarex opacity-70" />
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
                            <Card className="overflow-hidden border-none shadow-xl transition-all">
                                <div className="absolute top-0 left-0 w-full h-1 bg-edicarex opacity-50" />
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
                            <Card className="overflow-hidden border-none shadow-xl transition-all">
                                <div className="absolute top-0 left-0 w-full h-1 bg-edicarex opacity-70" />
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
                            <Card className="overflow-hidden border-none shadow-xl transition-all">
                                <div className="absolute top-0 left-0 w-full h-1 bg-edicarex" />
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
                </TabsContent >

                <TabsContent value="backups" className="mt-0">
                    <Card className="overflow-hidden border-none shadow-xl transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-edicarex" />
                        <CardHeader className="border-b border-border bg-muted/10 px-6 py-5">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl text-edicarex">Respaldos de Seguridad</CardTitle>
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
                                        <TableHead className="font-semibold text-foreground">Tipo</TableHead>
                                        <TableHead className="font-semibold text-foreground">Tamaño</TableHead>
                                        <TableHead className="font-semibold text-foreground">Fecha</TableHead>
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
                                            <TableRow key={backup.id} className="hover:bg-muted/20 transition-colors border-b border-border last:border-0 text-sm">
                                                <TableCell className="pl-6 font-medium font-mono">
                                                    {backup.name}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${backup.type === 'FULL' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
                                                        }`}>
                                                        {backup.type === 'FULL' ? 'COMPLETO' : 'INCREMENTAL'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{backup.size}</TableCell>
                                                <TableCell className="text-muted-foreground">{format(new Date(backup.createdAt), 'PP', { locale: es })}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full ${backup.status === 'COMPLETED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500'} `} />
                                                        <span>{backup.status === 'COMPLETED' ? 'Completado' : backup.status}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="hover:bg-edicarex/10 hover:text-edicarex"
                                                        onClick={() => handleRestoreBackup(backup.id)}
                                                    >
                                                        <Upload className="h-3 w-3 mr-2" />
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

                <TabsContent value="roles" className="mt-0">
                    <Card className="border-none shadow-xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-edicarex" />
                        <CardHeader>
                            <CardTitle className="text-xl text-edicarex text-center">Matriz de Acceso MediSync Enterprise</CardTitle>
                            <CardDescription className="text-center">Control jerárquico de permisos dinámicos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.entries(ROLE_DEFAULTS).map(([role, permissions], idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ scale: 1.02 }}
                                        className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-5">
                                            <Shield className="h-12 w-12" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-edicarex/10 rounded-lg">
                                                <Shield className="h-5 w-5 text-edicarex" />
                                            </div>
                                            <h4 className="font-extrabold text-lg text-foreground">{ROLE_DISPLAY_NAMES[role] || role}</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {permissions.includes('ALL') ? (
                                                    <div className="w-full flex items-center gap-2 text-xs font-bold text-green-600 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                                        <CheckCircle className="h-4 w-4" />
                                                        Privilegios Administrativos Totales
                                                    </div>
                                                ) : (
                                                    permissions.map((p, i) => {
                                                        const info = PERMISSION_MAP[p];
                                                        if (!info) return null;
                                                        return (
                                                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 border border-border/50 rounded-xl text-[11px] font-medium text-muted-foreground group-hover:bg-edicarex/5 group-hover:text-edicarex transition-colors">
                                                                <info.icon className="h-3 w-3" />
                                                                {info.label}
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >

            {/* User Modal - Global Unified */}
            < Dialog open={userModalOpen} onOpenChange={setUserModalOpen} >
                <DialogContent className="max-w-6xl p-0 overflow-hidden bg-card border-border shadow-2xl rounded-3xl">
                    <div className="flex flex-col lg:flex-row h-[85vh]">
                        {/* LEFT: Credentials & Basic Info */}
                        <div className="w-full lg:w-1/3 p-8 border-b lg:border-r border-border overflow-y-auto bg-muted/20">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-edicarex mb-1">{selectedUser ? 'Editar Perfil' : 'Alta de Usuario'}</h2>
                                <p className="text-sm text-muted-foreground">Gestión de identidad y acceso corporativo</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                                        <Input
                                            className="bg-background focus-visible:ring-edicarex"
                                            value={userData.firstName}
                                            onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Apellido</Label>
                                        <Input
                                            className="bg-background focus-visible:ring-edicarex"
                                            value={userData.lastName}
                                            onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        placeholder="user@medisync.com"
                                        className="bg-background focus-visible:ring-edicarex"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="bg-background focus-visible:ring-edicarex"
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                    />
                                    {selectedUser && <p className="text-[10px] text-muted-foreground italic">Dejar vacío para mantener la actual</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rol Organizacional</Label>
                                    <Select
                                        value={userData.roleId}
                                        onValueChange={(v) => {
                                            const role = adminData.roles.find((r: any) => r.id === v);
                                            const defaultPerms = ROLE_DEFAULTS[role?.name?.toUpperCase()] || [];
                                            setUserData({ ...userData, roleId: v, permissions: defaultPerms });
                                        }}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Seleccione cargo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {adminData.roles.filter((r: any) => r.name !== 'PATIENT').map((role: any) => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {ROLE_DISPLAY_NAMES[role.name.toUpperCase()] || role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4 mt-6 border-t border-border/50">
                                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                                        <div className="space-y-0.5">
                                            <Label className="font-bold">Estado de Cuenta</Label>
                                            <p className="text-[10px] text-muted-foreground">Permitir acceso al sistema</p>
                                        </div>
                                        <Switch
                                            checked={userData.status === 'ACTIVE'}
                                            onCheckedChange={(c) => setUserData({ ...userData, status: c ? 'ACTIVE' : 'INACTIVE' })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Visual Permissions Matrix */}
                        <div className="flex-1 p-8 overflow-y-auto bg-background">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-foreground">Matriz de Permisos</h3>
                                    <p className="text-sm text-muted-foreground">Configuración granular de módulos asistenciales y administrativos</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-edicarex">{userData.permissions.length}</div>
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground">Módulos On</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {[
                                    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
                                    { id: 'PATIENTS', label: 'Pacientes', icon: Users },
                                    { id: 'APPOINTMENTS', label: 'Citas', icon: CalendarCheck },
                                    { id: 'MEDICAL_RECORDS', label: 'Expedientes Médicos', icon: FileText },
                                    { id: 'PRESCRIPTIONS', label: 'Recetas', icon: Pill },
                                    { id: 'BILLING', label: 'Facturación', icon: DollarSign },
                                    { id: 'INVENTORY', label: 'Inventario', icon: Package },
                                    { id: 'SETTINGS', label: 'Configuración', icon: Settings },
                                    { id: 'USERS', label: 'Usuarios', icon: UserPlus },
                                    { id: 'ROLES', label: 'Roles', icon: ShieldCheck },
                                    { id: 'BACKUPS', label: 'Respaldos', icon: DatabaseBackup },
                                    { id: 'ANALYTICS', label: 'Analítica', icon: BarChart3 },
                                    { id: 'HR', label: 'Recursos Humanos', icon: UserCog },
                                    { id: 'AUDIT', label: 'Auditoría', icon: Shield },
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

                            <div className="mt-12 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setUserModalOpen(false)} className="rounded-xl px-8">Cancelar</Button>
                                <Button
                                    onClick={handleSaveUser}
                                    className="bg-edicarex hover:bg-edicarex/90 text-white rounded-xl px-12 font-black shadow-lg shadow-blue-500/20"
                                >
                                    Confirmar y Guardar
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Password Modal */}
            < Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen} >
                <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-edicarex" />
                            Resetear Contraseña
                        </DialogTitle>
                        <DialogDescription>
                            Introduzca la nueva contraseña maestra para {selectedUser?.firstName} {selectedUser?.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nueva Contraseña</Label>
                            <Input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-muted/20"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Esta acción invalidará las sesiones activas del usuario.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setPasswordModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleResetPassword} className="bg-edicarex hover:bg-edicarex/90 text-white">
                            Cambiar Contraseña
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Delete Modal - SHADCN UI INTEGRATED */}
            < Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen} >
                <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Confirmar Eliminación
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleDeleteUser}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Eliminar Usuario
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}
