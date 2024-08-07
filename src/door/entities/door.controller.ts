import { Column,  Entity, JoinColumn, OneToOne,OneToMany, PrimaryGeneratedColumn } from "typeorm";

// @Entity({ name: '' })
export class User {
    @PrimaryGeneratedColumn()
    id_door: number;

    @Column({})
    abrir: boolean;
}
