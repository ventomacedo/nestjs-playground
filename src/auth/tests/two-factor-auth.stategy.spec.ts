import { UnauthorizedException } from '@nestjs/common';
import { twoFactorAuthStrategy } from '../two-factor-auth.stategy';

describe('twoFactorAuthStrategy', () => {
    let strategy: twoFactorAuthStrategy;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        strategy = new twoFactorAuthStrategy();
    });

    describe('validate', () => {
        it('retorna o userId quando o token é do tipo PRE_AUTH', async () => {
            const result = await strategy.validate({
                sub: 'user-id',
                type: 'PRE_AUTH',
            });

            expect(result).toEqual({ userId: 'user-id' });
        });

        it('lança UnauthorizedException quando o token não é PRE_AUTH', async () => {
            await expect(
                strategy.validate({ sub: 'user-id', type: 'FULL_AUTH' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
