import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginService } from 'src/login/login.service';
import { UsersService } from 'src/users/users.service';
import * as bcryptjs from 'bcryptjs';

import { access } from 'fs';
import { RecoverDto } from './dto/recover.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly loginService: LoginService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try{
      const { nombre, apellido, id_tipo_usuario, cedula, correo_institucional, contrasenia } = registerDto;

    const invalidEmail = !this.validarEmail(correo_institucional);
    if (invalidEmail) {
      return {
        status: false,
        code: -1,
        msj: "El correo electrónico no es válido o no pertenece a una cuenta institucional"
      }
    }

    const mailExist = await this.userService.findByEmailWithPassword(correo_institucional);
    console.log(mailExist)
    if (mailExist && mailExist.estado_verificacion == 1) {
      return {
        status: false,
        code: -1,
        msj: "El correo ya está en uso"
      }
    }

    const cedExist = await this.userService.findByCedulaWithPassword(cedula);
    if (cedExist && cedExist.estado_verificacion == 1) {
      return {
        status: false,
        code: -1,
        msj: "La cédula ya está en uso"
      }
    }

    if ((cedExist&&cedExist.estado_verificacion == 0)) {
      cedExist.apellido=apellido;
      cedExist.nombre=nombre;
      cedExist.correo_institucional=correo_institucional;
      await this.userService.update(cedExist);
      return  await this.verifyAccount(correo_institucional, cedExist.codigo_verificacion, false);
    } else {
      var codigo_verificacion = '';
      for (let i = 0; i < 6; i++) {
        codigo_verificacion += (Math.floor(Math.random() * 10)).toString(); // Convert the digit to a string
      }

      const newUser = await this.userService.create({
        nombre,
        apellido,
        id_tipo_usuario,
        cedula,
        correo_institucional,
        codigo_verificacion
      });

      // Hashear la contraseña
      const hashedPassword = await bcryptjs.hash(contrasenia, 10);

      // Crear el registro de inicio de sesión
      await this.loginService.create({
        id_usuario: newUser.id_usuario,
        contrasenia: hashedPassword,
      });

      return await this.verifyAccount(correo_institucional, codigo_verificacion, false);
    }

    }catch(e){
      return { status: false, code:-1, msj: "Existe un error temporal en la creación de cuentas" };
    }
  }

  async recoverPass(cedula: string){
    const user = await this.userService.findOneByCedula(cedula);
    if (!user) {
      return{
        status:false,
        code:-1,
        msj:"No existe una cuenta con el usuario ingresado"
      }
    }

    var codigo_verificacion = '';
    for (let i = 0; i < 6; i++) {
      codigo_verificacion += (Math.floor(Math.random() * 10)).toString(); // Convert the digit to a string
    }

    user.codigo_verificacion =codigo_verificacion;

    await this.userService.update(user)
    
    return await this.verifyAccount(user.correo_institucional, user.codigo_verificacion, true);
    
  }

  async login({ cedula, contrasenia }: LoginDto) {
    const user = await this.userService.findOneByCedula(cedula);
    if (!user) {
      return{
        status:false,
        code:-1,
        msj:"No existe una cuenta con el usuario ingresado"
      }
    }
    const idUser = user.id_usuario;
    const login = await this.loginService.findOneByIdUser(idUser);

    if(login.habilitado==0){
      return{
        status:false,
        code:-1,
        msj:"El usuario está deshabilitado, comuníquese con el administrador"
      }
    }


    const isPasswordValid = await bcryptjs.compare(contrasenia, login.contrasenia);
    if (!isPasswordValid) {
      return{
        status:false,
        code:-1,
        msj:"La contraseña es incorrecta"
      }
    }

    if(user.estado_verificacion!=1){
      if(user.codigo_verificacion==null||user.codigo_verificacion==""){
        user.codigo_verificacion="";
        for (let i = 0; i < 6; i++) {
          user.codigo_verificacion += (Math.floor(Math.random() * 10)).toString(); // Convert the digit to a string
        }
        this.userService.update(user);
      }
      this.verifyAccount(user.correo_institucional, user.codigo_verificacion, false);
      return{
        status:false,
        code:1,
        msj:"La cuenta no se encuentra verificada",
        data:{
          mail:user.correo_institucional,
          cedula:user.cedula
        }
      }
    }

    const payload = { id_usuario: user.id_usuario, cedula: user.cedula, role: user.id_tipo_usuario };
    console.log(payload);
    const token = await this.jwtService.signAsync(payload);
    login.ultima_sesion= new Date();
    this.loginService.update(login);


    return {
      status: true,
      code: 0,
      msj: "Login correcto",
      data:{
        token,
        id_usuario: user.id_usuario,
        cedula,
        nombres:user.nombre,
        apellidos:user.apellido,
        role: user.id_tipo_usuario,
        ultima_sesion:login.ultima_sesion,
        email:user.correo_institucional
      }
    };
  }

  async enableUser(id_usuario: number){
    try{
      const login = await this.loginService.findOneByIdUser(id_usuario);
      if(!login){
        return  { status: false, code: -1,msj: "No existe usuario con el id ingresado" };
      }
      var mensaje;
      switch (login.habilitado){
        case 0:
          login.habilitado=1
          mensaje="Usuario habilitado correctamente"
        break;
        case 1:
          login.habilitado=0;
          mensaje="Usuario deshabilitado correctamente"
      }

      const update=await this.loginService.update(login);

      if(update){
        return  { status: true, code: 0,msj: mensaje };
      }else{
        return  { status: false, code: -1,msj: "Ha ocurrido un error al habilitar/deshabilitar usuario" };
      }

      
    }catch{
      return  { status: false, code: -1,msj: "Ha ocurrido un error al habilitar/deshabilitar usuario" };
    }
  }

  async verifyCode(cedula: string, code: string, recuperacion: boolean){
    try{
      const user = await this.userService.findOneByCedula(cedula);
      if(user){
        if(user.estado_verificacion==1&&!recuperacion){
          return  { status: false, code: -1,msj: "La cuenta ya se encuentra verificada." };
        }
        if(user.codigo_verificacion==code){
          user.estado_verificacion=1;
          console.log(user)
          if(!recuperacion){
            await this.userService.update(user);
          }
          return  { status: true, code: 0,msj: `La validación ha sido exitosa. ${recuperacion?"Ahora podrás cambiar tu contraseña":" Tu cuenta se ha activado."}` };
        }else{
          return  { status: false, code: -1,msj: `El código de ${recuperacion?"recuperación":"verificación"} es incorrecto.` };
        }
      }else{
        return  { status: false, code: -1,msj: `No existe código de ${recuperacion?"recuperación":"verificación"} registrado para la cédula ingresada.` };
      }
    }catch{
      return  { status: false, code: -1,msj: "Ha ocurrido un error al verificar código" };
    }
  }

  async updatePass(cedula:string, newPass:string, oldPass:string, recover:boolean){
    try{
      const user = await this.userService.findOneByCedula(cedula);
      if(user){
        const idUser = user.id_usuario;
        const login = await this.loginService.findOneByIdUser(idUser);
        if(!recover){
          const contraseniaHash = await bcryptjs.hash(oldPass, 10)
          console.log(contraseniaHash);
          const isPasswordValid = await bcryptjs.compare(oldPass, login.contrasenia);
          if (!isPasswordValid) {
            return{
              status:false,
              code:-1,
              msj:"La contraseña actual es incorrecta"
            }
          }
          const updated= await this.loginService.updatePassword(user.id_usuario, newPass);
          if(updated){
            return { status: true, code: 0,msj: "Contraseña actualizada con exito"};
          }else{
            return { status: false, code: -1,msj: "Ha ocurrido un error al actualizar contraseña"};
          }
        }else{
          const updated= await this.loginService.updatePassword(user.id_usuario, newPass);
          if(updated){
            return { status: true, code: 0,msj: "Contraseña actualizada con exito"};
          }else{
            return { status: false, code: -1,msj: "Ha ocurrido un error al actualizar contraseña"};
          }
        }
      }else{
        return { status: false, code: -1,msj: "No existe un usuario con cédula "+cedula };
      }
    }catch(e){
      return { status: false, code: -1,msj: "Ha ocurrido un error desconocido al actualizar contraseña" };
    }
  }

  async verifyAccount(email:string, code:string, recover:boolean): Promise<{ status: boolean, code:number, msj: string }> {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'atencion.estudiantilutmach@gmail.com',
          pass: 'ggrbhvbgkitlyeoc', 
        },
      });

      const mailOptions = {
        from: 'atencion.estudiantilutmach@gmail.com',
        to: email,
        subject: recover?'Recuperar contraseña':'Verificación App',
        text: recover?'Hola,': 'Gracias por registrarte.',
        html: `<label>Tu código de ${recover?"recuperación":"verificación"} es: <b>${code}</b>.</label>`,
      };

      // Enviar el correo electrónico y esperar la respuesta
      const { error, info } = await transporter.sendMail(mailOptions);

      if (error) {
        console.error('Error al enviar correo electrónico:', error);
        return { status: false, code:-1, msj: error };
      }
      return { status: true, code:0, msj: `Correo de ${recover?"recuperación":"verificación"} enviado correctamente` };
    } catch (error) {
      console.error('Error al enviar correo electrónico:', error);
      return { status: false, code: -1,msj: `Ha ocurrido un error al enviar correo de ${recover?"recuperación":"verificación"}` };
    }
  }
  
  validarEmail(email: string) {
    const emailRegex = /^[\w-.]+@[\w-.]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    const domain = email.split('@')[1];
    return domain === 'utmachala.edu.ec';
  }
}