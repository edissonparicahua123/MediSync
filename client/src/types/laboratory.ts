export interface LabOrder {
    id: string
    patientId: string
    doctorId?: string
    testType: string
    priority: 'NORMAL' | 'URGENT' | 'EMERGENCY'
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    notes?: string
    results?: string
    orderDate: string
    completedDate?: string
    createdAt: string
    updatedAt: string
    doctor?: {
        id: string
        user: {
            firstName: string
            lastName: string
        }
    }
}

export interface CreateLabOrderDto {
    patientId: string
    doctorId?: string
    testType: string
    priority: string
    notes?: string
    status?: string
}

export interface UpdateLabOrderDto {
    testType?: string
    priority?: string
    status?: string
    notes?: string
    results?: string
}
