import { User } from "src/users/entities/user.entity";
import {Entity, Column, PrimaryGeneratedColumn, OneToOne} from "typeorm";
@Entity({ name: 'tbl_inicio_sesion' })
export class Login {
    @PrimaryGeneratedColumn()
    id_inicio_sesion: number;

    @Column({unique : true, nullable:false})
    contrasenia: string;

    @Column()
    id_usuario: number;

    @Column()
    ultima_sesion: Date;

    @Column()
    id_client: string;

    @Column()
    habilitado: number;

    @OneToOne(() => User, user => user.login)
    user: User;
}

