import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMessageDto {

    @IsNumber()
    @IsNotEmpty()
    id_usuario_e: number;

    @IsNumber()
    @IsNotEmpty()
    id_usuario_r: number;

    @IsNotEmpty()
    mensaje: string;
}