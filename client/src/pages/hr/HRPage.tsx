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

export default function HRPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('employees')
    const [selectedMonth, setSelectedMonth] = useState(new Date())
    const { toast } = useToast()

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
                    // Ensure fields match if backend differs slightly
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
                    hoursWorked: a.hoursWorked || 0,
                    tardiness: a.tardiness || 0,
                    status: a.status
                })),
                payroll: payrollRes.data.map((p: any) => ({
                    id: p.id,
                    employeeName: p.employee?.name || 'Unknown',
                    baseSalary: parseFloat(p.baseSalary),
                    pension: parseFloat(p.pension),
                    discounts: parseFloat(p.discounts),
                    bonuses: parseFloat(p.bonuses),
                    finalAmount: parseFloat(p.netAmount)
                })),
                shifts: shiftsRes.data.map((s: any) => ({
                    id: s.id,
                    employeeName: s.employee?.name || 'Unknown',
                    day: s.dayOfWeek,
                    shift: s.shiftType,
                    startTime: s.startTime,
                    endTime: s.endTime
                }))
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
                <Button>
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
                                    <TableRow>
                                        <TableHead>Foto</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Área</TableHead>
                                        <TableHead>Salario</TableHead>
                                        <TableHead>Contrato</TableHead>
                                        <TableHead>Estado</TableHead>
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
                            <CardTitle>Control de Asistencia</CardTitle>
                            <CardDescription>Asistencia diaria y horas trabajadas</CardDescription>
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
                            <CardTitle>Gestión de Planilla</CardTitle>
                            <CardDescription>Desglose de salarios y cálculos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Empleado</TableHead>
                                        <TableHead>Salario Base</TableHead>
                                        <TableHead>Pensión (13%)</TableHead>
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
                            <CardTitle>Programación de Turnos</CardTitle>
                            <CardDescription>Asignación semanal de turnos</CardDescription>
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
        </div>
    )
}
