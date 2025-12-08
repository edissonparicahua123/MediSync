import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

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

        return this.prisma.user.create({
            data: createUserDto,
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
            include: { role: { include: { permissions: { include: { permission: true } } } } },
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

    async update(id: string, updateUserDto: UpdateUserDto) {
        await this.findOne(id);

        const updated = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
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
