import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;

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
    phone?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    roleId: string;

    @ApiProperty({ required: false, default: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    preferences?: any;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    address?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }
