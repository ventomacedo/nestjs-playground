import { AuthGuard } from '@nestjs/passport';
import { twoFactorAuthGuard } from './two-factor-auth.guard';

describe('twoFactorAuthGuard', () => {
    it('estende o AuthGuard configurado com a estratégia jwt-pre-auth', () => {
        const guard = new twoFactorAuthGuard();

        expect(guard).toBeInstanceOf(AuthGuard('jwt-pre-auth'));
    });
});
