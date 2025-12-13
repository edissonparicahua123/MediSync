import { useState, useEffect } from 'react'
import { useBedStore } from '@/stores/bedStore'
import BedModal from '@/components/modals/BedModal'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    LayoutGrid,
    List,
    Plus,
    Search,
    Activity,
    BedDouble,
    CheckCircle2,
    AlertCircle,
    History
} from 'lucide-react'
import BedMap from './components/BedMap'
import BedList from './components/BedList'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function BedManagementPage() {
    const { activityLog, fetchBeds, fetchStats, stats } = useBedStore()
    const [isBedModalOpen, setIsBedModalOpen] = useState(false)
    const [bedToEdit, setBedToEdit] = useState(null)

    useEffect(() => {
        fetchBeds()
        fetchStats()
    }, [fetchBeds, fetchStats])

    // Filters
    const [view, setView] = useState<'map' | 'list'>('map')
    const [filterWard, setFilterWard] = useState('ALL')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col space-y-4 p-4 md:p-8 pt-6">
            <BedModal
                isOpen={isBedModalOpen}
                onClose={() => {
                    setIsBedModalOpen(false)
                    setBedToEdit(null)
                }}
                bedToEdit={bedToEdit}
            />

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Camas</h2>
                    <p className="text-muted-foreground">
                        Centro de control de hospitalización y asignación de recursos.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsBedModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nueva Cama
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Camas</CardTitle>
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Capacidad total instalada</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                        <p className="text-xs text-muted-foreground">Listas para ingreso</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ocupación</CardTitle>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.occupancyRate}%</div>
                        <p className="text-xs text-muted-foreground">{stats.occupied} camas ocupadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
                        <AlertCircle className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-600">{stats.maintenance + stats.cleaning}</div>
                        <p className="text-xs text-muted-foreground">Incluye limpieza</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                {/* Left Column: Map/List (Takes 3/4 width) */}
                <div className="lg:col-span-3 flex flex-col space-y-4">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar cama, paciente..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={filterWard} onValueChange={setFilterWard}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Todas las Áreas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas las Áreas</SelectItem>
                                    <SelectItem value="Emergencia">Emergencia</SelectItem>
                                    <SelectItem value="UCI">UCI</SelectItem>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Pediatría">Pediatría</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Todos los Estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos los Estados</SelectItem>
                                    <SelectItem value="AVAILABLE">Disponible</SelectItem>
                                    <SelectItem value="OCCUPIED">Ocupada</SelectItem>
                                    <SelectItem value="CLEANING">Limpieza</SelectItem>
                                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                                    <SelectItem value="RESERVED">Reservada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
                            <Button
                                variant={view === 'map' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setView('map')}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" /> Mapa
                            </Button>
                            <Button
                                variant={view === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setView('list')}
                            >
                                <List className="h-4 w-4 mr-2" /> Lista
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1 h-[600px]">
                        {view === 'map' ? (
                            <BedMap
                                filterWard={filterWard}
                                filterStatus={filterStatus}
                                onEditBed={(bed) => {
                                    setBedToEdit(bed)
                                    setIsBedModalOpen(true)
                                }}
                            />
                        ) : (
                            <BedList
                                filterWard={filterWard}
                                filterStatus={filterStatus}
                                onEditBed={(bed) => {
                                    setBedToEdit(bed)
                                    setIsBedModalOpen(true)
                                }}
                            />
                        )}
                    </ScrollArea>
                </div>

                {/* Right Column: Activity Log (Takes 1/4 width) */}
                <div className="lg:col-span-1">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="h-5 w-5" /> Actividad Reciente
                            </CardTitle>
                            <CardDescription>Registro de movimientos</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-[600px]">
                                <div className="space-y-4">
                                    {activityLog.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No hay actividad reciente.
                                        </p>
                                    ) : (
                                        activityLog.map((log) => (
                                            <div key={log.id} className="flex flex-col space-y-1 pb-4 border-b border-border last:border-0">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-semibold">{log.bedNumber}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true, locale: es })}
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">
                                                    {log.action}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">{log.details}</p>
                                                <p className="text-[10px] text-muted-foreground opacity-70">Por: {log.user}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
