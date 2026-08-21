import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDto {
    @ApiProperty({ example: 'xxxxx.yyyyy.zzzzz' })
    accessToken!: string;
}