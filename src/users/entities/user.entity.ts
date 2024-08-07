import { Column,  Entity, JoinColumn, OneToOne,OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Login } from './../../login/entities/login.entity';
import { Chat } from './../../chat/entities/chat.entity';

@Entity({ name: 'tbl_usuario' })
export class User {
    @PrimaryGeneratedColumn()
    id_usuario: number;

    @Column({})
    nombre: string;

    @Column({})
    apellido: string;
    
    @Column({})
    id_tipo_usuario: number;
    
    @Column({unique : true})
    cedula: string;

    @Column({unique : true})
    correo_institucional: string;

    @Column({unique : false})
    codigo_verificacion: string;

    @Column({unique : false})
    estado_verificacion: number;

    @OneToOne(() => Login, login => login.user)
    @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id_usuario' })
    login: Login;

    /*@OneToMany(() => Chat, chat => chat.user1)
    chatsAsUser1: Chat[];

    @OneToMany(() => Chat, chat => chat.user2)
    chatsAsUser2: Chat[];*/

}
// @Column({unique : true})
// contrasenia: string;

// @DeleteDateColumn()
// deletedAt: Date;
