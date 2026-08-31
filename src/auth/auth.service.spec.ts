import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

import { AuthService } from './auth.service';
import { users } from '../database/schemas/user.schema';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

jest.mock('qrcode', () => ({
    toDataURL: jest.fn(),
}));

const otpInstance = {
    generateSecret: jest.fn(),
    generateURI: jest.fn(),
    verify: jest.fn(),
};

jest.mock('otplib', () => ({
    OTP: jest.fn().mockImplementation(() => otpInstance),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let db: {
        select: jest.Mock;
        update: jest.Mock;
    };
    let jwtService: {
        sign: jest.Mock;
    };
    const compareMock = bcrypt.compare as jest.Mock;
    const toDataURLMock = QRCode.toDataURL as jest.Mock;

    const user = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        deletedAt: null,
        isFirstAccess: false,
        isTwoFactorEnabled: true,
        twoFactorSecret: 'the-secret',
    };

    beforeEach(() => {
        compareMock.mockReset();
        toDataURLMock.mockReset();
        otpInstance.generateSecret.mockReset();
        otpInstance.generateURI.mockReset();
        otpInstance.verify.mockReset();
        db = {
            select: jest.fn(),
            update: jest.fn(),
        };
        jwtService = {
            sign: jest.fn(),
        };
        authService = new AuthService(
            db as never,
            jwtService as unknown as JwtService,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('login', () => {
        it('retorna authChallenge MFA_SYNC quando é o primeiro acesso do usuário', async () => {
            const where = jest
                .fn()
                .mockResolvedValue([{ ...user, isFirstAccess: true }]);
            const from = jest.fn().mockReturnValue({ where });
            db.select.mockReturnValue({ from });
            compareMock.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('pre-auth-token');

            const result = await authService.login(
                user.email,
                'plain-password',
            );

            expect(result).toEqual({
                authChallenge: 'MFA_SYNC',
                twoFactorAuthToken: 'pre-auth-token',
            });
            expect(compareMock).toHaveBeenCalledWith(
                'plain-password',
                user.password,
            );
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, type: 'PRE_AUTH' },
                { expiresIn: '5m' },
            );
            expect(from).toHaveBeenCalledWith(users);
            expect(where).toHaveBeenCalledWith(expect.anything());
        });

        it('retorna authChallenge MFA_VALIDATE quando o usuário já sincronizou o 2FA', async () => {
            const where = jest
                .fn()
                .mockResolvedValue([{ ...user, isFirstAccess: false }]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });
            compareMock.mockResolvedValue(true);
            jwtService.sign.mockReturnValue('pre-auth-token');

            const result = await authService.login(
                user.email,
                'plain-password',
            );

            expect(result).toEqual({
                authChallenge: 'MFA_VALIDATE',
                twoFactorAuthToken: 'pre-auth-token',
            });
        });

        it('lança UnauthorizedException quando o usuário não existe', async () => {
            const where = jest.fn().mockResolvedValue([]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            const loginPromise = authService.login(
                'unknown@example.com',
                'plain-password',
            );

            await expect(loginPromise).rejects.toBeInstanceOf(
                UnauthorizedException,
            );
            await expect(loginPromise).rejects.toThrow(
                'Usuário ou senha inválidos.',
            );
            expect(compareMock).not.toHaveBeenCalled();
            expect(jwtService.sign).not.toHaveBeenCalled();
        });

        it('lança UnauthorizedException quando a senha é inválida', async () => {
            const where = jest.fn().mockResolvedValue([user]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });
            compareMock.mockResolvedValue(false);

            await expect(
                authService.login(user.email, 'wrong-password'),
            ).rejects.toThrow('Usuário ou senha inválidos.');
            expect(jwtService.sign).not.toHaveBeenCalled();
        });
    });

    describe('generateTwoFactorSecret', () => {
        it('lança BadRequestException quando o 2FA não está ativado para o usuário', async () => {
            const where = jest
                .fn()
                .mockResolvedValue([{ ...user, isTwoFactorEnabled: false }]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            await expect(
                authService.generateTwoFactorSecret(user.id),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('gera o segredo, atualiza o usuário e retorna o QR Code', async () => {
            const selectWhere = jest.fn().mockResolvedValue([user]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where: selectWhere }),
            });

            const updateWhere = jest.fn().mockResolvedValue({ rowCount: 1 });
            const updateSet = jest.fn().mockReturnValue({ where: updateWhere });
            db.update.mockReturnValue({ set: updateSet });

            otpInstance.generateSecret.mockReturnValue('new-secret');
            otpInstance.generateURI.mockReturnValue(
                'otpauth://totp/App:user@example.com?secret=new-secret',
            );
            toDataURLMock.mockResolvedValue('data:image/png;base64,qrcode');

            const result = await authService.generateTwoFactorSecret(user.id);

            expect(otpInstance.generateURI).toHaveBeenCalledWith({
                issuer: process.env.APP_NAME ?? 'App',
                label: user.email,
                secret: 'new-secret',
            });
            expect(updateSet).toHaveBeenCalledWith({
                twoFactorSecret: 'new-secret',
                isFirstAccess: false,
            });
            expect(toDataURLMock).toHaveBeenCalledWith(
                'otpauth://totp/App:user@example.com?secret=new-secret',
            );
            expect(result).toEqual({
                secret: 'new-secret',
                qrCodeDataURL: 'data:image/png;base64,qrcode',
            });
        });

        it('lança NotFoundException quando nenhum registro é atualizado', async () => {
            const selectWhere = jest.fn().mockResolvedValue([user]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where: selectWhere }),
            });

            const updateWhere = jest.fn().mockResolvedValue({ rowCount: 0 });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnValue({ where: updateWhere }),
            });

            otpInstance.generateSecret.mockReturnValue('new-secret');
            otpInstance.generateURI.mockReturnValue('otpauth://totp/x');

            await expect(
                authService.generateTwoFactorSecret(user.id),
            ).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('validateTwoFactorAuth', () => {
        it('lança BadRequestException quando o 2FA não está ativado ou sem segredo', async () => {
            const where = jest
                .fn()
                .mockResolvedValue([{ ...user, twoFactorSecret: null }]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            await expect(
                authService.validateTwoFactorAuth(user.id, '123456'),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('lança UnauthorizedException quando o código TOTP é inválido', async () => {
            const where = jest.fn().mockResolvedValue([user]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });
            otpInstance.verify.mockResolvedValue({ valid: false });

            await expect(
                authService.validateTwoFactorAuth(user.id, '000000'),
            ).rejects.toThrow('Código de authenticação inválido');
        });

        it('retorna o accessToken quando o código TOTP é válido', async () => {
            const where = jest.fn().mockResolvedValue([user]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });
            otpInstance.verify.mockResolvedValue({ valid: true });
            jwtService.sign.mockReturnValue('full-access-token');

            const result = await authService.validateTwoFactorAuth(
                user.id,
                '123456',
            );

            expect(otpInstance.verify).toHaveBeenCalledWith({
                token: '123456',
                secret: user.twoFactorSecret,
            });
            expect(jwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, type: 'FULL_AUTH' },
                { expiresIn: '8h' },
            );
            expect(result).toEqual({ accessToken: 'full-access-token' });
        });
    });
});
