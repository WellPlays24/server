import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginModule } from 'src/login/login.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';

@Module({
  imports: [
    LoginModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule { }
