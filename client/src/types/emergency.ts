export interface EmergencyRecord {
    id: string
    patientId: string
    triageLevel: number // 1-5
    chiefComplaint: string
    diagnosis?: string
    notes?: string
    status: 'TRIAGE' | 'ADMITTED' | 'OBSERVATION' | 'DISCHARGED' | 'TRANSFERRED'
    admissionDate: string
    dischargeDate?: string
    createdAt: string
    updatedAt: string
}

export interface CreateEmergencyDto {
    patientId: string
    triageLevel: string // Form handling usually deals with strings, converted to number on submit
    chiefComplaint: string
    diagnosis?: string
    notes?: string
}
