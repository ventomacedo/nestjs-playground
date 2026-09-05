import { AppController } from './app.controller';

describe('AppController', () => {
    let appController: AppController;
    let appService: { getHello: jest.Mock };

    beforeEach(() => {
        appService = {
            getHello: jest.fn(),
        };
        appController = new AppController(appService);
    });

    describe('getHello', () => {
        it('returns the value produced by AppService', () => {
            appService.getHello.mockReturnValue('Hello World!');

            const result = appController.getHello();

            expect(result).toBe('Hello World!');
            expect(appService.getHello).toHaveBeenCalledWith();
        });
    });
});
