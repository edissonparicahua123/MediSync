import { Module } from '@nestjs/common';
import { ServicesCatalogController } from './services-catalog.controller';
import { ServicesCatalogService } from './services-catalog.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ServicesCatalogController],
    providers: [ServicesCatalogService],
    exports: [ServicesCatalogService],
})
export class ServicesCatalogModule { }
