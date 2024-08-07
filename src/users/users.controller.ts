import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }


  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Post('delete')
  async remove(
  @Body() 
  body: { 
    id_usuario: number
  }) {
    if(body&&body.id_usuario){
      return this.usersService.remove(body.id_usuario);
    }else {
      return { status: false, code:-1, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('edit')
  async edit(
  @Body() 
  body: { 
    id_usuario: number,
    nombre:string,
    apellido:string,
    id_tipo_usuario:number,
    cedula:string,
    correo_institucional:string
  }) {
    if(body&&body.id_usuario&&body.nombre&&body.apellido&&body.id_tipo_usuario&&body.cedula&&body.correo_institucional){
      return this.usersService.updateUser(body);
    }else {
      return { status: false, code:-1, msj: 'Los parámetros no son correctos' };
    }
  }

  @Get('/tipo/:id')
  // @UseGuards(JwtAuthGuard)  // Solo si quieres que la ruta sea protegida
  findAllByTipoUsuario(@Param('id') id: number) {
    return this.usersService.findAllByTipoUsuario(id);
  }

  @Post("list")
  async list(
  @Body() 
  body: { 
    tipo_usuario: string
  })
  {
    if (body&&body.tipo_usuario) {
      switch(body.tipo_usuario){
        case "docente":
          return await this.usersService.listUsers([101, 102]);
        break;
        case "estudiante":
          return await this.usersService.listUsers([100]);
        break;
        case "todos":
          return await this.usersService.listUsers([100, 101, 102]);
        break;
        default:
          return { status: false, code:-1, msj: 'No existe el tipo de usuario ingresado' };
        break;
      }
    } else {
      return { status: false, code:-1, msj: 'Los parámetros no son correctos' };
    }
  }
}
