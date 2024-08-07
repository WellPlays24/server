import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tbl_historial_puerta')
export class DoorHistory {
  @PrimaryGeneratedColumn()
  id_historial_puerta: number;

  @Column()
  id_usuario: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @ManyToOne(() => User, { 
    eager: true, // Opcional: carga la relación automáticamente cuando se carga el mensaje
    nullable: false // Opcional: especifica si es nullable o no
  })
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id_usuario' })
  usuario: User;

}