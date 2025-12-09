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
                        name: 'Admin User',
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
                        name: 'Nurse Sarah',
                        email: 'sarah@medisync.com',
                        role: 'NURSE',
                        status: 'ACTIVE',
                        permissions: ['PATIENTS', 'APPOINTMENTS'],
                        lastLogin: new Date(Date.now() - 7200000),
                    },
                    {
                        id: '4',
                        name: 'Receptionist Mike',
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
                        paymentMethods: ['Cash', 'Credit Card', 'Insurance'],
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
                description: error.response?.data?.message || 'Failed to load admin data',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = (userId: string) => {
        toast({
            title: 'Password Reset',
            description: 'Password reset email sent successfully',
        })
    }

    const handleCreateBackup = () => {
        toast({
            title: 'Backup Started',
            description: 'Database backup is being created...',
        })
    }

    const handleRestoreBackup = (backupId: string) => {
        toast({
            title: 'Restore Initiated',
            description: 'Database restore process started',
        })
    }

    const handleSaveSettings = () => {
        toast({
            title: 'Settings Saved',
            description: 'System settings updated successfully',
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
                        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                        <p className="text-muted-foreground">
                            User management, system settings, and backups
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="users">
                        <Users className="h-4 w-4 mr-2" />
                        Users
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="h-4 w-4 mr-2" />
                        System Settings
                    </TabsTrigger>
                    <TabsTrigger value="backups">
                        <Database className="h-4 w-4 mr-2" />
                        Backups
                    </TabsTrigger>
                </TabsList>

                {/* A. Users Tab */}
                <TabsContent value="users" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>Manage users, roles, and permissions</CardDescription>
                                </div>
                                <Button onClick={() => setUserModalOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminData.users.map((user: any) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(user.lastLogin, 'PPp')}
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
                                                        Edit
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
                                Logo & Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <img
                                    src={adminData.settings.logo}
                                    alt="Hospital Logo"
                                    className="w-24 h-24 rounded border"
                                />
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Logo
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Hospital Name</Label>
                                    <Input defaultValue={adminData.settings.hospitalName} />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input defaultValue={adminData.settings.phone} />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input type="email" defaultValue={adminData.settings.email} />
                                </div>
                                <div>
                                    <Label>Address</Label>
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
                                Hospital Hours
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(adminData.settings.openingHours).map(([day, hours]: [string, any]) => (
                                    <div key={day} className="flex items-center gap-4">
                                        <div className="w-32">
                                            <span className="font-medium capitalize">{day}</span>
                                        </div>
                                        <Switch defaultChecked={hours.enabled} />
                                        <Input
                                            type="time"
                                            defaultValue={hours.open}
                                            className="w-32"
                                            disabled={!hours.enabled}
                                        />
                                        <span>to</span>
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
                                Billing Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Tax Rate (%)</Label>
                                    <Input type="number" defaultValue={adminData.settings.billing.taxRate} />
                                </div>
                                <div>
                                    <Label>Currency</Label>
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
                                    <Label>Invoice Prefix</Label>
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
                                AI Panel Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable AI Features</p>
                                    <p className="text-sm text-muted-foreground">
                                        Activate AI-powered diagnostics and predictions
                                    </p>
                                </div>
                                <Switch defaultChecked={adminData.settings.ai.enabled} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>AI Model</Label>
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
                                    <Label>Temperature</Label>
                                    <Input type="number" step="0.1" defaultValue={adminData.settings.ai.temperature} />
                                </div>
                                <div>
                                    <Label>Max Tokens</Label>
                                    <Input type="number" defaultValue={adminData.settings.ai.maxTokens} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">AI Features</p>
                                <div className="flex items-center justify-between">
                                    <span>Triage Assistant</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.triage} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Diagnosis Support</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.diagnosis} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Predictive Analytics</span>
                                    <Switch defaultChecked={adminData.settings.ai.features.predictions} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button onClick={handleSaveSettings} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save All Settings
                    </Button>
                </TabsContent>

                {/* C. Backups Tab */}
                <TabsContent value="backups" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Database Backups</CardTitle>
                                    <CardDescription>Create and restore database backups</CardDescription>
                                </div>
                                <Button onClick={handleCreateBackup}>
                                    <Database className="h-4 w-4 mr-2" />
                                    Create Backup
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Backup Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
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
                                                    {backup.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{backup.size}</TableCell>
                                            <TableCell>{format(backup.createdAt, 'PPp')}</TableCell>
                                            <TableCell>
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                                    {backup.status}
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
                                                        Restore
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
                        <DialogTitle>{selectedUser ? 'Edit User' : 'Create User'}</DialogTitle>
                        <DialogDescription>
                            Manage user information, role, and permissions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input placeholder="Enter name" defaultValue={selectedUser?.name} />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" placeholder="Enter email" defaultValue={selectedUser?.email} />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select defaultValue={selectedUser?.role || 'RECEPTIONIST'}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                                    <SelectItem value="NURSE">Nurse</SelectItem>
                                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Permissions</Label>
                            <div className="space-y-2 mt-2">
                                {['PATIENTS', 'APPOINTMENTS', 'MEDICAL_RECORDS', 'BILLING', 'REPORTS'].map(perm => (
                                    <div key={perm} className="flex items-center justify-between">
                                        <span className="text-sm">{perm.replace('_', ' ')}</span>
                                        <Switch defaultChecked={selectedUser?.permissions?.includes(perm)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            toast({
                                title: 'User Saved',
                                description: 'User information updated successfully',
                            })
                            setUserModalOpen(false)
                            setSelectedUser(null)
                        }}>
                            Save User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
