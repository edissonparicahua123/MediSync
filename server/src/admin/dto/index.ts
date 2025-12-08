import { IsString, IsNumber, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigDto {
    @ApiProperty({ example: 'General Consultation' })
    @IsString()
    serviceName: string;

    @ApiProperty({ example: 50.00 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 'CONSULTATION' })
    @IsString()
    category: string;

    @ApiPropertyOptional({ example: 'Standard consultation fee' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 30 })
    @IsOptional()
    @IsInt()
    duration?: number;
}

export class UpdateConfigDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    serviceName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    price?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    duration?: number;
}
