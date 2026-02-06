import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddVitalSignDto {
    @ApiProperty()
    @IsNumber()
    hr?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bp?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    temp?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    spo2?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    rr?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    performedBy?: string;
}

export class AddMedicationDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsString()
    dosage: string;

    @ApiProperty()
    @IsString()
    route: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    administeredBy?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    medicationId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class AddProcedureDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    performedBy?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    result?: string;
}

export class AddAttachmentDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    url: string;

    @ApiProperty()
    @IsString()
    type: string;
}
