import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { RescuePasswordCodeResponseDto } from './dto/password-rescue-code-response.dto';
import { MFAVerifyRequestDto } from './dto/mfa-verify-request.dto';
import { SigninRequestDto } from './dto/signin-request.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Post('signin')
    async signin(@Body() body: SigninRequestDto) {
        return await this.authService.login(body.email, body.password);
    }

    @Post('request-password-rescue-code')
    @HttpCode(HttpStatus.OK)
    async requestPasswordRescueCode(): Promise<RescuePasswordCodeResponseDto> {
        return await this.authService.genPasswordRescueCode();
    }

    @Post('set-new-password')
    @HttpCode(HttpStatus.OK)
    async setNewPassword(): Promise<boolean> {
        return this.authService.setNewPassword();
    }

    @Post('mfa-verify')
    mfaLogin(@Body() body: MFAVerifyRequestDto) {
        return this.authService.verify2FACode(body.code);
    }
}