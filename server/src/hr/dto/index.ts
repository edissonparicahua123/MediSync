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

    @ApiPropertyOptional({ example: 'ACTIVE', enum: ['ACTIVE', 'VACATION', 'SICK', 'INACTIVE'] })
    @IsOptional()
    @IsString()
    status?: string;
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
    @IsDateString()
    hireDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    status?: string;

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

export class CreateShiftDto {
    @ApiProperty({ example: 'uuid-123' })
    @IsString()
    employeeId: string;

    @ApiProperty({ example: '2024-01-01T08:00:00Z' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2024-01-01T17:00:00Z' })
    @IsDateString()
    endTime: string;

    @ApiProperty({ example: 'MORNING', enum: ['MORNING', 'AFTERNOON', 'NIGHT'] })
    @IsString()
    type: string;
}

export class CreateAttendanceDto {
    @ApiProperty({ example: 'uuid-123' })
    @IsString()
    employeeId: string;

    @ApiProperty({ example: '2024-01-01T08:00:00Z' })
    @IsDateString()
    checkIn: string;

    @ApiPropertyOptional({ example: '2024-01-01T17:00:00Z' })
    @IsOptional()
    @IsDateString()
    checkOut?: string;

    @ApiProperty({ example: 'ON_TIME', enum: ['ON_TIME', 'LATE', 'ABSENT'] })
    @IsString()
    status: string;
}
