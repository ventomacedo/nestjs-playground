import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [BanksController],
    providers: [BanksService],
    exports: [],
})
export class BanksModule {}
