import { Module } from "@nestjs/common";
import { ClockController } from "./clock.controller";
import { ClockService } from "./clock.service";

@Module({
    imports: [],
    controllers: [ClockController],
    providers: [ClockService],
    exports: []
})

export class ClockModule {}