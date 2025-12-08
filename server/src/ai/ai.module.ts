import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService],
})
export class AiModule { }
