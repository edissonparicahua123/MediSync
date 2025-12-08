import { Module } from '@nestjs/common';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [EmergencyController],
    providers: [EmergencyService],
    exports: [EmergencyService],
})
export class EmergencyModule { }
