import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { patientsAPI } from '@/services/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Plus,
    Search,
    Loader2,
    Edit,
    Trash2,
    FileDown,
    FileSpreadsheet,
    Upload,
    Printer,
    Filter,
    Eye,
    User,
} from 'lucide-react'
import PatientModal from '@/components/modals/PatientModal'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function PatientsPage() {
    const navigate = useNavigate()
    const { toast } = useToast()

    // Estados
    const [searchTerm, setSearchTerm] = useState('')
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [showFilters, setShowFilters] = useState(false)

    // Filtros
    const [filters, setFilters] = useState({
        gender: 'all',
        status: 'all',
        priority: 'all',
        ageMin: '',
        ageMax: '',
        insurance: 'all',
    })

    // Cargar pacientes
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['patients'],
        queryFn: () => patientsAPI.getAll(),
    })

    const patients = data?.data?.data || []

    // Filtrar pacientes
    const filteredPatients = patients.filter((patient: any) => {
        // Búsqueda por texto
        const searchMatch = searchTerm === '' ||
            `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone?.includes(searchTerm) ||
            patient.documentNumber?.includes(searchTerm)

        // Filtros
        const genderMatch = filters.gender === 'all' || patient.gender === filters.gender
        const statusMatch = filters.status === 'all' || patient.status === filters.status

        // Edad
        let ageMatch = true
        if (patient.dateOfBirth) {
            const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
            if (filters.ageMin && age < parseInt(filters.ageMin)) ageMatch = false
            if (filters.ageMax && age > parseInt(filters.ageMax)) ageMatch = false
        }

        return searchMatch && genderMatch && statusMatch && ageMatch
    })

    // Handlers
    const handleEdit = (patient: any) => {
        setSelectedPatient(patient)
        setModalOpen(true)
    }

    const handleAdd = () => {
        setSelectedPatient(null)
        setModalOpen(true)
    }

    const handleSuccess = () => {
        refetch()
        setModalOpen(false)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await patientsAPI.delete(deleteId)
            toast({
                title: 'Éxito',
                description: 'Paciente eliminado correctamente',
            })
            refetch()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al eliminar paciente',
                variant: 'destructive',
            })
        } finally {
            setDeleteId(null)
        }
    }

    const handleViewProfile = (patientId: string) => {
        navigate(`/patients/${patientId}`)
    }

    // Exportar funciones
    const handleExportPDF = () => {
        toast({
            title: 'Exportar a PDF',
            description: 'Generando reporte PDF...',
        })
        // TODO: Implementar exportación PDF
    }

    const handleExportExcel = () => {
        try {
            toast({
                title: 'Exportando...',
                description: 'Generando archivo CSV...',
            })

            // Generate CSV
            const headers = ['ID', 'Nombre', 'Apellido', 'DNI', 'Email', 'Teléfono', 'Género', 'Tipo Sangre', 'Estado']
            const rows = filteredPatients.map((p: any) => [
                p.id,
                p.firstName,
                p.lastName,
                p.documentNumber || '',
                p.email || '',
                p.phone || '',
                p.gender,
                p.bloodType || '',
                p.status
            ])

            const csvContent = [
                headers.join(','),
                ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `pacientes_${format(new Date(), 'yyyyMMdd')}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast({
                title: 'Éxito',
                description: 'Archivo descargado correctamente',
            })
        } catch (error) {
            console.error(error)
            toast({
                title: 'Error',
                description: 'No se pudo exportar el archivo',
                variant: 'destructive'
            })
        }
    }

    const handleImport = () => {
        toast({
            title: 'Importar Datos',
            description: 'Funcionalidad de importación próximamente',
        })
        // TODO: Implementar importación
    }

    const handlePrint = () => {
        window.print()
    }

    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return 'N/A'
        const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
        return age
    }

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
            CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        }
        return colors[status] || colors.ACTIVE
    }

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            LOW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        }
        return colors[priority] || colors.MEDIUM
    }

    // Helper for table render
    const getPatientPriority = (patient: any) => {
        // If backend doesn't send priority, simulate it based on age or status for UI demo
        if (patient.priority) return patient.priority
        if (patient.status === 'CRITICAL') return 'HIGH'

        const age = calculateAge(patient.dateOfBirth)
        if (typeof age === 'number' && age > 70) return 'HIGH'
        return 'MEDIUM'
    }

    if (isLoading) {
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
                    <p className="text-muted-foreground">
                        Gestionar registros de pacientes e historial médico • {filteredPatients.length} total
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleImport}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Paciente
                    </Button>
                </div>
            </div>

            {/* Barra de acciones */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, correo, teléfono o ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <FileDown className="h-4 w-4 mr-2" />
                            PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t">
                        <Select value={filters.gender} onValueChange={(v) => setFilters({ ...filters, gender: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Género" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Géneros</SelectItem>
                                <SelectItem value="MALE">Masculino</SelectItem>
                                <SelectItem value="FEMALE">Femenino</SelectItem>
                                <SelectItem value="OTHER">Otro</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Estados</SelectItem>
                                <SelectItem value="ACTIVE">Activo</SelectItem>
                                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                                <SelectItem value="CRITICAL">Crítico</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Prioridades</SelectItem>
                                <SelectItem value="HIGH">Alta</SelectItem>
                                <SelectItem value="MEDIUM">Media</SelectItem>
                                <SelectItem value="LOW">Baja</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input
                            type="number"
                            placeholder="Edad Mín"
                            value={filters.ageMin}
                            onChange={(e) => setFilters({ ...filters, ageMin: e.target.value })}
                        />

                        <Input
                            type="number"
                            placeholder="Edad Máx"
                            value={filters.ageMax}
                            onChange={(e) => setFilters({ ...filters, ageMax: e.target.value })}
                        />

                        <Select value={filters.insurance} onValueChange={(v) => setFilters({ ...filters, insurance: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seguro" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo Seguro</SelectItem>
                                <SelectItem value="private">Privado</SelectItem>
                                <SelectItem value="public">Público</SelectItem>
                                <SelectItem value="none">Ninguno</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </Card>

            {/* Tabla de pacientes */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Foto</TableHead>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>DNI/ID</TableHead>
                            <TableHead>Género</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Seguro</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead>Última Visita</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                                    No se encontraron pacientes
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPatients.map((patient: any) => (
                                <TableRow key={patient.id} className="hover:bg-accent/50">
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                            {patient.firstName?.[0]}{patient.lastName?.[0]}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {patient.firstName} {patient.lastName}
                                    </TableCell>
                                    <TableCell>{patient.documentNumber || 'N/A'}</TableCell>
                                    <TableCell>{patient.gender || 'N/A'}</TableCell>
                                    <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                                    <TableCell>{patient.insuranceProvider || 'None'}</TableCell>
                                    <TableCell>{patient.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(getPatientPriority(patient))}`}>
                                            {getPatientPriority(patient) === 'HIGH' ? 'ALTA' :
                                                getPatientPriority(patient) === 'LOW' ? 'BAJA' : 'MEDIA'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {patient.createdAt ? format(new Date(patient.createdAt), 'MMM dd, yyyy', { locale: es }) : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(patient.status || 'ACTIVE')}`}>
                                            {({
                                                'ACTIVE': 'ACTIVO',
                                                'INACTIVE': 'INACTIVO',
                                                'CRITICAL': 'CRÍTICO'
                                            } as Record<string, string>)[patient.status || 'ACTIVE'] || patient.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleViewProfile(patient.id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(patient)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDeleteId(patient.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Modal de paciente */}
            <PatientModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                patient={selectedPatient}
                onSuccess={handleSuccess}
            />

            {/* Dialog de confirmación de eliminación */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Dtás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el registro del paciente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
