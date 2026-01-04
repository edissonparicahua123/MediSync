import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

import { useAuthStore } from '@/stores/authStore'

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token || localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login')
        if (error.response?.status === 401 && !isLoginRequest) {
            localStorage.removeItem('token')
            useAuthStore.getState().logout()
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ============================================
// AUTH API
// ============================================
export const authAPI = {
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    refresh: () => api.post('/auth/refresh'),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string) =>
        api.post('/auth/reset-password', { token, newPassword }),
    logout: () => api.post('/auth/logout'),
    changePassword: (oldPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { oldPassword, newPassword }),
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
    enablePortal: (id: string) => api.post(`/patients/${id}/enable-portal`, {}),
    getMedicalHistory: (id: string) => api.get(`/patients/${id}/medical-history`),
    // Timeline
    getTimeline: (id: string) => api.get(`/patients/${id}/timeline`),
    // Allergies
    getAllergies: (id: string) => api.get(`/patients/${id}/allergies`),
    addAllergy: (id: string, data: any) => api.post(`/patients/${id}/allergies`, data),
    updateAllergy: (id: string, allergyId: string, data: any) =>
        api.patch(`/patients/${id}/allergies/${allergyId}`, data),
    deleteAllergy: (id: string, allergyId: string) =>
        api.delete(`/patients/${id}/allergies/${allergyId}`),
    // Vital Signs
    getVitalSigns: (id: string, limit?: number) =>
        api.get(`/patients/${id}/vital-signs`, { params: { limit } }),
    addVitalSign: (id: string, data: any) => api.post(`/patients/${id}/vital-signs`, data),
    getVitalSignsChart: (id: string) => api.get(`/patients/${id}/vital-signs/chart`),
    // Medications
    getMedications: (id: string, activeOnly?: boolean) =>
        api.get(`/patients/${id}/medications`, { params: { activeOnly } }),
    addMedication: (id: string, data: any) => api.post(`/patients/${id}/medications`, data),
    updateMedication: (id: string, medicationId: string, data: any) =>
        api.patch(`/patients/${id}/medications/${medicationId}`, data),
    // Diagnoses
    getDiagnoses: (id: string) => api.get(`/patients/${id}/diagnoses`),
    addDiagnosis: (id: string, data: any) => api.post(`/patients/${id}/diagnoses`, data),
    updateDiagnosis: (id: string, diagnosisId: string, data: any) =>
        api.patch(`/patients/${id}/diagnoses/${diagnosisId}`, data),
    // Family Members
    getFamilyMembers: (id: string) => api.get(`/patients/${id}/family-members`),
    addFamilyMember: (id: string, data: any) => api.post(`/patients/${id}/family-members`, data),
    updateFamilyMember: (id: string, memberId: string, data: any) =>
        api.patch(`/patients/${id}/family-members/${memberId}`, data),
    deleteFamilyMember: (id: string, memberId: string) =>
        api.delete(`/patients/${id}/family-members/${memberId}`),
    // Documents
    getDocuments: (id: string) => api.get(`/patients/${id}/documents`),
    addDocument: (id: string, data: any) => api.post(`/patients/${id}/documents`, data),
    deleteDocument: (id: string, documentId: string) =>
        api.delete(`/patients/${id}/documents/${documentId}`),
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
    cancel: (id: string) => api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' }),
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
    generatePayroll: () => api.post('/hr/payroll'),
    payPayroll: (id: string) => api.put(`/hr/payroll/${id}/pay`),
    deletePayroll: (id: string) => api.delete(`/hr/payroll/${id}`),
    getShifts: () => api.get('/hr/shifts'),
    createShift: (data: any) => api.post('/hr/shifts', data),
    updateShift: (id: string, data: any) => api.put(`/hr/shifts/${id}`, data),
    deleteShift: (id: string) => api.delete(`/hr/shifts/${id}`),
    createAttendance: (data: any) => api.post('/hr/attendance', data),
}

