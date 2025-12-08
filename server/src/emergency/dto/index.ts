import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBedDto {
    @ApiProperty({ example: 'ICU-001' })
    @IsString()
    bedNumber: string;

    @ApiProperty({ example: 'ICU' })
    @IsString()
    ward: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    floor?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateBedStatusDto {
    @ApiPropertyOptional({ example: 'OCCUPIED' })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    patientId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}
