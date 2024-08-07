import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginService } from './../login/login.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-login.dto';
import { RecoverDto } from './dto/recover.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly loginService: LoginService) { }

  @Post('register')
  register(
    @Body()
    registerDto: RegisterDto,
  ) {
    // console.log(registerDto);
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body()
    loginDto: LoginDto,
  ) {
    return this.authService.login(loginDto);
  }

  @Post('enable-user')
  async enableUser(
    @Body()
    body:{ 
      id_usuario: number,
    }
  ) {
    if(body&&body.id_usuario){
      return this.authService.enableUser(body.id_usuario);
    }else{
      return { status: false, code:-1, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('recover')
  async recoverPass(
    @Body()
    body:{ 
      cedula: string 
    }
  ) {
    if (body&&body.cedula) {
      return await this.authService.recoverPass(body.cedula);
    } else {
      return { status: false, code:-1, msj: 'Los parámetros no son correctos' };
    }
    
  }

  /*@Post('update-password')
  async updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
    await this.loginService.updatePassword(req.id_usuario, updatePasswordDto.newPassword);
    return { message: 'Contraseña actualizada con éxito '+req.id_usuario };
  }*/

  @Post('update-password')
  async updatePassword(
    @Body()
    body:{
      cedula:string,
      pass_actual:string,
      pass_nueva: string,
      recuperacion:boolean
    })
  {
    if(body&&body.cedula&&body.recuperacion&&body.pass_nueva){
      return await this.authService.updatePass(body.cedula,body.pass_nueva, "", body.recuperacion)
    }else if(body&&body.cedula&&body.pass_actual&&body.pass_nueva){
      return await this.authService.updatePass(body.cedula,body.pass_nueva, body.pass_actual, false)
    }else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }


  @Post('verify')
  async dataVerify(
    @Body() 
    body: { 
      cedula: string 
      code: string
      recuperacion:boolean
    })
  {
    if(body&&body.cedula&&body.code&&body.recuperacion){
      return await this.authService.verifyCode(body.cedula, body.code, body.recuperacion);
    }else if (body&&body.cedula&&body.code) {
        return await this.authService.verifyCode(body.cedula, body.code, false);
    } else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }
}
