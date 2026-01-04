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
import { Pencil, Trash2, MoreHorizontal, FileText } from 'lucide-react'
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
        department: '',
        role: '',
        salary: '',
        hireDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'ACTIVE'
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

    // Attendance Modal State
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
    const [attendanceForm, setAttendanceForm] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '08:00',
        checkOut: '',
        status: 'ON_TIME'
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
                    date: new Date(a.checkIn),
                    checkIn: new Date(a.checkIn),
                    checkOut: a.checkOut ? new Date(a.checkOut) : null,
                    hoursWorked: Number(a.hoursWorked) || 0,
                    tardiness: a.tardiness || 0,
                    status: a.status
                })),
                payroll: payrollRes.data.map((p: any) => {
                    const base = Number(p.baseSalary)
                    const totalDeductions = Number(p.deductions)
                    const pension = base * 0.13
                    const otherDiscounts = totalDeductions - pension

                    return {
                        id: p.id,
                        employeeName: p.employee?.name || 'Unknown',
                        baseSalary: base,
                        pension: pension,
                        discounts: otherDiscounts > 0 ? otherDiscounts : 0,
                        bonuses: Number(p.bonuses),
                        finalAmount: Number(p.netSalary)
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

    // Estad├¡sticas
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
            department: '',
            role: '',
            salary: '',
            hireDate: format(new Date(), 'yyyy-MM-dd'),
            status: 'ACTIVE'
        })
        setIsEditing(false)
        setCurrentEmployeeId(null)
    }

    const openNewEmployeeModal = () => {
        resetForm()
        setIsEmployeeModalOpen(true)
    }

    const handleEditEmployee = (employee: any) => {
        setEmployeeForm({
            name: employee.name,
            email: employee.email,
            department: employee.department || employee.area || '',
            role: employee.role,
            salary: employee.salary,
            hireDate: employee.hireDate ? format(new Date(employee.hireDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            status: employee.status
        })
        setCurrentEmployeeId(employee.id)
        setIsEditing(true)
        setIsEmployeeModalOpen(true)
    }

    const handleSaveEmployee = async () => {
        try {
            if (!employeeForm.name || !employeeForm.email || !employeeForm.salary) {
                toast({
                    title: 'Error de validaci├│n',
                    description: 'Por favor completa los campos requeridos',
                    variant: 'destructive',
                })
                return
            }

            const payload = {
                ...employeeForm,
                salary: Number(employeeForm.salary),
                hireDate: new Date(employeeForm.hireDate).toISOString()
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
        if (!confirm('┬┐Est├ís seguro de eliminar este empleado? Esta acci├│n no se puede deshacer.')) return

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
            toast({ title: 'Planilla Generada', description: 'Se ha procesado la planilla del mes actual' })
            loadHRData()
        } catch (error: any) {
            toast({ title: 'Error', description: 'Error al generar planilla', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
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
                status: attendanceForm.status
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
                            Gesti├│n de empleados, asistencia, planilla y turnos
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
                                    <CardDescription>Gestionar informaci├│n de empleados</CardDescription>
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
                                    <TableRow>
                                        <TableHead>Foto</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>├ürea</TableHead>
                                        <TableHead>Salario</TableHead>
                                        <TableHead>Contrato</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.employees.map((employee: any) => (
                                        <TableRow key={employee.id}>
                                            <TableCell>
                                                <Avatar>
                                                    <AvatarImage src={employee.photo} />
                                                    <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">{employee.name}</TableCell>
                                            <TableCell>{employee.area}</TableCell>
                                            <TableCell className="font-semibold">
                                                ${employee.salary.toLocaleString()}
                                            </TableCell>
                                            <TableCell>{employee.contract}</TableCell>
                                            <TableCell>
                                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(employee.status)}`}>
                                                    {({
                                                        'ACTIVE': 'ACTIVO',
                                                        'VACATION': 'VACACIONES',
                                                        'SICK': 'ENFERMO',
                                                        'INACTIVE': 'INACTIVO'
                                                    } as Record<string, string>)[employee.status] || employee.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir men├║</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleDeleteEmployee(employee.id)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                <Button onClick={() => setIsAttendanceModalOpen(true)} variant="outline">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Registrar Asistencia
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Entrada</TableHead>
                                        <TableHead>Salida</TableHead>
                                        <TableHead>Horas Trab.</TableHead>
                                        <TableHead>Tardanza</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.attendance.map((record: any) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                                            <TableCell>{format(record.date, 'MMM dd, yyyy', { locale: es })}</TableCell>
                                            <TableCell>
                                                {record.checkIn ? format(record.checkIn, 'HH:mm') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {record.checkOut ? format(record.checkOut, 'HH:mm') : '-'}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {record.hoursWorked}h
                                            </TableCell>
                                            <TableCell>
                                                {record.tardiness > 0 ? (
                                                    <span className="text-orange-600 font-medium">
                                                        {record.tardiness} min
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getAttendanceIcon(record.status)}
                                                    <span className="text-sm">
                                                        {({
                                                            'ON_TIME': 'A TIEMPO',
                                                            'LATE': 'TARDE',
                                                            'ABSENT': 'AUSENTE'
                                                        } as Record<string, string>)[record.status] || record.status}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6">
                                <h3 className="font-semibold mb-4">Reporte Mensual</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Horas Totales</p>
                                            <p className="text-2xl font-bold">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.hoursWorked, 0)}h
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Tardanza Total</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.tardiness, 0)} min
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Tasa de Asistencia</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {Math.round((stats.presentToday / stats.totalEmployees) * 100)}%
                                            </p>
                                        </CardContent>
                                    </Card>
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
                                    <CardTitle>Gesti├│n de Planilla</CardTitle>
                                    <CardDescription>Desglose de salarios y c├ílculos</CardDescription>
                                </div>
                                <Button onClick={handleGeneratePayroll} variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Generar Planilla Mensual
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Salario Base</TableHead>
                                        <TableHead>Pensi├│n (13%)</TableHead>
                                        <TableHead>Descuentos</TableHead>
                                        <TableHead>Bonos</TableHead>
                                        <TableHead>Monto Final</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.payroll.map((record: any) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                                            <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                                            <TableCell className="text-red-600">
                                                -${record.pension.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-red-600">
                                                -${record.discounts.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-green-600">
                                                +${record.bonuses.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-bold text-lg">
                                                ${record.finalAmount.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6 p-4 bg-accent rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Planilla Total:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        ${stats.totalPayroll.toLocaleString()}
                                    </span>
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
                                    <CardTitle>Programaci├│n de Turnos</CardTitle>
                                    <CardDescription>Asignaci├│n semanal de turnos</CardDescription>
                                </div>
                                <Button onClick={() => setIsShiftModalOpen(true)} variant="outline">
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Asignar Turno
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Lunes', 'Martes', 'Mi├®rcoles', 'Jueves', 'Viernes', 'S├íbado', 'Domingo'].map(day => {
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
                                                                        'MORNING': 'MA├æANA',
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
            {/* Employee Modal */}
            <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? 'Modifica los datos del empleado. Clic en guardar cuando termines.' : 'Ingresa los datos del nuevo empleado. Clic en guardar para crearlo.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={employeeForm.name}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={employeeForm.email}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="department">Departamento</Label>
                                <Input
                                    id="department"
                                    value={employeeForm.department}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol / Puesto</Label>
                                <Input
                                    id="role"
                                    value={employeeForm.role}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="salary">Salario Base</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    value={employeeForm.salary}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hireDate">Fecha Contrataci├│n</Label>
                                <Input
                                    id="hireDate"
                                    type="date"
                                    value={employeeForm.hireDate}
                                    onChange={(e) => setEmployeeForm({ ...employeeForm, hireDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={employeeForm.status}
                                onValueChange={(value) => setEmployeeForm({ ...employeeForm, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Activo</SelectItem>
                                    <SelectItem value="VACATION">Vacaciones</SelectItem>
                                    <SelectItem value="SICK">Licencia M├®dica</SelectItem>
                                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmployeeModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEmployee}>Guardar</Button>
                    </DialogFooter>
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
                                        <SelectItem value="MORNING">Ma├▒ana</SelectItem>
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
                            <Label>Estado</Label>
                            <Select
                                value={attendanceForm.status}
                                onValueChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ON_TIME">A Tiempo</SelectItem>
                                    <SelectItem value="LATE">Tarde</SelectItem>
                                    <SelectItem value="ABSENT">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAttendanceModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveAttendance}>Guardar Registro</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
