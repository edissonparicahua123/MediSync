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

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh'),
}

// ============================================
// PATIENTS API
// ============================================
export const patientsAPI = {
    getAll: (params?: any) => api.get('/patients', { params }),
    getOne: (id: string) => api.get(`/patients/${id}`),
    create: (data: any) => api.post('/patients', data),
    update: (id: string, data: any) => api.patch(`/patients/${id}`, data),
    delete: (id: string) => api.delete(`/patients/${id}`),
    getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
}

// ============================================
// DOCTORS API
// ============================================
export const doctorsAPI = {
    getAll: (params?: any) => api.get('/doctors', { params }),
    getOne: (id: string) => api.get(`/doctors/${id}`),
    create: (data: any) => api.post('/doctors', data),
    update: (id: string, data: any) => api.patch(`/doctors/${id}`, data),
    delete: (id: string) => api.delete(`/doctors/${id}`),
}

// ============================================
// APPOINTMENTS API
// ============================================
export const appointmentsAPI = {
    getAll: (params?: any) => api.get('/appointments', { params }),
    getOne: (id: string) => api.get(`/appointments/${id}`),
    create: (data: any) => api.post('/appointments', data),
    update: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
    updateStatus: (id: string, status: string, notes?: string) =>
        api.patch(`/appointments/${id}/status`, { status, notes }),
    delete: (id: string) => api.delete(`/appointments/${id}`),
}

// ============================================
// HR API (NEW)
// ============================================
export const hrAPI = {
    getEmployees: (params?: any) => api.get('/hr/employees', { params }),
    getEmployee: (id: string) => api.get(`/hr/employees/${id}`),
    createEmployee: (data: any) => api.post('/hr/employees', data),
    updateEmployee: (id: string, data: any) => api.put(`/hr/employees/${id}`, data),
    deleteEmployee: (id: string) => api.delete(`/hr/employees/${id}`),
    getStats: () => api.get('/hr/stats'),
    getAttendance: (date?: Date) => api.get('/hr/attendance', { params: { date } }),
    getPayroll: () => api.get('/hr/payroll'),
    getShifts: () => api.get('/hr/shifts'),
}

// ============================================
// EMERGENCY API (NEW)
// ============================================
export const emergencyAPI = {
    getDashboard: () => api.get('/emergency/dashboard'),
    getCriticalPatients: () => api.get('/emergency/critical-patients'),
    getBeds: (params?: any) => api.get('/emergency/beds', { params }),
    getBed: (id: string) => api.get(`/emergency/beds/${id}`),
    createBed: (data: any) => api.post('/emergency/beds', data),
    updateBedStatus: (id: string, data: any) => api.put(`/emergency/beds/${id}`, data),
    getWardStats: () => api.get('/emergency/wards/stats'),
    getPatientHistory: (patientId: string) => api.get(`/emergency/history/${patientId}`),
}

// ============================================
// BED MANAGEMENT API
// ============================================
export const bedsAPI = {
    getAll: (params?: any) => api.get('/beds', { params }),
    getStats: () => api.get('/beds/stats'),
    getOne: (id: string) => api.get(`/beds/${id}`),
    create: (data: any) => api.post('/beds', data),
    update: (id: string, data: any) => api.patch(`/beds/${id}`, data),
    delete: (id: string) => api.delete(`/beds/${id}`),
    assign: (id: string, data: any) => api.post(`/beds/${id}/assign`, data),
    discharge: (id: string) => api.post(`/beds/${id}/discharge`),
}

// ============================================
// ADMIN API (NEW)
// ============================================
export const adminAPI = {
    getConfigs: (params?: any) => api.get('/admin/config', { params }),
    getConfig: (id: string) => api.get(`/admin/config/${id}`),
    createConfig: (data: any) => api.post('/admin/config', data),
    updateConfig: (id: string, data: any) => api.put(`/admin/config/${id}`, data),
    deleteConfig: (id: string) => api.delete(`/admin/config/${id}`),
    getServicesByCategory: () => api.get('/admin/services/by-category'),
}

// ============================================
// MESSAGES API (NEW)
// ============================================
export const messagesAPI = {
    getMessages: (params?: any) => api.get('/messages', { params }),
    sendMessage: (data: any) => api.post('/messages', data),
    markAsRead: (id: string) => api.put(`/messages/${id}/read`),
    getUnreadCount: () => api.get('/messages/unread/count'),
    getConversations: () => api.get('/messages/conversations'),
}

