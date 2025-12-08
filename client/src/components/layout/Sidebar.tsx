import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Calendar,
    Pill,
    FlaskConical,
    Receipt,
    FileText,
    Brain,
    Settings,
    Activity,
} from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Pill, label: 'Pharmacy', path: '/pharmacy' },
    { icon: FlaskConical, label: 'Laboratory', path: '/laboratory' },
    { icon: Receipt, label: 'Billing', path: '/billing' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Brain, label: 'AI Features', path: '/ai' },
    { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
    const location = useLocation()

    return (
        <aside className="w-64 bg-card border-r border-border">
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <Activity className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">MediSync</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Enterprise</p>
            </div>

            <nav className="px-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
