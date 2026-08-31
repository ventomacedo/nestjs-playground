import { Controller, Sse, UseGuards } from "@nestjs/common";
import { finalize, interval, map, Observable } from "rxjs";
import { JwthGuard } from "src/auth/jwt.guard";
import { GetTimeResponseDto } from "./dto/get-time-response.dto";
import { ClockService } from "./clock.service";

@Controller('clock')
export class ClockController {
    constructor(private clockService: ClockService){}
   
    @UseGuards(JwthGuard)
    @Sse('/')
    public getTime(): Observable<{ data: GetTimeResponseDto }> {
        return interval(1000).pipe(
            map(() => ({ data: { timezone: this.clockService.getTimezone(), timestamp: this.clockService.getTime() }})),
            finalize(() => console.log('Client desconnected'))
        );
    }
    
}