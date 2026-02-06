import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesCatalogService {
    constructor(private prisma: PrismaService) { }

    async getAll(query: any = {}) {
        const { category } = query;

        const where: any = {
            isActive: true
        };

        if (category) {
            where.category = category;
        }

        return this.prisma.serviceCatalog.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });
    }

    async getById(id: string) {
        return this.prisma.serviceCatalog.findUnique({
            where: { id }
        });
    }

    async create(data: any) {
        return this.prisma.serviceCatalog.create({
            data: {
                name: data.name,
                description: data.description,
                price: parseFloat(data.price),
                category: data.category,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });
    }

    async update(id: string, data: any) {
        return this.prisma.serviceCatalog.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.price && { price: parseFloat(data.price) }),
                ...(data.category && { category: data.category }),
                ...(data.isActive !== undefined && { isActive: data.isActive })
            }
        });
    }

    async delete(id: string) {
        // Soft delete
        return this.prisma.serviceCatalog.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async seed() {
        const existingCount = await this.prisma.serviceCatalog.count();

        if (existingCount > 0) {
            console.log('Services catalog already seeded');
            return { message: 'Already seeded', count: existingCount };
        }

        const services = [
            // CONSULTAS
            { name: 'Consulta General', description: 'Consulta médica general', price: 50, category: 'CONSULTA' },
            { name: 'Consulta Pediátrica', description: 'Consulta de especialidad pediátrica', price: 60, category: 'CONSULTA' },
            { name: 'Consulta Ginecológica', description: 'Consulta de ginecología', price: 70, category: 'CONSULTA' },
            { name: 'Consulta Cardiológica', description: 'Consulta de cardiología', price: 80, category: 'CONSULTA' },
            { name: 'Consulta Dermatológica', description: 'Consulta de dermatología', price: 65, category: 'CONSULTA' },

            // EXÁMENES
            { name: 'Hemograma Completo', description: 'Análisis de sangre completo', price: 30, category: 'EXAMEN' },
            { name: 'Perfil Lipídico', description: 'Colesterol y triglicéridos', price: 35, category: 'EXAMEN' },
            { name: 'Glucosa en Ayunas', description: 'Medición de glucosa', price: 15, category: 'EXAMEN' },
            { name: 'Examen de Orina', description: 'Uroanálisis completo', price: 20, category: 'EXAMEN' },
            { name: 'Prueba de Embarazo', description: 'Beta HCG', price: 25, category: 'EXAMEN' },

            // PROCEDIMIENTOS
            { name: 'Radiografía Simple', description: 'Rx de una zona', price: 90, category: 'PROCEDIMIENTO' },
            { name: 'Ecografía Abdominal', description: 'Ultrasonido abdominal', price: 120, category: 'PROCEDIMIENTO' },
            { name: 'Electrocardiograma (ECG)', description: 'Estudio del corazón', price: 45, category: 'PROCEDIMIENTO' },
            { name: 'Nebulización', description: 'Terapia respiratoria', price: 25, category: 'PROCEDIMIENTO' },
            { name: 'Curaciones', description: 'Cura de heridas', price: 40, category: 'PROCEDIMIENTO' },
            { name: 'Inyección Intramuscular', description: 'Aplicación de inyectable', price: 15, category: 'PROCEDIMIENTO' },

            // TERAPIAS
            { name: 'Terapia Física', description: 'Sesión de fisioterapia', price: 55, category: 'TERAPIA' },
            { name: 'Terapia Respiratoria', description: 'Sesión de rehabilitación respiratoria', price: 50, category: 'TERAPIA' },
        ];

        await this.prisma.serviceCatalog.createMany({
            data: services,
            skipDuplicates: true
        });

        return { message: 'Seeded successfully', count: services.length };
    }
}
