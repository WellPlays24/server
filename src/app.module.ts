import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from './login/login.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DoorModule } from './door/door.module';

@Module({
  imports: [
    UsersModule,
    LoginModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '45.55.65.143',
      port: 3306,
      username: 'well',
      password: 'utm123',
      database: 'atencion_estudiantil_bd',
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    ChatModule,
    DoorModule,
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
