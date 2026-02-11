import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MaintenanceGuard } from '../common/guards/maintenance.guard';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, MaintenanceGuard)
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @ApiOperation({ summary: 'Send message' })
    sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
        return this.messagesService.sendMessage(req.user.id, sendMessageDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user messages' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    getUserMessages(
        @Request() req,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.messagesService.getUserMessages(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark message as read' })
    markAsRead(@Request() req, @Param('id') id: string) {
        return this.messagesService.markAsRead(id, req.user.id);
    }

    @Get('unread/count')
    @ApiOperation({ summary: 'Get unread messages count' })
    getUnreadCount(@Request() req) {
        return this.messagesService.getUnreadCount(req.user.id);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get user conversations' })
    getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a message (soft delete)' })
    deleteMessage(@Request() req, @Param('id') id: string) {
        return this.messagesService.deleteMessage(id, req.user.id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Edit a message (within 15 min)' })
    editMessage(@Request() req, @Param('id') id: string, @Body() body: { content: string }) {
        return this.messagesService.editMessage(id, req.user.id, body.content);
    }

    @Delete('conversation/:otherUserId')
    @ApiOperation({ summary: 'Delete entire conversation with a user' })
    deleteConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
        return this.messagesService.deleteConversation(req.user.id, otherUserId);
    }
}
