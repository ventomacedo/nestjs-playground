import { UnauthorizedException } from '@nestjs/common';
import { twoFactorAuthStrategy } from '../strategies/two-factor-auth.strategy';

describe('twoFactorAuthStrategy', () => {
    let strategy: twoFactorAuthStrategy;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        strategy = new twoFactorAuthStrategy();
    });

    describe('validate', () => {
        it('returns the userId when the token is of type PRE_AUTH', async () => {
            const result = await strategy.validate({
                sub: 'user-id',
                type: 'PRE_AUTH',
            });

            expect(result).toEqual({ userId: 'user-id' });
        });

        it('throws UnauthorizedException when the token is not PRE_AUTH', async () => {
            await expect(
                strategy.validate({ sub: 'user-id', type: 'FULL_AUTH' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
