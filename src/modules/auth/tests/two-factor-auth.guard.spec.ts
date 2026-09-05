import { AuthGuard } from '@nestjs/passport';
import { twoFactorAuthGuard } from '../guards/two-factor-auth.guard';

describe('twoFactorAuthGuard', () => {
    it('extends AuthGuard configured with the jwt-pre-auth strategy', () => {
        const guard = new twoFactorAuthGuard();

        expect(guard).toBeInstanceOf(AuthGuard('jwt-pre-auth'));
    });
});
