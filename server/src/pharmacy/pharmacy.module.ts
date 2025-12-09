import { Module } from '@nestjs/common';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PharmacyController],
    providers: [PharmacyService],
    exports: [PharmacyService],
})
export class PharmacyModule { }
