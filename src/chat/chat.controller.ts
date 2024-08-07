import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatService.createChat(createChatDto);
  }

  @Post('/message')
  createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatService.createMessage(createMessageDto);
  }

  @Get()
  findAllChats() {
    return this.chatService.findAllChats();
  }

  @Get(':id')
  findChatById(@Param('id') id: string) {
    return this.chatService.findChatById(+id);
  }

  /*@Get('/messages/:chatId')
  findAllMessagesInChat(@Param('chatId') chatId: string) {
    return this.chatService.findAllMessagesInChat(+chatId);
  }*/

  @Post('/save')
  async saveMessage(
    @Body() 
    body: { 
      id_usuario_e: number 
      id_usuario_r: number
      mensaje:string
    })
  {
    if(body&&body.id_usuario_e&&body.id_usuario_r&&body.mensaje){
      return await this.chatService.saveMessage(body.id_usuario_e, body.id_usuario_r, body.mensaje);
    }else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('/getByUsers')
  async getByUsers(
    @Body() 
    body: { 
      usuario1: number 
      usuario2: number
      mensaje:string
    })
  {
    if(body&&body.usuario1&&body.usuario2){
      return await this.chatService.getMessagesByUsers(body.usuario1, body.usuario2,);
    }else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('/deleteByUsers')
  async deleteByUsers(
    @Body() 
    body: { 
      usuario1: number 
      usuario2: number
    })
  {
    if(body&&body.usuario1&&body.usuario2){
      return await this.chatService.deleteMessagesByUsers(body.usuario1, body.usuario2,);
    }else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }

  @Post('/getChats')
  async getChats(
    @Body() 
    body: { 
      id_usuario: number
    })
  {
    if(body&&body.id_usuario){
      return await this.chatService.getLatestMessageByUser(body.id_usuario);
    }else {
      return { status: false, msj: 'Los parámetros no son correctos' };
    }
  }
}
