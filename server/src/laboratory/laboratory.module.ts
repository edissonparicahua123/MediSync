import { Module } from '@nestjs/common';
import { LaboratoryController } from './laboratory.controller';
import { LaboratoryService } from './laboratory.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LaboratoryController],
    providers: [LaboratoryService],
    exports: [LaboratoryService],
})
export class LaboratoryModule { }
