import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    attachmentUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    attachmentName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    attachmentType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    attachmentSize?: number;
}
