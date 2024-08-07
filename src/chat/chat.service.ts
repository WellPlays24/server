import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Int32, Repository, SelectQueryBuilder, getConnection } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) { }

  async saveMessage(id_usuario_e: number, id_usuario_r: number, mensaje: string) {
    const now = moment().utc().toDate()
    const newMessage = await this.messageRepository.save({ id_usuario_e, id_usuario_r, mensaje, fechaHora: now })
  }

  async getMessagesByUsers(usuario1: number, usuario2: number) {
    // Buscar mensajes donde id_usuario_e sea usuario1 o usuario2, o id_usuario_r sea usuario1 o usuario2
    const messages = await this.messageRepository.find({
      where: [
        { id_usuario_e: usuario1, id_usuario_r: usuario1 },
        { id_usuario_e: usuario1, id_usuario_r: usuario2 },
        { id_usuario_e: usuario2, id_usuario_r: usuario1 },
        { id_usuario_e: usuario2, id_usuario_r: usuario2 }
      ],
      order: {
        fechaHora: 'ASC' // Ordenar por fechaHora de manera ascendente (más antigua a más reciente)
      }
    });

    // Convertir la fechaHora a la zona horaria deseada solo para mostrar
    const adjustedMessages = messages.map(message => {
      return {
        ...message,
        fechaHora: moment.utc(message.fechaHora).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss')
      };
    });
    return { status: true, code: 0, msj: 'Chats obtenidos', data: adjustedMessages };;
  }

  async deleteMessagesByUsers(usuario1: number, usuario2: number) {
    const deleteResult = await this.messageRepository.createQueryBuilder()
      .delete()
      .where(
        '(id_usuario_e = :usuario1 AND id_usuario_r = :usuario1) OR ' +
        '(id_usuario_e = :usuario1 AND id_usuario_r = :usuario2) OR ' +
        '(id_usuario_e = :usuario2 AND id_usuario_r = :usuario1) OR ' +
        '(id_usuario_e = :usuario2 AND id_usuario_r = :usuario2)',
        { usuario1, usuario2 }
      )
      .execute();

    if (deleteResult.affected > 0) {
      return { status: true, code: 0, msj: 'Mensajes eliminados' };
    } else {
      return { status: false, code: 1, msj: 'No se encontraron mensajes para eliminar' };
    }
  }

  async getLatestMessageByUser(id_usuario: number) {
    try {
      const queryBuilder = this.messageRepository.createQueryBuilder('m');

      const messages = await queryBuilder
        .select([
          'm',
          `CASE WHEN ue.id_usuario <> :id_usuario THEN ue.nombre ELSE ur.nombre END AS nombre`,
          `CASE WHEN ue.id_usuario <> :id_usuario THEN ue.apellido ELSE ur.apellido END AS apellido`
        ])
        .leftJoin('m.usuarioEmisor', 'ue') // LEFT JOIN con el usuario emisor
        .leftJoin('m.usuarioReceptor', 'ur') // LEFT JOIN con el usuario receptor
        .where('m.id_usuario_e = :id_usuario OR m.id_usuario_r = :id_usuario', { id_usuario })
        .orderBy('m.fechaHora', 'DESC')
        .setParameter('id_usuario', id_usuario)
        .getRawMany();


      if (messages.length === 0) {
        return { status: false, code: 1, msj: 'No se encontraron mensajes para el usuario' };
      }

      // Convertir la fechaHora a la zona horaria deseada solo para mostrar
      const adjustedMessages = messages.map(message => {
        return {
          ...message,
          m_fechaHora: moment.utc(message.m_fechaHora).tz('America/Guayaquil').format('YYYY-MM-DD HH:mm:ss')
        };
      });

      console.log(messages)

      return { status: true, code: 0, msj: 'Últimos mensajes obtenidos', data: this.filterLatestMessages(adjustedMessages, id_usuario) };
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
      return { status: false, code: 2, msj: 'Error al obtener los mensajes' };
    }
  }


  createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const newChat = this.chatRepository.create(createChatDto);
    return this.chatRepository.save(newChat);
  }

  createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(newMessage);
  }

  async findAllChats(): Promise<Chat[]> {
    return this.chatRepository.find({ relations: ['user1', 'user2', 'mensajes'] });
  }

  async findChatById(id: number): Promise<Chat> {
    return this.chatRepository.findOneBy({ id_chat: id });
  }

  /*async findAllMessagesInChat(id_chat: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: { id_chat },
      relations: ['usuario'],
    });
  }*/

  private filterLatestMessages(messages, id_usuario: number): Message[] {
    const map = new Map<string, Message>();

    // Iterar sobre los mensajes y mantener solo el último mensaje con cada combinación de usuarios
    messages.forEach((message) => {
      const otherUserId = message.m_id_usuario_e === id_usuario ? message.m_id_usuario_r : message.m_id_usuario_e;
      const key = `${Math.min(id_usuario, otherUserId)}_${Math.max(id_usuario, otherUserId)}`;

      // Mantener solo el último mensaje según la fechaHora
      if (!map.has(key) || message.fechaHora > map.get(key)!.fechaHora) {
        map.set(key, message);
      }
    });

    // Convertir el mapa de mensajes de vuelta a un array
    const filteredMessages = Array.from(map.values());

    return filteredMessages;
  }
}