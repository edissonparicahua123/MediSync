import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConfigDto {
    @ApiProperty({ example: 'SYSTEM' })
    @IsString()
    category: string;

    @ApiProperty({ example: 'MAX_UPLOAD_SIZE' })
    @IsString()
    key: string;

    @ApiProperty({ example: '1024' })
    @IsString()
    value: string;

    @ApiProperty({ example: 'NUMBER', enum: ['STRING', 'NUMBER', 'BOOLEAN', 'JSON'] })
    @IsString()
    @IsEnum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
    type: string;

    @ApiPropertyOptional({ example: 'Maximum file upload size in MB' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}

export class UpdateConfigDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    key?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    value?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsEnum(['STRING', 'NUMBER', 'BOOLEAN', 'JSON'])
    type?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
}
