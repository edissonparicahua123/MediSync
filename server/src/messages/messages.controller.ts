import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @ApiOperation({ summary: 'Send message' })
    sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
        return this.messagesService.sendMessage(req.user.sub, sendMessageDto);
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
            req.user.sub,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }

    @Put(':id/read')
    @ApiOperation({ summary: 'Mark message as read' })
    markAsRead(@Request() req, @Param('id') id: string) {
        return this.messagesService.markAsRead(id, req.user.sub);
    }

    @Get('unread/count')
    @ApiOperation({ summary: 'Get unread messages count' })
    getUnreadCount(@Request() req) {
        return this.messagesService.getUnreadCount(req.user.sub);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get user conversations' })
    getConversations(@Request() req) {
        return this.messagesService.getConversations(req.user.sub);
    }
}
