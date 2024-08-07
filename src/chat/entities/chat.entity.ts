import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('tbl_chat')
export class Chat {
  @PrimaryGeneratedColumn()
  id_chat: number;

  @Column()
  usuario1: number;

  @Column()
  usuario2: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario1', referencedColumnName: 'id_usuario' })
  user1: User;

  /*@ManyToOne(() => User)
  @JoinColumn({ name: 'usuario2', referencedColumnName: 'id_usuario' })
  user2: User;

  @OneToMany(() => Message, message => message.chat)
  mensajes: Message[];*/
}
