import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from './entities/login.entity'
import { LoginService } from './login.service';
import { LoginController } from './login.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Login])],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [LoginService]
})
export class LoginModule {}
