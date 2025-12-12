import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bed, MoreVertical, UserPlus, UserMinus, Settings, Trash2, Activity, Clock, AlertCircle, CheckCircle2, CalendarClock } from 'lucide-react'
import { useBedStore, Bed as BedType } from '@/stores/bedStore'
import { useToast } from '@/components/ui/use-toast'
import BedAssignmentDialog from './BedAssignmentDialog'

interface BedMapProps {
    filterWard: string
    filterStatus: string
}

export default function BedMap({ filterWard, filterStatus }: BedMapProps) {
    const { beds, deleteBed, dischargePatient, setBedStatus } = useBedStore()
    const { toast } = useToast()
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null)

    const filteredBeds = beds.filter(bed => {
        if (filterWard !== 'ALL' && bed.ward !== filterWard) return false
        if (filterStatus !== 'ALL' && bed.status !== filterStatus) return false
        return true
    })

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return {
                    card: 'bg-card border-emerald-500/50 hover:border-emerald-500 shadow-sm hover:shadow-emerald-500/10',
                    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    icon: 'text-emerald-500',
                    label: 'Disponible'
                }
            case 'OCCUPIED':
                return {
                    card: 'bg-card border-rose-500/50 hover:border-rose-500 shadow-sm hover:shadow-rose-500/10',
                    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                    icon: 'text-rose-500',
                    label: 'Ocupada'
                }
            case 'CLEANING':
                return {
                    card: 'bg-card border-amber-500/50 hover:border-amber-500 shadow-sm hover:shadow-amber-500/10',
                    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    icon: 'text-amber-500',
                    label: 'Limpieza'
                }
            case 'MAINTENANCE':
                return {
                    card: 'bg-card border-slate-500/50 hover:border-slate-500 shadow-sm hover:shadow-slate-500/10',
                    badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
                    icon: 'text-slate-500',
                    label: 'Mantenimiento'
                }
            case 'RESERVED':
                return {
                    card: 'bg-card border-blue-500/50 hover:border-blue-500 shadow-sm hover:shadow-blue-500/10',
                    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    icon: 'text-blue-500',
                    label: 'Reservada'
                }
            default:
                return {
                    card: 'bg-card border-border',
                    badge: 'bg-secondary text-secondary-foreground',
                    icon: 'text-muted-foreground',
                    label: status
                }
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBeds.map((bed) => {
                    const styles = getStatusStyles(bed.status)
                    return (
                        <Card key={bed.id} className={`transition-all duration-200 hover:shadow-lg border ${styles.card}`}>
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Bed className={`h-5 w-5 ${styles.icon}`} />
                                        {bed.number}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium uppercase tracking-wider opacity-80">
                                        {bed.ward} • {bed.type}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-background/50">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        {bed.status === 'AVAILABLE' && (
                                            <DropdownMenuItem onClick={() => {
                                                setSelectedBedId(bed.id)
                                                setAssignDialogOpen(true)
                                            }}>
                                                <UserPlus className="mr-2 h-4 w-4" /> Asignar Paciente
                                            </DropdownMenuItem>
                                        )}
                                        {bed.status === 'OCCUPIED' && (
                                            <DropdownMenuItem onClick={() => {
                                                dischargePatient(bed.id)
                                                toast({ title: 'Paciente dado de alta', description: 'La cama ahora está en limpieza.' })
                                            }}>
                                                <UserMinus className="mr-2 h-4 w-4" /> Dar de Alta
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setBedStatus(bed.id, 'AVAILABLE')}>
                                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Marcar Disponible
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setBedStatus(bed.id, 'CLEANING')}>
                                            <Activity className="mr-2 h-4 w-4 text-amber-500" /> Marcar Limpieza
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setBedStatus(bed.id, 'MAINTENANCE')}>
                                            <Settings className="mr-2 h-4 w-4 text-slate-500" /> Marcar Mantenimiento
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setBedStatus(bed.id, 'RESERVED')}>
                                            <CalendarClock className="mr-2 h-4 w-4 text-blue-500" /> Marcar Reservada
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteBed(bed.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cama
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className={`${styles.badge} font-semibold`}>
                                            {styles.label}
                                        </Badge>
                                    </div>

                                    {bed.status === 'OCCUPIED' && (
                                        <div className="p-3 bg-background/60 backdrop-blur-sm rounded-lg border border-border/50 text-sm space-y-1 shadow-sm">
                                            <div className="flex items-center gap-2 text-foreground font-medium">
                                                <UserPlus className="h-3 w-3 text-muted-foreground" />
                                                {bed.patientName}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Ingreso: {new Date(bed.admissionDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {bed.diagnosis && (
                                                <div className="text-xs text-muted-foreground pt-1 border-t border-border/50 mt-1">
                                                    Dx: {bed.diagnosis}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {bed.status === 'RESERVED' && (
                                        <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20 text-sm space-y-1">
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
                                                <CalendarClock className="h-3 w-3" />
                                                {bed.patientName}
                                            </div>
                                            <div className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                                {bed.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <BedAssignmentDialog
                isOpen={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                bedId={selectedBedId}
            />
        </>
    )
}
