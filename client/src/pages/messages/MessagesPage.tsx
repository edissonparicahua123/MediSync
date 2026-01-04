import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
    MessageSquare,
    Send,
    Search,
    MoreVertical,
    Check,
    CheckCheck,
    Loader2,
    Plus,
    RefreshCw,
    Pin,
    Smile,
    Zap,
    AlertCircle,
    Trash2,
    Pencil,
    X,
    Paperclip,
    FileText,
    Image as ImageIcon,
    Download,
    File,
} from 'lucide-react'
import { messagesAPI, usersAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Conversation {
    user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    lastMessage: any;
    unreadCount: number;
}

interface Message {
    id: string;
    fromUserId: string;
    toUserId: string;
    content: string;
    subject?: string;
    isRead: boolean;
    createdAt: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    attachmentSize?: number;
    fromUser: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    toUser: {
        id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
}

const QUICK_REPLIES = [
    { icon: '✅', text: 'Entendido, procedo de inmediato' },
    { icon: '🏥', text: 'Paciente estabilizado' },
    { icon: '⏰', text: 'En camino, llego en 5 minutos' },
    { icon: '📋', text: 'Revisaré el expediente y te confirmo' },
    { icon: '💊', text: 'Medicamento administrado' },
    { icon: '🔬', text: 'Resultados de laboratorio listos' },
    { icon: '📞', text: 'Te llamo en un momento' },
    { icon: '👍', text: 'Perfecto, gracias por la información' },
]

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messageInput, setMessageInput] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [sendingMsg, setSendingMsg] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)
    const [allUsers, setAllUsers] = useState<any[]>([])
    const [selectedNewUser, setSelectedNewUser] = useState<string>('')
    const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set())
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [editingContent, setEditingContent] = useState('')
    const [uploadingFile, setUploadingFile] = useState(false)
    const [pendingFile, setPendingFile] = useState<{
        url: string;
        name: string;
        type: string;
        size: number;
    } | null>(null)
    const { toast } = useToast()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadInitialData()
        const savedPinned = localStorage.getItem('pinnedConversations')
        if (savedPinned) {
            setPinnedConversations(new Set(JSON.parse(savedPinned)))
        }
    }, [])

    useEffect(() => {
        if (selectedConversation) {
            loadConversationMessages(selectedConversation.user.id)
        }
    }, [selectedConversation])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadInitialData = async () => {
        try {
            setLoading(true)
            const [profileRes, conversationsRes, usersRes] = await Promise.all([
                usersAPI.getProfile(),
                messagesAPI.getConversations(),
                usersAPI.getAll({ limit: 100 }),
            ])

            setCurrentUserId(profileRes.data.id)
            setConversations(conversationsRes.data || [])
            setAllUsers(usersRes.data?.data || [])
        } catch (error: any) {
            console.error('Error loading messages:', error)
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las conversaciones',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const loadConversationMessages = async (otherUserId: string) => {
        try {
            const res = await messagesAPI.getMessages({ limit: 100 })
            const allMessages = res.data?.data || []

            const conversationMsgs = allMessages.filter((msg: Message) =>
                (msg.fromUserId === currentUserId && msg.toUserId === otherUserId) ||
                (msg.fromUserId === otherUserId && msg.toUserId === currentUserId)
            ).sort((a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )

            setMessages(conversationMsgs)

            conversationMsgs.forEach(async (msg: Message) => {
                if (msg.toUserId === currentUserId && !msg.isRead) {
                    await messagesAPI.markAsRead(msg.id)
                }
            })
        } catch (error: any) {
            console.error('Error loading messages:', error)
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'Archivo muy grande',
                description: 'El tamaño máximo es 10MB',
                variant: 'destructive',
            })
            return
        }

        try {
            setUploadingFile(true)
            const res = await messagesAPI.uploadFile(file)
            setPendingFile(res.data)
            toast({
                title: '📎 Archivo listo',
                description: `${file.name} está listo para enviar`,
            })
        } catch (error: any) {
            toast({
                title: 'Error al subir archivo',
                description: error.response?.data?.message || 'No se pudo subir el archivo',
                variant: 'destructive',
            })
        } finally {
            setUploadingFile(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleSendMessage = async (content?: string) => {
        const msgContent = content || messageInput
        if (!msgContent.trim() && !pendingFile) return
        if (!selectedConversation) return

        try {
            setSendingMsg(true)
            await messagesAPI.sendMessage({
                toUserId: selectedConversation.user.id,
                content: msgContent || (pendingFile ? `📎 ${pendingFile.name}` : ''),
                ...(pendingFile && {
                    attachmentUrl: pendingFile.url,
                    attachmentName: pendingFile.name,
                    attachmentType: pendingFile.type,
                    attachmentSize: pendingFile.size,
                }),
            })

            setMessageInput('')
            setPendingFile(null)
            await loadConversationMessages(selectedConversation.user.id)
            await loadInitialData()

            toast({
                title: '✅ Mensaje Enviado',
                description: 'Tu mensaje ha sido entregado',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Error al enviar mensaje',
                variant: 'destructive',
            })
        } finally {
            setSendingMsg(false)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        try {
            await messagesAPI.deleteMessage(messageId)
            toast({ title: '🗑️ Mensaje eliminado' })
            if (selectedConversation) {
                await loadConversationMessages(selectedConversation.user.id)
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo eliminar el mensaje',
                variant: 'destructive',
            })
        }
    }

    const handleEditMessage = async (messageId: string) => {
        if (!editingContent.trim()) return
        try {
            await messagesAPI.editMessage(messageId, editingContent)
            toast({ title: '✏️ Mensaje editado' })
            setEditingMessageId(null)
            setEditingContent('')
            if (selectedConversation) {
                await loadConversationMessages(selectedConversation.user.id)
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo editar el mensaje',
                variant: 'destructive',
            })
        }
    }

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return
        try {
            await messagesAPI.deleteConversation(selectedConversation.user.id)
            toast({ title: '🗑️ Conversación eliminada' })
            setSelectedConversation(null)
            await loadInitialData()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo eliminar la conversación',
                variant: 'destructive',
            })
        }
    }

    const handleStartNewConversation = async () => {
        if (!selectedNewUser) return

        const user = allUsers.find(u => u.id === selectedNewUser)
        if (user) {
            const newConv: Conversation = {
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                },
                lastMessage: null,
                unreadCount: 0,
            }
            setSelectedConversation(newConv)
            setShowNewMessageDialog(false)
            setSelectedNewUser('')
        }
    }

    const togglePinConversation = (userId: string) => {
        const newPinned = new Set(pinnedConversations)
        if (newPinned.has(userId)) {
            newPinned.delete(userId)
        } else {
            newPinned.add(userId)
        }
        setPinnedConversations(newPinned)
        localStorage.setItem('pinnedConversations', JSON.stringify([...newPinned]))
        toast({ title: newPinned.has(userId) ? '📌 Conversación fijada' : '📌 Conversación desfijada' })
    }

    const canEditMessage = (msg: Message) => {
        if (msg.fromUserId !== currentUserId) return false
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
        return new Date(msg.createdAt) > fifteenMinutesAgo
    }

    const formatConversationTime = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isToday(date)) return format(date, 'HH:mm', { locale: es })
        if (isYesterday(date)) return 'Ayer'
        return format(date, 'd MMM', { locale: es })
    }

    const getDateSeparator = (currentMsg: Message, prevMsg: Message | null) => {
        const currentDate = new Date(currentMsg.createdAt)
        if (!prevMsg) {
            if (isToday(currentDate)) return 'Hoy'
            if (isYesterday(currentDate)) return 'Ayer'
            return format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
        }

        const prevDate = new Date(prevMsg.createdAt)
        if (!isSameDay(currentDate, prevDate)) {
            if (isToday(currentDate)) return 'Hoy'
            if (isYesterday(currentDate)) return 'Ayer'
            return format(currentDate, "EEEE, d 'de' MMMM", { locale: es })
        }
        return null
    }

    const getStatusIcon = (isRead: boolean) => {
        if (isRead) return <CheckCheck className="h-3 w-3 text-blue-500" />
        return <Check className="h-3 w-3 text-gray-400" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const isImageFile = (type?: string) => type?.startsWith('image/')

    const getFileIcon = (type?: string) => {
        if (type?.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
        if (type?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
        if (type?.includes('word') || type?.includes('document')) return <FileText className="h-4 w-4 text-blue-500" />
        if (type?.includes('excel') || type?.includes('spreadsheet')) return <FileText className="h-4 w-4 text-green-500" />
        return <File className="h-4 w-4" />
    }

    const sortedConversations = [...conversations].sort((a, b) => {
        const aPinned = pinnedConversations.has(a.user.id)
        const bPinned = pinnedConversations.has(b.user.id)
        if (aPinned && !bPinned) return -1
        if (!aPinned && bPinned) return 1

        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
        return bTime - aTime
    })

    const filteredConversations = sortedConversations.filter(conv =>
        `${conv.user.firstName} ${conv.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Cargando mensajes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
                        <p className="text-muted-foreground">Comunicación interna del equipo médico</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadInitialData} title="Actualizar">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Mensaje
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Mensaje</DialogTitle>
                                <DialogDescription>Selecciona un usuario para iniciar una conversación.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Select value={selectedNewUser} onValueChange={setSelectedNewUser}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar usuario..." />
                                    </SelectTrigger>
                                    <SelectContent className="z-[9999] max-h-[300px]">
                                        {allUsers.filter(u => u.id !== currentUserId).length === 0 ? (
                                            <div className="p-4 text-sm text-muted-foreground text-center">
                                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                No hay otros usuarios registrados
                                            </div>
                                        ) : (
                                            allUsers.filter(u => u.id !== currentUserId).map(user => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback className="text-xs">{user.firstName?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span>{user.firstName} {user.lastName}</span>
                                                        <Badge variant="outline" className="text-xs ml-1">{user.role?.name || 'Usuario'}</Badge>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleStartNewConversation} disabled={!selectedNewUser} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600">
                                    Iniciar Conversación
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="grid grid-cols-12 gap-6 h-[700px]">
                {/* Conversations List */}
                <Card className="col-span-4 flex flex-col border-t-4 border-t-blue-500 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                                Conversaciones
                            </CardTitle>
                            <Badge variant="secondary">{conversations.length}</Badge>
                        </div>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            {filteredConversations.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No hay conversaciones</p>
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => {
                                    const isPinned = pinnedConversations.has(conversation.user.id)
                                    return (
                                        <div
                                            key={conversation.user.id}
                                            onClick={() => setSelectedConversation(conversation)}
                                            className={`p-4 border-b cursor-pointer hover:bg-accent/50 ${selectedConversation?.user.id === conversation.user.id ? 'bg-accent border-l-4 border-l-blue-500' : ''} ${isPinned ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={conversation.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.user.firstName}`} />
                                                    <AvatarFallback>{conversation.user.firstName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-1">
                                                            {isPinned && <Pin className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                                            <span className="font-semibold truncate">{conversation.user.firstName} {conversation.user.lastName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {conversation.lastMessage && (
                                                                <span className="text-xs text-muted-foreground">{formatConversationTime(conversation.lastMessage.createdAt)}</span>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-3 w-3" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); togglePinConversation(conversation.user.id) }}>
                                                                        <Pin className="h-4 w-4 mr-2" />{isPinned ? 'Desfijar' : 'Fijar arriba'}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm text-muted-foreground truncate max-w-[180px]">{conversation.lastMessage?.content || 'Sin mensajes'}</p>
                                                        {conversation.unreadCount > 0 && <Badge className="bg-blue-600 text-white text-xs">{conversation.unreadCount}</Badge>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="col-span-8 flex flex-col shadow-lg">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-11 w-11 ring-2 ring-blue-200">
                                            <AvatarImage src={selectedConversation.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.user.firstName}`} />
                                            <AvatarFallback>{selectedConversation.user.firstName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold text-lg">{selectedConversation.user.firstName} {selectedConversation.user.lastName}</h3>
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />En línea
                                            </div>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
                                                <AlertDialogDescription>Esta acción eliminará todos los mensajes. No se puede deshacer.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteConversation} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>

                            {/* Messages Area */}
                            <CardContent className="flex-1 p-4 overflow-hidden bg-gradient-to-b from-gray-50/50 to-background dark:from-gray-900/30">
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-4">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-12">
                                                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg font-medium">Iniciar conversación</p>
                                                <p className="text-sm">Envía el primer mensaje</p>
                                            </div>
                                        ) : (
                                            messages.map((message, index) => {
                                                const prevMessage = index > 0 ? messages[index - 1] : null
                                                const dateSeparator = getDateSeparator(message, prevMessage)
                                                const isMyMessage = message.fromUserId === currentUserId
                                                const isEditing = editingMessageId === message.id

                                                return (
                                                    <div key={message.id}>
                                                        {dateSeparator && (
                                                            <div className="flex items-center justify-center my-4">
                                                                <div className="bg-muted px-3 py-1 rounded-full text-xs font-medium">{dateSeparator}</div>
                                                            </div>
                                                        )}
                                                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} group`}>
                                                            <div className="relative">
                                                                {isMyMessage && !isEditing && (
                                                                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1">
                                                                        {canEditMessage(message) && (
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingMessageId(message.id); setEditingContent(message.content) }}>
                                                                                <Pencil className="h-3 w-3" />
                                                                            </Button>
                                                                        )}
                                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteMessage(message.id)}>
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border rounded-lg p-2">
                                                                        <Input value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="min-w-[200px]" autoFocus />
                                                                        <Button size="icon" className="h-8 w-8" onClick={() => handleEditMessage(message.id)}><Check className="h-4 w-4" /></Button>
                                                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingMessageId(null); setEditingContent('') }}><X className="h-4 w-4" /></Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className={`max-w-[400px] ${isMyMessage ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-t-2xl rounded-bl-2xl' : 'bg-white dark:bg-gray-800 border shadow-sm rounded-t-2xl rounded-br-2xl'} p-3`}>
                                                                        {/* Attachment Preview */}
                                                                        {message.attachmentUrl && (
                                                                            <div className="mb-2">
                                                                                {isImageFile(message.attachmentType) ? (
                                                                                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${message.attachmentUrl}`} target="_blank" rel="noopener noreferrer">
                                                                                        <img
                                                                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${message.attachmentUrl}`}
                                                                                            alt={message.attachmentName}
                                                                                            className="max-w-full rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90"
                                                                                        />
                                                                                    </a>
                                                                                ) : (
                                                                                    <a
                                                                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${message.attachmentUrl}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className={`flex items-center gap-2 p-2 rounded-lg ${isMyMessage ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'}`}
                                                                                    >
                                                                                        {getFileIcon(message.attachmentType)}
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-sm font-medium truncate">{message.attachmentName}</p>
                                                                                            <p className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                                                                                {message.attachmentSize && formatFileSize(message.attachmentSize)}
                                                                                            </p>
                                                                                        </div>
                                                                                        <Download className="h-4 w-4" />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                                                        <div className="flex items-center justify-end gap-1 mt-1">
                                                                            <span className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                                                                {format(new Date(message.createdAt), 'HH:mm', { locale: es })}
                                                                            </span>
                                                                            {isMyMessage && <span>{getStatusIcon(message.isRead)}</span>}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            {/* Message Input */}
                            <div className="border-t p-4 bg-gray-50/50 dark:bg-gray-900/30">
                                {/* Pending File Preview */}
                                {pendingFile && (
                                    <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                        {getFileIcon(pendingFile.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{pendingFile.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.size)}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPendingFile(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Quick Replies */}
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                    {QUICK_REPLIES.slice(0, 4).map((reply, index) => (
                                        <Button key={index} variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => handleSendMessage(reply.text)} disabled={sendingMsg}>
                                            <span className="mr-1">{reply.icon}</span>{reply.text.substring(0, 18)}...
                                        </Button>
                                    ))}
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="shrink-0"><Zap className="h-3 w-3 mr-1" />Más</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-2">
                                            <div className="grid gap-1">
                                                {QUICK_REPLIES.map((reply, index) => (
                                                    <Button key={index} variant="ghost" className="justify-start text-sm h-auto py-2" onClick={() => handleSendMessage(reply.text)}>
                                                        <span className="mr-2 text-lg">{reply.icon}</span>{reply.text}
                                                    </Button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Input Area */}
                                <div className="flex gap-2">
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                                    <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile} className="shrink-0" title="Adjuntar archivo">
                                        {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className="shrink-0"><Smile className="h-4 w-4" /></Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2">
                                            <div className="flex gap-1">
                                                {['😊', '👍', '❤️', '🙏', '✅', '🏥', '💊', '📋'].map(emoji => (
                                                    <Button key={emoji} variant="ghost" size="icon" className="text-xl h-8 w-8" onClick={() => setMessageInput(prev => prev + emoji)}>{emoji}</Button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        placeholder="Escribe un mensaje..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && !sendingMsg && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={() => handleSendMessage()} disabled={sendingMsg || (!messageInput.trim() && !pendingFile)} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                                        {sendingMsg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-xl font-medium mb-2">Selecciona una conversación</p>
                                <p className="text-sm">O inicia una nueva con el botón de arriba</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
