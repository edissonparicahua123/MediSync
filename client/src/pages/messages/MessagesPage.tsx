import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    MessageSquare,
    Send,
    Paperclip,
    Users,
    Search,
    MoreVertical,
    Phone,
    Video,
    Image as ImageIcon,
    File,
    Check,
    CheckCheck,
} from 'lucide-react'
import { messagesAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

export default function MessagesPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [messageInput, setMessageInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const { toast } = useToast()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        loadConversations()
    }, [])

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadConversations = async () => {
        try {
            // Datos simulados de conversaciones
            const simulatedConversations = [
                {
                    id: '1',
                    name: 'Dr. John Smith',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                    lastMessage: 'The patient needs immediate attention',
                    lastMessageTime: new Date(Date.now() - 300000),
                    unreadCount: 2,
                    isOnline: true,
                    isGroup: false,
                },
                {
                    id: '2',
                    name: 'Emergency Team',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emergency',
                    lastMessage: 'New case in ER',
                    lastMessageTime: new Date(Date.now() - 600000),
                    unreadCount: 5,
                    isOnline: true,
                    isGroup: true,
                    members: 8,
                },
                {
                    id: '3',
                    name: 'Nurse Sarah',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                    lastMessage: 'Medication administered',
                    lastMessageTime: new Date(Date.now() - 1800000),
                    unreadCount: 0,
                    isOnline: false,
                    isGroup: false,
                },
                {
                    id: '4',
                    name: 'Cardiology Department',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cardio',
                    lastMessage: 'Meeting at 3 PM',
                    lastMessageTime: new Date(Date.now() - 3600000),
                    unreadCount: 1,
                    isOnline: true,
                    isGroup: true,
                    members: 12,
                },
                {
                    id: '5',
                    name: 'Dr. Mike Williams',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                    lastMessage: 'Thanks for the update',
                    lastMessageTime: new Date(Date.now() - 7200000),
                    unreadCount: 0,
                    isOnline: true,
                    isGroup: false,
                },
            ]

            setConversations(simulatedConversations)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load conversations',
                variant: 'destructive',
            })
        }
    }

    const loadMessages = async (conversationId: string) => {
        try {
            // Datos simulados de mensajes
            const simulatedMessages = [
                {
                    id: '1',
                    senderId: 'other',
                    senderName: selectedConversation?.name || 'User',
                    content: 'Hello! How are you?',
                    timestamp: new Date(Date.now() - 3600000),
                    status: 'read',
                    type: 'text',
                },
                {
                    id: '2',
                    senderId: 'me',
                    senderName: 'Me',
                    content: 'Hi! I\'m doing well, thanks for asking.',
                    timestamp: new Date(Date.now() - 3500000),
                    status: 'read',
                    type: 'text',
                },
                {
                    id: '3',
                    senderId: 'other',
                    senderName: selectedConversation?.name || 'User',
                    content: 'I need to discuss the patient case',
                    timestamp: new Date(Date.now() - 3400000),
                    status: 'read',
                    type: 'text',
                },
                {
                    id: '4',
                    senderId: 'me',
                    senderName: 'Me',
                    content: 'Sure, let me check the records',
                    timestamp: new Date(Date.now() - 3300000),
                    status: 'read',
                    type: 'text',
                },
                {
                    id: '5',
                    senderId: 'other',
                    senderName: selectedConversation?.name || 'User',
                    content: 'patient_records.pdf',
                    timestamp: new Date(Date.now() - 1800000),
                    status: 'read',
                    type: 'file',
                    fileSize: '2.5 MB',
                },
                {
                    id: '6',
                    senderId: 'me',
                    senderName: 'Me',
                    content: 'Got it, reviewing now',
                    timestamp: new Date(Date.now() - 600000),
                    status: 'delivered',
                    type: 'text',
                },
                {
                    id: '7',
                    senderId: 'me',
                    senderName: 'Me',
                    content: 'xray_results.jpg',
                    timestamp: new Date(Date.now() - 300000),
                    status: 'sent',
                    type: 'image',
                },
            ]

            setMessages(simulatedMessages)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load messages',
                variant: 'destructive',
            })
        }
    }

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return

        const newMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'Me',
            content: messageInput,
            timestamp: new Date(),
            status: 'sent',
            type: 'text',
        }

        setMessages([...messages, newMessage])
        setMessageInput('')

        // Simular indicador "escribiendo..."
        setTimeout(() => {
            setIsTyping(true)
        }, 500)

        // Simular respuesta
        setTimeout(() => {
            setIsTyping(false)
            const response = {
                id: (Date.now() + 1).toString(),
                senderId: 'other',
                senderName: selectedConversation.name,
                content: 'Thanks for the message! I\'ll get back to you shortly.',
                timestamp: new Date(),
                status: 'read',
                type: 'text',
            }
            setMessages(prev => [...prev, response])
        }, 2000)

        toast({
            title: 'Message Sent',
            description: 'Your message has been delivered',
        })
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file || !selectedConversation) return

        const newMessage = {
            id: Date.now().toString(),
            senderId: 'me',
            senderName: 'Me',
            content: file.name,
            timestamp: new Date(),
            status: 'sent',
            type: file.type.startsWith('image/') ? 'image' : 'file',
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        }

        setMessages([...messages, newMessage])

        toast({
            title: 'File Uploaded',
            description: `${file.name} has been sent`,
        })
    }

    const getStatusIcon = (status: string) => {
        if (status === 'read') return <CheckCheck className="h-3 w-3 text-blue-600" />
        if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-gray-400" />
        return <Check className="h-3 w-3 text-gray-400" />
    }

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground">
                        Real-time chat with colleagues
                    </p>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="grid grid-cols-12 gap-6 h-[700px]">
                {/* Conversations List */}
                <Card className="col-span-4 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Conversations</CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        <ScrollArea className="h-full">
                            {filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setSelectedConversation(conversation)}
                                    className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={conversation.avatar} />
                                                <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {conversation.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold truncate">
                                                        {conversation.name}
                                                    </span>
                                                    {conversation.isGroup && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Users className="h-3 w-3 mr-1" />
                                                            {conversation.members}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(conversation.lastMessageTime, 'HH:mm')}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {conversation.lastMessage}
                                                </p>
                                                {conversation.unreadCount > 0 && (
                                                    <Badge className="bg-blue-600 text-white">
                                                        {conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="col-span-8 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src={selectedConversation.avatar} />
                                                <AvatarFallback>
                                                    {selectedConversation.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {selectedConversation.isOnline && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{selectedConversation.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedConversation.isOnline ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Video className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Messages Area */}
                            <CardContent className="flex-1 p-4 overflow-hidden">
                                <ScrollArea className="h-full pr-4">
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                <div
                                                    className={`max-w-[70%] ${message.senderId === 'me'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-100'
                                                        } rounded-lg p-3`}
                                                >
                                                    {message.type === 'text' && (
                                                        <p className="text-sm">{message.content}</p>
                                                    )}
                                                    {message.type === 'file' && (
                                                        <div className="flex items-center gap-2">
                                                            <File className="h-8 w-8" />
                                                            <div>
                                                                <p className="text-sm font-medium">{message.content}</p>
                                                                <p className="text-xs opacity-70">{message.fileSize}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {message.type === 'image' && (
                                                        <div className="flex items-center gap-2">
                                                            <ImageIcon className="h-8 w-8" />
                                                            <div>
                                                                <p className="text-sm font-medium">{message.content}</p>
                                                                <p className="text-xs opacity-70">{message.fileSize}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs opacity-70">
                                                            {format(message.timestamp, 'HH:mm')}
                                                        </span>
                                                        {message.senderId === 'me' && (
                                                            <span className="ml-2">
                                                                {getStatusIcon(message.status)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Typing Indicator */}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-100 rounded-lg p-3">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            {/* Message Input */}
                            <div className="border-t p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        placeholder="Type a message..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendMessage}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
