import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { BanksModule } from './banks/banks.module';
import { ClockModule } from './clock/clock.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        AuthModule,
        BanksModule,
        ClockModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
