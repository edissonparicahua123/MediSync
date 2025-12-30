import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        return this.prisma.user.create({
            data: {
                ...createUserDto,
                password: hashedPassword,
            },
            include: { role: true },
        });
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { deletedAt: null },
                include: { role: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
        ]);

        return {
            data: users.map(({ password, ...user }) => user),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { role: true },
        });

        if (!user || user.deletedAt) {
            throw new NotFoundException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    }

    async getRoles() {
        return this.prisma.role.findMany();
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);

        // Hash password if it's being updated
        const dataToUpdate = { ...updateUserDto };
        if (dataToUpdate.password) {
            dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: { role: true },
        });

        const { password, ...result } = updated;
        return result;
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
