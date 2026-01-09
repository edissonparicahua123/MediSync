import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ShieldCheck, Lock, User, Loader2, ArrowRight, AlertTriangle } from 'lucide-react'

import { authAPI } from '@/services/api'

export default function AttendanceLoginPage() {
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const loginStore = useAuthStore((state) => state.login)
    const navigate = useNavigate()
    const location = useLocation()
    const { toast } = useToast()

    // Error from ProtectedRoute redirection
    const navigationError = location.state?.error

    useEffect(() => {
        if (navigationError) {
            toast({
                title: "Acceso Restringido",
                description: navigationError,
                variant: 'destructive'
            })
            // Clear location state after showing toast
            window.history.replaceState({}, document.title)
        }
    }, [navigationError, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await authAPI.login({
                email: credentials.username,
                password: credentials.password
            })

            const userData = response.data.user
            const userRoleName = (typeof userData.role === 'object') ? userData.role.name : userData.role
            const normalizedRole = String(userRoleName).toUpperCase()

            console.log('Role Check:', { original: userRoleName, normalized: normalizedRole })

            // Validate Role Access for Operations Portal
            if (normalizedRole !== 'HR' && normalizedRole !== 'ADMIN') {
                toast({
                    title: "Acceso Denegado",
                    description: "Esta cuenta no tiene privilegios de Gestión Humana.",
                    variant: 'destructive'
                })
                setIsLoading(false)
                return
            }

            if (response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken)
                loginStore(userData, response.data.accessToken)

                toast({
                    title: "Acceso Autorizado",
                    description: "Bienvenido al portal operativo EdiCarex",
                })
                navigate('/attendance')
            }
        } catch (error) {
            toast({
                title: "Error de Autenticación",
                description: "Credenciales inválidas para el sistema operativo",
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="min-h-screen w-full bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden font-inter">
            {/* Cyberpunk Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex h-20 w-20 rounded-3xl bg-blue-600 items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] mb-6 border border-white/10 ring-4 ring-blue-600/20">
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Medi<span className="text-blue-500">Ops</span></h1>
                    <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.4em] mt-2">Operational Command Center</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Identificador de Usuario</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="text"
                                    required
                                    placeholder="OPERADOR_ID"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 text-white font-bold placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-blue-500/10 transition-all uppercase text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Llave de Acceso</Label>
                                <a href="#" className="text-[10px] font-black text-blue-500/50 uppercase tracking-widest hover:text-blue-500 transition-colors">Olvidé mi clave</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl pl-12 text-white font-bold placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-blue-500/10 transition-all uppercase text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/40 transition-all hover:-translate-y-1 active:scale-95 group"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Autenticar Sistema <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="mt-10 text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
                        Seguridad de Grado Militar EdiCarex
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Auditoría Activo</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
