import { create } from 'zustand'
import { bedsAPI } from '@/services/api'
import { toast } from '@/components/ui/use-toast'

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE' | 'RESERVED'

export interface Bed {
    id: string
    number: string
    ward: string
    type: string
    status: BedStatus
    patientId?: string
    diagnosis?: string
    patientName?: string
    admissionDate?: string
    notes?: string
    activities?: any[]
}

interface BedState {
    beds: Bed[]
    stats: any
    activityLog: any[]
    isLoading: boolean

    fetchBeds: () => Promise<void>
    fetchStats: () => Promise<void>

    addBed: (bed: Partial<Bed>) => Promise<void>
    updateBed: (id: string, updates: Partial<Bed>) => Promise<void>
    deleteBed: (id: string) => Promise<void>

    assignPatient: (bedId: string, data: { patientId: string }) => Promise<void>
    dischargePatient: (bedId: string) => Promise<void>
    setBedStatus: (bedId: string, status: BedStatus) => Promise<void>
    reserveBed: (bedId: string, data: any) => Promise<void>

    getStats: () => any
}

export const useBedStore = create<BedState>((set, get) => ({
    beds: [],
    stats: { total: 0, available: 0, occupied: 0, cleaning: 0, maintenance: 0, reserved: 0, occupancyRate: 0 },
    activityLog: [],
    isLoading: false,

    fetchBeds: async () => {
        set({ isLoading: true })
        try {
            const response = await bedsAPI.getAll()
            set({ beds: response.data.data })
        } catch (error) {
            console.error('Failed to fetch beds', error)
        } finally {
            set({ isLoading: false })
        }
    },

    fetchStats: async () => {
        try {
            const response = await bedsAPI.getStats()
            set({ stats: response.data })
        } catch (error) {
            console.error('Failed to fetch stats', error)
        }
    },

    addBed: async (bed) => {
        try {
            await bedsAPI.create(bed)
            get().fetchBeds()
            get().fetchStats()
            toast({ title: 'Cama creada', description: `Cama ${bed.number} agregada correctamente` })
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al crear cama', variant: 'destructive' })
        }
    },

    updateBed: async (id, updates) => {
        try {
            await bedsAPI.update(id, updates)
            get().fetchBeds()
            get().fetchStats()
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al actualizar cama', variant: 'destructive' })
        }
    },

    setBedStatus: async (id, status) => {
        try {
            await bedsAPI.update(id, { status })
            get().fetchBeds()
            get().fetchStats()
            toast({ title: 'Estado actualizado', description: `Cama marcada como ${status}` })
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al cambiar estado', variant: 'destructive' })
        }
    },

    deleteBed: async (id) => {
        try {
            await bedsAPI.delete(id)
            get().fetchBeds()
            get().fetchStats()
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al eliminar cama', variant: 'destructive' })
        }
    },

    assignPatient: async (bedId, data) => {
        try {
            await bedsAPI.assign(bedId, data)
            get().fetchBeds()
            get().fetchStats()
            toast({ title: 'Paciente Asignado', description: 'La cama ha sido ocupada.' })
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al asignar paciente', variant: 'destructive' })
        }
    },

    dischargePatient: async (bedId) => {
        try {
            await bedsAPI.discharge(bedId)
            get().fetchBeds()
            get().fetchStats()
            toast({ title: 'Alta Exitosa', description: 'La cama ahora está en limpieza.' })
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al dar de alta', variant: 'destructive' })
        }
    },

    reserveBed: async (bedId, data) => {
        // Implementation for reservation if backend supports it specifically or via update
        try {
            await bedsAPI.update(bedId, { status: 'RESERVED', notes: data.notes })
            get().fetchBeds()
            get().fetchStats()
            toast({ title: 'Reserva Exitosa', description: 'La cama ha sido reservada.' })
        } catch (error: any) {
            toast({ title: 'Error', description: error.response?.data?.message || 'Error al reservar', variant: 'destructive' })
        }
    },

    getStats: () => get().stats
}))
