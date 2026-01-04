import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Label } from '@/components/ui/label'
import {
    Clock,
    DollarSign,
    Calendar,
    ShieldCheck,
    Plus,
    Search,
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2,
    Copy,
    Printer,
    Eye,
    TrendingUp,
    Download,
    ArrowUpRight,
    LayoutDashboard
} from 'lucide-react'
import { hrAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLocation } from 'react-router-dom'

export default function AttendancePage() {
    const location = useLocation()

    // Determine the active tab based on the URL path
    const getTabFromPath = () => {
        if (location.pathname.includes('/ops')) return 'ops'
        if (location.pathname.includes('/shifts')) return 'shifts'
        if (location.pathname.includes('/payroll')) return 'payroll'
        return 'dashboard'
    }

    const [activeTab, setActiveTab] = useState(getTabFromPath())
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()

    // Data State
    const [data, setData] = useState<any>({
        employees: [],
        attendance: [],
        payroll: [],
        shifts: []
    })

    // Modals State
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
    const [isEditingShift, setIsEditingShift] = useState(false)
    const [currentShiftId, setCurrentShiftId] = useState<string | null>(null)
    const [shiftForm, setShiftForm] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '17:00',
        type: 'MORNING'
    })

    const [isPaystubModalOpen, setIsPaystubModalOpen] = useState(false)
    const [selectedPaystub, setSelectedPaystub] = useState<any>(null)

    // Sync state with URL manually if needed, or just use location
    useEffect(() => {
        setActiveTab(getTabFromPath())
    }, [location.pathname])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [emp, att, pay, shi] = await Promise.all([
                hrAPI.getEmployees(),
                hrAPI.getAttendance(),
                hrAPI.getPayroll(),
                hrAPI.getShifts()
            ])

            setData({
                employees: emp.data.data,
                attendance: att.data,
                payroll: pay.data,
                shifts: shi.data.map((s: any) => ({
                    ...s,
                    rawDate: format(new Date(s.startTime), 'yyyy-MM-dd'),
                    startTime: format(new Date(s.startTime), 'HH:mm'),
                    endTime: format(new Date(s.endTime), 'HH:mm'),
                    dayName: format(new Date(s.startTime), 'eeee', { locale: es })
                }))
            })
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudieron cargar los datos operativos', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    // --- SHIFT LOGIC ---
    const resetShiftForm = () => {
        setShiftForm({
            employeeId: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            startTime: '08:00',
            endTime: '17:00',
            type: 'MORNING'
        })
        setIsEditingShift(false)
        setCurrentShiftId(null)
    }

    const handleEditShift = (shift: any) => {
        setShiftForm({
            employeeId: String(shift.employeeId),
            date: shift.rawDate,
            startTime: shift.startTime,
            endTime: shift.endTime,
            type: shift.type
        })
        setCurrentShiftId(shift.id)
        setIsEditingShift(true)
        setIsShiftModalOpen(true)
    }

    const handleCopyShift = (shift: any) => {
        setShiftForm({
            employeeId: String(shift.employeeId),
            date: shift.rawDate,
            startTime: shift.startTime,
            endTime: shift.endTime,
            type: shift.type
        })
        setCurrentShiftId(null)
        setIsEditingShift(false)
        setIsShiftModalOpen(true)
        toast({ title: 'Turno Copiado', description: 'Listo para nueva asignación' })
    }

    const handleSaveShift = async () => {
        try {
            const start = new Date(`${shiftForm.date}T${shiftForm.startTime}:00`)
            const end = new Date(`${shiftForm.date}T${shiftForm.endTime}:00`)

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                toast({ title: 'Error', description: 'Fecha u horas inválidas', variant: 'destructive' })
                return
            }

            const payload = {
                employeeId: shiftForm.employeeId,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                type: shiftForm.type
            }

            if (isEditingShift && currentShiftId) {
                await hrAPI.updateShift(currentShiftId, payload)
                toast({ title: 'Turno Actualizado' })
            } else {
                await hrAPI.createShift(payload)
                toast({ title: 'Turno Registrado' })
            }

            setIsShiftModalOpen(false)
            loadData()
        } catch (error) {
            toast({ title: 'Error al guardar', variant: 'destructive' })
        }
    }

    const handleDeleteShift = async (id: string) => {
        if (!confirm('¿Eliminar esta asignación?')) return
        try {
            await hrAPI.deleteShift(id)
            loadData()
        } catch (error) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    // --- PAYROLL LOGIC ---
    const handleGeneratePayroll = async () => {
        try {
            await hrAPI.generatePayroll()
            toast({ title: 'Planilla Generada', description: 'Cálculos actualizados para el mes actual' })
            loadData()
        } catch (error) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    const handlePayPayroll = async (id: string) => {
        try {
            await hrAPI.payPayroll(id)
            toast({ title: 'Pago Procesado', description: 'La boleta ya puede ser descargada' })
            loadData()
        } catch (error) {
            toast({ title: 'Error', variant: 'destructive' })
        }
    }

    const handleViewPaystub = (payroll: any) => {
        setSelectedPaystub(payroll)
        setIsPaystubModalOpen(true)
    }

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header dinámico por tab */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/5">
                        {activeTab === 'dashboard' && <LayoutDashboard className="h-10 w-10 text-blue-500" />}
                        {activeTab === 'ops' && <Clock className="h-10 w-10 text-blue-500" />}
                        {activeTab === 'shifts' && <Calendar className="h-10 w-10 text-blue-500" />}
                        {activeTab === 'payroll' && <DollarSign className="h-10 w-10 text-blue-500" />}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
                            {activeTab === 'dashboard' && 'Portal Operativo'}
                            {activeTab === 'ops' && 'Control de Marcaciones'}
                            {activeTab === 'shifts' && 'Planificación Maestro'}
                            {activeTab === 'payroll' && 'Gestión de Nómina'}
                        </h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            Módulo de Alta Disponibilidad <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></span> Contexto: {activeTab.toUpperCase()}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {activeTab === 'shifts' && (
                        <Button
                            onClick={() => { resetShiftForm(); setIsShiftModalOpen(true); }}
                            className="h-12 rounded-xl px-10 bg-blue-600 hover:bg-blue-700 font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/30 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Programar Turno
                        </Button>
                    )}
                    {activeTab === 'payroll' && (
                        <Button onClick={handleGeneratePayroll} className="h-12 rounded-xl px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                            Cerrar Planilla Mensual
                        </Button>
                    )}
                    <Button variant="outline" className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold px-6">
                        <Download className="h-4 w-4 mr-2" /> Exportar Data
                    </Button>
                </div>
            </div>

            {/* Renderizado de Contenido por Tab */}
            <div className="animate-in slide-in-from-bottom-6 duration-700">
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="bg-white/5 border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                            <Clock className="h-12 w-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Monitor de Marcaciones</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Gestione entradas, salidas y correcciones manuales de marcaciones con trazabilidad total.</p>
                            <div className="text-3xl font-black text-white">{data.attendance.length} <span className="text-xs font-normal text-slate-500 uppercase tracking-widest ml-2">Registros hoy</span></div>
                        </Card>
                        <Card className="bg-white/5 border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                            <Calendar className="h-12 w-12 text-blue-500 mb-6" />
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Planificador de Turnos</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Asigne jornadas, duplique semanas exitosas y controle la cobertura por áreas.</p>
                            <div className="text-3xl font-black text-white">{data.shifts.length} <span className="text-xs font-normal text-slate-500 uppercase tracking-widest ml-2">Turnos activos</span></div>
                        </Card>
                        <Card className="bg-white/5 border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors">
                            <DollarSign className="h-12 w-12 text-emerald-500 mb-6" />
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Motor Financiero</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Cálculo automatizado de haberes, descuentos por tardanza y emisión de boletas legales.</p>
                            <div className="text-3xl font-black text-emerald-500">S/ {data.payroll.length * 2500 || 0} <span className="text-xs font-normal text-slate-500 uppercase tracking-widest ml-2">Proyectado</span></div>
                        </Card>
                    </div>
                )}

                {activeTab === 'shifts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                        {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map((day) => {
                            const dayShifts = data.shifts.filter((s: any) => s.dayName === day)
                            return (
                                <div key={day} className="space-y-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{day}</p>
                                    </div>
                                    <div className="space-y-3">
                                        {dayShifts.map((shift: any) => (
                                            <div key={shift.id} className="group relative bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all shadow-sm">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-8 w-8 ring-2 ring-blue-500/10">
                                                        <AvatarImage src={shift.employee?.photo} />
                                                        <AvatarFallback className="text-[9px] font-black">{shift.employee?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-white truncate max-w-[80px]">{shift.employee?.name}</p>
                                                        <p className="text-[8px] font-bold text-blue-500 uppercase tracking-tighter">{shift.type}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> {shift.startTime} - {shift.endTime}
                                                </p>

                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-6 w-6 p-0 rounded-full hover:bg-blue-500/10 text-white">
                                                                <MoreHorizontal className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 bg-zinc-900 border-white/10 text-white">
                                                            <DropdownMenuItem onClick={() => handleEditShift(shift)} className="gap-2 font-bold text-[10px] uppercase tracking-widest focus:bg-white/5">
                                                                <Pencil className="h-3 w-3 text-blue-500" /> Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleCopyShift(shift)} className="gap-2 font-bold text-[10px] uppercase tracking-widest focus:bg-white/5">
                                                                <Copy className="h-3 w-3 text-blue-500" /> Copiar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                            <DropdownMenuItem onClick={() => handleDeleteShift(shift.id)} className="gap-2 font-bold text-[10px] uppercase tracking-widest text-red-500 focus:bg-red-500/10">
                                                                <Trash2 className="h-3 w-3" /> Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'ops' && (
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                            <div className="flex justify-between items-center text-white">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Bitácora de <span className="text-blue-500">Eventos</span></h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Visualización de marcaciones biométricas y remotas</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <Input placeholder="FILTRAR POR COLABORADOR..." className="pl-12 h-12 text-[10px] font-black uppercase rounded-xl border-white/10 bg-black/40 text-white focus:ring-blue-500/20" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="hover:bg-transparent border-white/10 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        <TableHead className="px-8 py-5">Colaborador</TableHead>
                                        <TableHead>Fecha Marcación</TableHead>
                                        <TableHead>Punto de Entrada</TableHead>
                                        <TableHead>Punto de Salida</TableHead>
                                        <TableHead>Hrs Netas</TableHead>
                                        <TableHead>Estatus</TableHead>
                                        <TableHead className="text-right px-8">Audit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.attendance.map((a: any) => (
                                        <TableRow key={a.id} className="hover:bg-white/5 transition-colors border-white/5 text-slate-300">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 ring-1 ring-white/10">
                                                        <AvatarImage src={a.employee?.photo} />
                                                        <AvatarFallback className="bg-white/5 text-[10px] uppercase font-black">{a.employee?.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <p className="text-[10px] font-black uppercase tracking-tight">{a.employee?.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-[10px] font-bold uppercase">{format(new Date(a.checkIn), 'dd MMM yyyy', { locale: es })}</TableCell>
                                            <TableCell className="text-[10px] font-mono font-black text-blue-400">{format(new Date(a.checkIn), 'HH:mm:ss')}</TableCell>
                                            <TableCell className="text-[10px] font-mono font-black text-emerald-400">
                                                {a.checkOut ? format(new Date(a.checkOut), 'HH:mm:ss') : '--:--:--'}
                                            </TableCell>
                                            <TableCell className="text-[10px] font-black text-white">{(a.hoursWorked || 0).toFixed(2)} Hrs</TableCell>
                                            <TableCell>
                                                <Badge className={`text-[8px] font-black uppercase tracking-tighter ${a.status === 'ON_TIME' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`} variant="outline">
                                                    {a.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-slate-500">
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'payroll' && (
                    <Card className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Nómina Operativa <span className="text-emerald-500">MediSync</span></h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Cálculo de boletas basado en marcaciones auditadas</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-white/5">
                                    <TableRow className="hover:bg-transparent border-white/10 text-[10px] font-black uppercase text-slate-400">
                                        <TableHead className="px-8 py-5">Colaborador</TableHead>
                                        <TableHead>Ingreso Bruto</TableHead>
                                        <TableHead>Descuentos</TableHead>
                                        <TableHead>Bonos</TableHead>
                                        <TableHead>Neto Final</TableHead>
                                        <TableHead>Estatus Financiero</TableHead>
                                        <TableHead className="text-right px-8">Boleta</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.payroll.map((p: any) => (
                                        <TableRow key={p.id} className="hover:bg-emerald-500/5 transition-colors border-white/5 text-slate-300">
                                            <TableCell className="px-8 py-5 text-[10px] font-black uppercase text-white">{p.employee?.name}</TableCell>
                                            <TableCell className="text-[10px] font-bold">S/ {Number(p.baseSalary).toLocaleString()}</TableCell>
                                            <TableCell className="text-[10px] font-bold text-red-500">S/ {Number(p.deductions).toLocaleString()}</TableCell>
                                            <TableCell className="text-[10px] font-bold text-emerald-500">S/ {Number(p.bonuses).toLocaleString()}</TableCell>
                                            <TableCell className="text-base font-black tracking-tighter text-white">S/ {Number(p.netSalary).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-[8px] font-black uppercase ${p.status === 'PAID' ? 'bg-emerald-600' : 'bg-orange-600'} text-white border-none`}>
                                                    {p.status === 'PAID' ? 'TRANSFERIDO' : 'POR PROCESAR'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right px-8 flex gap-2 justify-end">
                                                <Button onClick={() => handleViewPaystub(p)} variant="outline" size="sm" className="h-9 px-4 text-[9px] font-black uppercase rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white">
                                                    PDF <Eye className="h-3 w-3 ml-2" />
                                                </Button>
                                                {p.status !== 'PAID' && (
                                                    <Button onClick={() => handlePayPayroll(p.id)} size="sm" className="h-9 px-4 text-[9px] font-black uppercase rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20">
                                                        Pagar
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* MODALS REUSED FROM PREVIOUS LOGIC (OMITTED FOR BREVITY BUT KEPT IN PRODUCTION CODE) */}
            {/* [IS SHIFT MODAL - SAME AS BEFORE BUT WITH DARK THEME OVERRIDES] */}
            {/* [IS PAYSTUB MODAL - SAME AS BEFORE BUT WITH DARK THEME OVERRIDES] */}
            <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
                <DialogContent className="sm:max-w-[450px] bg-[#0c0c0e] border-white/10 p-8 rounded-3xl shadow-3xl text-white">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                            {isEditingShift ? 'Editar' : 'Programar'} <span className="text-blue-500">Turno</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Colaborador</Label>
                            <Select value={shiftForm.employeeId} onValueChange={(v) => setShiftForm({ ...shiftForm, employeeId: v })}>
                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-xs font-bold text-white uppercase px-4">
                                    <SelectValue placeholder="SELECCIONE..." />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    {data.employees.map((e: any) => (
                                        <SelectItem key={e.id} value={String(e.id)} className="text-[10px] font-bold uppercase focus:bg-white/10">{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="date" value={shiftForm.date} onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })} className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold" />
                            <Select value={shiftForm.type} onValueChange={(v) => setShiftForm({ ...shiftForm, type: v })}>
                                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-[10px] font-black uppercase px-4"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10">
                                    <SelectItem value="MORNING" className="text-[10px] font-black uppercase">☀️ Mañana</SelectItem>
                                    <SelectItem value="AFTERNOON" className="text-[10px] font-black uppercase">⛅ Tarde</SelectItem>
                                    <SelectItem value="NIGHT" className="text-[10px] font-black uppercase">🌙 Noche</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold" />
                            <Input type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} className="h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold" />
                        </div>
                    </div>
                    <DialogFooter className="mt-8 flex gap-3">
                        <Button variant="ghost" onClick={() => setIsShiftModalOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5">Cerrar</Button>
                        <Button onClick={handleSaveShift} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-10 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPaystubModalOpen} onOpenChange={setIsPaystubModalOpen}>
                <DialogContent className="sm:max-w-[750px] bg-white text-zinc-900 p-0 border-none rounded-2xl overflow-hidden shadow-4xl">
                    {selectedPaystub && (
                        <div className="p-12 space-y-10">
                            {/* Header Boleta (Light Theme for Printing) */}
                            <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                                        <ShieldCheck className="h-10 w-10 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Boleta de <span className="text-blue-600">Pago</span></h2>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">MediSync Operational Portal</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black uppercase tracking-widest">MediSync Enterprise S.A.C.</p>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">PERIODO: ENERO 2026</p>
                                </div>
                            </div>

                            {/* Detalle Empleado */}
                            <div className="grid grid-cols-2 gap-12 bg-zinc-50 p-8 rounded-2xl">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Colaborador</p>
                                        <p className="text-sm font-black uppercase">{selectedPaystub.employee?.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Nro Cuenta</p>
                                        <p className="text-xs font-mono font-bold tracking-tighter">{(selectedPaystub.employee as any)?.bankAccount || '193-************-91'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Cargo Operativo</p>
                                        <p className="text-sm font-black uppercase">{(selectedPaystub.employee as any)?.area || 'MÉDICO STAFF'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Audit ID</p>
                                        <p className="text-xs font-mono font-bold text-blue-600">MED-OPS-#{selectedPaystub.id.slice(-6)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de Conceptos */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-20">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-zinc-100 pb-2 flex justify-between">
                                            <span>Haberes / Ingresos</span>
                                            <span>Importe</span>
                                        </h4>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                                            <span>Sueldo Básico</span>
                                            <span className="text-zinc-900">S/ {Number(selectedPaystub.baseSalary).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                                            <span>Bonos Operativos</span>
                                            <span className="text-emerald-600">S/ {Number(selectedPaystub.bonuses).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] border-b border-zinc-100 pb-2 flex justify-between">
                                            <span>Deducciones</span>
                                            <span>Importe</span>
                                        </h4>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                                            <span>AFP / Pensiones</span>
                                            <span className="text-zinc-900">- S/ {(Number(selectedPaystub.baseSalary) * 0.13).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-zinc-500">
                                            <span>Tardanzas Rec.</span>
                                            <span className="text-red-500">- S/ {Number(selectedPaystub.deductions).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Neto Final */}
                            <div className="bg-zinc-900 text-white p-10 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">Total Neto Percibido</p>
                                    <p className="text-xs font-medium opacity-70 mt-1 italic italic">Transferencia exitosa vía BBVA/BCP</p>
                                </div>
                                <div className="text-5xl font-black tracking-tighter">S/ {Number(selectedPaystub.netSalary).toLocaleString()}</div>
                            </div>

                            <div className="flex justify-between pt-10 no-print">
                                <Button variant="ghost" onClick={() => setIsPaystubModalOpen(false)} className="text-[10px] font-black uppercase text-zinc-400">Cerrar</Button>
                                <Button onClick={() => window.print()} className="bg-blue-600 px-12 h-14 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/30">
                                    <Printer className="h-5 w-5 mr-3" /> Imprimir Boleta
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
