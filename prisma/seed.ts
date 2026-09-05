import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client } from 'pg';

async function main() {
    const sql = readFileSync(
        join(__dirname, 'seeds', 'banks.seed.sql'),
        'utf-8',
    );
    const client = new Client({ connectionString: process.env.DATABASE_URL });

    await client.connect();
    try {
        await client.query(sql);
        console.log('Seed de banks aplicado com sucesso.');
    } finally {
        await client.end();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
