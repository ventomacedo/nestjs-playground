import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class MFAVerifyRequestDto {
    @ApiProperty({ example: '123456 '})
    @IsNotEmpty({ message: 'O code é obrigatório.' })
    code!: string;
}