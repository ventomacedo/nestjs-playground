import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { ClockController } from '../clock.controller';

describe('ClockController', () => {
    let clockController: ClockController;
    let clockService: {
        getTimezone: jest.Mock;
        getTime: jest.Mock;
    };

    beforeEach(() => {
        jest.useFakeTimers();
        clockService = {
            getTimezone: jest.fn().mockReturnValue('America/Sao_Paulo'),
            getTime: jest.fn().mockReturnValue(1788184216055),
        };
        clockController = new ClockController(clockService);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('getTime', () => {
        it('emits timezone and timestamp every second', async () => {
            const resultPromise = firstValueFrom(
                clockController.getTime().pipe(take(1)),
            );
            jest.advanceTimersByTime(1000);

            const result = await resultPromise;

            expect(result).toEqual({
                data: {
                    timezone: 'America/Sao_Paulo',
                    timestamp: 1788184216055,
                },
            });
        });
    });
});
