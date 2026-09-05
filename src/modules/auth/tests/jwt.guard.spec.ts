import { AuthGuard } from '@nestjs/passport';
import { JwthGuard } from '../guards/jwt.guard';

describe('JwthGuard', () => {
    it('extends AuthGuard configured with the jwt-full-auth strategy', () => {
        const guard = new JwthGuard();

        expect(guard).toBeInstanceOf(AuthGuard('jwt-full-auth'));
    });
});
