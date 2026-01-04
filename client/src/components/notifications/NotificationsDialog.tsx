import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
    Bell, Check, Trash2, Search, Filter, Calendar,
    FlaskConical, Pill, DollarSign, AlertCircle, Loader2,
    MessageSquare, CheckCheck, Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
}

interface NotificationsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: React.ReactNode;
}

export function NotificationsDialog({ open, onOpenChange, children }: NotificationsDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (open) {
            loadNotifications();
        }
    }, [open]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getAll({ limit: 50 });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast({
                title: "Notificaciones actualizadas",
                description: "Todas las notificaciones han sido marcadas como leídas.",
            });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            await notificationsAPI.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast({
                title: "Notificación eliminada",
                description: "La notificación ha sido eliminada correctamente.",
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_REMINDER': return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'LAB_READY': return <FlaskConical className="h-5 w-5 text-purple-500" />;
            case 'PRESCRIPTION_READY': return <Pill className="h-5 w-5 text-green-500" />;
            case 'PAYMENT_DUE': return <DollarSign className="h-5 w-5 text-orange-500" />;
            case 'MESSAGE_RECEIVED': return <MessageSquare className="h-5 w-5 text-indigo-500" />;
            default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ? true : activeTab === 'unread' ? !n.isRead : true;
        return matchesSearch && matchesTab;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border shadow-2xl gap-0 h-[80vh] flex flex-col" aria-describedby="notifications-description">
                <DialogTitle className="sr-only">Centro de Notificaciones</DialogTitle>
                <DialogDescription id="notifications-description" className="sr-only">
                    Lista completa de notificaciones del usuario con opciones de filtrado y acciones.
                </DialogDescription>

                {/* Header Section */}
                <div className="relative p-6 bg-gradient-to-r from-background via-muted/20 to-background border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Centro de Notificaciones</h2>
                                <p className="text-sm text-muted-foreground">
                                    Tienes <span className="font-semibold text-primary">{unreadCount}</span> notificaciones sin leer
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="gap-2">
                                    <CheckCheck className="h-4 w-4" />
                                    Marcar todo leído
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar notificaciones..."
                                className="pl-9 bg-background/50 border-primary/20 focus:border-primary/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
                            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                                <TabsTrigger value="all">Todas</TabsTrigger>
                                <TabsTrigger value="unread" className="relative">
                                    No Leídas
                                    {unreadCount > 0 && (
                                        <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 bg-muted/10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4 opacity-50">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <Bell className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium">No se encontraron notificaciones</p>
                            <p className="text-sm text-muted-foreground max-w-xs text-center">
                                {searchQuery
                                    ? "Intenta con otros términos de búsqueda."
                                    : "Estás al día. ¡Buen trabajo!"}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`
                                        group relative p-4 border-b border-border/40 hover:bg-muted/30 transition-all cursor-default
                                        ${!notification.isRead ? 'bg-primary/5' : ''}
                                    `}
                                >
                                    <div className="flex gap-4">
                                        <div className={`mt-1 h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-background border shadow-sm ${!notification.isRead ? 'border-primary/30 ring-2 ring-primary/10' : 'border-border'}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <h4 className={`text-sm font-medium leading-none ${!notification.isRead ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1 bg-background px-2 py-0.5 rounded-full border">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: es,
                                                    })}
                                                </span>
                                            </div>

                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions Overlay (visible on hover) */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.isRead && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 rounded-full bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/50 shadow-sm"
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                title="Marcar como leída"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 w-8 p-0 rounded-full bg-background hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 shadow-sm"
                                            onClick={(e) => handleDelete(notification.id, e)}
                                            title="Eliminar"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Unread Indicator Dot */}
                                    {!notification.isRead && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 bg-primary rounded-r-full" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer can be empty or have bulk actions */}
                <div className="p-2 border-t border-border bg-muted/40 text-center text-xs text-muted-foreground">
                    Mostrando los últimos 50 eventos
                </div>

            </DialogContent>
        </Dialog>
    );
}
