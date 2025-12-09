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

            // Datos simulados profesionales
            const simulatedData = {
                // A. Empleados
                employees: [
                    {
                        id: '1',
                        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                        name: 'Dr. John Smith',
                        area: 'Cardiology',
                        salary: 8500,
                        contract: 'Full-time',
                        status: 'ACTIVE',
                    },
                    {
                        id: '2',
                        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                        name: 'Dr. Sarah Johnson',
                        area: 'Pediatrics',
                        salary: 7800,
                        contract: 'Full-time',
                        status: 'ACTIVE',
                    },
                    {
                        id: '3',
                        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                        name: 'Nurse Mike Williams',
                        area: 'Emergency',
                        salary: 4500,
                        contract: 'Full-time',
                        status: 'ACTIVE',
                    },
                    {
                        id: '4',
                        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
                        name: 'Emma Brown',
                        area: 'Administration',
                        salary: 3200,
                        contract: 'Part-time',
                        status: 'ACTIVE',
                    },
                    {
                        id: '5',
                        photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
                        name: 'Dr. David Davis',
                        area: 'Surgery',
                        salary: 9500,
                        contract: 'Full-time',
                        status: 'VACATION',
                    },
                ],

                // B. Asistencia
                attendance: [
                    {
                        id: '1',
                        employeeName: 'Dr. John Smith',
                        date: new Date(),
                        checkIn: new Date(new Date().setHours(8, 5, 0)),
                        checkOut: new Date(new Date().setHours(17, 10, 0)),
                        hoursWorked: 9,
                        tardiness: 5,
                        status: 'LATE',
                    },
                    {
                        id: '2',
                        employeeName: 'Dr. Sarah Johnson',
                        date: new Date(),
                        checkIn: new Date(new Date().setHours(7, 55, 0)),
                        checkOut: new Date(new Date().setHours(17, 0, 0)),
                        hoursWorked: 9,
                        tardiness: 0,
                        status: 'ON_TIME',
                    },
                    {
                        id: '3',
                        employeeName: 'Nurse Mike Williams',
                        date: new Date(),
                        checkIn: new Date(new Date().setHours(8, 0, 0)),
                        checkOut: new Date(new Date().setHours(16, 0, 0)),
                        hoursWorked: 8,
                        tardiness: 0,
                        status: 'ON_TIME',
                    },
                    {
                        id: '4',
                        employeeName: 'Emma Brown',
                        date: new Date(),
                        checkIn: null,
                        checkOut: null,
                        hoursWorked: 0,
                        tardiness: 0,
                        status: 'ABSENT',
                    },
                ],

                // C. Planilla
                payroll: [
                    {
                        id: '1',
                        employeeName: 'Dr. John Smith',
                        baseSalary: 8500,
                        pension: 1105, // 13%
                        discounts: 150,
                        bonuses: 500,
                        finalAmount: 7745,
                    },
                    {
                        id: '2',
                        employeeName: 'Dr. Sarah Johnson',
                        baseSalary: 7800,
                        pension: 1014,
                        discounts: 100,
                        bonuses: 300,
                        finalAmount: 6986,
                    },
                    {
                        id: '3',
                        employeeName: 'Nurse Mike Williams',
                        baseSalary: 4500,
                        pension: 585,
                        discounts: 50,
                        bonuses: 200,
                        finalAmount: 4065,
                    },
                    {
                        id: '4',
                        employeeName: 'Emma Brown',
                        baseSalary: 3200,
                        pension: 416,
                        discounts: 0,
                        bonuses: 100,
                        finalAmount: 2884,
                    },
                ],

                // D. Turnos
                shifts: [
                    {
                        id: '1',
                        employeeName: 'Dr. John Smith',
                        day: 'Monday',
                        shift: 'MORNING',
                        startTime: '08:00',
                        endTime: '16:00',
                    },
                    {
                        id: '2',
                        employeeName: 'Dr. Sarah Johnson',
                        day: 'Monday',
                        shift: 'AFTERNOON',
                        startTime: '14:00',
                        endTime: '22:00',
                    },
                    {
                        id: '3',
                        employeeName: 'Nurse Mike Williams',
                        day: 'Monday',
                        shift: 'NIGHT',
                        startTime: '22:00',
                        endTime: '06:00',
                    },
                    {
                        id: '4',
                        employeeName: 'Dr. John Smith',
                        day: 'Tuesday',
                        shift: 'MORNING',
                        startTime: '08:00',
                        endTime: '16:00',
                    },
                    {
                        id: '5',
                        employeeName: 'Dr. Sarah Johnson',
                        day: 'Wednesday',
                        shift: 'MORNING',
                        startTime: '08:00',
                        endTime: '16:00',
                    },
                ],
            }

            setHrData(simulatedData)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load HR data',
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
                        <h1 className="text-3xl font-bold tracking-tight">Human Resources</h1>
                        <p className="text-muted-foreground">
                            Employee management, attendance, payroll, and shifts
                        </p>
                    </div>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.activeEmployees} active
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.totalEmployees - stats.presentToday} absent
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ${stats.totalPayroll.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shifts Scheduled</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{hrData.shifts.length}</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="employees">
                        <Users className="h-4 w-4 mr-2" />
                        Employees
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                        <Clock className="h-4 w-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="payroll">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payroll
                    </TabsTrigger>
                    <TabsTrigger value="shifts">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Shifts
                    </TabsTrigger>
                </TabsList>

                {/* A. Employees Tab */}
                <TabsContent value="employees" className="mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Employee Directory</CardTitle>
                                    <CardDescription>Manage employee information</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
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
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Area</TableHead>
                                        <TableHead>Salary</TableHead>
                                        <TableHead>Contract</TableHead>
                                        <TableHead>Status</TableHead>
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
                                                    {employee.status}
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
                            <CardTitle>Attendance Tracking</CardTitle>
                            <CardDescription>Daily attendance and hours worked</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Check In</TableHead>
                                        <TableHead>Check Out</TableHead>
                                        <TableHead>Hours Worked</TableHead>
                                        <TableHead>Tardiness</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hrData.attendance.map((record: any) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.employeeName}</TableCell>
                                            <TableCell>{format(record.date, 'MMM dd, yyyy')}</TableCell>
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
                                                    <span className="text-sm">{record.status.replace('_', ' ')}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-6">
                                <h3 className="font-semibold mb-4">Monthly Report</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Total Hours</p>
                                            <p className="text-2xl font-bold">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.hoursWorked, 0)}h
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Total Tardiness</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {hrData.attendance.reduce((sum: number, a: any) => sum + a.tardiness, 0)} min
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <p className="text-sm text-muted-foreground">Attendance Rate</p>
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
                            <CardTitle>Payroll Management</CardTitle>
                            <CardDescription>Salary breakdown and calculations</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Base Salary</TableHead>
                                        <TableHead>Pension (13%)</TableHead>
                                        <TableHead>Discounts</TableHead>
                                        <TableHead>Bonuses</TableHead>
                                        <TableHead>Final Amount</TableHead>
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
                                    <span className="text-lg font-semibold">Total Payroll:</span>
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
                            <CardTitle>Shift Schedule</CardTitle>
                            <CardDescription>Weekly shift assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                    const dayShifts = hrData.shifts.filter((s: any) => s.day === day)
                                    return (
                                        <div key={day} className="border rounded-lg p-4">
                                            <h3 className="font-semibold mb-3">{day}</h3>
                                            {dayShifts.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No shifts scheduled</p>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {dayShifts.map((shift: any) => (
                                                        <div key={shift.id} className="p-3 border rounded">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium">{shift.employeeName}</span>
                                                                <span className={`text-xs px-2 py-1 rounded-full ${getShiftColor(shift.shift)}`}>
                                                                    {shift.shift}
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
