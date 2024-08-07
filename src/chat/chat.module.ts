import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { LoginModule } from 'src/login/login.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    LoginModule,
    UsersModule,
    TypeOrmModule.forFeature([Chat, Message]) // Aquí registras las entidades como repositorios
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
