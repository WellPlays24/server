import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tbl_mensajes')
export class Message {
  @PrimaryGeneratedColumn()
  id_mensaje: number;

  @Column()
  id_usuario_e: number;

  @Column()
  id_usuario_r: number;

  @Column('text')
  mensaje: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaHora: Date;

  /*@ManyToOne(() => Chat)
  @JoinColumn({ name: 'id_chat', referencedColumnName: 'id_chat' }) // Asegúrate que esta parte sea correcta
  chat: Chat;*/

  @ManyToOne(() => User, { 
    eager: true, // Opcional: carga la relación automáticamente cuando se carga el mensaje
    nullable: false // Opcional: especifica si es nullable o no
  })
  @JoinColumn({ name: 'id_usuario_e', referencedColumnName: 'id_usuario' })
  usuarioEmisor: User;

  @ManyToOne(() => User, { 
    eager: true, // Opcional: carga la relación automáticamente cuando se carga el mensaje
    nullable: false // Opcional: especifica si es nullable o no
  })
  @JoinColumn({ name: 'id_usuario_r', referencedColumnName: 'id_usuario' })
  usuarioReceptor: User;
}