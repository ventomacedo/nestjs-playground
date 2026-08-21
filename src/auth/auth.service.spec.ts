import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { users } from '../database/schemas/user.schema';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

describe('AuthService.login', () => {
    let authService: AuthService;
    let db: {
        select: jest.Mock;
    };
    let jwtService: {
        signAsync: jest.Mock;
    };
    const compareMock = bcrypt.compare as jest.Mock;

    const user = {
        id: 'user-id',
        email: 'user@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        deletedAt: null,
    };

    beforeEach(() => {
        compareMock.mockReset();
        db = {
            select: jest.fn(),
        };
        jwtService = {
            signAsync: jest.fn(),
        };
        authService = new AuthService(db as never, jwtService as unknown as JwtService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('retorna um token quando as credenciais são válidas', async () => {
        const where = jest.fn().mockResolvedValue([user]);
        const from = jest.fn().mockReturnValue({ where });
        db.select.mockReturnValue({ from });
        compareMock.mockResolvedValue(true);
        jwtService.signAsync.mockResolvedValue('access-token');

        const result = await authService.login(user.email, 'plain-password');

        expect(result).toEqual({ accessToken: 'access-token' });
        expect(compareMock).toHaveBeenCalledWith('plain-password', user.password);
        expect(jwtService.signAsync).toHaveBeenCalledWith({
            sub: user.id,
            email: user.email,
        });
        expect(db.select).toHaveBeenCalledWith();
        expect(from).toHaveBeenCalledWith(users);
        expect(where).toHaveBeenCalledWith(expect.anything());
    });

    it('lança UnauthorizedException quando o usuário não existe', async () => {
        const where = jest.fn().mockResolvedValue([]);
        db.select.mockReturnValue({
            from: jest.fn().mockReturnValue({ where }),
        });

        const loginPromise = authService.login('unknown@example.com', 'plain-password');

        await expect(loginPromise).rejects.toBeInstanceOf(UnauthorizedException);
        await expect(loginPromise).rejects.toThrow('Usuário ou senha inválidos.');
        expect(compareMock).not.toHaveBeenCalled();
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedException quando a senha é inválida', async () => {
        const where = jest.fn().mockResolvedValue([user]);
        db.select.mockReturnValue({
            from: jest.fn().mockReturnValue({ where }),
        });
        compareMock.mockResolvedValue(false);

        await expect(authService.login(user.email, 'wrong-password'))
            .rejects.toThrow('Usuário ou senha inválidos.');
        expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
});
