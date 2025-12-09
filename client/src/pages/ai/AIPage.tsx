import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Brain,
    Send,
    Loader2,
    TrendingUp,
    Activity,
    MessageSquare,
    AlertTriangle,
    Sparkles,
} from 'lucide-react'
import { aiAPI } from '@/services/api'
import { useToast } from '@/components/ui/use-toast'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AIPage() {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('triage')
    const { toast } = useToast()

    // Triage State
    const [symptoms, setSymptoms] = useState('')
    const [triageResult, setTriageResult] = useState<any>(null)
    const [analyzingTriage, setAnalyzingTriage] = useState(false)

    // Chat State
    const [chatMessages, setChatMessages] = useState<any[]>([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI Medical Assistant. How can I help you today?',
            timestamp: new Date(),
        },
    ])
    const [chatInput, setChatInput] = useState('')
    const [sendingMessage, setSendingMessage] = useState(false)

    // Predictions Data
    const [predictions, setPredictions] = useState<any>({
        saturation: [],
        demand: [],
        categories: [],
    })

    useEffect(() => {
        loadPredictions()
    }, [])

    const loadPredictions = async () => {
        try {
            setLoading(true)

            // Datos simulados de predicciones
            const simulatedPredictions = {
                // Predicción de saturación
                saturation: [
                    { hour: '08:00', current: 45, predicted: 52, capacity: 60, confidence: 85 },
                    { hour: '09:00', current: 58, predicted: 65, capacity: 60, confidence: 88 },
                    { hour: '10:00', current: 55, predicted: 62, capacity: 60, confidence: 82 },
                    { hour: '11:00', current: 52, predicted: 58, capacity: 60, confidence: 80 },
                    { hour: '12:00', current: 48, predicted: 54, capacity: 60, confidence: 78 },
                    { hour: '13:00', current: 42, predicted: 48, capacity: 60, confidence: 75 },
                    { hour: '14:00', current: 50, predicted: 56, capacity: 60, confidence: 82 },
                    { hour: '15:00', current: 54, predicted: 60, capacity: 60, confidence: 85 },
                ],

                // Predicción de demanda
                demand: [
                    { day: 'Mon', actual: 145, predicted: 152, confidence: 85 },
                    { day: 'Tue', actual: 168, predicted: 175, confidence: 82 },
                    { day: 'Wed', actual: 192, predicted: 188, confidence: 88 },
                    { day: 'Thu', actual: 178, predicted: 185, confidence: 80 },
                    { day: 'Fri', actual: 205, predicted: 212, confidence: 86 },
                    { day: 'Sat', actual: 120, predicted: 125, confidence: 78 },
                    { day: 'Sun', actual: 95, predicted: 98, confidence: 75 },
                ],

                // Categorización automática
                categories: [
                    { category: 'Cardiology', count: 45, trend: 'up', confidence: 92 },
                    { category: 'Emergency', count: 78, trend: 'stable', confidence: 88 },
                    { category: 'Pediatrics', count: 52, trend: 'up', confidence: 85 },
                    { category: 'Surgery', count: 34, trend: 'down', confidence: 90 },
                    { category: 'General', count: 120, trend: 'up', confidence: 87 },
                ],
            }

            setPredictions(simulatedPredictions)
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to load predictions',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleTriageAnalysis = async () => {
        if (!symptoms.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter symptoms',
                variant: 'destructive',
            })
            return
        }

        setAnalyzingTriage(true)

        // Simular análisis de IA
        setTimeout(() => {
            const priorities = [
                {
                    level: 1,
                    label: 'CRITICAL',
                    color: 'bg-red-600',
                    waitTime: 0,
                    description: 'Immediate attention required',
                },
                {
                    level: 2,
                    label: 'URGENT',
                    color: 'bg-orange-600',
                    waitTime: 10,
                    description: 'Attention needed within 10 minutes',
                },
                {
                    level: 3,
                    label: 'SEMI-URGENT',
                    color: 'bg-yellow-600',
                    waitTime: 30,
                    description: 'Attention needed within 30 minutes',
                },
                {
                    level: 4,
                    label: 'NON-URGENT',
                    color: 'bg-blue-600',
                    waitTime: 60,
                    description: 'Can wait up to 1 hour',
                },
                {
                    level: 5,
                    label: 'LOW PRIORITY',
                    color: 'bg-green-600',
                    waitTime: 120,
                    description: 'Can wait up to 2 hours',
                },
            ]

            // Análisis simple basado en palabras clave
            const symptomLower = symptoms.toLowerCase()
            let priority = priorities[3] // Default: NON-URGENT
            let category = 'General Medicine'
            let recommendations = []

            if (symptomLower.includes('chest pain') || symptomLower.includes('heart') || symptomLower.includes('cardiac')) {
                priority = priorities[0]
                category = 'Cardiology - Emergency'
                recommendations = [
                    'Immediate ECG required',
                    'Cardiac enzyme tests',
                    'Monitor vital signs continuously',
                    'Prepare for possible cardiac intervention',
                ]
            } else if (symptomLower.includes('severe') || symptomLower.includes('bleeding') || symptomLower.includes('unconscious')) {
                priority = priorities[0]
                category = 'Emergency'
                recommendations = [
                    'Immediate assessment required',
                    'Stabilize patient',
                    'Check vital signs',
                    'Prepare emergency equipment',
                ]
            } else if (symptomLower.includes('fever') || symptomLower.includes('pain') || symptomLower.includes('difficulty breathing')) {
                priority = priorities[1]
                category = 'General Medicine'
                recommendations = [
                    'Check temperature and vital signs',
                    'Assess pain level',
                    'Consider blood tests',
                    'Monitor respiratory rate',
                ]
            } else if (symptomLower.includes('cough') || symptomLower.includes('cold') || symptomLower.includes('headache')) {
                priority = priorities[2]
                category = 'General Medicine'
                recommendations = [
                    'Basic vital signs check',
                    'Symptomatic treatment',
                    'Patient education',
                    'Follow-up if symptoms persist',
                ]
            }

            setTriageResult({
                priority,
                category,
                recommendations,
                confidence: 85 + Math.floor(Math.random() * 10),
                analysis: `Based on the symptoms provided, the AI has categorized this case as ${priority.label} priority. The patient should be seen ${priority.waitTime === 0 ? 'immediately' : `within ${priority.waitTime} minutes`}.`,
            })

            setAnalyzingTriage(false)
            toast({
                title: 'Analysis Complete',
                description: `Priority: ${priority.label}`,
            })
        }, 2000)
    }

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return

        const userMessage = {
            role: 'user',
            content: chatInput,
            timestamp: new Date(),
        }

        setChatMessages([...chatMessages, userMessage])
        setChatInput('')
        setSendingMessage(true)

        // Simular respuesta de IA
        setTimeout(() => {
            const responses = [
                'Based on the symptoms you described, I recommend scheduling an appointment with a specialist.',
                'That sounds like it could be related to several conditions. I suggest getting a proper examination.',
                'For immediate relief, you can try over-the-counter medication, but please consult with a doctor if symptoms persist.',
                'This is a common condition. I can help you understand the possible causes and treatment options.',
                'I recommend getting lab tests done to rule out any underlying conditions.',
            ]

            const aiMessage = {
                role: 'assistant',
                content: responses[Math.floor(Math.random() * responses.length)],
                timestamp: new Date(),
            }

            setChatMessages(prev => [...prev, aiMessage])
            setSendingMessage(false)
        }, 1500)
    }

    const getCategoryTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
        if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
        return <Activity className="h-4 w-4 text-blue-600" />
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Brain className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI Medical Assistant</h1>
                        <p className="text-muted-foreground">
                            Intelligent triage, predictions, and medical chat
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    AI Powered
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="triage">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Intelligent Triage
                    </TabsTrigger>
                    <TabsTrigger value="predictions">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Predictions
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Medical Chat
                    </TabsTrigger>
                    <TabsTrigger value="categorization">
                        <Activity className="h-4 w-4 mr-2" />
                        Auto Categorization
                    </TabsTrigger>
                </TabsList>

                {/* Intelligent Triage Tab */}
                <TabsContent value="triage" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Symptom Analysis</CardTitle>
                                <CardDescription>Enter patient symptoms for AI analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="Describe the patient's symptoms in detail..."
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                    rows={8}
                                />
                                <Button
                                    onClick={handleTriageAnalysis}
                                    disabled={analyzingTriage}
                                    className="w-full"
                                >
                                    {analyzingTriage ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="h-4 w-4 mr-2" />
                                            Analyze with AI
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>AI Analysis Result</CardTitle>
                                <CardDescription>Intelligent triage recommendation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {triageResult ? (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg border-2" style={{ borderColor: triageResult.priority.color.replace('bg-', '') }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-lg font-bold">Priority Level {triageResult.priority.level}</span>
                                                <Badge className={`${triageResult.priority.color} text-white`}>
                                                    {triageResult.priority.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {triageResult.priority.description}
                                            </p>
                                            <p className="text-sm font-medium">
                                                Wait Time: {triageResult.priority.waitTime === 0 ? 'IMMEDIATE' : `${triageResult.priority.waitTime} minutes`}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="font-semibold mb-2">Category:</p>
                                            <Badge variant="outline">{triageResult.category}</Badge>
                                        </div>

                                        <div>
                                            <p className="font-semibold mb-2">AI Confidence:</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${triageResult.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{triageResult.confidence}%</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-semibold mb-2">Recommendations:</p>
                                            <ul className="space-y-1">
                                                {triageResult.recommendations.map((rec: string, idx: number) => (
                                                    <li key={idx} className="text-sm flex items-start gap-2">
                                                        <span className="text-indigo-600">•</span>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-3 bg-indigo-50 rounded-lg">
                                            <p className="text-sm">{triageResult.analysis}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Enter symptoms and click "Analyze with AI" to get results</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Predictions Tab */}
                <TabsContent value="predictions" className="mt-4 space-y-6">
                    {/* Saturation Prediction */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Saturation Prediction</CardTitle>
                            <CardDescription>AI-powered capacity forecasting</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={predictions.saturation}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="current" stroke="#3b82f6" strokeWidth={2} name="Current" />
                                    <Line type="monotone" dataKey="predicted" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                                    <Line type="monotone" dataKey="capacity" stroke="#ef4444" strokeWidth={2} name="Capacity" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Demand Prediction */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Demand Prediction</CardTitle>
                            <CardDescription>Weekly patient volume forecasting</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={predictions.demand}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="actual" fill="#10b981" name="Actual" />
                                    <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Medical Chat Tab */}
                <TabsContent value="chat" className="mt-4">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>AI Medical Chat</CardTitle>
                            <CardDescription>Ask medical questions to the AI assistant</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <ScrollArea className="flex-1 pr-4">
                                <div className="space-y-4">
                                    {chatMessages.map((message, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {sendingMessage && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-100 p-3 rounded-lg">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="flex gap-2 mt-4">
                                <Input
                                    placeholder="Ask a medical question..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage} disabled={sendingMessage}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Auto Categorization Tab */}
                <TabsContent value="categorization" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Automatic Case Categorization</CardTitle>
                            <CardDescription>AI-powered case classification and trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {predictions.categories.map((cat: any, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-lg">{cat.category}</span>
                                                {getCategoryTrendIcon(cat.trend)}
                                            </div>
                                            <Badge variant="outline">
                                                {cat.confidence}% confidence
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>Cases: {cat.count}</span>
                                                    <span className="text-muted-foreground">Trend: {cat.trend}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${(cat.count / 120) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
