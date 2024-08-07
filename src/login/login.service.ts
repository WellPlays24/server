import { Injectable } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm';
import { Login } from './entities/login.entity'

import * as bcryptjs from 'bcryptjs';

@Injectable()
export class LoginService {

  constructor(
    @InjectRepository(Login)
    private readonly loginRepository: Repository<Login>,
  ) { }

  create(createLoginDto: CreateLoginDto) {
    return this.loginRepository.save(createLoginDto);
  }

  findOneByIdUser(id_usuario: number) {
    return this.loginRepository.findOne({
      where: { id_usuario },
      select: ['id_inicio_sesion', 'contrasenia', 'id_usuario', 'ultima_sesion', 'id_client', 'habilitado'],
    });
  }

  findAll() {
    return `This action returns all login`;
  }

  findOne(id: number) {
    return `This action returns a #${id} login`;
  }

  async update(login: Login) {
    return await this.loginRepository.save(login);
  }

  remove(id: number) {
    return `This action removes a #${id} login`;
  }

  async updatePassword(id_usuario: number, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    const login = await this.loginRepository.findOne({
      where: { id_usuario },
    });

    if (!login) {
      return false
    }

    login.contrasenia = hashedPassword;
    await this.loginRepository.save(login);
    return true
  }
}
