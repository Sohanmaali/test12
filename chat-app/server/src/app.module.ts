import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { MessagesModule } from './messages/messages.module';
import { GroupsModule } from './groups/groups.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://foduuusr:FoduuPsd654@192.168.1.138:27017/chat_app?authSource=admin'),
    UsersModule,
    AuthModule,
    ChatModule,
    MessagesModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
