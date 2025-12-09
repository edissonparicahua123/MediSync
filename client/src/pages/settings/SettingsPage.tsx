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
        name: 'Dr. John Smith',
        email: 'john.smith@medisync.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
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
            device: 'Chrome on Windows',
            location: 'New York, USA',
            ip: '192.168.1.100',
            lastActive: new Date(),
            current: true,
        },
        {
            id: '2',
            device: 'Safari on iPhone',
            location: 'New York, USA',
            ip: '192.168.1.101',
            lastActive: new Date(Date.now() - 3600000),
            current: false,
        },
    ])

    // Recent Activity
    const [recentActivity] = useState([
        {
            id: '1',
            action: 'Login',
            timestamp: new Date(),
            ip: '192.168.1.100',
        },
        {
            id: '2',
            action: 'Updated patient record',
            timestamp: new Date(Date.now() - 1800000),
            ip: '192.168.1.100',
        },
        {
            id: '3',
            action: 'Generated report',
            timestamp: new Date(Date.now() - 3600000),
            ip: '192.168.1.100',
        },
    ])

    // System Status
    const [systemStatus] = useState({
        server: 'online',
        database: 'online',
        api: 'online',
        uptime: '15 days, 4 hours',
        version: '2.5.0',
        lastBackup: new Date(Date.now() - 86400000),
    })

    const handleSaveAccount = () => {
        toast({
            title: 'Account Updated',
            description: 'Your account settings have been saved',
        })
    }

    const handleSaveTheme = () => {
        toast({
            title: 'Theme Updated',
            description: 'Your theme preferences have been saved',
        })
    }

    const handleSaveNotifications = () => {
        toast({
            title: 'Notifications Updated',
            description: 'Your notification preferences have been saved',
        })
    }

    const handleEnable2FA = () => {
        setSecurity({ ...security, twoFactor: !security.twoFactor })
        toast({
            title: security.twoFactor ? '2FA Disabled' : '2FA Enabled',
            description: security.twoFactor
                ? 'Two-factor authentication has been disabled'
                : 'Two-factor authentication has been enabled',
        })
    }

    const handleLogoutAllDevices = () => {
        toast({
            title: 'Sessions Terminated',
            description: 'All other sessions have been logged out',
        })
    }

    const handleCreateBackup = () => {
        toast({
            title: 'Backup Started',
            description: 'Database backup is being created',
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
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account and system preferences
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full">
                    <TabsTrigger value="account">
                        <User className="h-4 w-4 mr-2" />
                        Account
                    </TabsTrigger>
                    <TabsTrigger value="personalization">
                        <Palette className="h-4 w-4 mr-2" />
                        Personalization
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                        <Users className="h-4 w-4 mr-2" />
                        Roles
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="system">
                        <Server className="h-4 w-4 mr-2" />
                        System
                    </TabsTrigger>
                </TabsList>

                {/* 1. Account Configuration */}
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={accountData.avatar} />
                                    <AvatarFallback>{accountData.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Change Photo
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Full Name</Label>
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
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Current Password</Label>
                                <Input type="password" />
                            </div>
                            <div>
                                <Label>New Password</Label>
                                <Input type="password" />
                            </div>
                            <div>
                                <Label>Confirm New Password</Label>
                                <Input type="password" />
                            </div>
                            <Button>Update Password</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your recent account activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>IP Address</TableHead>
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
                            <CardTitle>Theme Settings</CardTitle>
                            <CardDescription>Customize the appearance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Theme Mode</Label>
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
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="auto">Auto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Primary Color</Label>
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
                                <Label>Font Family</Label>
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
                                <Label>Dashboard Layout</Label>
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
                                        <SelectItem value="grid">Grid</SelectItem>
                                        <SelectItem value="list">List</SelectItem>
                                        <SelectItem value="compact">Compact</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSaveTheme}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Theme
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Module Visibility</CardTitle>
                            <CardDescription>Enable or disable modules</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                'Appointments',
                                'Emergency',
                                'Pharmacy',
                                'Laboratory',
                                'Billing',
                                'Reports',
                                'Analytics',
                                'HR',
                                'Messages',
                                'AI Features',
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
                            <CardTitle>Default Permissions by Role</CardTitle>
                            <CardDescription>Configure default permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Admin', 'Doctor', 'Nurse', 'Receptionist'].map((role) => (
                                    <div key={role} className="border rounded-lg p-4">
                                        <h4 className="font-semibold mb-3">{role}</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                'View Patients',
                                                'Edit Patients',
                                                'Delete Patients',
                                                'View Reports',
                                                'Generate Reports',
                                                'Manage Billing',
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
                            <CardTitle>Auto-Configuration by Area</CardTitle>
                            <CardDescription>Automatic settings per department</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {['Emergency', 'Cardiology', 'Pediatrics', 'Surgery'].map((area) => (
                                <div key={area} className="flex items-center justify-between">
                                    <span>{area} Department</span>
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
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Manage how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
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
                                    <p className="font-medium">Emergency Alerts</p>
                                    <p className="text-sm text-muted-foreground">
                                        Critical emergency notifications
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
                                    <p className="font-medium">Appointment Alerts</p>
                                    <p className="text-sm text-muted-foreground">
                                        Upcoming appointment reminders
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
                                    <p className="font-medium">Laboratory Alerts</p>
                                    <p className="text-sm text-muted-foreground">
                                        Lab results and updates
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
                                    <p className="font-medium">Pharmacy Alerts</p>
                                    <p className="text-sm text-muted-foreground">
                                        Medication and inventory alerts
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
                                Save Preferences
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 5. Security */}
                <TabsContent value="security" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Two-Factor Authentication</CardTitle>
                            <CardDescription>Add an extra layer of security</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Enable 2FA</p>
                                    <p className="text-sm text-muted-foreground">
                                        Require a code in addition to your password
                                    </p>
                                </div>
                                <Switch checked={security.twoFactor} onCheckedChange={handleEnable2FA} />
                            </div>
                            {security.twoFactor && (
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        ✓ Two-factor authentication is enabled
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Sessions</CardTitle>
                            <CardDescription>Manage your active sessions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Device</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {session.device}
                                                    {session.current && (
                                                        <Badge variant="outline">Current</Badge>
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
                                Logout All Other Devices
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Access Audit</CardTitle>
                            <CardDescription>View your access history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Audit Log
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 6. System */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Server Status</CardTitle>
                            <CardDescription>Current system health</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span>Server</span>
                                    <Badge className="bg-green-600">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {systemStatus.server}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Database</span>
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
                                    <span>Uptime</span>
                                    <span className="font-mono text-sm">{systemStatus.uptime}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Version</span>
                                    <Badge variant="outline">v{systemStatus.version}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Backups</CardTitle>
                            <CardDescription>Database backup management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Last Backup</p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(systemStatus.lastBackup, 'PPp')}
                                    </p>
                                </div>
                                <Button onClick={handleCreateBackup}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Create Backup
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Logs</CardTitle>
                            <CardDescription>View system activity logs</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline">
                                <Activity className="h-4 w-4 mr-2" />
                                View Logs
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
