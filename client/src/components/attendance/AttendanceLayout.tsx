import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
    Clock,
    DollarSign,
    Calendar,
    Settings,
    ShieldCheck,
    LayoutDashboard,
    ChevronLeft,
    TrendingUp,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItemProps {
    icon: any
    label: string
    path: string
}

function NavItem({ icon: Icon, label, path }: NavItemProps) {
    const location = useLocation()
    const isActive = location.pathname === path || (path !== '/attendance' && location.pathname.startsWith(path))

    return (
        <Link
            to={path}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
        >
            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-blue-500/50 group-hover:text-blue-500")} />
            <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
        </Link>
    )
}

export function AttendanceLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen w-full bg-[#0a0a0c] text-slate-200 overflow-hidden font-inter">
            {/* Dark Tech Background */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full"></div>
            </div>

            {/* Specialized Portal Sidebar */}
            <aside className="w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col z-20">
                <div className="p-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Medi<span className="text-blue-500">Ops</span></h1>
                            <p className="text-[8px] font-black text-blue-500/80 uppercase tracking-[0.3em]">Portal de Asistencia</p>
                        </div>
                    </div>

                    <Link to="/hr">
                        <Button variant="ghost" size="sm" className="w-full justify-start text-xs font-bold text-slate-500 hover:text-white hover:bg-white/5 rounded-xl gap-2">
                            <ChevronLeft className="h-4 w-4" /> Volver al Portal RH
                        </Button>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Operaciones</p>
                    <NavItem icon={LayoutDashboard} label="Dashboard" path="/attendance" />
                    <NavItem icon={Clock} label="Marcaciones" path="/attendance/ops" />
                    <NavItem icon={Calendar} label="Turnos" path="/attendance/shifts" />

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Finanzas</p>
                        <NavItem icon={DollarSign} label="Nómina" path="/attendance/payroll" />
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Sistema</p>
                        <NavItem icon={Briefcase} label="Reglas" path="/attendance/rules" />
                        <NavItem icon={Settings} label="Configuración" path="/attendance/settings" />
                    </div>
                </nav>

                <div className="p-8 mt-auto border-t border-white/5 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Servidor Activo</p>
                    </div>
                </div>
            </aside>

            {/* Main Portal Content */}
            <main className="flex-1 overflow-y-auto p-12 relative z-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    )
}
