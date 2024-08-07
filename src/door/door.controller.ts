import { Body, Controller,Get, Param, Post } from '@nestjs/common';
import { DoorService } from './door.service';

@Controller('door')
export class DoorController {
  constructor(private readonly doorService: DoorService) {}
  //@Get(':state')
  @Post('status')
  async toggleRelay(@Body() body: { abrir: boolean }) {
    if (body && typeof body.abrir === 'boolean') {
      if (body.abrir === true) {
        return await this.doorService.toggleRelay();
        //return { status: true, msj: 'La puerta se ha abierto' };
      } else {
        return { status: false, msj: 'La puerta no se ha abierto' };
      }
    } else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('/saveDoorHistory')
  async saveDoorHistory(
    @Body() 
    body: { 
      id_usuario: number
    })
  {
    if(body&&body.id_usuario){
      return await this.doorService.saveDoorHistoryByUser(body.id_usuario);
    }else {
      return { status: false,code:-1,  msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('/getDoorHistory')
  async getDoorHistory(
    @Body() 
    body: { 
      fecha_inicio:string,
      fecha_fin:string
    })
  {
    if(body&&body.fecha_inicio&&body.fecha_fin){
      return await this.doorService.getDoorHistoryByUser(body.fecha_inicio, body.fecha_fin);
    }else {
      return { status: false,code:-1,  msj: 'Los parámetros no son correctos' };
    }
  }
}