import { IsString, IsEmail, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'NURSE' })
    @IsString()
    role: string;

    @ApiProperty({ example: 'EMERGENCY' })
    @IsString()
    department: string;

    @ApiProperty({ example: 'john.doe@hospital.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 50000 })
    @IsOptional()
    @IsNumber()
    salary?: number;

    @ApiProperty({ example: '2024-01-01' })
    @IsDateString()
    hireDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emergencyPhone?: string;
}

export class UpdateEmployeeDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    department?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    salary?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emergencyPhone?: string;
}
