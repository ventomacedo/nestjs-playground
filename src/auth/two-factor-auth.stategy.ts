import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class twoFactorAuthStrategy extends PassportStrategy(
    Strategy,
    'jwt-pre-auth',
) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    async validate(payload: { sub: string; type: string }) {
        if (payload.type !== 'PRE_AUTH')
            throw new UnauthorizedException('Token inválido para esta etapa.');

        return { userId: payload.sub };
    }
}
