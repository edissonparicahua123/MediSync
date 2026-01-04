import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import {
    Loader2,
    FileDown,
    Eye,
    ShieldAlert,
    User,
    Calendar,
    Filter,
    Activity,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    resourceId?: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: { name: string };
    };
}

export default function AuditLogsPage() {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState<string>('');
    const [resourceFilter, setResourceFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['audit-logs', page, actionFilter, resourceFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (actionFilter && actionFilter !== 'TODAS') params.append('action', actionFilter);
            if (resourceFilter && resourceFilter !== 'TODAS') params.append('resource', resourceFilter);

            const response = await api.get(`/audit?${params.toString()}`);
            return response.data;
        },
    });

    const { data: stats } = useQuery({
        queryKey: ['audit-stats'],
        queryFn: async () => {
            const response = await api.get('/audit/stats');
            return response.data;
        }
    });

    const exportLogs = () => {
        if (!data?.data) return;
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Fecha,Usuario,Rol,Accion,Recurso,IP\n"
            + data.data.map((log: AuditLog) =>
                `${log.createdAt},${log.user.firstName} ${log.user.lastName},${log.user.role.name},${log.action},${log.resource},${log.ipAddress}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `auditoria_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getActionBadge = (action: string) => {
        if (action.includes('DELETE')) return <Badge variant="destructive">ELIMINAR</Badge>;
        if (action.includes('CREATE')) return <Badge variant="success">CREAR</Badge>;
        if (action.includes('UPDATE')) return <Badge variant="warning">ACTUALIZAR</Badge>;
        if (action.includes('LOGIN')) return <Badge variant="info">ACCESO</Badge>;
        return <Badge variant="secondary">VER</Badge>;
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <ShieldAlert className="h-8 w-8 text-primary" />
                        Registro de Auditoría
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoreo de seguridad y trazabilidad de acciones en el sistema.
                    </p>
                </div>
                <Button variant="outline" onClick={exportLogs} className="shadow-sm">
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </div>

            {/* Resumen Cards con Datos Reales */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Logs Hoy</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.logsToday ?? '...'}</div>
                        <p className="text-xs text-muted-foreground">Acciones registradas hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Activos Hoy</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeUsersToday ?? '...'}</div>
                        <p className="text-xs text-muted-foreground">Usuarios únicos que realizaron acciones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Histórico</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalLogs ?? '...'}</div>
                        <p className="text-xs text-muted-foreground">Total de registros de auditoría</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filtros y Búsqueda
                    </CardTitle>
                    <CardDescription>
                        Filtra los resultados para encontrar eventos específicos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="w-full md:w-[250px]">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas las Acciones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODAS">Todas las Acciones</SelectItem>
                                    <SelectItem value="VIEW_PATIENT">Ver Paciente</SelectItem>
                                    <SelectItem value="UPDATE_PATIENT">Actualizar Paciente</SelectItem>
                                    <SelectItem value="CREATE_PATIENT">Crear Paciente</SelectItem>
                                    <SelectItem value="DELETE_PATIENT">Eliminar Paciente</SelectItem>
                                    <SelectItem value="LOGIN">Inicio de Sesión</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-[250px]">
                            <Select value={resourceFilter} onValueChange={setResourceFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los Recursos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODAS">Todos los Recursos</SelectItem>
                                    <SelectItem value="patients">Pacientes</SelectItem>
                                    <SelectItem value="appointments">Citas</SelectItem>
                                    <SelectItem value="medications">Medicamentos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setActionFilter('');
                                setResourceFilter('');
                                setPage(1);
                            }}
                        >
                            Limpiar
                        </Button>
                    </div>

                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[200px]">Fecha y Hora</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Acción</TableHead>
                                    <TableHead>Recurso</TableHead>
                                    <TableHead>IP</TableHead>
                                    <TableHead className="text-right">Detalle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-muted-foreground text-sm">Cargando registros...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No se encontraron registros de auditoría.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data.map((log: AuditLog) => (
                                        <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">
                                                        {log.user.firstName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{log.user.firstName} {log.user.lastName}</span>
                                                        <span className="text-xs text-muted-foreground">{log.user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {log.user.role.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getActionBadge(log.action)}</TableCell>
                                            <TableCell>
                                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                    {log.resource}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {log.ipAddress || 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="h-8 w-8"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-muted-foreground">
                            Página {page} de {data?.meta?.lastPage || 1}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!data?.meta || page >= data.meta.lastPage}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Search className="h-5 w-5 text-primary" />
                            Detalle del Evento de Auditoría
                        </DialogTitle>
                        <DialogDescription>
                            Información técnica detallada sobre la acción registrada.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded-lg bg-card">
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Usuario</label>
                                    <div className="text-base font-medium">{selectedLog.user.firstName} {selectedLog.user.lastName}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Rol</label>
                                    <div>{selectedLog.user.role.name}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Acción</label>
                                    <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Recurso ID</label>
                                    <div className="font-mono text-xs">{selectedLog.resourceId || 'N/A'}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">Fecha</label>
                                    <div>{format(new Date(selectedLog.createdAt), "PPpp", { locale: es })}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">IP</label>
                                    <div className="font-mono">{selectedLog.ipAddress}</div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">Datos / Cambios (JSON)</label>
                                <div className="rounded-md border bg-slate-950 p-4 overflow-hidden">
                                    <pre className="text-xs font-mono text-slate-50 overflow-auto max-h-[300px]">
                                        {JSON.stringify(selectedLog.changes, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground border-t pt-4">
                                <span className="font-semibold">User Agent:</span> {selectedLog.userAgent}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