// ============================================
// ANALYTICS API (NEW)
// ============================================
export const analyticsAPI = {
    getAppointmentsByDay: (days?: number) =>
        api.get('/analytics/appointments/by-day', { params: { days } }),
    getAppointmentsByPriority: () => api.get('/analytics/appointments/by-priority'),
    getAppointmentsByStatus: () => api.get('/analytics/appointments/by-status'),
    getPatientStats: () => api.get('/analytics/patients/stats'),
    getRevenueStats: () => api.get('/analytics/revenue/stats'),
    getDashboard: () => api.get('/analytics/dashboard'),
}

// ============================================
// PHARMACY API
// ============================================
export const pharmacyAPI = {
    getMedications: (params?: any) => api.get('/pharmacy/medications', { params }),
    getMedication: (id: string) => api.get(`/pharmacy/medications/${id}`),
    createMedication: (data: any) => api.post('/pharmacy/medications', data),
    updateMedication: (id: string, data: any) => api.patch(`/pharmacy/medications/${id}`, data),
    deleteMedication: (id: string) => api.delete(`/pharmacy/medications/${id}`),
    getStock: (params?: any) => api.get('/pharmacy/stock', { params }),
    updateStock: (id: string, data: any) => api.patch(`/pharmacy/stock/${id}`, data),
    getLowStock: () => api.get('/pharmacy/stock/low'),
    getOrders: (params?: any) => api.get('/pharmacy/orders', { params }),
    getKardex: (params?: any) => api.get('/pharmacy/kardex', { params }),
}

// ============================================
// LABORATORY API
// ============================================
export const laboratoryAPI = {
    getOrders: (params?: any) => api.get('/laboratory/orders', { params }),
    getOrder: (id: string) => api.get(`/laboratory/orders/${id}`),
    createOrder: (data: any) => api.post('/laboratory/orders', data),
    updateOrder: (id: string, data: any) => api.patch(`/laboratory/orders/${id}`, data),
    updateStatus: (id: string, status: string, results?: any) =>
        api.patch(`/laboratory/orders/${id}/status`, { status, results }),
    deleteOrder: (id: string) => api.delete(`/laboratory/orders/${id}`),
    getTests: () => api.get('/laboratory/tests'),
}

// ============================================
// BILLING API
// ============================================
export const billingAPI = {
    getInvoices: (params?: any) => api.get('/billing/invoices', { params }),
    getInvoice: (id: string) => api.get(`/billing/invoices/${id}`),
    createInvoice: (data: any) => api.post('/billing/invoices', data),
    updateInvoice: (id: string, data: any) => api.patch(`/billing/invoices/${id}`, data),
    updateStatus: (id: string, status: string) =>
        api.patch(`/billing/invoices/${id}/status`, { status }),
    deleteInvoice: (id: string) => api.delete(`/billing/invoices/${id}`),
    getStats: () => api.get('/billing/stats'),
}

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
    getPatientReport: (patientId: string) => api.get(`/reports/patient/${patientId}`),
    getAppointmentReport: (params?: any) => api.get('/reports/appointments', { params }),
    getRevenueReport: (params?: any) => api.get('/reports/revenue', { params }),
    getInventoryReport: () => api.get('/reports/inventory'),
    exportReport: (type: string, params?: any) =>
        api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
}

// ============================================
// AI API
// ============================================
export const aiAPI = {
    triage: (data: any) => api.post('/ai/triage', data),
    summarize: (text: string) => api.post('/ai/summarize', { text }),
    predictDemand: (medicationId: string) =>
        api.post('/ai/pharmacy/demand', { medication_id: medicationId }),
}

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
    getAll: (params?: any) => api.get('/notifications', { params }),
    markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllAsRead: () => api.patch('/notifications/read-all'),
    getUnreadCount: () => api.get('/notifications/unread/count'),
}

// ============================================
// ATTENDANCE API
// ============================================
export const attendanceAPI = {
    getRecords: (params?: any) => api.get('/attendance', { params }),
    clockIn: () => api.post('/attendance/clock-in'),
    clockOut: () => api.post('/attendance/clock-out'),
    getMyAttendance: () => api.get('/attendance/me'),
}
