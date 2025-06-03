import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get('user/:userId1/:userId2')
  findByUsers(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.messagesService.findByUsers(userId1, userId2);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.messagesService.findByGroup(groupId);
  }

  @Post(':messageId/read/:userId')
  markAsRead(
    @Param('messageId') messageId: string,
    @Param('userId') userId: string,
  ) {
    return this.messagesService.markAsRead(messageId, userId);
  }
}
