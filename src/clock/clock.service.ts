import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ClockService {
    public getTime(): number {
        return Date.now();
    }

    public getTimezone(): string {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}
