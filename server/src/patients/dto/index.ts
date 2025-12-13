import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreatePatientDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    documentNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    photo?: string;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: string;

    @ApiProperty({ enum: ['MALE', 'FEMALE', 'OTHER'] })
    @IsString()
    @IsIn(['MALE', 'FEMALE', 'OTHER'])
    gender: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    bloodType?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    zipCode?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    emergencyContact?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    emergencyPhone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    insuranceNumber?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    insuranceProvider?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    allergies?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    chronicConditions?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    notes?: string;

    @ApiProperty({ required: false, default: 'ACTIVE' })
    @IsString()
    @IsOptional()
    status?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) { }

export class SearchPatientsDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    query?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    gender?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    status?: string;
}
