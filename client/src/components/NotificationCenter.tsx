import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Bell,
    Calendar,
    FlaskConical,
    Pill,
    DollarSign,
    AlertCircle,
    Check,
    Loader2,
} from 'lucide-react'
import { notificationsAPI } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { NotificationsDialog } from '@/components/notifications/NotificationsDialog'

interface Notification {
    id: string
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
    relatedEntityType?: string
    relatedEntityId?: string
}

export default function NotificationCenter() {
    const [open, setOpen] = useState(false)
    const [openModal, setOpenModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        loadNotifications()
        // Polling every 30 seconds
        const interval = setInterval(loadUnreadCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const loadNotifications = async () => {
        try {
            setLoading(true)
            const [notifRes, countRes] = await Promise.all([
                notificationsAPI.getAll({ limit: 20 }),
                notificationsAPI.getUnreadCount(),
            ])
            setNotifications(notifRes.data.data || [])
            setUnreadCount(countRes.data.count || 0)
        } catch (error) {
            console.error('Error loading notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadUnreadCount = async () => {
        try {
            const res = await notificationsAPI.getUnreadCount()
            setUnreadCount(res.data.count || 0)
        } catch (error) {
            // Silently fail
        }
    }

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id)
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'APPOINTMENT_REMINDER':
                return <Calendar className="h-5 w-5 text-blue-500" />
            case 'LAB_READY':
                return <FlaskConical className="h-5 w-5 text-purple-500" />
            case 'PRESCRIPTION_READY':
                return <Pill className="h-5 w-5 text-green-500" />
            case 'PAYMENT_DUE':
                return <DollarSign className="h-5 w-5 text-orange-500" />
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <button
                            className="text-sm text-blue-600 hover:underline"
                            onClick={handleMarkAllAsRead}
                        >
                            Marcar todas leídas
                        </button>
                    )}
                </div>

                {/* Notification List */}
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) {
                                            handleMarkAsRead(notification.id)
                                        }
                                    }}
                                >
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1 text-muted-foreground">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide pt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Bell className="h-12 w-12 text-gray-300 mb-2" />
                            <p>No tienes notificaciones</p>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 border-t bg-muted/20">
                    <Button
                        variant="ghost"
                        className="w-full text-sm hover:text-primary transition-colors hover:bg-primary/5"
                        onClick={() => {
                            setOpen(false); // Close popover
                            setOpenModal(true); // Open dialog
                        }}
                    >
                        Gestionar todas las notificaciones
                    </Button>
                </div>
            </PopoverContent>

            <NotificationsDialog open={openModal} onOpenChange={setOpenModal} />
        </Popover>
    )
}
