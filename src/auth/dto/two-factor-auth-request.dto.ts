import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TwoFactorAuthRequest {
    @ApiProperty({ example: '123456' })
    @IsNotEmpty({ message: 'Code é obrigatório.' })
    code!: string;
}
