import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';
import * as schemas from './schemas';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';
export const databaseProviders = [
    {
        provide: DRIZZLE_PROVIDER,
        useFactory: async () => {
            const pool = new Pool({ connectionString: process.env.DATABASE_URL });
            return drizzle(pool, { schema: schemas });
        }
    }
];