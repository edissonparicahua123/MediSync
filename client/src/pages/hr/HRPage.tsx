import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Camera
} from 'lucide-react'
import { hrAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, differenceInHours, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, MoreHorizontal, FileText, Eye, Activity, TrendingUp, TrendingDown, Printer } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function HRPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('employees')
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const { toast } = useToast()

    // Employee Modal State
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        email: '',
        documentId: '',
        phone: '',
        department: '',
        area: '',
        role: '',
        salary: '',
        bonus: '0',
        hireDate: format(new Date(), 'yyyy-MM-dd'),
        birthDate: '',
        gender: '',
        contract: 'Tiempo Completo',
        status: 'ACTIVE',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        bankAccount: '',
        notes: '',
        photo: ''
    })

    // Shift Modal State
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
    const [shiftForm, setShiftForm] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '08:00',
        endTime: '17:00',
        type: 'MORNING'
    })

    // Details Modal State
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isPaystubModalOpen, setIsPaystubModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [selectedPayroll, setSelectedPayroll] = useState<any>(null)

    // Attendance Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
    const [attendanceForm, setAttendanceForm] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '08:00',
        checkOut: '',
        status: 'ON_TIME',
        notes: ''
    })

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
                        employeeName: s.employee?.name || 'Unknown',
                        day: capitalizedDay,
                        shift: s.type, // Schema uses 'type', see seed/schema
                        startTime: format(date, 'HH:mm'),
                        endTime: format(new Date(s.endTime), 'HH:mm')
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

    const resetForm = () => {
        setEmployeeForm({
            name: '',
            email: '',
            documentId: '',
            phone: '',
            department: '',
            area: '',
            role: '',
            salary: '',
            bonus: '0',
            hireDate: format(new Date(), 'yyyy-MM-dd'),
            birthDate: '',
            gender: '',
            contract: 'Tiempo Completo',
            status: 'ACTIVE',
            address: '',
            emergencyContact: '',
            emergencyPhone: '',
            bankAccount: '',
            notes: '',
            photo: ''
        })
        setIsEditing(false)
        setCurrentEmployeeId(null)
    }

    const openNewEmployeeModal = () => {
        resetForm()
        setIsEmployeeModalOpen(true)
    }

    const handleViewDetails = (employee: any) => {
        setSelectedEmployee(employee)
        setIsDetailsModalOpen(true)
    }

    const handleEditEmployee = (employee: any) => {
        setEmployeeForm({
            name: employee.name || '',
            email: employee.email || '',
            documentId: employee.documentId || '',
            phone: employee.phone || '',
            department: employee.department || '',
            area: employee.area || '',
            role: employee.role || '',
            salary: employee.salary ? String(employee.salary) : '',
            bonus: employee.bonus ? String(employee.bonus) : '0',
            hireDate: employee.hireDate ? format(new Date(employee.hireDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            birthDate: employee.birthDate ? format(new Date(employee.birthDate), 'yyyy-MM-dd') : '',
            gender: employee.gender || '',
            contract: employee.contract || 'Tiempo Completo',
            status: employee.status || 'ACTIVE',
            address: employee.address || '',
            emergencyContact: employee.emergencyContact || '',
            emergencyPhone: employee.emergencyPhone || '',
            bankAccount: employee.bankAccount || '',
            notes: employee.notes || '',
            photo: employee.photo || ''
        })
        setCurrentEmployeeId(employee.id)
        setIsEditing(true)
        setIsEmployeeModalOpen(true)
    }

    const handleSaveEmployee = async () => {
        try {
            if (!employeeForm.name || !employeeForm.email || !employeeForm.salary) {
                toast({
                    title: 'Error de validación',
                    description: 'Por favor completa los campos requeridos',
                    variant: 'destructive',
                })
                return
            }

            const payload = {
                ...employeeForm,
                salary: Number(employeeForm.salary),
                bonus: Number(employeeForm.bonus),
                hireDate: new Date(employeeForm.hireDate).toISOString(),
                birthDate: employeeForm.birthDate ? new Date(employeeForm.birthDate).toISOString() : undefined,
                // Clean up empty strings to undefined for optional fields
                documentId: employeeForm.documentId || undefined,
                phone: employeeForm.phone || undefined,
                emergencyPhone: employeeForm.emergencyPhone || undefined,
                emergencyContact: employeeForm.emergencyContact || undefined,
                address: employeeForm.address || undefined,
                bankAccount: employeeForm.bankAccount || undefined,
                notes: employeeForm.notes || undefined,
                photo: employeeForm.photo || undefined,
                gender: employeeForm.gender || undefined,
                area: employeeForm.area || undefined,
            }

            if (isEditing && currentEmployeeId) {
                await hrAPI.updateEmployee(currentEmployeeId, payload)
                toast({ title: 'Empleado actualizado', description: 'Los datos han sido guardados' })
            } else {
                await hrAPI.createEmployee(payload)
                toast({ title: 'Empleado creado', description: 'El nuevo empleado ha sido registrado' })
            }

            setIsEmployeeModalOpen(false)
            resetForm()
            loadHRData()
        } catch (error: any) {
            console.error('Save error:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al guardar empleado',
                variant: 'destructive',
            })
        }
    }

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) return

        try {
            await hrAPI.deleteEmployee(id)
            toast({ title: 'Empleado eliminado', description: 'El registro ha sido eliminado correctamente' })
            loadHRData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar empleado',
                variant: 'destructive',
            })
        }
    }

    const handleSaveShift = async () => {
        try {
            if (!shiftForm.employeeId) {
                toast({ title: 'Error', description: 'Selecciona un empleado', variant: 'destructive' })
                return
            }

            // Construct timestamps
            const start = new Date(`${shiftForm.date}T${shiftForm.startTime}:00`)
            const end = new Date(`${shiftForm.date}T${shiftForm.endTime}:00`)

            await hrAPI.createShift({
                employeeId: shiftForm.employeeId,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                type: shiftForm.type
            })

            toast({ title: 'Turno asignado', description: 'El turno se ha guardado correctamente' })
            setIsShiftModalOpen(false)
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al asignar turno', variant: 'destructive' })
        }
    }

    const handleGeneratePayroll = async () => {
        try {
            setLoading(true)
            await hrAPI.generatePayroll()
            toast({ title: 'Planilla Generada', description: 'Se ha procesado la planilla del mes actual en modo borrador' })
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al generar planilla', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handlePayPayroll = async (id: string) => {
        try {
            setLoading(true)
            await hrAPI.payPayroll(id)
            toast({ title: 'Pago Registrado', description: 'La planilla ha sido marcada como pagada' })
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al procesar pago', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePayroll = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro de planilla?')) return
        try {
            setLoading(true)
            await hrAPI.deletePayroll(id)
            toast({ title: 'Registro eliminado', description: 'La planilla ha sido eliminada correctamente' })
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al eliminar planilla', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    const handleViewPaystub = (record: any) => {
        setSelectedPayroll(record)
        setIsPaystubModalOpen(true)
    }

    const handleSaveAttendance = async () => {
        try {
            if (!attendanceForm.employeeId) {
                toast({ title: 'Error', description: 'Selecciona un empleado', variant: 'destructive' })
                return
            }

            const checkInDate = new Date(`${attendanceForm.date}T${attendanceForm.checkIn}:00`)
            let checkOutDate = null
            if (attendanceForm.checkOut) {
                checkOutDate = new Date(`${attendanceForm.date}T${attendanceForm.checkOut}:00`).toISOString()
            }

            await hrAPI.createAttendance({
                employeeId: attendanceForm.employeeId,
                checkIn: checkInDate.toISOString(),
                checkOut: checkOutDate,
                status: attendanceForm.status,
                notes: attendanceForm.notes
            })

            toast({ title: 'Asistencia registrada', description: 'El registro se ha guardado correctamente' })
            setIsAttendanceModalOpen(false)
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al registrar asistencia', variant: 'destructive' })
        }
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
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserCog className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
                        <p className="text-muted-foreground">
                            Gestión de empleados, asistencia, planilla y turnos
                        </p>
                    </div>
                </div>
                <Button onClick={openNewEmployeeModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Empleado
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeEmployees} activos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Presentes Hoy</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalEmployees - stats.presentToday} ausentes
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Planilla Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ${stats.totalPayroll.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Este mes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Turnos Programados</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{hrData.shifts.length}</div>
                        <p className="text-xs text-muted-foreground">Esta semana</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="employees">
                        <Users className="h-4 w-4 mr-2" />
                        Empleados
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                        <Clock className="h-4 w-4 mr-2" />
                        Asistencia
                    </TabsTrigger>
                    <TabsTrigger value="payroll">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Planilla
                    </TabsTrigger>
                    <TabsTrigger value="shifts">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Turnos
                    </TabsTrigger>
                </TabsList>

                {/* A. Employees Tab */}
                <TabsContent value="employees" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Directorio de Empleados</CardTitle>
                                    <CardDescription>Gestionar información de empleados</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar empleados..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 border-b border-border/50">
                                        <TableHead className="w-[80px] font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Foto</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Colaborador</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">DNI / Documento</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Área / Cargo</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Remuneración</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Contacto</TableHead>
                                        <TableHead className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Estado</TableHead>
                                        <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Gestión</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.employees.map((employee: any) => (
                                        <TableRow key={employee.id} className="hover:bg-muted/10 transition-colors border-b border-border/10 group">
                                            <TableCell>
                                                <Avatar className="h-10 w-10 border border-border/50 shadow-sm transition-transform group-hover:scale-110">
                                                    <AvatarImage src={employee.photo} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{employee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight text-foreground">{employee.name}</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase opacity-70">{employee.role}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <BadgeCheck className="h-3 w-3 text-primary opacity-50" />
                                                    <span className="font-mono text-xs font-semibold">{employee.documentId || '---'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground/80">{employee.area}</span>
                                                    <span className="text-[9px] text-muted-foreground opacity-60 font-medium italic">{employee.department}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-emerald-500 tracking-tighter">${Number(employee.salary).toLocaleString()}</span>
                                                    {employee.bonus > 0 && (
                                                        <span className="text-[9px] font-bold text-teal-500/80 tracking-tight">+${Number(employee.bonus).toLocaleString()} Bono</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1.5 opacity-80">
                                                        <FileText className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[10px] font-medium truncate max-w-[120px]">{employee.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 opacity-80">
                                                        <PhoneCall className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[10px] font-medium">{employee.phone || '---'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-current bg-opacity-10 ${getStatusBadge(employee.status)}`}>
                                                    {({
                                                        'ACTIVE': 'ACTIVO',
                                                        'VACATION': 'VACACIONES',
                                                        'SICK': 'LICENCIA',
                                                        'INACTIVE': 'INACTIVO'
                                                    } as Record<string, string>)[employee.status] || employee.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 transition-all rounded-lg" onClick={() => handleViewDetails(employee)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted transition-all rounded-lg" onClick={() => handleEditEmployee(employee)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-lg">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-lg border-border/50">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50">Opciones</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Eliminar Registro
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* B. Attendance Tab */}
                <TabsContent value="attendance" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Control de Asistencia</CardTitle>
                                    <CardDescription>Asistencia diaria y horas trabajadas</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-b-2 border-border/50">
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70">Empleado</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Fecha</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Entrada</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Salida</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Horas Trab.</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Tardanza</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-right">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.attendance.map((record: any) => (
                                        <TableRow key={record.id} className="hover:bg-muted/20 transition-colors border-b border-border/40">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                        <AvatarImage src={record.employeePhoto} />
                                                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-black uppercase">
                                                            {record.employeeName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm tracking-tighter uppercase text-foreground/90">{record.employeeName}</span>
                                                        {record.notes && <span className="text-[9px] text-muted-foreground italic truncate max-w-[120px]">{record.notes}</span>}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{format(record.date, 'dd MMM, yyyy', { locale: es })}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-mono text-sm font-black text-primary/80">
                                                    {record.checkIn ? format(record.checkIn, 'HH:mm') : '--:--'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-mono text-sm font-black text-muted-foreground/80">
                                                    {record.checkOut ? format(record.checkOut, 'HH:mm') : '--:--'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-muted/50 border border-border/50">
                                                    <span className="font-black text-xs text-foreground/80">
                                                        {record.hoursWorked.toFixed(2)}h
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {record.tardiness > 0 ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black text-orange-500 tracking-tighter animate-pulse">
                                                            {record.tardiness} min
                                                        </span>
                                                        <span className="text-[8px] font-bold text-orange-500/50 uppercase tracking-tighter">Retraso</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-emerald-500/40">---</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border border-current bg-opacity-10 transition-all ${getStatusBadge(record.status)} shadow-[0_0_10px_rgba(0,0,0,0.05)]`}>
                                                        {({
                                                            'ON_TIME': 'A TIEMPO',
                                                            'LATE': 'TARDE',
                                                            'ABSENT': 'AUSENTE',
                                                            'PRESENT': 'PRESENTE'
                                                        } as Record<string, string>)[record.status] || record.status}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-6 ml-1">Reporte Mensual de Analítica</h3>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="relative group overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <Clock className="h-16 w-16" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Horas Totales</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.hoursWorked, 0).toFixed(1)}
                                            </span>
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Horas</span>
                                        </div>
                                        <div className="mt-4 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/40 rounded-full" style={{ width: '70%' }} />
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-orange-500/5">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-orange-500">
                                            <AlertCircle className="h-16 w-16" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Tardanza Total</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black tracking-tighter text-orange-500 transition-colors">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.tardiness, 0)}
                                            </span>
                                            <span className="text-xs font-bold text-orange-500/50 uppercase tracking-widest">Minutos</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                            <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest">Requiere Atención</span>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 p-6 transition-all hover:bg-card/60 hover:shadow-2xl hover:shadow-emerald-500/5">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-emerald-500">
                                            <CheckCircle className="h-16 w-16" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Tasa de Asistencia</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black tracking-tighter text-emerald-500 transition-colors">
                                                {hrData.attendance.length > 0 ? Math.round((hrData.attendance.filter((a: any) => a.status === 'ON_TIME').length / hrData.attendance.length) * 100) : 0}%
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500/70 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <Plus className="h-2 w-2" /> 2.4%
                                            </div>
                                        </div>
                                        <div className="mt-4 h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${hrData.attendance.length > 0 ? (hrData.attendance.filter((a: any) => a.status === 'ON_TIME').length / hrData.attendance.length) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* C. Payroll Tab */}
                <TabsContent value="payroll" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Gestión de Planilla</CardTitle>
                                    <CardDescription>Desglose de salarios y cálculos</CardDescription>
                                </div>
                                <Button onClick={handleGeneratePayroll} variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generar Planilla Mensual
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="border-b-2 border-border/50">
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70">Colaborador</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Salario Base</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Ley (Pensión)</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Deducciones</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Bonificaciones</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Monto Neto</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-center">Estado</TableHead>
                                        <TableHead className="py-5 font-black uppercase tracking-widest text-[10px] opacity-70 text-right">Gestión</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.payroll.map((record: any) => (
                                        <TableRow key={record.id} className="hover:bg-muted/20 transition-colors border-b border-border/40 group">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                                        <AvatarImage src={record.employeePhoto} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-black uppercase">
                                                            {record.employeeName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-black text-sm tracking-tighter uppercase text-foreground/90">{record.employeeName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono font-bold text-sm">
                                                ${record.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-mono text-sm font-bold text-red-500/80">
                                                    -${record.pension.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-mono text-sm font-bold ${record.discounts > 0 ? 'text-red-500/80' : 'text-muted-foreground/30'}`}>
                                                    -${record.discounts.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-mono text-sm font-bold ${record.bonuses > 0 ? 'text-emerald-500' : 'text-muted-foreground/30'}`}>
                                                    +${record.bonuses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                                                    <span className="font-black text-sm text-primary">
                                                        ${record.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border border-current bg-opacity-10 ${record.status === 'PAID' ? 'text-emerald-500' :
                                                    record.status === 'PROCESSED' ? 'text-blue-500' : 'text-orange-500'
                                                    }`}>
                                                    {record.status === 'PAID' ? 'PAGADO' : record.status === 'PROCESSED' ? 'PROCESADO' : 'BORRADOR'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20 transition-colors">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl">
                                                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-50 px-3 py-2">Opciones de Pago</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-border/50" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleViewPaystub(record)}
                                                            className="gap-2 focus:bg-primary/20 cursor-pointer text-xs font-bold px-3 py-2.5"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-primary" /> Ver Boleta Detallada
                                                        </DropdownMenuItem>
                                                        {record.status !== 'PAID' && (
                                                            <DropdownMenuItem
                                                                onClick={() => handlePayPayroll(record.id)}
                                                                className="gap-2 focus:bg-emerald-500/20 cursor-pointer text-xs font-bold text-emerald-500 px-3 py-2.5"
                                                            >
                                                                <DollarSign className="h-3.5 w-3.5" /> Procesar Pago Ahora
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-border/50" />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeletePayroll(record.id)}
                                                            className="gap-2 focus:bg-red-500/20 cursor-pointer text-xs font-bold text-red-500 px-3 py-2.5"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" /> Eliminar Registro
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-10 p-1 rounded-3xl bg-gradient-to-r from-primary/20 via-border/10 to-transparent">
                                <div className="bg-card/60 backdrop-blur-2xl border border-border/50 rounded-[22px] p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-primary/20" />

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                                                <DollarSign className="h-8 w-8 text-primary animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Inversión Mensual Estimada</p>
                                                <h4 className="text-3xl font-black tracking-tight text-foreground">Resumen General</h4>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12 text-right">
                                            <div className="hidden lg:block">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-50">Total Bonificaciones</p>
                                                <p className="text-xl font-bold text-emerald-500">
                                                    +${hrData.payroll.reduce((sum: number, p: any) => sum + p.bonuses, 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="hidden lg:block">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-50">Total Deducciones</p>
                                                <p className="text-xl font-bold text-red-500/80">
                                                    -${hrData.payroll.reduce((sum: number, p: any) => sum + (Number(p.pension) + Number(p.discounts)), 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-primary/10 px-8 py-5 rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Planilla Total Bruta</p>
                                                <p className="text-4xl font-black text-primary tracking-tighter">
                                                    ${stats.totalPayroll.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* D. Shifts Tab */}
                <TabsContent value="shifts" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Programación de Turnos</CardTitle>
                                    <CardDescription>Asignación semanal de turnos</CardDescription>
                                </div>
                                <Button onClick={() => setIsShiftModalOpen(true)} variant="outline">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Asignar Turno
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                                    const dayShifts = hrData.shifts.filter((s: any) => s.day === day)
                                    return (
                                        <div key={day} className="border rounded-lg p-4">
                                            <h3 className="font-semibold mb-3">{day}</h3>
                                            {dayShifts.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">Sin turnos programados</p>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {dayShifts.map((shift: any) => (
                                                        <div key={shift.id} className="p-3 border rounded">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">{shift.employeeName}</span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getShiftColor(shift.shift)}`}>
                                                                    {({
                                                                        'MORNING': 'MAÑANA',
                                                                        'AFTERNOON': 'TARDE',
                                                                        'NIGHT': 'NOCHE'
                                                                    } as Record<string, string>)[shift.shift] || shift.shift}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">
                                                                {shift.startTime} - {shift.endTime}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            {/* Employee Modal - Premium Redesign */}
            <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
                <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 gap-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-teal-500/5 pointer-events-none" />

                    <DialogHeader className="p-8 pb-4 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                    {isEditing ? 'Editar Colaborador' : 'Nuevo Registro de Personal'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-1">
                                    {isEditing ? 'Actualiza el perfil y la información laboral del empleado.' : 'Completa los campos para dar de alta a un nuevo integrante en el equipo.'}
                                </DialogDescription>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                                {isEditing ? <Pencil className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="px-8 py-4 space-y-10 relative">
                        {/* Profile Photo Upload Area (Visual Only for now) */}
                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border/50 rounded-3xl bg-muted/30 group hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="h-20 w-20 rounded-full bg-background border-4 border-muted flex items-center justify-center mb-3 shadow-inner relative z-10">
                                {employeeForm.photo ? (
                                    <img src={employeeForm.photo} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors z-10">
                                {employeeForm.photo ? 'Cambiar Fotografía' : 'Subir Fotografía'}
                            </span>
                            <p className="text-[10px] text-muted-foreground/60 mt-1 z-10">Formato cuadrado recomendado (JPG, PNG)</p>
                        </div>

                        {/* Section 1: Personal Data */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                    <Contact className="h-4 w-4 text-purple-500" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-500/80">Datos de Identidad</h3>
                            </div>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Nombre Completo</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl" placeholder="Ej. Juan Pérez..." value={employeeForm.name} onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })} />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">DNI / Documento</Label>
                                    <div className="relative">
                                        <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl" placeholder="Indispensable para Kiosko" value={employeeForm.documentId} onChange={(e) => setEmployeeForm({ ...employeeForm, documentId: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Principal</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" type="email" placeholder="ejemplo@empresa.com" value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Fecha de Nacimiento</Label>
                                    <div className="relative">
                                        <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl" type="date" value={employeeForm.birthDate} onChange={(e) => setEmployeeForm({ ...employeeForm, birthDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Género</Label>
                                    <Select value={employeeForm.gender} onValueChange={(val) => setEmployeeForm({ ...employeeForm, gender: val })}>
                                        <SelectTrigger className="h-11 bg-muted/50 border-border/50 rounded-xl font-medium"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent className="bg-card/95 backdrop-blur-lg">
                                            <SelectItem value="MALE">Masculino</SelectItem>
                                            <SelectItem value="FEMALE">Femenino</SelectItem>
                                            <SelectItem value="OTHER">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-4 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Dirección Actual</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl" placeholder="Av. Principal 123, Ciudad..." value={employeeForm.address} onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Job Data */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                    <Briefcase className="h-4 w-4 text-teal-500" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-500/80">Configuración Laboral</h3>
                            </div>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Departamento</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" placeholder="Ej. RRHH..." value={employeeForm.department} onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Área</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" placeholder="Ej. Selección..." value={employeeForm.area} onChange={(e) => setEmployeeForm({ ...employeeForm, area: e.target.value })} />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Cargo</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" placeholder="Ej. Analista..." value={employeeForm.role} onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })} />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tipo de Contrato</Label>
                                    <Select value={employeeForm.contract} onValueChange={(val) => setEmployeeForm({ ...employeeForm, contract: val })}>
                                        <SelectTrigger className="h-11 bg-muted/50 border-border/50 rounded-xl font-medium"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                        <SelectContent><SelectItem value="Tiempo Completo">Tiempo Completo</SelectItem><SelectItem value="Part Time">Part Time</SelectItem><SelectItem value="Por Recibo">Por Recibo</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Salario Base (PEN)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl font-bold" type="number" placeholder="2500" value={employeeForm.salary} onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Bono Mensual (Extra)</Label>
                                    <div className="relative">
                                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl font-bold" type="number" placeholder="0.00" value={employeeForm.bonus} onChange={(e) => setEmployeeForm({ ...employeeForm, bonus: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Fecha de Ingreso</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl text-primary font-medium" type="date" value={employeeForm.hireDate} onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })} />
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Estado en Planilla</Label>
                                    <Select value={employeeForm.status} onValueChange={(val) => setEmployeeForm({ ...employeeForm, status: val })}>
                                        <SelectTrigger className="h-11 bg-muted/50 border-border/50 rounded-xl font-medium"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE" className="text-emerald-500">Activo</SelectItem>
                                            <SelectItem value="VACATION" className="text-blue-500">Vacaciones</SelectItem>
                                            <SelectItem value="SICK" className="text-orange-500">Licencia</SelectItem>
                                            <SelectItem value="INACTIVE" className="text-red-500">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Extra Data */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                    <ShieldCheck className="h-4 w-4 text-orange-500" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500/80">Seguridad y Finanzas</h3>
                            </div>
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Cuenta Bancaria (Sueldo)</Label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl text-xs font-mono" placeholder="Ej. 193-998822..." value={employeeForm.bankAccount} onChange={(e) => setEmployeeForm({ ...employeeForm, bankAccount: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Contacto de Emergencia</Label>
                                    <div className="relative">
                                        <VenetianMask className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl" placeholder="Nombre completo..." value={employeeForm.emergencyContact} onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyContact: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Teléfono Personal</Label>
                                    <div className="relative">
                                        <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input className="h-11 pl-10 bg-muted/50 border-border/50 rounded-xl" placeholder="+51 999..." value={employeeForm.phone} onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="col-span-3 space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tel. Emergencia</Label>
                                    <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" placeholder="987 654..." value={employeeForm.emergencyPhone} onChange={(e) => setEmployeeForm({ ...employeeForm, emergencyPhone: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Notas Adicionales</Label>
                                <Input className="h-11 bg-muted/50 border-border/50 rounded-xl" placeholder="Ej. Alergias, preferencias, observaciones..." value={employeeForm.notes} onChange={(e) => setEmployeeForm({ ...employeeForm, notes: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-8 pt-4 pb-10 bg-muted/20 border-t border-border/50 relative">
                        <Button variant="ghost" className="rounded-xl px-8 font-bold text-xs uppercase tracking-widest hover:bg-muted/50" onClick={() => setIsEmployeeModalOpen(false)}>Descartar</Button>
                        <Button className="rounded-xl px-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95" onClick={handleSaveEmployee}>
                            Finalizar Registro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Details Modal - Enhanced Ficha del Colaborador */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-[800px] bg-card/98 backdrop-blur-2xl border-border/50 p-0 gap-0 overflow-hidden shadow-3xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Ficha del Colaborador</DialogTitle>
                        <DialogDescription>Visualización detallada de la información del empleado.</DialogDescription>
                    </DialogHeader>
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <BadgeCheck className="h-48 w-48 text-primary" />
                    </div>

                    {selectedEmployee && (
                        <div className="relative group">
                            {/* Header Section */}
                            <div className="p-10 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/50">
                                <div className="flex items-center gap-10">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 animate-pulse" />
                                        <Avatar className="h-32 w-32 border-4 border-background shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-500">
                                            <AvatarImage src={selectedEmployee.photo} />
                                            <AvatarFallback className="text-4xl font-black bg-gradient-to-br from-primary to-primary-foreground text-foreground">
                                                {selectedEmployee.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-background z-20 ${selectedEmployee.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500'
                                            }`} />
                                    </div>
                                    <div className="space-y-2 relative z-10">
                                        <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">{selectedEmployee.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-black tracking-widest text-primary uppercase">
                                                {selectedEmployee.role}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm tracking-tight opacity-80">
                                                <Briefcase className="h-4 w-4" />
                                                {selectedEmployee.area} • {selectedEmployee.department}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="p-10 grid grid-cols-3 gap-10 bg-background/50 relative overflow-hidden">
                                {/* Column 1: Personal */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Info className="h-4 w-4 text-purple-500 opacity-70" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">General</h4>
                                    </div>
                                    <div className="space-y-1 group/item">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest transition-colors group-hover/item:text-primary">DNI / ID Document</p>
                                        <p className="font-bold text-lg tracking-tight">{selectedEmployee.documentId || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Corporativo</p>
                                        <p className="font-bold text-sm truncate">{selectedEmployee.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Nacimiento</p>
                                        <p className="font-bold text-sm">{selectedEmployee.birthDate ? format(new Date(selectedEmployee.birthDate), 'dd MMM, yyyy', { locale: es }) : '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Género</p>
                                        <p className="font-bold text-sm uppercase opacity-70">
                                            {selectedEmployee.gender === 'MALE' ? 'Masculino' : selectedEmployee.gender === 'FEMALE' ? 'Femenino' : 'Otro'}
                                        </p>
                                    </div>
                                </div>

                                {/* Column 2: Financial */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-teal-500 opacity-70" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Compensación</h4>
                                    </div>
                                    <div className="space-y-1 group/item">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover/item:text-teal-500">Salario Neto</p>
                                        <p className="font-black text-2xl tracking-tighter text-emerald-400">S/. {Number(selectedEmployee.salary).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1 group/item">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest group-hover/item:text-teal-500">Bono Fijo</p>
                                        <p className="font-bold text-lg tracking-tighter text-emerald-500/80">S/. {Number(selectedEmployee.bonus || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Cuenta Bancaria</p>
                                        <p className="font-medium text-sm font-mono tracking-wider opacity-70">{selectedEmployee.bankAccount || 'No vinculada'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Contrato</p>
                                        <p className="font-bold text-sm uppercase opacity-80">{selectedEmployee.contract}</p>
                                    </div>
                                </div>

                                {/* Column 3: Contact */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PhoneCall className="h-4 w-4 text-orange-500 opacity-70" />
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Seguridad</h4>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Celular</p>
                                        <p className="font-bold text-sm">{selectedEmployee.phone || '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Emergencia</p>
                                        <p className="font-bold text-sm">{selectedEmployee.emergencyContact || '---'}</p>
                                        <p className="text-xs font-semibold opacity-60 italic">{selectedEmployee.emergencyPhone}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Ingreso</p>
                                        <p className="font-bold text-sm text-primary">{selectedEmployee.hireDate ? format(new Date(selectedEmployee.hireDate), 'PPP', { locale: es }) : '---'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Notas</p>
                                        <p className="text-[11px] font-medium leading-tight text-muted-foreground italic truncate max-w-[150px]">{selectedEmployee.notes || 'Sin observaciones'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Footer */}
                            <div className="px-10 py-6 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Domicilio Legal</p>
                                        <p className="text-sm font-bold opacity-80">{selectedEmployee.address || 'Ubicación no detallada'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest border-border/50 rounded-lg hover:bg-muted" onClick={() => handleEditEmployee(selectedEmployee)}>
                                        <Pencil className="h-3 w-3 mr-2" /> Editar Perfil
                                    </Button>
                                    <Button className="h-9 px-6 font-bold text-[10px] uppercase tracking-widest rounded-lg" onClick={() => setIsDetailsModalOpen(false)}>
                                        Cerrar Ficha
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Paystub Modal (Boleta) */}
            <Dialog open={isPaystubModalOpen} onOpenChange={setIsPaystubModalOpen}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl border-border/50 shadow-3xl">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Boleta de Pago Detallada</DialogTitle>
                        <DialogDescription>Visualización oficial del desglose salarial.</DialogDescription>
                    </DialogHeader>

                    {selectedPayroll && (
                        <div className="relative">
                            {/* Watermark/Background Decoration */}
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                <DollarSign className="h-64 w-64 rotate-12" />
                            </div>

                            {/* Header: Company & Title */}
                            <div className="bg-primary/5 p-10 border-b border-border/50 flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Activity className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tighter text-foreground uppercase">MEDISYNC <span className="text-primary">ERP</span></h2>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Recursos Humanos & Planillas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs uppercase tracking-widest mb-2">
                                        Boleta de Pago
                                    </div>
                                    <p className="text-sm font-mono font-bold text-foreground/70">REF: #{selectedPayroll.id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>

                            {/* Employee Info Strip */}
                            <div className="grid grid-cols-4 gap-8 p-10 bg-muted/20">
                                <div className="col-span-2 flex items-center gap-5">
                                    <Avatar className="h-16 w-16 border-4 border-background shadow-xl">
                                        <AvatarImage src={selectedPayroll.employeePhoto} />
                                        <AvatarFallback className="bg-primary/20 text-primary font-black text-xl uppercase">
                                            {selectedPayroll.employeeName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Colaborador</p>
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{selectedPayroll.employeeName}</h3>
                                        <p className="text-xs font-bold text-primary italic uppercase">{selectedPayroll.employeeArea}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">DNI / ID</p>
                                    <p className="text-sm font-mono font-bold text-foreground">{selectedPayroll.employeeDni}</p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-3 mb-1">Cta. Bancaria</p>
                                    <p className="text-xs font-mono font-bold text-foreground/80">{selectedPayroll.employeeBankAccount}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Periodo</p>
                                    <p className="text-sm font-bold text-foreground uppercase">
                                        {format(selectedPayroll.period, 'MMMM yyyy', { locale: es })}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-3 mb-1">Estado</p>
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border border-current bg-opacity-10 ${selectedPayroll.status === 'PAID' ? 'text-emerald-500' : 'text-orange-500'
                                        }`}>
                                        {selectedPayroll.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'}
                                    </span>
                                </div>
                            </div>

                            {/* Financial Breakdown Table */}
                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-2 gap-10">
                                    {/* Incomes */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b-2 border-emerald-500/30 pb-2">
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600">Remuneraciones</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-foreground/70 uppercase text-[11px]">Sueldo Base</span>
                                                <span className="font-mono font-black">${selectedPayroll.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-foreground/70 uppercase text-[11px]">Bonificaciones</span>
                                                <span className="font-mono font-black text-emerald-500">+${selectedPayroll.bonuses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
                                                <span className="font-black text-foreground uppercase text-xs">Total Bruto</span>
                                                <span className="font-mono font-black text-lg text-foreground">
                                                    ${(selectedPayroll.baseSalary + selectedPayroll.bonuses).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deductions */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b-2 border-red-500/30 pb-2">
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                            <h4 className="text-xs font-black uppercase tracking-widest text-red-600">Deducciones y Retenciones</h4>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-foreground/70 uppercase text-[11px]">Pensión de Ley (13%)</span>
                                                <span className="font-mono font-black text-red-500/80">-${selectedPayroll.pension.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-foreground/70 uppercase text-[11px]">Otros Descuentos</span>
                                                <span className="font-mono font-black text-red-500/80">-${selectedPayroll.discounts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
                                                <span className="font-black text-foreground uppercase text-xs">Total Descuentos</span>
                                                <span className="font-mono font-black text-lg text-red-600">
                                                    -${(selectedPayroll.pension + selectedPayroll.discounts).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Footer Card */}
                                <div className="p-1 rounded-3xl bg-gradient-to-br from-primary/30 to-border/10">
                                    <div className="bg-primary/10 rounded-[22px] px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-primary/20 shadow-inner">
                                        <div className="flex items-center gap-5">
                                            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                                                <CreditCard className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-primary/70 tracking-[0.2em] leading-none mb-1">Monto Líquido a Pagar</p>
                                                <h3 className="text-4xl font-black tracking-tighter text-primary">Sueldo Neto</h3>
                                            </div>
                                        </div>
                                        <div className="text-center md:text-right bg-background/50 px-10 py-4 rounded-2xl border border-white/10 shadow-lg">
                                            <p className="text-4xl font-black text-foreground tracking-tighter">
                                                ${selectedPayroll.finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Dólares Americanos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Final Note & Actions */}
                                <div className="flex justify-between items-end pt-5">
                                    <div className="max-w-xs">
                                        <p className="text-[9px] font-medium text-muted-foreground uppercase leading-tight italic">
                                            Este documento es una representación digital del pago de haberes correspondiente al periodo indicado. Para trámites legales, solicite la boleta física firmada.
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" className="h-12 px-8 font-black text-xs uppercase tracking-widest border-border/50 rounded-xl hover:bg-muted" onClick={() => window.print()}>
                                            <Printer className="h-4 w-4 mr-2" /> Imprimir Boleta
                                        </Button>
                                        <Button className="h-12 px-8 font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20" onClick={() => setIsPaystubModalOpen(false)}>
                                            Entendido
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Shift Modal */}
            <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asignar Turno</DialogTitle>
                        <DialogDescription>Crea un nuevo turno para un empleado.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Empleado</Label>
                            <Select
                                value={shiftForm.employeeId}
                                onValueChange={(value) => setShiftForm({ ...shiftForm, employeeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar empleado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hrData.employees.map((emp: any) => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={shiftForm.date}
                                    onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select
                                    value={shiftForm.type}
                                    onValueChange={(value) => setShiftForm({ ...shiftForm, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MORNING">Mañana</SelectItem>
                                        <SelectItem value="AFTERNOON">Tarde</SelectItem>
                                        <SelectItem value="NIGHT">Noche</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Hora Inicio</Label>
                                <Input
                                    type="time"
                                    value={shiftForm.startTime}
                                    onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hora Fin</Label>
                                <Input
                                    type="time"
                                    value={shiftForm.endTime}
                                    onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsShiftModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveShift}>Asignar Turno</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Attendance Modal */}
            <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Asistencia</DialogTitle>
                        <DialogDescription>
                            Registra manualmente la entrada/salida de un empleado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Empleado</Label>
                            <Select
                                value={attendanceForm.employeeId}
                                onValueChange={(value) => setAttendanceForm({ ...attendanceForm, employeeId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar empleado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hrData.employees.map((emp: any) => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <Input
                                type="date"
                                value={attendanceForm.date}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Entrada</Label>
                                <Input
                                    type="time"
                                    value={attendanceForm.checkIn}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Salida (Opcional)</Label>
                                <Input
                                    type="time"
                                    value={attendanceForm.checkOut}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Estado</Label>
                            <Select
                                value={attendanceForm.status}
                                onValueChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })}
                            >
                                <SelectTrigger className="h-11 bg-muted/50 border-border/50 rounded-xl font-medium">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ON_TIME" className="text-emerald-500">A Tiempo</SelectItem>
                                    <SelectItem value="LATE" className="text-orange-500">Tarde</SelectItem>
                                    <SelectItem value="ABSENT" className="text-red-500">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Observaciones</Label>
                            <Input
                                className="h-11 bg-muted/50 border-border/50 rounded-xl"
                                placeholder="Ej. Permiso médico, falla técnica, etc."
                                value={attendanceForm.notes}
                                onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-8 pt-4 pb-10 bg-muted/20 border-t border-border/50 relative">
                        <Button variant="ghost" className="rounded-xl px-8 font-bold text-xs uppercase tracking-widest hover:bg-muted/50" onClick={() => setIsAttendanceModalOpen(false)}>Cancelar</Button>
                        <Button className="rounded-xl px-12 font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95" onClick={handleSaveAttendance}>
                            Guardar Registro
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
