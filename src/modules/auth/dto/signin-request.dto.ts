import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class SigninRequestDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'E-mail utilizado como username',
    })
    @IsEmail({}, { message: 'O e-mail informado deve ser válido' })
    @IsNotEmpty({ message: 'O e-mail é obrigatório' })
    email!: string;

    @ApiProperty({ example: 'UmaSenhaBemSegura@2026' })
    @IsNotEmpty({ message: 'Password é obrigatório' })
    @MinLength(6, { message: 'O Password precisa ter no mínimo 6 caracteres' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, {
        message:
            'O Password deve conter letras, números e ao menos 1 caracter especial',
    })
    password!: string;
}
