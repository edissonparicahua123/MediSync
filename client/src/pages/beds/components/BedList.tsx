import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { MoreHorizontal, UserPlus, UserMinus, Settings, Trash2, Activity, CheckCircle2, CalendarClock } from "lucide-react"
import { useBedStore, Bed as BedType } from "@/stores/bedStore"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import BedAssignmentDialog from "./BedAssignmentDialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface BedListProps {
    filterWard: string
    filterStatus: string
    onEditBed: (bed: BedType) => void
}

export default function BedList({ filterWard, filterStatus, onEditBed }: BedListProps) {
    const { beds, deleteBed, dischargePatient, setBedStatus } = useBedStore()
    const { toast } = useToast()
    const [assignDialogOpen, setAssignDialogOpen] = useState(false)
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null)

    const filteredBeds = beds.filter(bed => {
        if (filterWard !== 'ALL' && bed.ward !== filterWard) return false
        if (filterStatus !== 'ALL' && bed.status !== filterStatus) return false
        return true
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">Disponible</Badge>
            case 'OCCUPIED':
                return <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 transition-colors">Ocupada</Badge>
            case 'CLEANING':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 transition-colors">Limpieza</Badge>
            case 'MAINTENANCE':
                return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20 transition-colors">Mantenimiento</Badge>
            case 'RESERVED':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20 transition-colors">Reservada</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b border-border/50">
                                <TableHead className="w-[100px]">Número</TableHead>
                                <TableHead>Área</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[200px]">Paciente</TableHead>
                                <TableHead>Tiempo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBeds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No se encontraron camas con los filtros actuales.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBeds.map((bed) => (
                                    <TableRow key={bed.id} className="group hover:bg-muted/50 transition-colors border-border/50">
                                        <TableCell className="font-medium text-foreground">{bed.number}</TableCell>
                                        <TableCell>{bed.ward}</TableCell>
                                        <TableCell>{bed.type}</TableCell>
                                        <TableCell>{getStatusBadge(bed.status)}</TableCell>
                                        <TableCell>
                                            {bed.patientName ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{bed.patientName}</span>
                                                    {bed.diagnosis && (
                                                        <span className="text-xs text-muted-foreground">{bed.diagnosis}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {bed.admissionDate ? (
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(bed.admissionDate), { addSuffix: true, locale: es })}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
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
                                                    <DropdownMenuItem onClick={() => onEditBed(bed)}>
                                                        <Settings className="mr-2 h-4 w-4" /> Editar Cama
                                                    </DropdownMenuItem>
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
                                                    <DropdownMenuItem className="text-red-600" onClick={() => deleteBed(bed.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Cama
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <BedAssignmentDialog
                isOpen={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                bedId={selectedBedId}
            />
        </>
    )
}
