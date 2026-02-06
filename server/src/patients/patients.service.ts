import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto, SearchPatientsDto } from './dto';

@Injectable()
export class PatientsService {
    constructor(private prisma: PrismaService) { }

    async create(createPatientDto: CreatePatientDto) {
        try {
            return await this.prisma.patient.create({
                data: createPatientDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async importPatients(patients: CreatePatientDto[]) {
        try {
            // Using createMany with skipDuplicates to avoid crashing on existing unique fields (like documentNumber)
            // Note: skipDuplicates ignores records that violate unique constraints.
            return await this.prisma.patient.createMany({
                data: patients,
                skipDuplicates: true,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async findAll(page: number = 1, limit: number = 20, search?: SearchPatientsDto) {
        const skip = (page - 1) * limit;
        const where: any = { deletedAt: null };

        if (search?.query) {
            where.OR = [
                { firstName: { contains: search.query, mode: 'insensitive' } },
                { lastName: { contains: search.query, mode: 'insensitive' } },
                { phone: { contains: search.query } },
                { email: { contains: search.query, mode: 'insensitive' } },
            ];
        }

        if (search?.gender) {
            where.gender = search.gender;
        }

        if (search?.status) {
            where.status = search.status;
        }

        const [patients, total] = await Promise.all([
            this.prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            appointments: true,
                            medicalRecords: true,
                        },
                    },
                },
            }),
            this.prisma.patient.count({ where }),
        ]);

        return {
            data: patients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const patient = await this.prisma.patient.findUnique({
            where: { id },
            include: {
                appointments: {
                    take: 10,
                    orderBy: { appointmentDate: 'desc' },
                    include: { doctor: { include: { user: true } } },
                },
                medicalRecords: {
                    take: 10,
                    orderBy: { visitDate: 'desc' },
                    include: { doctor: { include: { user: true } } },
                },
                labOrders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                files: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                pharmacyOrders: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                }
            },
        });

        if (!patient || patient.deletedAt) {
            throw new NotFoundException('Patient not found');
        }

        return patient;
    }

    async update(id: string, updatePatientDto: UpdatePatientDto) {
        await this.findOne(id);

        try {
            return await this.prisma.patient.update({
                where: { id },
                data: updatePatientDto,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    private handlePrismaError(error: any) {
        if (error.code === 'P2002') {
            const fields = error.meta?.target ? ` en: ${error.meta.target.join(', ')}` : '';
            throw new ConflictException(`Ya existe un paciente con este dato único${fields}.`);
        }
        console.error('Prisma Error:', error);
        throw new BadRequestException('Error al procesar datos del paciente. Verifique los campos enviados.');
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.patient.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async getMedicalHistory(id: string) {
        await this.findOne(id);

        return this.prisma.medicalRecord.findMany({
            where: { patientId: id },
            orderBy: { visitDate: 'desc' },
            include: {
                doctor: { include: { user: true } },
            },
        });
    }

    async enablePortalAccess(id: string) {
        const patient = await this.findOne(id) as any;

        // 1. Get Patient Role
        const patientRole = await this.prisma.role.findFirst({
            where: { name: 'Patient' },
        });

        if (!patientRole) {
            throw new NotFoundException('Patient role not configured in system');
        }

        const tempPassword = `Portal${new Date().getFullYear()}!`;
        const hashedPassword = await import('bcrypt').then(m => m.hash(tempPassword, 10));

        // IF USER EXISTS: RESET PASSWORD
        if (patient.userId) {
            await this.prisma.user.update({
                where: { id: patient.userId },
                data: { password: hashedPassword }
            });

            // Find user to get email
            const user = await this.prisma.user.findUnique({ where: { id: patient.userId } });

            return {
                message: 'Portal access reset successfully',
                credentials: {
                    email: user.email,
                    password: tempPassword
                }
            };
        }

        // IF NEW USER: CREATE

        // Use part of email or name as base, fallback to random if no email
        const baseEmail = patient.email || `patient${patient.documentNumber || patient.id.substring(0, 6)}@medisync.portal`;

        // Ensure email uniqueness (simple check, improve for prod)
        let email = baseEmail;
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            email = `${patient.id.substring(0, 4)}.${baseEmail}`;
        }

        // Create User linked to Patient
        return this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    phone: patient.phone,
                    roleId: patientRole.id,
                    isActive: true,
                    // Link to patient
                    patient: {
                        connect: { id: patient.id }
                    }
                } as any
            });

            // Return credentials to be shown ONCE
            return {
                message: 'Portal access enabled successfully',
                credentials: {
                    email: newUser.email,
                    password: tempPassword
                }
            };
        });
    }

    // ============================================
    // PATIENT TIMELINE
    // ============================================
    async getTimeline(id: string) {
        await this.findOne(id);

        const [appointments, diagnoses, medications, labOrders, vitalSigns] = await Promise.all([
            this.prisma.appointment.findMany({
                where: { patientId: id },
                orderBy: { appointmentDate: 'desc' },
                take: 50,
                include: { doctor: { include: { user: true } } },
            }),
            (this.prisma as any).patientDiagnosis.findMany({
                where: { patientId: id },
                orderBy: { diagnosedDate: 'desc' },
                take: 50,
            }),
            (this.prisma as any).patientMedication.findMany({
                where: { patientId: id },
                orderBy: { startDate: 'desc' },
                take: 50,
            }),
            this.prisma.labOrder.findMany({
                where: { patientId: id },
                orderBy: { createdAt: 'desc' },
                take: 50,
            }),
            (this.prisma as any).patientVitalSign.findMany({
                where: { patientId: id },
                orderBy: { recordedAt: 'desc' },
                take: 50,
            }),
        ]);

        // Combine and sort all events
        const events = [
            ...appointments.map(a => ({ type: 'APPOINTMENT', date: a.appointmentDate, data: a })),
            ...diagnoses.map(d => ({ type: 'DIAGNOSIS', date: d.diagnosedDate, data: d })),
            ...medications.map(m => ({ type: 'MEDICATION', date: m.startDate, data: m })),
            ...labOrders.map(l => ({ type: 'LAB_ORDER', date: l.createdAt, data: l })),
            ...vitalSigns.map(v => ({ type: 'VITAL_SIGN', date: v.recordedAt, data: v })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return events;
    }

    // ============================================
    // PATIENT ALLERGIES
    // ============================================
    async getAllergies(id: string) {
        await this.findOne(id);
        return (this.prisma as any).patientAllergy.findMany({
            where: { patientId: id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addAllergy(id: string, data: { allergen: string; reaction?: string; severity?: string; notes?: string }) {
        await this.findOne(id);
        return (this.prisma as any).patientAllergy.create({
            data: { patientId: id, ...data },
        });
    }

    async updateAllergy(patientId: string, allergyId: string, data: any) {
        await this.findOne(patientId);
        return (this.prisma as any).patientAllergy.update({
            where: { id: allergyId },
            data,
        });
    }

    async deleteAllergy(patientId: string, allergyId: string) {
        await this.findOne(patientId);
        return (this.prisma as any).patientAllergy.delete({
            where: { id: allergyId },
        });
    }

    // ============================================
    // PATIENT VITAL SIGNS
    // ============================================
    async getVitalSigns(id: string, limit: number = 50) {
        await this.findOne(id);
        return (this.prisma as any).patientVitalSign.findMany({
            where: { patientId: id },
            orderBy: { recordedAt: 'desc' },
            take: limit,
        });
    }

    async addVitalSign(id: string, data: any) {
        await this.findOne(id);
        return (this.prisma as any).patientVitalSign.create({
            data: { patientId: id, ...data },
        });
    }

    async getVitalSignsChart(id: string) {
        await this.findOne(id);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const vitals = await (this.prisma as any).patientVitalSign.findMany({
            where: {
                patientId: id,
                recordedAt: { gte: sixMonthsAgo },
            },
            orderBy: { recordedAt: 'asc' },
        });

        return {
            weight: vitals.filter(v => v.weight).map(v => ({ date: v.recordedAt, value: v.weight })),
            bloodPressure: vitals.filter(v => v.bloodPressureSystolic).map(v => ({
                date: v.recordedAt,
                systolic: v.bloodPressureSystolic,
                diastolic: v.bloodPressureDiastolic,
            })),
            glucose: vitals.filter(v => v.glucose).map(v => ({ date: v.recordedAt, value: v.glucose })),
            heartRate: vitals.filter(v => v.heartRate).map(v => ({ date: v.recordedAt, value: v.heartRate })),
        };
    }

    // ============================================
    // PATIENT MEDICATIONS
    // ============================================
    async getMedications(id: string, activeOnly: boolean = false) {
        await this.findOne(id);
        const where: any = { patientId: id };
        if (activeOnly) where.isActive = true;

        return (this.prisma as any).patientMedication.findMany({
            where,
            include: {
                prescribedBy: {
                    include: { user: true }
                }
            },
            orderBy: { startDate: 'desc' },
        });
    }

    async addMedication(id: string, data: any) {
        try {
            await this.findOne(id);

            // [SENIOR INTEGRATION] Find medication and doctor to create order
            // We'll use the first active doctor if not specified for outpatient prescriptions
            const doctor = await this.prisma.doctor.findFirst({
                include: { user: true }
            });

            let medication = null;
            if (data.medicationId) {
                medication = await this.prisma.medication.findUnique({
                    where: { id: data.medicationId }
                });
            } else {
                medication = await this.prisma.medication.findFirst({
                    where: { name: { contains: data.name, mode: 'insensitive' } }
                });
            }

            if (doctor && medication) {
                const orderCount = await this.prisma.pharmacyOrder.count();
                const orderNumber = `ORD-RX-${(orderCount + 1).toString().padStart(5, '0')}`;

                await (this.prisma as any).pharmacyOrder.create({
                    data: {
                        orderNumber,
                        medicationId: medication.id,
                        quantity: 1, // Default for outpatient prescription
                        doctorId: doctor.id,
                        patientId: id,
                        status: 'PENDIENTE'
                    }
                });
                console.log(`[PatientsService] Automatic pharmacy order ${orderNumber} created for patient ${id} linked to med ${medication.id}`);
            }

            // Ensure startDate is a valid Date object
            const payload = {
                patientId: id,
                medicationId: medication?.id || data.medicationId || null,
                name: data.name,
                dosage: data.dosage,
                frequency: data.frequency,
                startDate: new Date(data.startDate || new Date()),
                instructions: data.instructions || data.notes || '',
                status: 'ACTIVE',
                prescribedById: doctor?.id || null
            };

            return await (this.prisma as any).patientMedication.create({
                data: payload,
            });
        } catch (error) {
            console.error('Error adding medication:', error);
            throw new BadRequestException(`Error al agregar medicamento: ${error.message}`);
        }
    }

    async updateMedication(patientId: string, medicationId: string, data: any) {
        await this.findOne(patientId);
        return (this.prisma as any).patientMedication.update({
            where: { id: medicationId },
            data,
        });
    }

    // ============================================
    // PATIENT DIAGNOSES
    // ============================================
    async getDiagnoses(id: string) {
        await this.findOne(id);
        return (this.prisma as any).patientDiagnosis.findMany({
            where: { patientId: id },
            orderBy: { diagnosedDate: 'desc' },
        });
    }

    async addDiagnosis(id: string, data: any) {
        await this.findOne(id);
        return (this.prisma as any).patientDiagnosis.create({
            data: { patientId: id, ...data },
        });
    }

    async updateDiagnosis(patientId: string, diagnosisId: string, data: any) {
        await this.findOne(patientId);
        return (this.prisma as any).patientDiagnosis.update({
            where: { id: diagnosisId },
            data,
        });
    }

    // ============================================
    // PATIENT FAMILY MEMBERS
    // ============================================
    async getFamilyMembers(id: string) {
        await this.findOne(id);
        return (this.prisma as any).patientFamilyMember.findMany({
            where: { patientId: id },
        });
    }

    async addFamilyMember(id: string, data: any) {
        await this.findOne(id);
        return (this.prisma as any).patientFamilyMember.create({
            data: { patientId: id, ...data },
        });
    }

    async updateFamilyMember(patientId: string, memberId: string, data: any) {
        await this.findOne(patientId);
        return (this.prisma as any).patientFamilyMember.update({
            where: { id: memberId },
            data,
        });
    }

    async deleteFamilyMember(patientId: string, memberId: string) {
        await this.findOne(patientId);
        return (this.prisma as any).patientFamilyMember.delete({
            where: { id: memberId },
        });
    }

    // ============================================
    // PATIENT DOCUMENTS
    // ============================================
    async getDocuments(id: string) {
        await this.findOne(id);
        return (this.prisma as any).patientDocument.findMany({
            where: { patientId: id },
            orderBy: { uploadedAt: 'desc' },
        });
    }

    async addDocument(id: string, data: { name: string; type: string; url: string; mimeType?: string; size?: number; uploadedBy?: string }) {
        await this.findOne(id);
        return (this.prisma as any).patientDocument.create({
            data: { patientId: id, ...data },
        });
    }

    async deleteDocument(patientId: string, documentId: string) {
        await this.findOne(patientId);
        return (this.prisma as any).patientDocument.delete({
            where: { id: documentId },
        });
    }

    // ============================================
    // CLINICAL NOTES
    // ============================================
    async addNote(id: string, data: { title: string; content: string }) {
        await this.findOne(id);

        // Find a default doctor (first available) to assign this note to
        // In a real app, this should come from the logged-in user context
        const doctor = await this.prisma.doctor.findFirst();

        if (!doctor) {
            // Fallback or error if no doctor exists
            throw new BadRequestException('No se encontraron doctores en el sistema para asignar la nota.');
        }

        return this.prisma.medicalRecord.create({
            data: {
                patientId: id,
                doctorId: doctor.id,
                visitDate: new Date(),
                chiefComplaint: data.title,
                diagnosis: 'Nota Clínica', // Tag to identify it as a note
                notes: data.content,
                treatment: '',
                prescriptions: ''
            }
        });
    }
}
