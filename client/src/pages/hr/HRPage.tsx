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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    UserCog,
    Plus,
    Camera,
    LayoutGrid,
    LayoutList,
    Layers,
    History,
    ArrowUpRight,
    Search,
    Loader2,
    Users,
    Clock,
    DollarSign,
    Calendar as CalendarIcon,
    CheckCircle,
    XCircle,
    AlertCircle,
    BadgeCheck,
    Briefcase,
    ShieldCheck,
    Contact,
    CreditCard,
    PhoneCall,
    MapPin,
    Baby,
    VenetianMask,
    Info,
    Mail,
    Smartphone,
    MapPin as MapPinIcon,
    Globe,
    CalendarDays,
    CreditCard as CreditCardIcon,
    Heart,
    Edit,
    Activity,
    TrendingUp,
    TrendingDown,
    Printer,
    FileText,
    Eye,
    AlertTriangle,
    Filter,
    Download,
    Mail as MailIcon,
    Sun,
    Sunset,
    Moon
} from 'lucide-react'
import { hrAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { useNavigate, Link } from 'react-router-dom'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart as RePieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts'

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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function HRPage() {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    // Modals and Data State
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('staff')
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const { toast } = useToast()

    // Essential Modal State (Remaining in Dashboard)
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [selectedPayroll, setSelectedPayroll] = useState<any>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isPaystubModalOpen, setIsPaystubModalOpen] = useState(false)


    // Datos de HR
    const [hrData, setHrData] = useState<any>({
        employees: [],
        attendance: [],
        payroll: [],
        shifts: [],
    })

    useEffect(() => {
        loadHRData()
    }, [])


    const loadHRData = async () => {
        try {
            setLoading(true)

            // [REAL] Fetch data from Backend
            const [employeesRes, attendanceRes, payrollRes, shiftsRes] = await Promise.all([
                hrAPI.getEmployees(),
                hrAPI.getAttendance(),
                hrAPI.getPayroll(),
                hrAPI.getShifts()
            ])

            // Map Backend Data to Frontend Structure
            // Note: Backend returns { data: [], meta: ... } for some, array for others
            // Adjust based on actual API return signature in hr.service.ts

            const realData = {
                employees: employeesRes.data.data.map((e: any) => ({
                    ...e,
                    area: e.area || e.department,
                    contract: e.contract || 'Tiempo Completo',
                    photo: e.photo || `https://ui-avatars.com/api/?name=${e.name}`
                })),
                attendance: attendanceRes.data.map((a: any) => ({
                    id: a.id,
                    employeeName: a.employee?.name || 'Unknown',
                    employeePhoto: a.employee?.photo || `https://ui-avatars.com/api/?name=${a.employee?.name || 'U'}`,
                    date: new Date(a.checkIn),
                    checkIn: new Date(a.checkIn),
                    checkOut: a.checkOut ? new Date(a.checkOut) : null,
                    hoursWorked: Number(a.hoursWorked) || 0,
                    tardiness: a.tardiness || 0,
                    status: a.status,
                    notes: a.notes
                })),
                payroll: payrollRes.data.map((p: any) => {
                    const base = Number(p.baseSalary)
                    const totalDeductions = Number(p.deductions)
                    const pension = base * 0.13
                    const otherDiscounts = totalDeductions - pension

                    return {
                        id: p.id,
                        employeeName: p.employee?.name || 'Unknown',
                        employeePhoto: p.employee?.photo || `https://ui-avatars.com/api/?name=${p.employee?.name || 'U'}`,
                        employeeDni: p.employee?.documentId || 'N/A',
                        employeeArea: p.employee?.area || 'General',
                        employeeBankAccount: p.employee?.bankAccount || 'N/A',
                        baseSalary: base,
                        pension: pension,
                        discounts: otherDiscounts > 0 ? otherDiscounts : 0,
                        bonuses: Number(p.bonuses),
                        finalAmount: Number(p.netSalary),
                        status: p.status || 'PAID',
                        period: p.periodStart ? new Date(p.periodStart) : new Date()
                    }
                }),
                shifts: shiftsRes.data.map((s: any) => {
                    const date = new Date(s.startTime)
                    const dayName = format(date, 'eeee', { locale: es })
                    // Capitalize first letter: lunes -> Lunes
                    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1)

                    return {
                        id: s.id,
                        employeeId: s.employeeId,
                        employeeName: s.employee?.name || 'Unknown',
                        employeePhoto: s.employee?.photo || `https://ui-avatars.com/api/?name=${s.employee?.name || 'U'}`,
                        day: capitalizedDay,
                        shift: s.type,
                        startTime: format(date, 'HH:mm'),
                        endTime: format(new Date(s.endTime), 'HH:mm'),
                        fullStart: s.startTime,
                        fullEnd: s.endTime
                    }
                })
            }

            setHrData(realData)
        } catch (error: any) {
            console.error('HR Load Error:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al cargar datos de RRHH',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Estadísticas
    const stats = {
        totalEmployees: hrData.employees.length,
        activeEmployees: hrData.employees.filter((e: any) => e.status === 'ACTIVE').length,
        presentToday: hrData.attendance.filter((a: any) => a.status !== 'ABSENT').length,
        totalPayroll: hrData.payroll.reduce((sum: number, p: any) => sum + p.finalAmount, 0),
        punctualityMonth: Math.round((hrData.attendance.filter((a: any) => a.status === 'ON_TIME').length / (hrData.attendance.length || 1)) * 100),
        absenteeism: Math.round((hrData.attendance.filter((a: any) => a.status === 'ABSENT').length / (hrData.attendance.length || 1)) * 100),
        avgTardiness: Math.round(hrData.attendance.reduce((sum: number, a: any) => sum + (a.tardiness || 0), 0) / (hrData.attendance.filter((a: any) => a.status === 'LATE').length || 1)),
        costPerEmployee: Math.round(hrData.payroll.reduce((sum: number, p: any) => sum + p.finalAmount, 0) / (hrData.payroll.length || 1)),
        coverage: Math.round((hrData.shifts.length / (hrData.employees.length * 5 || 1)) * 100), // Estimado basado en semana de 5 días
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800',
            VACATION: 'bg-blue-100 text-blue-800',
            SICK: 'bg-orange-100 text-orange-800',
            INACTIVE: 'bg-red-100 text-red-800',
        }
        return colors[status] || colors.ACTIVE
    }

    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case 'ON_TIME':
                return <CheckCircle className="h-4 w-4 text-green-600" />
            case 'LATE':
                return <AlertCircle className="h-4 w-4 text-orange-600" />
            case 'ABSENT':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                return <Clock className="h-4 w-4 text-gray-600" />
        }
    }

    const getShiftColor = (shift: string) => {
        const colors: Record<string, string> = {
            MORNING: 'bg-yellow-100 text-yellow-800',
            AFTERNOON: 'bg-orange-100 text-orange-800',
            NIGHT: 'bg-indigo-100 text-indigo-800',
        }
        return colors[shift] || colors.MORNING
    }

    // Modals y Helpers
    const handleViewDetails = (employee: any) => {
        setSelectedEmployee(employee)
        setIsDetailsModalOpen(true)
    }

    const handleViewPaystub = (record: any) => {
        setSelectedPayroll(record)
        setIsPaystubModalOpen(true)
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
            <div className="flex border-b border-border/50 pb-8 items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-[2rem] bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 backdrop-blur-md">
                        <Users className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">Portal <span className="text-indigo-500">Senior</span> RRHH</h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-70 flex items-center gap-2">
                            Módulo de Alta Disponibilidad • Contexto Estratégico
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link to="/attendance">
                        <Button className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 px-10 transition-all hover:scale-[1.02] active:scale-95 group">
                            Control de Asistencia Operativo <ArrowUpRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Empleados</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tracking-tighter text-foreground">{stats.totalEmployees}</div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                            {stats.activeEmployees} activos en sistema
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Disponibilidad Hoy</CardTitle>
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tracking-tighter text-emerald-500">{stats.presentToday}</div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                            Resumen operativo del día (sin detalle individual)
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl shadow-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Planilla Total (Mes)</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tracking-tighter text-blue-500">
                            S/ {stats.totalPayroll.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black">+3.2%</Badge>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Variación mensual</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Cobertura de Turnos</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black tracking-tighter text-foreground">{hrData.shifts.length}</div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">
                            Vista consolidada (sin edición)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Users className="h-4 w-4 mr-2" />
                        Colaboradores
                    </TabsTrigger>
                    <TabsTrigger value="schedules">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Horarios
                    </TabsTrigger>
                    <TabsTrigger value="payroll">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Nómina
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="schedules" className="mt-6 space-y-6 outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Métricas Inline de Turnos */}
                    <Card className="border-border/50 shadow-sm bg-indigo-500/5 border-indigo-500/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Resumen de Cobertura de Turnos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Turno Mañana</p>
                                    <p className="text-2xl font-black text-yellow-500 tracking-tighter">{hrData.shifts.filter((s: any) => s.shift === 'MORNING').length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Turno Tarde</p>
                                    <p className="text-2xl font-black text-orange-500 tracking-tighter">{hrData.shifts.filter((s: any) => s.shift === 'AFTERNOON').length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Turno Noche</p>
                                    <p className="text-2xl font-black text-indigo-500 tracking-tighter">{hrData.shifts.filter((s: any) => s.shift === 'NIGHT').length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Total Activos</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">{hrData.shifts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de Turnos Asignados */}
                    <Card className="border-border shadow-xl overflow-hidden bg-card/30 backdrop-blur-xl">
                        <CardHeader className="bg-muted/10 border-b border-border p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <CalendarIcon className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Horarios del Personal</CardTitle>
                                        <CardDescription className="text-[10px] uppercase tracking-widest">Turnos asignados desde el backend</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/5">
                                    <TableRow className="border-border">
                                        <TableHead className="px-6 py-4 text-[10px] font-black uppercase">Colaborador</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Día</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Turno</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Hora Inicio</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Hora Fin</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-center">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.shifts.map((shift: any) => {
                                        const employee = hrData.employees.find((e: any) => e.id === shift.employeeId || e.name === shift.employeeName);
                                        return (
                                            <TableRow key={shift.id} className="hover:bg-muted/5 border-border">
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 rounded-lg border border-border">
                                                            <AvatarImage src={shift.employeePhoto || employee?.photo} />
                                                            <AvatarFallback className="bg-indigo-500/10 text-indigo-500 font-bold text-xs">
                                                                {shift.employeeName?.charAt(0) || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-bold">{shift.employeeName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{shift.day}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-[9px] font-black uppercase ${getShiftColor(shift.shift)}`}>
                                                        {shift.shift === 'MORNING' ? 'Mañana' : shift.shift === 'AFTERNOON' ? 'Tarde' : 'Noche'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{shift.startTime}</TableCell>
                                                <TableCell className="font-mono text-sm">{shift.endTime}</TableCell>
                                                <TableCell className="text-center">
                                                    {employee && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(employee)}
                                                            className="h-8 w-8 p-0 hover:bg-indigo-500/10"
                                                        >
                                                            <Eye className="h-4 w-4 text-indigo-500" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {hrData.shifts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <CalendarIcon className="h-10 w-10" />
                                                    <p className="text-xs font-bold uppercase">No hay turnos registrados</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


                {/* Tab "Colaboradores" - Executive Directory */}
                <TabsContent value="staff" className="mt-6 space-y-6 outline-none">
                    <Card className="border-border/50 shadow-sm bg-indigo-500/5 border-indigo-500/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Métricas de Retención y Cultura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Rotación Mensual</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">2.4%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Antigüedad (Prom)</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">3.2a</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Satisfacción</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">4.8/5</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Diversidad</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">45/55</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NUEVO: Directorio Ejecutivo de Colaboradores (Vista Técnica Gerencial) */}
                    <Card className="border-border shadow-2xl overflow-hidden bg-card/30 backdrop-blur-xl border-t-4 border-t-indigo-500">
                        <CardHeader className="bg-muted/10 border-b border-border p-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Users className="h-5 w-5 text-indigo-500" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">Directorio <span className="text-indigo-500">Ejecutivo</span></CardTitle>
                                    </div>
                                    <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50">Mapa humano y administrativo de la institución</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="FILTRAR POR NOMBRE, DNI O CARGO..."
                                            className="pl-12 h-12 bg-background/50 border-border text-[10px] font-black uppercase rounded-xl focus:ring-indigo-500/20"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" className="h-12 border-border bg-background/50 rounded-xl px-6 group hover:bg-indigo-500/10 hover:text-indigo-500 transition-all font-bold">
                                        <Filter className="h-4 w-4 mr-2" /> Filtros Avanzados
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="px-8 py-6">Colaborador / Unidad</TableHead>
                                        <TableHead>DNI / Documento</TableHead>
                                        <TableHead>Nivel Contractual</TableHead>
                                        <TableHead>Estado Laboral</TableHead>
                                        <TableHead className="text-right px-8">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.employees
                                        .filter((emp: any) =>
                                            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            emp.documentId?.includes(searchTerm) ||
                                            emp.role.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((emp: any) => (
                                            <TableRow key={emp.id} className="hover:bg-indigo-500/5 transition-all border-border text-foreground group">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-11 w-11 rounded-xl border-2 border-background shadow-lg transition-transform group-hover:scale-105">
                                                                <AvatarImage src={emp.photo} className="object-cover" />
                                                                <AvatarFallback className="font-black bg-indigo-500/10 text-indigo-500 uppercase">{emp.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black uppercase tracking-tight leading-none">{emp.name}</p>
                                                            <p className="text-[9px] font-bold text-indigo-500/70 mt-1.5 uppercase tracking-widest">{emp.role} • {emp.area}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground opacity-40" />
                                                        <span className="text-xs font-mono font-bold tracking-tighter text-muted-foreground">{emp.documentId || '---'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[8px] font-black bg-indigo-500/5 border-indigo-500/20 text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-lg">
                                                        {emp.contract}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`text-[8px] font-black uppercase tracking-widest border-none ${emp.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                                                        {emp.status === 'ACTIVE' ? 'EN FUNCIONES' : 'LICENCIA/INACTIVO'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 px-6 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-indigo-500/20 hover:shadow-lg"
                                                        onClick={() => handleViewDetails(emp)}
                                                    >
                                                        Explorar Perfil <Eye className="ml-3 h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    {hrData.employees.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-60 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                                    <Users className="h-12 w-12" />
                                                    <p className="text-xs font-black uppercase tracking-[0.3em]">Base de datos vacía</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab "Nómina" - Payroll Records */}
                <TabsContent value="payroll" className="mt-6 space-y-6 outline-none animate-in fade-in slide-in-from-right-4 duration-300">
                    {/* Métricas Inline de Nómina */}
                    <Card className="border-border/50 shadow-sm bg-emerald-500/5 border-emerald-500/10">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Resumen de Planilla</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Total Planilla</p>
                                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">S/ {hrData.payroll.reduce((acc: number, p: any) => acc + (Number(p.netSalary) || 0), 0).toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Boletas</p>
                                    <p className="text-2xl font-black text-blue-500 tracking-tighter">{hrData.payroll.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Pendientes</p>
                                    <p className="text-2xl font-black text-orange-500 tracking-tighter">{hrData.payroll.filter((p: any) => p.status === 'PENDING').length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Pagados</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">{hrData.payroll.filter((p: any) => p.status === 'PAID').length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de Nómina */}
                    <Card className="border-border shadow-xl overflow-hidden bg-card/30 backdrop-blur-xl">
                        <CardHeader className="bg-muted/10 border-b border-border p-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <DollarSign className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black uppercase tracking-tight">Registros de Nómina</CardTitle>
                                        <CardDescription className="text-[10px] uppercase tracking-widest">Historial de pagos desde el backend</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/5">
                                    <TableRow className="border-border">
                                        <TableHead className="px-6 py-4 text-[10px] font-black uppercase">Colaborador</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Período</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Salario Base</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Bonificaciones</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Deducciones</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Neto</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase">Estado</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase text-center">Boleta</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.payroll.map((record: any) => (
                                        <TableRow key={record.id} className="hover:bg-muted/5 border-border">
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 rounded-lg border border-border">
                                                        <AvatarImage src={record.employeePhoto} />
                                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                                                            {record.employeeName?.charAt(0) || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-bold">{record.employeeName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{typeof record.period === 'string' ? record.period : format(new Date(record.period || record.createdAt || Date.now()), 'MMM yyyy', { locale: es })}</TableCell>
                                            <TableCell className="font-mono text-sm">S/ {Number(record.baseSalary || 0).toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-sm text-emerald-500">+S/ {Number(record.bonuses || 0).toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-sm text-red-500">-S/ {Number(record.deductions || 0).toLocaleString()}</TableCell>
                                            <TableCell className="font-mono text-sm font-bold">S/ {Number(record.netSalary || 0).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge className={`text-[9px] font-black uppercase ${record.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600' : record.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    {record.status === 'PAID' ? 'Pagado' : record.status === 'PENDING' ? 'Pendiente' : 'Procesando'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewPaystub(record)}
                                                    className="h-8 w-8 p-0 hover:bg-indigo-500/10"
                                                >
                                                    <Eye className="h-4 w-4 text-indigo-500" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {hrData.payroll.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <DollarSign className="h-10 w-10" />
                                                    <p className="text-xs font-bold uppercase">No hay registros de nómina</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Visor de Detalles "Senior Profile Viewer" (Executive Read-Only) */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-[#0c0c0e] border-white/10 shadow-3xl rounded-[2.5rem] text-white">
                    <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh]">
                        {/* Sidebar Estratégico */}
                        <div className="md:col-span-4 bg-white/5 p-10 flex flex-col items-center border-r border-white/5 relative bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.1),transparent)]">
                            <div className="relative mb-8 pt-6">
                                <div className="h-44 w-44 rounded-[3rem] overflow-hidden border-4 border-indigo-500/30 shadow-2xl relative p-1 bg-gradient-to-tr from-indigo-500/20 to-transparent">
                                    <div className="h-full w-full rounded-[2.8rem] overflow-hidden bg-zinc-900 border border-white/10">
                                        <Avatar className="h-full w-full rounded-none">
                                            <AvatarImage src={selectedEmployee?.photo} className="object-cover" />
                                            <AvatarFallback className="text-5xl font-black bg-indigo-500 text-white">
                                                {selectedEmployee?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    <Badge className="bg-emerald-500 text-white font-black px-4 py-1.5 rounded-full border-4 border-[#0c0c0e] text-[9px] uppercase tracking-widest shadow-xl">
                                        VERIFICADO
                                    </Badge>
                                </div>
                            </div>

                            <div className="text-center space-y-2 mb-10">
                                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-tight">
                                    {selectedEmployee?.name?.split(' ')[0]} <span className="text-indigo-500">{selectedEmployee?.name?.split(' ')[1]}</span>
                                </h2>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 font-mono">
                                        ID-OPS #88{selectedEmployee?.documentId?.slice(-4)}
                                    </p>
                                </div>
                            </div>

                            {/* Acciones Rápidas Unificadas */}
                            <div className="w-full space-y-3">
                                <Button
                                    onClick={() => { setIsDetailsModalOpen(false); navigate(`/attendance?search=${selectedEmployee?.name}`); }}
                                    className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 group"
                                >
                                    <Activity className="mr-3 h-5 w-5 text-indigo-500 group-hover:animate-bounce" /> Ver Detalle en Asistencia
                                </Button>
                                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 active:scale-95 group">
                                    <Download className="mr-3 h-5 w-5 group-hover:translate-y-1 transition-transform" /> Descargar Ficha Técnica
                                </Button>
                            </div>
                        </div>

                        {/* Panel de Datos "Executive View" */}
                        <div className="md:col-span-8 p-12 overflow-y-auto custom-scrollbar bg-gradient-to-br from-transparent to-indigo-500/[0.02]">
                            <div className="space-y-12">
                                {/* Fila 1: KPIs Personales (Mocked/Calculated base) */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1 flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center mb-3">
                                            <span className="text-xs font-black text-emerald-500">98%</span>
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Puntualidad</p>
                                        <p className="text-xl font-black text-white italic tracking-tighter">EFICIENTE</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1 flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                                            <XCircle className="h-6 w-6 text-orange-500" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Ausencias</p>
                                        <p className="text-xl font-black text-white italic tracking-tighter">02 DÍAS</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-1 flex flex-col items-center">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3">
                                            <TrendingUp className="h-6 w-6 text-indigo-500" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Horas Extra</p>
                                        <p className="text-xl font-black text-white italic tracking-tighter">+12.5 hrs</p>
                                    </div>
                                </div>

                                {/* Secciones de Datos */}
                                <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 flex items-center gap-3">
                                                <span className="h-px w-8 bg-indigo-500" /> Identidad Admin
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">DNI Titular</p>
                                                    <p className="text-sm font-black tracking-widest text-white/90">{selectedEmployee?.documentId || '---'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Email Corporativo</p>
                                                    <p className="text-sm font-bold text-white/70 underline decoration-indigo-500/30">{selectedEmployee?.email || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Celular Contacto</p>
                                                    <p className="text-sm font-mono font-black text-white/90">{selectedEmployee?.phone || '---'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-6 flex items-center gap-3">
                                                <span className="h-px w-8 bg-emerald-500" /> Historial / Estructura
                                            </h3>
                                            <div className="space-y-5">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Fecha Ingreso</p>
                                                    <p className="text-sm font-black text-white/90 uppercase">{selectedEmployee?.hireDate ? format(new Date(selectedEmployee.hireDate), 'MMMM yyyy', { locale: es }) : '---'}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Tipo de Contrato</p>
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] px-3">ESTABLE / {selectedEmployee?.contract}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 flex items-center gap-3">
                                                <span className="h-px w-8 bg-blue-500" /> Percepción Mensual
                                            </h3>
                                            <div className="bg-white/5 p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                                                <div className="space-y-1 relative">
                                                    <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Sueldo Base Nominal</p>
                                                    <p className="text-4xl font-black text-white tracking-tighter">S/ {selectedEmployee?.baseSalary ? Number(selectedEmployee.baseSalary).toLocaleString() : '0'}</p>
                                                </div>
                                                <div className="space-y-4 pt-4 border-t border-white/5 relative">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-slate-500">CTA Bancaria</span>
                                                        <span className="text-[10px] font-mono font-black text-white">{selectedEmployee?.bankAccount?.slice(-6) ? '****' + selectedEmployee.bankAccount.slice(-6) : 'PENDIENTE'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-slate-500">Estado Pago</span>
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[8px]">AL DÍA</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-2xl relative">
                                            <Info className="h-5 w-5 text-indigo-500 absolute top-4 right-4 opacity-50" />
                                            <p className="text-[9px] font-black uppercase text-indigo-500 tracking-widest mb-2">Observaciones Gerenciales</p>
                                            <p className="text-[11px] text-slate-400 font-medium italic leading-relaxed">
                                                {selectedEmployee?.notes || "Perfil verificado por la dirección médica. No registra anomalías contractuales en el histórico de los últimos 12 meses."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent >
            </Dialog >

            {/* Modal de Boleta de Pago */}
            <Dialog open={isPaystubModalOpen} onOpenChange={setIsPaystubModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-[#0c0c0e] border-white/10 shadow-3xl rounded-3xl text-white">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-white">
                            Boleta de Pago
                        </DialogTitle>
                        <DialogDescription className="text-[10px] uppercase tracking-widest text-slate-500">
                            Detalle del registro de nómina
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayroll && (
                        <div className="p-6 space-y-6">
                            {/* Header con empleado */}
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <Avatar className="h-14 w-14 rounded-xl border-2 border-emerald-500/30">
                                    <AvatarImage src={selectedPayroll.employeePhoto} />
                                    <AvatarFallback className="bg-emerald-500 text-white font-bold">
                                        {selectedPayroll.employeeName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-lg font-black text-white">{selectedPayroll.employeeName}</p>
                                    <p className="text-[10px] uppercase text-slate-500 tracking-widest">
                                        Período: {typeof selectedPayroll.period === 'string' ? selectedPayroll.period : format(new Date(selectedPayroll.period || selectedPayroll.createdAt || Date.now()), 'MMMM yyyy', { locale: es })}
                                    </p>
                                </div>
                            </div>

                            {/* Desglose de pago */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                                    <span className="text-sm text-slate-400">Salario Base</span>
                                    <span className="text-lg font-mono font-bold text-white">S/ {Number(selectedPayroll.baseSalary || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <span className="text-sm text-emerald-400">Bonificaciones</span>
                                    <span className="text-lg font-mono font-bold text-emerald-400">+S/ {Number(selectedPayroll.bonuses || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                    <span className="text-sm text-red-400">Deducciones</span>
                                    <span className="text-lg font-mono font-bold text-red-400">-S/ {Number(selectedPayroll.deductions || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                    <span className="text-sm font-bold text-white">NETO A PAGAR</span>
                                    <span className="text-2xl font-mono font-black text-indigo-400">S/ {Number(selectedPayroll.netSalary || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <span className="text-sm text-slate-400">Estado</span>
                                <Badge className={`text-xs font-black uppercase ${selectedPayroll.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : selectedPayroll.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {selectedPayroll.status === 'PAID' ? 'Pagado' : selectedPayroll.status === 'PENDING' ? 'Pendiente' : 'Procesando'}
                                </Badge>
                            </div>

                            {/* Botón de descarga */}
                            <Button
                                onClick={() => {
                                    const printContent = `
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>Boleta de Pago - ${selectedPayroll.employeeName}</title>
                                            <style>
                                                body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                                                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
                                                .title { font-size: 24px; font-weight: bold; color: #4f46e5; }
                                                .subtitle { font-size: 12px; color: #666; text-transform: uppercase; }
                                                .employee { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
                                                .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
                                                .label { color: #666; }
                                                .value { font-weight: bold; font-family: monospace; }
                                                .total { background: #4f46e5; color: white; padding: 15px; border-radius: 8px; margin-top: 20px; }
                                                .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                                                .paid { background: #d1fae5; color: #059669; }
                                                .pending { background: #fef3c7; color: #d97706; }
                                                @media print { body { padding: 20px; } }
                                            </style>
                                        </head>
                                        <body>
                                            <div class="header">
                                                <div class="title">BOLETA DE PAGO</div>
                                                <div class="subtitle">EdiCarex Hospital - Recursos Humanos</div>
                                            </div>
                                            <div class="employee">
                                                <div>
                                                    <strong style="font-size: 18px;">${selectedPayroll.employeeName}</strong><br>
                                                    <span style="color: #666; font-size: 12px;">Período: ${typeof selectedPayroll.period === 'string' ? selectedPayroll.period : new Date(selectedPayroll.period || selectedPayroll.createdAt || Date.now()).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}</span>
                                                </div>
                                            </div>
                                            <div class="row"><span class="label">Salario Base</span><span class="value">S/ ${Number(selectedPayroll.baseSalary || 0).toLocaleString()}</span></div>
                                            <div class="row"><span class="label" style="color: #059669;">Bonificaciones</span><span class="value" style="color: #059669;">+S/ ${Number(selectedPayroll.bonuses || 0).toLocaleString()}</span></div>
                                            <div class="row"><span class="label" style="color: #dc2626;">Deducciones</span><span class="value" style="color: #dc2626;">-S/ ${Number(selectedPayroll.deductions || 0).toLocaleString()}</span></div>
                                            <div class="total"><div style="display: flex; justify-content: space-between;"><span>NETO A PAGAR</span><span style="font-size: 24px; font-weight: bold;">S/ ${Number(selectedPayroll.netSalary || 0).toLocaleString()}</span></div></div>
                                            <div style="margin-top: 20px; text-align: center;">
                                                <span class="status ${selectedPayroll.status === 'PAID' ? 'paid' : 'pending'}">${selectedPayroll.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}</span>
                                            </div>
                                            <div style="margin-top: 40px; text-align: center; color: #999; font-size: 10px;">
                                                Documento generado el ${new Date().toLocaleDateString('es-PE')} - EdiCarex RRHH
                                            </div>
                                        </body>
                                        </html>
                                    `;
                                    const printWindow = window.open('', '_blank');
                                    if (printWindow) {
                                        printWindow.document.write(printContent);
                                        printWindow.document.close();
                                        printWindow.print();
                                    }
                                }}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider"
                            >
                                <Download className="mr-2 h-4 w-4" /> Descargar PDF
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}