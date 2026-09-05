jest.mock('otplib', () => ({
    OTP: jest.fn().mockImplementation(() => ({
        generateSecret: jest.fn(),
        generateURI: jest.fn(),
        verify: jest.fn(),
    })),
}));

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { SigninRequestDto } from '../dto/signin-request.dto';
import { TwoFactorAuthRequest } from '../dto/two-factor-auth-request.dto';

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
        it('delegates to AuthService.login with email and password from the body', async () => {
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
        it('delegates to AuthService.validateTwoFactorAuth with the userId from the request and the code from the body', async () => {
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
        it('delegates to AuthService.generateTwoFactorSecret with the userId from the request', async () => {
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
