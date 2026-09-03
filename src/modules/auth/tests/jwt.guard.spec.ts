import { AuthGuard } from '@nestjs/passport';
import { JwthGuard } from '../guards/jwt.guard';

describe('JwthGuard', () => {
    it('estende o AuthGuard configurado com a estratégia jwt-full-auth', () => {
        const guard = new JwthGuard();

        expect(guard).toBeInstanceOf(AuthGuard('jwt-full-auth'));
    });
});
