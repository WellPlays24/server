import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatDto {
    @IsNumber()
    @IsNotEmpty()
    usuario1: number;

    @IsNumber()
    @IsNotEmpty()
    usuario2: number;
}