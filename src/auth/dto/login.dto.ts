import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';
export class LoginDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    cedula: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    contrasenia: string;
}

