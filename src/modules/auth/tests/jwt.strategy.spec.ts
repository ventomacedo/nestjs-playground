import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        strategy = new JwtStrategy();
    });

    describe('validate', () => {
        it('retorna o userId quando o token é do tipo FULL_AUTH', async () => {
            const result = await strategy.validate({
                sub: 'user-id',
                type: 'FULL_AUTH',
            });

            expect(result).toEqual({ userId: 'user-id' });
        });

        it('lança UnauthorizedException quando o token não é FULL_AUTH', async () => {
            await expect(
                strategy.validate({ sub: 'user-id', type: 'PRE_AUTH' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
