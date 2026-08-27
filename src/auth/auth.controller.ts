import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

import { SigninRequestDto } from './dto/signin-request.dto';
import { TwoFactorAuthResponse } from './dto/two-factor-auth-response.dto';
import { TwoFactorAuthRequest } from './dto/two-factor-auth-request.dto';
import { TwoFactorAuthSyncResponse } from './dto/two-factor-auth-sync-response.dto';
import { twoFactorAuthGuard } from './two-factor-auth.guard';

type PreAuthRequest = Request & { user: { userId: string } };

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    async signin(@Body() body: SigninRequestDto) {
        return await this.authService.login(body.email, body.password);
    }

    @UseGuards(twoFactorAuthGuard)
    @Post('verify-two-factor-authentication')
    async verifyTwoFactorAuthentication(@Req() req: PreAuthRequest, @Body() body: TwoFactorAuthRequest): Promise<TwoFactorAuthResponse> {
        return await this.authService.validateTwoFactorAuth(req.user.userId, body.code);
    }

    @UseGuards(twoFactorAuthGuard)
    @Post('sync-app-authenticator')
    syncAppAuthenticator(@Req() req: PreAuthRequest): Promise<TwoFactorAuthSyncResponse> {
        return this.authService.generateTwoFactorSecret(req.user.userId);
    }
}