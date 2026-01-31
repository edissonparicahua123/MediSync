import { create } from 'zustand'
import { patientsAPI } from '@/services/api'

interface Patient {
    id: string
    firstName: string
    lastName: string
    documentNumber: string
    // Add other fields as necessary
}

interface PatientStore {
    patients: Patient[]
    isLoading: boolean
    fetchPatients: (params?: any) => Promise<void>
}

export const usePatientStore = create<PatientStore>((set) => ({
    patients: [],
    isLoading: false,

    fetchPatients: async (params) => {
        set({ isLoading: true })
        try {
            const response = await patientsAPI.getAll(params)
            console.log('fetching raw:', response)
            // Handle pagination structure (response.data.data) or direct array (response.data)
            const patientsData = response.data.data || response.data
            console.log('processed patientsData:', patientsData)
            set({ patients: Array.isArray(patientsData) ? patientsData : [] })
        } catch (error) {
            console.error('Failed to fetch patients', error)
            set({ patients: [] })
        } finally {
            set({ isLoading: false })
        }
    }
}))
