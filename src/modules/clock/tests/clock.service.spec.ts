import { ClockService } from '../clock.service';

describe('ClockService', () => {
    let clockService: ClockService;

    beforeEach(() => {
        clockService = new ClockService();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getTime', () => {
        it('returns the current timestamp', () => {
            jest.spyOn(Date, 'now').mockReturnValue(1788184216055);

            expect(clockService.getTime()).toBe(1788184216055);
        });
    });

    describe('getTimezone', () => {
        it('returns the timezone resolved by Intl', () => {
            const expected = Intl.DateTimeFormat().resolvedOptions().timeZone;

            expect(clockService.getTimezone()).toBe(expected);
        });
    });
});
