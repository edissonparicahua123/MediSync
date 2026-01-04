import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    Calendar,
    UserCheck,
    Users,
    Activity, // "Check" like icon
    AlertTriangle,
    CheckCircle2,
    ScanLine,
    MoveRight
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { attendanceAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

export default function PublicScreenPage() {
    const [currentTime, setCurrentTime] = useState(new Date())
    const [stats, setStats] = useState({
        present: 0,
        total: 0,
        onTime: 0,
        late: 0
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [employeeId, setEmployeeId] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [scanMessage, setScanMessage] = useState('')

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Real stats fetching
    const fetchStats = async () => {
        try {
            const res = await attendanceAPI.getKioskStats()
            setStats(res.data)
        } catch (error) {
            console.error('Error fetching kiosk stats:', error)
        }
    }

    useEffect(() => {
        fetchStats()
        // Refresh stats every 60 seconds
        const interval = setInterval(fetchStats, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleAttendance = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!employeeId.trim()) return

        setIsLoading(true)
        setScanStatus('idle')

        try {
            const res = await attendanceAPI.kioskClock(employeeId)
            const { action, employeeName, time } = res.data

            setScanStatus('success')
            const actionText = action === 'CLOCK_IN' ? 'Entrada registrada' : 'Salida registrada'
            setScanMessage(`¡Hola, ${employeeName}! ${actionText}: ${format(new Date(time), 'HH:mm')}`)
            setEmployeeId('')

            // Refresh stats after success
            fetchStats()

            // Auto close after success
            setTimeout(() => {
                setIsModalOpen(false)
                setScanStatus('idle')
                setScanMessage('')
            }, 5000)

        } catch (error: any) {
            setScanStatus('error')
            setScanMessage(error.response?.data?.message || 'Código no reconocido o error de conexión.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050510] text-foreground overflow-hidden font-sans relative">
            {/* High-End Background with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover scale-105"
                    style={{ filter: 'grayscale(20%) brightness(40%)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050510] via-transparent to-[#050510]/80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,0.8)_100%)]" />
            </div>

            <div className="relative z-10 w-full h-full flex flex-col md:flex-row p-6 md:p-12 gap-12 items-center justify-between min-h-screen">

                {/* LEFT CONTENT: BRANDING & HERO */}
                <div className="flex-1 flex flex-col justify-center space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                    <div className="space-y-6">
                        <div className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] ring-1 ring-white/20">
                                <Activity className="h-10 w-10 text-white drop-shadow-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-blue-400/80 tracking-[0.2em] uppercase">Centro Médico</h2>
                                <h1 className="text-6xl font-black tracking-tighter text-white">MediSync <span className="text-blue-500">Pro+</span></h1>
                            </div>
                        </div>

                        <div className="max-w-xl space-y-4">
                            <h3 className="text-4xl md:text-5xl font-extrabold leading-tight text-white/95">
                                Excelencia en Salud <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Compromiso con la Vida</span>
                            </h3>
                            <p className="text-xl text-gray-400 font-light italic border-l-2 border-blue-500/50 pl-6 py-2">
                                "La medicina es el arte de conservar la salud y curar la enfermedad con conocimiento y compasión."
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 max-w-md">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:border-blue-500/50 transition-all duration-500">
                            <Users className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                            <div className="text-3xl font-black text-white">50+</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Especialistas</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 group hover:border-emerald-500/50 transition-all duration-500">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
                            <div className="text-3xl font-black text-white">Cert.</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Acreditado por Minsa</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT: CLOCK & ACTIONS */}
                <div className="flex-1 flex flex-col justify-center items-end h-full w-full max-w-lg">

                    {/* CLOCK CARD */}
                    <div className="bg-[#0c0c1a]/80 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden mb-8 animate-in slide-in-from-bottom duration-1000 delay-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                        <div className="flex justify-between items-start mb-10">
                            <div className="flex flex-col">
                                <span className="text-blue-400 font-bold text-xl flex items-center gap-3">
                                    <Calendar className="h-5 w-5" />
                                    {format(currentTime, 'EEEE, d MMMM', { locale: es })}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1 uppercase font-black tracking-[0.3em]">Fecha de Gestión</span>
                            </div>
                            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full">
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Sistema Online</span>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="text-[7.5rem] font-black text-white tracking-tighter tabular-nums leading-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                {format(currentTime, 'HH:mm')}
                            </div>
                            <div className="absolute -bottom-4 right-2 text-3xl text-blue-500 font-black tracking-tighter tabular-nums opacity-60">
                                {format(currentTime, 'ss')} sg
                            </div>
                        </div>
                    </div>

                    {/* STATS & ACTION CARD */}
                    <div className="bg-gradient-to-b from-[#121225] to-[#050510] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] w-full shadow-2xl animate-in slide-in-from-bottom duration-1000 delay-400">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="h-1 w-8 bg-blue-500 rounded-full" />
                                Estadísticas Hoy
                            </h4>
                            <span className="text-[10px] text-gray-400 font-medium">Auto-refresh ready</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
                                <UserCheck className="h-6 w-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Asistencias</div>
                                <div className="text-3xl font-black text-white mt-1 tabular-nums">{stats.present}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
                                <Users className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Staff</div>
                                <div className="text-3xl font-black text-white mt-1 tabular-nums">{stats.total}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">A Tiempo</div>
                                <div className="text-3xl font-black text-white mt-1 tabular-nums">{stats.onTime}</div>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors group">
                                <AlertTriangle className="h-6 w-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
                                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Tardanzas</div>
                                <div className="text-3xl font-black text-white mt-1 tabular-nums">{stats.late}</div>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-18 text-xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 shadow-[0_10px_30px_rgba(16,185,129,0.3)] rounded-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-emerald-950 uppercase tracking-widest gap-4"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <ScanLine className="h-6 w-6" />
                            </div>
                            Marcar Asistencia
                        </Button>
                    </div>

                </div>
            </div>

            {/* ATTENDANCE MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md bg-[#0c0c1a] border-white/10 text-white rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden p-0">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500" />

                    <div className="p-10 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-3xl text-center font-black flex flex-col items-center gap-6">
                                <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-emerald-500/20 to-teal-400/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                                    <Clock className="h-10 w-10 text-emerald-500 animate-pulse" />
                                </div>
                                <span className="tracking-tighter">Acceso Personal</span>
                            </DialogTitle>
                            <DialogDescription className="text-center text-gray-400 text-lg font-light">
                                Ingrese su <span className="text-white font-bold">Documento de Identidad (DNI)</span> para validar su sesión actual.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleAttendance} className="space-y-8">
                            <div className="relative">
                                <Input
                                    autoFocus
                                    type="text"
                                    placeholder="00000000"
                                    className="text-center text-5xl font-black tabular-nums tracking-[0.2em] h-24 w-full bg-white/5 border-white/10 rounded-2xl text-white focus:border-blue-500 focus:ring-[0_0_40px_rgba(59,130,246,0.2)] transition-all placeholder:text-white/5"
                                    value={employeeId}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                        setEmployeeId(val)
                                        if (scanStatus !== 'idle') setScanStatus('idle')
                                    }}
                                    maxLength={10}
                                    disabled={scanStatus === 'success'}
                                />
                            </div>

                            {scanStatus === 'success' && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle2 className="h-7 w-7 text-emerald-950" />
                                    </div>
                                    <p className="text-emerald-400 font-bold text-lg text-center leading-tight">{scanMessage}</p>
                                </div>
                            )}

                            {scanStatus === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                                    <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                                        <AlertTriangle className="h-7 w-7 text-red-950" />
                                    </div>
                                    <p className="text-red-400 font-bold text-center">{scanMessage}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-16 text-xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-2xl transition-all uppercase tracking-widest disabled:opacity-20"
                                disabled={isLoading || employeeId.length < 5 || scanStatus === 'success'}
                            >
                                {isLoading ? (
                                    <Activity className="h-6 w-6 animate-spin" />
                                ) : (
                                    <>
                                        Validar Acceso <MoveRight className="ml-3 h-6 w-6" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="text-center pt-4">
                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">
                                MediSync Secure Entry • v3.0
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
