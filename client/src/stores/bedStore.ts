import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED'

export interface Bed {
    id: string
    number: string
    ward: string // Area: UCI, Emergencia, etc.
    type: string // Camilla, Cama Hospitalaria, etc.
    status: BedStatus

    // Patient Data
    patientId?: string
    patientName?: string
    admissionDate?: string
    estimatedDischargeDate?: string
    diagnosis?: string
    specialty?: string

    // Metadata
    notes?: string
    assignedBy?: string
    lastUpdated: string
}

export interface ActivityLog {
    id: string
    bedId: string
    bedNumber: string
    action: string
    timestamp: string
    user: string
    details?: string
}

interface BedState {
    beds: Bed[]
    activityLog: ActivityLog[]
    selectedBed: Bed | null

    // Actions
    addBed: (bed: Partial<Bed>) => void
    updateBed: (id: string, updates: Partial<Bed>) => void
    deleteBed: (id: string) => void

    // Operational Actions
    assignPatient: (bedId: string, patientData: { id?: string, name: string, diagnosis?: string, specialty?: string, estimatedDischarge?: string, notes?: string }) => void
    dischargePatient: (bedId: string) => void
    setBedStatus: (bedId: string, status: BedStatus, notes?: string) => void
    reserveBed: (bedId: string, patientName: string, notes?: string) => void

    getStats: () => {
        total: number
        available: number
        occupied: number
        cleaning: number
        maintenance: number
        reserved: number
        occupancyRate: number
    }
}

