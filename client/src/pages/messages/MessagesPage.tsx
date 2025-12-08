import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { messagesAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'

export default function MessagesPage() {
    const [conversations, setConversations] = useState<any[]>([])
    const [messages, setMessages] = useState<any[]>([])
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        try {
            setLoading(true)
            const response = await messagesAPI.getConversations()
            setConversations(response.data || [])
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load conversations',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return

        try {
            setSending(true)
            await messagesAPI.sendMessage({
                toUserId: selectedConversation.user.id,
                content: newMessage,
            })
            setNewMessage('')
            toast({
                title: 'Success',
                description: 'Message sent successfully',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to send message',
                variant: 'destructive',
            })
        } finally {
            setSending(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-8 w-8" />
                    Messages
                </h1>
                <p className="text-muted-foreground mt-1">Internal messaging system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                    <h2 className="font-bold mb-4">Conversations</h2>
                    <div className="space-y-2">
                        {conversations.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4 text-sm">
                                No conversations yet
                            </p>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.user.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`p-3 hover:bg-accent rounded-lg cursor-pointer border ${selectedConversation?.user.id === conv.user.id
                                            ? 'border-primary'
                                            : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="font-semibold text-primary">
                                                {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">
                                                {conv.user.firstName} {conv.user.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {conv.lastMessage?.content || 'No messages'}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card className="md:col-span-2 p-6">
                    {!selectedConversation ? (
                        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
                            Select a conversation to start messaging
                        </div>
                    ) : (
                        <div className="flex flex-col h-[600px]">
                            <div className="border-b pb-4 mb-4">
                                <h2 className="font-bold">
                                    {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedConversation.user.email}
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                                {messages.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No messages yet. Start the conversation!
                                    </p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.fromUserId === selectedConversation.user.id ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`p-3 rounded-lg max-w-[70%] ${msg.fromUserId === selectedConversation.user.id
                                                    ? 'bg-accent'
                                                    : 'bg-primary text-primary-foreground'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.fromUserId === selectedConversation.user.id
                                                        ? 'text-muted-foreground'
                                                        : 'opacity-70'
                                                    }`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Type a message..."
                                    className="flex-1"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={sending}
                                />
                                <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