// ============================================
// EMERGENCY API (NEW)
// ============================================
export const emergencyAPI = {
    getDashboard: () => api.get('/emergency/dashboard'),
    getCriticalPatients: () => api.get('/emergency/critical-patients'),
    getCase: (id: string) => api.get(`/emergency/cases/${id}`),
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
    // Organization & Backups
    getOrganization: () => api.get('/admin/organization'),
    updateOrganization: (data: any) => api.put('/admin/organization', data),
    getBackups: () => api.get('/admin/backups'),
    createBackup: () => api.post('/admin/backups'),
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
    deleteMessage: (id: string) => api.delete(`/messages/${id}`),
    editMessage: (id: string, content: string) => api.put(`/messages/${id}`, { content }),
    deleteConversation: (otherUserId: string) => api.delete(`/messages/conversation/${otherUserId}`),
    uploadFile: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
}


// ============================================
// ANALYTICS API (NEW)
// ============================================
export const analyticsAPI = {
    getDashboard: () => api.get('/analytics/dashboard'),
    getHeatmap: () => api.get('/analytics/heatmap'),
    getSaturation: () => api.get('/analytics/saturation'),
    getAreaComparison: () => api.get('/analytics/area-comparison'),
    getPatientCycle: () => api.get('/analytics/patient-cycle'),
    getCapacity: () => api.get('/analytics/capacity'),
    getHistorical: () => api.get('/analytics/historical'),
    // Kept for backward compatibility if needed, but these might be redundant now
    getAppointmentsByDay: (days?: number) =>
        api.get('/analytics/appointments/by-day', { params: { days } }),
    getAppointmentsByPriority: () => api.get('/analytics/appointments/by-priority'),
    getAppointmentsByStatus: () => api.get('/analytics/appointments/by-status'),
    getPatientStats: () => api.get('/analytics/patients/stats'),
    getRevenueStats: () => api.get('/analytics/revenue/stats'),
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
    approveOrder: (id: string) => api.patch(`/pharmacy/orders/${id}/approve`),
    rejectOrder: (id: string, reason: string) => api.patch(`/pharmacy/orders/${id}/reject`, { reason }),
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
    getDashboardStats: () => api.get('/reports/dashboard'),
    getAppointmentStats: () => api.get('/reports/appointments'),
    getPatientStats: () => api.get('/reports/patients'),
    getFinancialStats: () => api.get('/reports/finance'),
    getMedicationStats: () => api.get('/reports/medications'),
    getDoctorStats: () => api.get('/reports/doctors'),
    getEmergencyStats: () => api.get('/reports/emergencies'),
    getComparisonStats: () => api.get('/reports/comparison'),
    getAiPredictions: () => api.get('/reports/ai-predictions'),
    // Legacy/Unused for now but kept for compatibility if needed
    getPatientReport: (patientId: string) => api.get(`/reports/patient/${patientId}`),
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
    chat: (data: { message: string; context?: string }) => api.post('/ai/chat', data),
}

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsAPI = {
    getAll: (params?: any) => api.get('/notifications', { params }),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
    getUnreadCount: () => api.get('/notifications/unread-count'),
    delete: (id: string) => api.delete(`/notifications/${id}`),
    getPreferences: () => api.get('/notifications/preferences'),
    updatePreferences: (data: any) => api.put('/notifications/preferences', data),
    getTemplates: () => api.get('/notifications/templates'),
    getLogs: (params?: any) => api.get('/notifications/logs', { params }),
}

// ============================================
// ATTENDANCE API
// ============================================
export const attendanceAPI = {
    getRecords: (params?: any) => api.get('/attendance', { params }),
    clockIn: () => api.post('/attendance/clock-in'),
    clockOut: () => api.post('/attendance/clock-out'),
    getMyAttendance: () => api.get('/attendance/me'),
    kioskClock: (documentId: string) => api.post('/attendance/kiosk', { documentId }),
    getKioskStats: () => api.get('/attendance/kiosk-stats'),
}

// ============================================
// USERS API
// ============================================
export const usersAPI = {
    getProfile: () => api.get('/users/me'),
    updateProfile: (data: any) => api.patch('/users/me', data),
    getRoles: () => api.get('/users/roles'),
    getAll: (params?: any) => api.get('/users', { params }),
    getOne: (id: string) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: string, data: any) => api.patch(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
}

// ============================================
// SYSTEM API
// ============================================
export const systemAPI = {
    getStatus: () => api.get('/health'),
}
