import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, getRepository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Crea una nueva instancia de la entidad User con los datos proporcionados
    const newUser = this.userRepository.create(createUserDto);

    // Guarda el nuevo usuario en la base de datos
    await this.userRepository.save(newUser);

    // Devuelve el nuevo usuario, incluido su id generado automáticamente
    return newUser;
  }

  findOneByCedula(cedula: string) {
    return this.userRepository.findOneBy({ cedula })
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userRepository.save(updateUserDto);
  }

  async updateUser(user) {
    const updateUser= await this.findById(user.id_usuario);
    if(!updateUser){
      return { 
        status: false, 
        code: -1,
        msj: "No existe el usuario ingresado",
      };
    }

    updateUser.nombre=user.nombre;
    updateUser.apellido=user.apellido;
    updateUser.cedula=user.cedula;
    updateUser.correo_institucional=user.correo_institucional;
    updateUser.id_tipo_usuario=user.id_tipo_usuario;

    const update = await this.userRepository.update(updateUser.id_usuario, updateUser)

    if(update){
      return { 
        status: true, 
        code: 0,
        msj: "El usuario se ha modificado correctamente",
      };
    }
  }

  async remove(id_usuario: number) {
    try{
      const del= await this.userRepository.delete(id_usuario);
      console.log(del.affected)

      if(del){
        if(del.affected==0){
          return { 
            status: false, 
            code: -1,
            msj: "No existe el usuario ingresado",
          };
        }else{
          return { 
            status: true, 
            code: 0,
            msj: "Se ha eliminado el usuario correctamente",
          };
        }
      }else{
        return { 
          status: false, 
          code: -1,
          msj: "Ha ocurrido un error al eliminar usuario",
        };
      }
    }catch{
      return { 
        status: false, 
        code: -1,
        msj: "Ha ocurrido un error al eliminar usuario",
      };
    }
  }

  findById(id_usuario: number) {
    return this.userRepository.findOne({
      where: { id_usuario },
      select: ['id_usuario', 'nombre', 'apellido', 'id_tipo_usuario', 'cedula', 'correo_institucional', 'codigo_verificacion', 'estado_verificacion'],
    });
  }

  findByEmailWithPassword(correo_institucional: string) {
    return this.userRepository.findOne({
      where: { correo_institucional },
      select: ['id_usuario', 'nombre', 'apellido', 'id_tipo_usuario', 'cedula', 'correo_institucional', 'codigo_verificacion', 'estado_verificacion'],
    });
  }
  findByCedulaWithPassword(cedula: string) {
    return this.userRepository.findOne({
      where: { cedula },
      select: ['id_usuario', 'nombre', 'apellido', 'id_tipo_usuario', 'cedula', 'correo_institucional', 'codigo_verificacion', 'estado_verificacion'],
    });
  }

  async findAllByTipoUsuario(id_tipo_usuario: number): Promise<User[]> {
    return this.userRepository.find({
      where: { id_tipo_usuario }
    });
  }

  async listUsers(id_tipo_usuario: Array<number>) {
    try{
      const users = await this.userRepository.find({
        where: { id_tipo_usuario:In(id_tipo_usuario) },
        relations: ['login'],
      });
    
      var userSession= users.map(user => ({
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        id_tipo_usuario: user.id_tipo_usuario,
        cedula: user.cedula,
        correo_institucional: user.correo_institucional,
        codigo_verificacion: user.codigo_verificacion,
        estado_verificacion: user.estado_verificacion,
        ultima_sesion: user.login.ultima_sesion,
        habilitado: user.login.habilitado
      }));
  
      return { 
        status: true, 
        code: 0,
        msj: "listado correcto",
        data: userSession
      };
    }catch(e){
      return { 
        status: false, 
        code: -1,
        msj: "Ha ocurrido un error al listar",
      };
    }
    
  }
  
}
// async createLogin(id: number, login:CreateLoginDto ){
//   const userFound = await this.userRepository.findOne({
//     where:{
//       id_usuario,
//     }
//   });
//   if (!userFound) {
//     return new HTTException('User not found')
//   }
// }
// findLoginUser() {
//   return this.userRepository.findOne({
//     where: { cedula },
//     relations: ['login'],
//   });
// }
