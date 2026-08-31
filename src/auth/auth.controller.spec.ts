jest.mock('otplib', () => ({
    OTP: jest.fn().mockImplementation(() => ({
        generateSecret: jest.fn(),
        generateURI: jest.fn(),
        verify: jest.fn(),
    })),
}));

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninRequestDto } from './dto/signin-request.dto';
import { TwoFactorAuthRequest } from './dto/two-factor-auth-request.dto';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: {
        login: jest.Mock;
        validateTwoFactorAuth: jest.Mock;
        generateTwoFactorSecret: jest.Mock;
    };

    beforeEach(() => {
        authService = {
            login: jest.fn(),
            validateTwoFactorAuth: jest.fn(),
            generateTwoFactorSecret: jest.fn(),
        };
        authController = new AuthController(
            authService as unknown as AuthService,
        );
    });

    describe('signin', () => {
        it('delega para AuthService.login com email e senha do body', async () => {
            const body: SigninRequestDto = {
                email: 'user@example.com',
                password: 'plain-password',
            };
            const expected = {
                authChallenge: 'MFA_VALIDATE',
                twoFactorAuthToken: 'pre-auth-token',
            };
            authService.login.mockResolvedValue(expected);

            const result = await authController.signin(body);

            expect(authService.login).toHaveBeenCalledWith(
                body.email,
                body.password,
            );
            expect(result).toBe(expected);
        });
    });

    describe('verifyTwoFactorAuthentication', () => {
        it('delega para AuthService.validateTwoFactorAuth com o userId do request e o código do body', async () => {
            const req = { user: { userId: 'user-id' } } as never;
            const body: TwoFactorAuthRequest = { code: '123456' };
            const expected = { accessToken: 'full-access-token' };
            authService.validateTwoFactorAuth.mockResolvedValue(expected);

            const result = await authController.verifyTwoFactorAuthentication(
                req,
                body,
            );

            expect(authService.validateTwoFactorAuth).toHaveBeenCalledWith(
                'user-id',
                '123456',
            );
            expect(result).toBe(expected);
        });
    });

    describe('syncAppAuthenticator', () => {
        it('delega para AuthService.generateTwoFactorSecret com o userId do request', async () => {
            const req = { user: { userId: 'user-id' } } as never;
            const expected = {
                secret: 'new-secret',
                qrCodeDataURL: 'data:image/png;base64,qrcode',
            };
            authService.generateTwoFactorSecret.mockResolvedValue(expected);

            const result = await authController.syncAppAuthenticator(req);

            expect(authService.generateTwoFactorSecret).toHaveBeenCalledWith(
                'user-id',
            );
            expect(result).toBe(expected);
        });
    });
});
