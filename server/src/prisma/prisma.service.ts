import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Soft delete helper
    async softDelete(model: string, id: string) {
        return this[model].update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    // Find many excluding soft deleted
    async findManyActive(model: string, args?: any) {
        return this[model].findMany({
            ...args,
            where: {
                ...args?.where,
                deletedAt: null,
            },
        });
    }
}
// Force type refresh - Emergency module integration
