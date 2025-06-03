import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [UsersModule, MessagesModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
