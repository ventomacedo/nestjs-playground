import * as bcrypt from 'bcrypt'

import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, isNull } from "drizzle-orm";
import { JwtService } from '@nestjs/jwt';
import * as QRCode from 'qrcode';
import { OTP } from 'otplib';

import { DRIZZLE_PROVIDER } from "src/database/database.provider";
import * as schemas from "../database/schemas/user.schema";
import { LoginResponseDto } from './dto/login-response.dto';
import { TwoFactorAuthSyncResponse } from './dto/two-factor-auth-sync-response.dto';
import { TwoFactorAuthResponse } from './dto/two-factor-auth-response.dto';

@Injectable()
export class AuthService {
    private readonly otp: OTP;

    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: NodePgDatabase<typeof schemas>,
        private jwtService: JwtService
    ){
        this.otp = new OTP({ strategy: 'totp' });
    }

    async login(_email: string, _password: string): Promise<LoginResponseDto> {
        try {
            const INVALID_MESSAGE = "Usuário ou senha inválidos.";
            const [user] = await this.db.select()
                .from(schemas.users)
                .where(
                    and(
                        eq(schemas.users.email, _email),
                        isNull(schemas.users.deletedAt)
                    )
                );

            if (!user)
                throw new UnauthorizedException(INVALID_MESSAGE)

            const passwordIsValid = await bcrypt.compare(_password, user.password);
            if (!passwordIsValid)
                throw new UnauthorizedException(INVALID_MESSAGE)

            return {
                authChallenge: user.isFirstAccess ? 'MFA_SYNC' : 'MFA_VALIDATE',
                twoFactorAuthToken: await this.generaeTwoFactorAuthToken(user.id)
            }
        } catch(error) {
            throw error;
        }
    }

    async generateTwoFactorSecret(userId: string): Promise<TwoFactorAuthSyncResponse> {
        const user = await this.findUserById(userId);

        if (!user?.isTwoFactorEnabled)
            throw new BadRequestException("O 2FA não está ativado para este usuário.");

        const secret = this.otp.generateSecret();
        const appName = process.env.APP_NAME ?? 'App';

        const otpAuthURL = this.otp.generateURI({ issuer: appName, label: user.email, secret });
        await this.updateUserSecret(user.id, secret);
        const qrCodeDataURL = await QRCode.toDataURL(otpAuthURL);

        return {
            secret,
            qrCodeDataURL
        }
    }

    async validateTwoFactorAuth(userId: string, code: string): Promise<TwoFactorAuthResponse> {
        const user = await this.findUserById(userId);

        if (!user?.isTwoFactorEnabled || !user?.twoFactorSecret)
            throw new BadRequestException("O 2FA não está ativado para este usuário.");
        
        const { valid } = await this.otp.verify({
            token: code,
            secret: user.twoFactorSecret
        });

        if (!valid)
            throw new UnauthorizedException("Código de authenticação inválido");

        return {
            accessToken: await this.generateAuthToken(user.id)
        };

    }

    private async updateUserSecret(userId: string, secret: string): Promise<void> {
        try {
            const result = await this.db.update(schemas.users).set({ 
                twoFactorSecret: secret,
                isFirstAccess: false
            }).where(eq(schemas.users.id, userId));

            if (result.rowCount === 0)
                throw new NotFoundException(`Nenhum registro encontrado com o ID ${userId} ou nada foi alterado.`);

        } catch (error) {
            throw error;
        }
    }

    private async findUserById(userId: string): Promise<schemas.TUser> {
        try {
            const userData = await this.db.select().from(schemas.users).where(eq(schemas.users.id, userId));
            return userData[0];
        } catch(error) {
            console.error(error);
            return {} as schemas.TUser;
        }
    }

    private async generaeTwoFactorAuthToken(userId: string) {
        return this.jwtService.sign(
            { sub: userId, type: 'PRE_AUTH' },
            { expiresIn: '5m' }
        );
    }

    private async generateAuthToken(userId: string) {
        return this.jwtService.sign(
            { sub: userId, type: 'FULL_AUTH' },
            { expiresIn: '8h' }
        )
    }
}