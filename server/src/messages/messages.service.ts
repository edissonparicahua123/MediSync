import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto';

@Injectable()
export class MessagesService {
    constructor(private prisma: PrismaService) { }

    async sendMessage(fromUserId: string, data: SendMessageDto) {
        return this.prisma.message.create({
            data: {
                fromUserId,
                ...data,
            },
            include: {
                fromUser: { select: { id: true, firstName: true, lastName: true, email: true } },
                toUser: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    }

    async getUserMessages(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: {
                    OR: [{ fromUserId: userId }, { toUserId: userId }],
                    deletedAt: null,
                },
                include: {
                    fromUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                    toUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({
                where: {
                    OR: [{ fromUserId: userId }, { toUserId: userId }],
                    deletedAt: null,
                },
            }),
        ]);

        return {
            data: messages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async markAsRead(messageId: string, userId: string) {
        return this.prisma.message.updateMany({
            where: {
                id: messageId,
                toUserId: userId,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.message.count({
            where: {
                toUserId: userId,
                isRead: false,
                deletedAt: null,
            },
        });
    }

    async getConversations(userId: string) {
        const messages = await this.prisma.message.findMany({
            where: {
                OR: [{ fromUserId: userId }, { toUserId: userId }],
                deletedAt: null,
            },
            include: {
                fromUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                toUser: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const conversationsMap = new Map();

        messages.forEach((msg) => {
            const otherUserId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId;
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    user: msg.fromUserId === userId ? msg.toUser : msg.fromUser,
                    lastMessage: msg,
                    unreadCount: 0,
                });
            }
            if (msg.toUserId === userId && !msg.isRead) {
                conversationsMap.get(otherUserId).unreadCount++;
            }
        });

        return Array.from(conversationsMap.values());
    }
}
