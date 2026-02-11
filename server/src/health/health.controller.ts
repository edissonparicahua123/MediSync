import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Health check endpoint' })
    async check() {
        let dbStatus = 'offline';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            dbStatus = 'online';
        } catch (e) {
            dbStatus = 'error';
        }

        return {
            status: 'ok',
            server: 'online',
            database: dbStatus,
            api: 'online',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            service: 'EdiCarex Enterprise API',
            version: '1.0.0',
        };
    }
}
