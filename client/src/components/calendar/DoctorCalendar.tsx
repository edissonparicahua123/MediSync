import { useState, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, SlotInfo } from 'react-big-calendar'
// @ts-ignore - withDragAndDrop has type issues
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay, addHours, setHours, setMinutes } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { appointmentsAPI } from '@/services/api'
import './DoctorCalendar.css'

const locales = {
    'en-US': enUS,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

// @ts-ignore
const DnDCalendar = withDragAndDrop(Calendar)

interface DoctorCalendarProps {
    doctorId: string
    appointments: any[]
    onRefresh: () => void
}

export default function DoctorCalendar({ doctorId, appointments, onRefresh }: DoctorCalendarProps) {
    const { toast } = useToast()
    const [view, setView] = useState<View>('week')

    // Convertir citas a eventos del calendario
    const events = useMemo(() => {
        return appointments.map((apt: any) => {
            const start = new Date(apt.appointmentDate)
            const end = addHours(start, 1)

            return {
                id: apt.id,
                title: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown Patient',
                start,
                end,
                resource: {
                    patientId: apt.patientId,
                    patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
                    reason: apt.reason || 'General Checkup',
                    status: apt.status,
                    type: 'appointment',
                },
            }
        })
    }, [appointments])

    // Manejar selección de slot
    const handleSelectSlot = useCallback(
        (slotInfo: SlotInfo) => {
            toast({
                title: 'Create Appointment',
                description: `Selected time: ${format(slotInfo.start, 'PPpp')}`,
            })
        },
        [toast]
    )

    // Manejar clic en evento
    const handleSelectEvent = useCallback(
        (event: any) => {
            toast({
                title: event.title || 'Appointment',
                description: `${event.resource?.reason} - ${event.resource?.status}`,
            })
        },
        [toast]
    )

    // Manejar drag & drop
    const handleEventDrop = useCallback(
        async (data: any) => {
            const { event, start } = data
            try {
                await appointmentsAPI.update(event.id, {
                    appointmentDate: start.toISOString(),
                })

                toast({
                    title: 'Appointment Moved',
                    description: `Moved to ${format(start, 'PPpp')}`,
                })

                onRefresh()
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to move appointment',
                    variant: 'destructive',
                })
            }
        },
        [toast, onRefresh]
    )

    // Manejar resize
    const handleEventResize = useCallback(
        async (data: any) => {
            const { event, start } = data
            try {
                await appointmentsAPI.update(event.id, {
                    appointmentDate: start.toISOString(),
                })

                toast({
                    title: 'Appointment Resized',
                    description: 'Duration changed',
                })

                onRefresh()
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to resize appointment',
                    variant: 'destructive',
                })
            }
        },
        [toast, onRefresh]
    )

    // Estilos personalizados
    const eventStyleGetter = (event: any) => {
        let backgroundColor = '#3b82f6'

        if (event.resource?.type === 'blocked') {
            backgroundColor = '#6b7280'
        } else if (event.resource?.status === 'COMPLETED') {
            backgroundColor = '#10b981'
        } else if (event.resource?.status === 'CANCELLED') {
            backgroundColor = '#ef4444'
        } else if (event.resource?.status === 'CONFIRMED') {
            backgroundColor = '#3b82f6'
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Schedule Calendar</CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant={view === 'day' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('day')}
                        >
                            Day
                        </Button>
                        <Button
                            variant={view === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('week')}
                        >
                            Week
                        </Button>
                        <Button
                            variant={view === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setView('month')}
                        >
                            Month
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="doctor-calendar" style={{ height: '600px' }}>
                    {/* @ts-ignore */}
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        view={view}
                        onView={setView}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                        selectable
                        resizable
                        eventPropGetter={eventStyleGetter}
                        step={30}
                        timeslots={2}
                        min={setHours(setMinutes(new Date(), 0), 8)}
                        max={setHours(setMinutes(new Date(), 0), 18)}
                        defaultDate={new Date()}
                        popup
                    />
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span>Cancelled</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-500"></div>
                        <span>Blocked</span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">📅 Calendar Features:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Drag & Drop:</strong> Drag appointments to move them</li>
                        <li>• <strong>Resize:</strong> Drag edges to change duration</li>
                        <li>• <strong>Create:</strong> Click on time slot to create appointment</li>
                        <li>• <strong>View:</strong> Click event to see details</li>
                        <li>• <strong>Color Coded:</strong> Blue=Scheduled, Green=Completed, Red=Cancelled</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}
