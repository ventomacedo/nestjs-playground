import { AppService } from './app.service';

describe('AppService', () => {
    let appService: AppService;

    beforeEach(() => {
        appService = new AppService();
    });

    describe('getHello', () => {
        it('retorna a mensagem de saudação', () => {
            expect(appService.getHello()).toBe('Hello World!');
        });
    });
});
