import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty()
    @IsUUID()
    toUserId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subject?: string;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiPropertyOptional({ example: 'NORMAL' })
    @IsOptional()
    @IsString()
    priority?: string;
}
