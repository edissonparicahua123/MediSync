import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Activity,
    Server,
    RefreshCw,
    Lock,
    Zap,
    Construction,
    Cpu,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api'; // Import API instance
import { Toaster, toast } from 'sonner'; // User requested sonner

const ROBOT_IMAGES = [
    '/assets/robot-1.png',
    '/assets/robot-2.png',
    '/assets/robot-3.png',
    '/assets/robot-4.png',
    '/assets/robot-5.png',
    '/assets/robot-6.png',
];

export default function MaintenancePage() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % ROBOT_IMAGES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        setIsChecking(true);
        try {
            await api.get('/users/me');

            // SUCCESS TOAST
            toast.custom((t) => (
                <div className="flex flex-col items-center justify-center w-[500px] bg-[#0f172a]/95 backdrop-blur-3xl border border-teal-500/40 rounded-3xl p-8 shadow-[0_0_100px_rgba(20,184,166,0.5)] animate-in zoom-in-95 duration-300">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 animate-pulse" />
                        <CheckCircle2 className="w-20 h-20 text-teal-400 relative z-10 drop-shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
                    </div>

                    <h3 className="text-3xl font-black text-white mb-2 text-center tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-teal-400">SISTEMA ONLINE</span>
                    </h3>

                    <p className="text-teal-100/70 text-center text-lg mb-6 leading-relaxed">
                        Conexión segura establecida con el núcleo.
                        <br />Iniciando protocolos de acceso...
                    </p>

                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '100%' }} />
                    </div>
                </div>
            ), { duration: 3000 });

            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error: any) {
            const status = error.response?.status;

            if (status === 503) {
                // MAINTENANCE TOAST - ULTRA PREMIUM
                toast.custom((t) => (
                    <div className="flex flex-col items-center justify-center w-[500px] bg-[#0a0a0a]/95 backdrop-blur-3xl border border-orange-500/40 rounded-3xl p-8 shadow-[0_0_100px_rgba(249,115,22,0.4)] animate-in zoom-in-95 duration-300 relative overflow-hidden">

                        {/* Background subtle noise/grid */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                        <div className="relative mb-6 group">
                            <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                            <Construction className="w-20 h-20 text-orange-500 relative z-10 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-bounce" />
                        </div>

                        <h3 className="text-3xl font-black text-white mb-3 text-center uppercase tracking-widest">
                            Mantenimiento
                        </h3>

                        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full mb-6">
                            <span className="text-orange-400 text-xs font-bold tracking-[0.2em] flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                ACCESO DENEGADO
                            </span>
                        </div>

                        <p className="text-slate-400 text-center text-base leading-relaxed max-w-sm">
                            El sistema se encuentra en una ventana de actualización crítica. Por favor, reintente en unos minutos.
                        </p>

                        <button
                            onClick={() => toast.dismiss(t)}
                            className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                ), { duration: 5000 });
            }
            else if (status === 401) {
                // AUTH TOAST
                toast.custom((t) => (
                    <div className="flex flex-col items-center justify-center w-[450px] bg-[#0f172a]/95 backdrop-blur-3xl border border-blue-500/40 rounded-3xl p-8 shadow-[0_0_80px_rgba(59,130,246,0.4)] animate-in zoom-in-95 duration-300">
                        <div className="relative mb-4">
                            <Lock className="w-16 h-16 text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center">Credenciales Requeridas</h3>
                        <p className="text-blue-200/70 text-center mb-4">Redirigiendo al portal de acceso...</p>
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ));
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
            else {
                toast.error("Error de conexión");
            }
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-teal-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.15),transparent_50%)]" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Column: Visual Core */}
                <div className="relative flex justify-center lg:justify-end order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-80 h-80 md:w-[500px] md:h-[500px]"
                    >
                        {/* Rotating Rings */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border border-teal-500/20 border-t-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-12 rounded-full border border-emerald-500/20 border-b-emerald-500/50"
                        />
                        <motion.div
                            animate={{ rotate: 180 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-24 rounded-full border border-blue-500/20 border-l-blue-500/50"
                        />

                        {/* Center Robot Image Carousel */}
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                                <AnimatePresence mode='wait'>
                                    <motion.img
                                        key={currentImageIndex}
                                        src={ROBOT_IMAGES[currentImageIndex]}
                                        alt="Maintenance Robot"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-transparent pointer-events-none" />
                            </div>
                        </div>

                        {/* Floating Tech Icons */}
                        <motion.div animate={{ x: [0, 10, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-0 right-10 bg-slate-900/80 p-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg shadow-teal-500/20">
                            <Server className="w-6 h-6 text-blue-400" />
                        </motion.div>
                        <motion.div animate={{ x: [0, -10, 0], y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute bottom-10 left-0 bg-slate-900/80 p-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg shadow-emerald-500/20">
                            <Lock className="w-6 h-6 text-emerald-400" />
                        </motion.div>
                        <motion.div animate={{ x: [0, 5, 0], y: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-20 left-4 bg-slate-900/80 p-3 rounded-xl border border-white/10 backdrop-blur-md shadow-lg shadow-purple-500/20">
                            <Cpu className="w-6 h-6 text-purple-400" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Column: Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-left space-y-6 order-1 lg:order-2"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
                        <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                        <span className="text-xs font-semibold text-teal-400 tracking-wider uppercase">SISTEMA EN MANTENIMIENTO</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                        EdiCarex <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Enterprise</span>
                    </h1>

                    <p className="text-lg text-slate-400 leading-relaxed max-w-md border-l-4 border-teal-500/50 pl-6">
                        El equipo de especialistas del <span className="text-teal-400 font-bold">Ing. Edisson Paricahua</span> está ejecutando maniobras de optimización avanzada.
                        <br /><span className="text-emerald-500 font-medium opacity-90">Por favor, espere mientras reestablecemos el núcleo.</span>
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Estado</div>
                            <div className="text-white font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                Despliegue en Curso
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Cierre Estimado</div>
                            <div className="text-white font-medium">
                                {(() => {
                                    // Logic: Round up to the next even hour + 2 hours buffer
                                    // This prevents the time from constantly shifting on refresh
                                    const now = new Date();
                                    const nextEvenHour = Math.ceil(now.getHours() / 2) * 2 + 2;
                                    const targetDate = new Date(now);
                                    targetDate.setHours(nextEvenHour, 0, 0, 0);

                                    // If target is practically now (unlikely due to math), add 2 more hours
                                    if (targetDate <= now) {
                                        targetDate.setHours(targetDate.getHours() + 2);
                                    }

                                    return targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={checkStatus}
                            disabled={isChecking}
                        >
                            <RefreshCw className={`mr-2 h-5 w-5 ${isChecking ? 'animate-spin' : 'animate-spin-slow'}`} />
                            {isChecking ? 'Verificando...' : 'Verificar Estado'}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-[10px] font-bold tracking-[0.3em] text-slate-600 uppercase">
                    EdiCarex System v3.0 • Secure Hospital Management
                </p>
            </div>

            {/* FORCE CENTERED TOASTER - TOP CENTER */}
            <Toaster
                position="top-center"
                richColors
                toastOptions={{
                    style: {
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    },
                    className: 'w-full flex justify-center',
                }}
            />
        </div>
    );
}
