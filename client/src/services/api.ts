import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth API
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh'),
}

// Patients API
export const patientsAPI = {
    getAll: (params?: any) => api.get('/patients', { params }),
    getOne: (id: string) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
    getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
}

// Doctors API
export const doctorsAPI = {
    getAll: (params?: any) => api.get('/doctors', { params }),
    getOne: (id: string) => api.get(`/doctors/${id}`),
}

// Appointments API
export const appointmentsAPI = {
    getAll: (params?: any) => api.get('/appointments', { params }),
    getOne: (id: string) => api.get(`/appointments/${id}`),
    create: (data: any) => api.post('/appointments', data),
    updateStatus: (id: string, status: string, notes?: string) =>
        api.patch(`/appointments/${id}/status`, { status, notes }),
}

// AI API
export const aiAPI = {
    triage: (data: any) => api.post('/ai/triage', data),
    summarize: (text: string) => api.post('/ai/summarize', { text }),
    predictDemand: (medicationId: string) =>
        api.post('/ai/pharmacy/demand', { medication_id: medicationId }),
}
