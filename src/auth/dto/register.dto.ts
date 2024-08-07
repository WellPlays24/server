import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsString, Min, MinLength } from 'class-validator';
export class RegisterDto {
    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1,)
    nombre: string;

    @IsString()
    @MinLength(1)
    apellido: string;

    @IsInt()
    @Min(1)
    id_tipo_usuario: number;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(1)
    cedula: string;

    @Transform(({ value }) => value.trim())
    @IsEmail()
    correo_institucional: string;

    @Transform(({ value }) => value.trim())
    @IsString()
    @MinLength(6)
    contrasenia: string;
}