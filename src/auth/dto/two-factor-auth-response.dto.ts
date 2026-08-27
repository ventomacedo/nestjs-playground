import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorAuthResponse {
    @ApiProperty({ example: 'xxxxx.yyyyy.zzzzz' })
    accessToken!: string;
}