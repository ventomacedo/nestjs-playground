import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        strategy = new JwtStrategy();
    });

    describe('validate', () => {
        it('returns the userId when the token is of type FULL_AUTH', async () => {
            const result = await strategy.validate({
                sub: 'user-id',
                type: 'FULL_AUTH',
            });

            expect(result).toEqual({ userId: 'user-id' });
        });

        it('throws UnauthorizedException when the token is not FULL_AUTH', async () => {
            await expect(
                strategy.validate({ sub: 'user-id', type: 'PRE_AUTH' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
