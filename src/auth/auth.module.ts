import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { twoFactorAuthStrategy } from './two-factor-auth.stategy';
import { JwtStrategy } from './jwt.stategy';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '8h' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, twoFactorAuthStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
