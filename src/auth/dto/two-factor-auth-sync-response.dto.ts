import { ApiProperty } from "@nestjs/swagger";

export class TwoFactorAuthSyncResponse {
    @ApiProperty({ example: 'abcdefgh...' })
    secret!: string;

    @ApiProperty({ example: 'otpauth://totp/MyService:user@://example.com' })
    qrCodeDataURL!: string;
}