import * as bcrypt from 'bcrypt'

import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { and, eq, isNull } from "drizzle-orm";
import { JwtService } from '@nestjs/jwt';

import { DRIZZLE_PROVIDER } from "src/database/database.provider";
import { RescuePasswordCodeResponseDto } from "./dto/password-rescue-code-response.dto";
import * as schemas from "../database/schemas/user.schema";
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {

    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: NodePgDatabase<typeof schemas>,
        private jwtService: JwtService
    ){}

    async login(_email: string, _password: string): Promise<LoginResponseDto> {
        try {
            const INVALID_MESSAGE = "Usuário ou senha inválidos.";
            const [user] = await this.db.select().from(schemas.users).where(and(
                eq(schemas.users.email, _email),
                isNull(schemas.users.deletedAt)
            ));

            if (!user)
                throw new UnauthorizedException(INVALID_MESSAGE)

            const passwordIsValid = await bcrypt.compare(_password, user.password);
            if (!passwordIsValid)
                throw new UnauthorizedException(INVALID_MESSAGE)

            return {
                accessToken: await this.jwtService.signAsync({
                    sub: user.id,
                    email: user.email
                })
            };
        } catch(error) {
            throw error;
        }
    }

    async verify2FACode(code: string): Promise<Boolean> {
        try {
            return new Promise((res) => res(code === '123456'));
        } catch(error) {
            throw error;
        }
    }

    async genPasswordRescueCode(): Promise<RescuePasswordCodeResponseDto> {
        return { code: '1234' };
    }

    async setNewPassword(): Promise<boolean> {
        try {
            return new Promise((res) => res(true));
        } catch(error) {
            throw error;
        }
    }
}