import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { notificationsAPI } from '@/services/api';
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Calendar,
    AlertTriangle,
    Info,
    FileText,
    Filter,
    Search,
    Clock,
    ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types locally since we might not have a shared types file handy yet
interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    link?: string;
    relatedEntityType?: string;
}

import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [searchQuery, setSearchQuery] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getAll({ limit: 50 });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string, event?: React.MouseEvent) => {
        event?.stopPropagation();
        try {
            setUpdating(id);
            await notificationsAPI.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            setUpdating(id);
            await notificationsAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        } finally {
            setUpdating(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_REMINDER': return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'SYSTEM_ALERT': return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'LAB_RESULT': return <FileText className="h-5 w-5 text-purple-500" />;
            case 'BILLING': return <FileText className="h-5 w-5 text-green-500" />;
            default: return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_REMINDER': return 'Cita';
            case 'SYSTEM_ALERT': return 'Sistema';
            case 'LAB_RESULT': return 'Laboratorio';
            case 'BILLING': return 'Facturación';
            default: return 'Info';
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'unread' ? !n.isRead :
                    filter === 'read' ? n.isRead : true;

        const matchesSearch =
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-muted"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Centro de Notificaciones
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Gestiona tus alertas, recordatorios y mensajes del sistema.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || loading}
                        className="gap-2"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Marcar todo leído
                    </Button>
                </div>
            </div>

            <Card className="glass-card border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                            <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                                <TabsTrigger value="all">Todas</TabsTrigger>
                                <TabsTrigger value="unread" className="relative">
                                    No leídas
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="read">Leídas</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar notificaciones..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] pr-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-muted-foreground">Cargando notificaciones...</p>
                            </div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                                <div className="bg-muted/50 p-6 rounded-full">
                                    <Bell className="h-12 w-12 text-muted-foreground/50" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">No hay notificaciones</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        {searchQuery
                                            ? 'No se encontraron resultados para tu búsqueda.'
                                            : 'Estás al día. No tienes notificaciones pendientes.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredNotifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className={`
                                                group relative flex gap-4 p-4 rounded-xl border transition-all duration-200
                                                ${notification.isRead
                                                    ? 'bg-card/50 border-border/50 hover:bg-card/80'
                                                    : 'bg-primary/5 border-primary/20 shadow-sm hover:shadow-md hover:border-primary/30'}
                                            `}
                                        >
                                            <div className={`
                                                mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center
                                                ${notification.isRead ? 'bg-muted' : 'bg-background shadow-inner'}
                                            `}>
                                                {getIcon(notification.type)}
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-1">
                                                        <h4 className={`text-sm font-semibold leading-none ${!notification.isRead && 'text-foreground'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {format(new Date(notification.createdAt), "d MMM, HH:mm", { locale: es })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-3">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {getTypeLabel(notification.type)}
                                                    </Badge>

                                                    {notification.link && (
                                                        <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                                                            <a href={notification.link}>Ver detalles</a>
                                                        </Button>
                                                    )}

                                                    <div className="flex-1" />

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notification.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                title="Marcar como leída"
                                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            title="Eliminar"
                                                            onClick={(e) => handleDelete(notification.id, e)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {!notification.isRead && (
                                                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationsPage;