export const useBedStore = create<BedState>()(
    persist(
        (set, get) => ({
            beds: [
                { id: '1', number: 'CAM-001', ward: 'Emergencia', type: 'Camilla', status: 'OCCUPIED', patientName: 'Juan Pérez', admissionDate: new Date().toISOString(), diagnosis: 'Dolor Abdominal', specialty: 'Medicina General', lastUpdated: new Date().toISOString() },
                { id: '2', number: 'CAM-002', ward: 'Emergencia', type: 'Camilla', status: 'AVAILABLE', lastUpdated: new Date().toISOString() },
                { id: '3', number: 'CAM-003', ward: 'Emergencia', type: 'Camilla', status: 'AVAILABLE', lastUpdated: new Date().toISOString() },
                { id: '4', number: 'UCI-001', ward: 'UCI', type: 'Cama UCI', status: 'OCCUPIED', patientName: 'María García', admissionDate: new Date().toISOString(), diagnosis: 'Insuficiencia Respiratoria', specialty: 'Neumología', lastUpdated: new Date().toISOString() },
                { id: '5', number: 'UCI-002', ward: 'UCI', type: 'Cama UCI', status: 'MAINTENANCE', notes: 'Revisión de oxígeno', lastUpdated: new Date().toISOString() },
                { id: '6', number: 'GEN-001', ward: 'General', type: 'Cama Hospitalaria', status: 'AVAILABLE', lastUpdated: new Date().toISOString() },
                { id: '7', number: 'GEN-002', ward: 'General', type: 'Cama Hospitalaria', status: 'CLEANING', lastUpdated: new Date().toISOString() },
                { id: '8', number: 'GEN-003', ward: 'General', type: 'Cama Hospitalaria', status: 'RESERVED', patientName: 'Reserva Quirófano', notes: 'Ingreso post-op 14:00', lastUpdated: new Date().toISOString() },
            ],
            activityLog: [
                { id: '1', bedId: '8', bedNumber: 'GEN-003', action: 'RESERVA', timestamp: new Date().toISOString(), user: 'Dr. Admin', details: 'Reserva para post-operatorio' }
            ],
            selectedBed: null,

            addBed: (bed) => set((state) => ({
                beds: [...state.beds, {
                    ...bed,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'AVAILABLE',
                    lastUpdated: new Date().toISOString()
                } as Bed]
            })),

            updateBed: (id, updates) => set((state) => ({
                beds: state.beds.map((b) => b.id === id ? { ...b, ...updates, lastUpdated: new Date().toISOString() } : b)
            })),

            deleteBed: (id) => set((state) => ({
                beds: state.beds.filter((b) => b.id !== id)
            })),

            assignPatient: (bedId, data) => set((state) => {
                const bed = state.beds.find(b => b.id === bedId)
                if (!bed) return state

                const newLog: ActivityLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    bedId,
                    bedNumber: bed.number,
                    action: 'ASIGNACIÓN',
                    timestamp: new Date().toISOString(),
                    user: 'Usuario Actual', // TODO: Get real user
                    details: `Paciente: ${data.name}`
                }

                return {
                    beds: state.beds.map(b => b.id === bedId ? {
                        ...b,
                        status: 'OCCUPIED',
                        patientName: data.name,
                        patientId: data.id,
                        diagnosis: data.diagnosis,
                        specialty: data.specialty,
                        estimatedDischargeDate: data.estimatedDischarge,
                        notes: data.notes,
                        admissionDate: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    } : b),
                    activityLog: [newLog, ...state.activityLog]
                }
            }),

            dischargePatient: (bedId) => set((state) => {
                const bed = state.beds.find(b => b.id === bedId)
                if (!bed) return state

                const newLog: ActivityLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    bedId,
                    bedNumber: bed.number,
                    action: 'ALTA',
                    timestamp: new Date().toISOString(),
                    user: 'Usuario Actual',
                    details: `Paciente: ${bed.patientName} dado de alta`
                }

                return {
                    beds: state.beds.map(b => b.id === bedId ? {
                        ...b,
                        status: 'CLEANING', // Auto-switch to cleaning
                        patientName: undefined,
                        patientId: undefined,
                        diagnosis: undefined,
                        specialty: undefined,
                        estimatedDischargeDate: undefined,
                        notes: undefined,
                        admissionDate: undefined,
                        lastUpdated: new Date().toISOString()
                    } : b),
                    activityLog: [newLog, ...state.activityLog]
                }
            }),

            setBedStatus: (bedId, status, notes) => set((state) => {
                const bed = state.beds.find(b => b.id === bedId)
                if (!bed) return state

                const newLog: ActivityLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    bedId,
                    bedNumber: bed.number,
                    action: 'CAMBIO ESTADO',
                    timestamp: new Date().toISOString(),
                    user: 'Usuario Actual',
                    details: `Estado cambiado a ${status}`
                }

                return {
                    beds: state.beds.map(b => b.id === bedId ? {
                        ...b,
                        status,
                        notes: notes || b.notes,
                        lastUpdated: new Date().toISOString()
                    } : b),
                    activityLog: [newLog, ...state.activityLog]
                }
            }),

            reserveBed: (bedId, patientName, notes) => set((state) => {
                const bed = state.beds.find(b => b.id === bedId)
                if (!bed) return state

                const newLog: ActivityLog = {
                    id: Math.random().toString(36).substr(2, 9),
                    bedId,
                    bedNumber: bed.number,
                    action: 'RESERVA',
                    timestamp: new Date().toISOString(),
                    user: 'Usuario Actual',
                    details: `Reservada para: ${patientName}`
                }

                return {
                    beds: state.beds.map(b => b.id === bedId ? {
                        ...b,
                        status: 'RESERVED',
                        patientName,
                        notes,
                        lastUpdated: new Date().toISOString()
                    } : b),
                    activityLog: [newLog, ...state.activityLog]
                }
            }),

            getStats: () => {
                const { beds } = get()
                const total = beds.length
                const available = beds.filter(b => b.status === 'AVAILABLE').length
                const occupied = beds.filter(b => b.status === 'OCCUPIED').length
                const cleaning = beds.filter(b => b.status === 'CLEANING').length
                const maintenance = beds.filter(b => b.status === 'MAINTENANCE').length
                const reserved = beds.filter(b => b.status === 'RESERVED').length

                return {
                    total, available, occupied, cleaning, maintenance, reserved,
                    occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
                }
            }
        }),
        {
            name: 'medisync-bed-storage',
        }
    )
)
