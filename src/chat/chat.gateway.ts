import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { LoginService } from 'src/login/login.service';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatService: ChatService,
    private readonly loginService: LoginService,
    private readonly userService: UsersService,
  ) { }
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log('Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    var login = await this.loginService.findOneByIdUser(parseInt(client.handshake.query.id_usuario.toString()))
    login.id_client = client.id;
    await this.loginService.update(login);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { id_usuario_e: number, id_usuario_r: number, mensaje: string }): Promise<void> {
    // Aquí manejarás la lógica para guardar el mensaje en la base de datos y reenviarlo al receptor
    var login = await this.loginService.findOneByIdUser(payload.id_usuario_r)
    var user = await this.userService.findById(payload.id_usuario_e)
    console.log("login");
    console.log(user);
    await this.chatService.saveMessage(payload.id_usuario_e, payload.id_usuario_r, payload.mensaje);
    this.server.to(login.id_client).emit('receiveMessage', payload);
    this.sendNotification(
      payload.id_usuario_r.toString(),
      user.nombre.split(" ")[0] + " " + user.apellido.split(" ")[0],
      payload.mensaje
    )
  }

  @SubscribeMessage('sendLogin')
  async handleLoginStatus(client: Socket, payload: { sendStatus: true }): Promise<void> {
   
    this.server.emit('receiveLogin', payload);
  }

  async sendNotification(externalUserId: string, title: string, message: string) {
    const ONE_SIGNAL_API_URL = 'https://onesignal.com/api/v1/notifications';
    const APP_ID = '78514b70-d693-4849-8964-b22bbcc889ed'; // Reemplaza con tu App ID de OneSignal
    const API_KEY = 'ZjBjZTZlNmQtNDI3MS00MWU2LTg3MDktMDlkM2VkODE2YjA2'; // Reemplaza con tu REST API Key de OneSignal
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Basic ${API_KEY}`
    };

    const data = {
      app_id: APP_ID,
      include_external_user_ids: [externalUserId],
      headings: { en: title },
      contents: { en: message }
    };

    try {
      const response = await axios.post(ONE_SIGNAL_API_URL, data, { headers });
      console.log('Notification sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
  }
}
