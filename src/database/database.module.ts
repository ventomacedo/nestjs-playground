import { Module, Global } from '@nestjs/common';
import { databaseProviders, DRIZZLE_PROVIDER } from './database.provider';

@Global()
@Module({
    providers: [...databaseProviders],
    exports: [DRIZZLE_PROVIDER],
})
export class DatabaseModule {}
