import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

export class RedisService implements OnModuleInit, OnModuleDestroy {
    constructor(private client: Redis) {}

    onModuleInit() {
        try {
            this.client = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT || 6379),
            });
        } catch (error) {
            throw error;
        }
    }

    onModuleDestroy() {
        this.client.quit();
    }

    public async set(
        key: string,
        value: string,
        ttlSeconds: number,
    ): Promise<string | null> {
        if (ttlSeconds) {
            return await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
        } else {
            return await this.client.set(key, value);
        }
    }

    public async upsert(key: string, value: string, ttleSeconds: number) {
        return await this.client.set(key, value, 'EX', ttleSeconds);
    }

    public async get(key: string): Promise<string | null> {
        return await this.client.get(key);
    }

    public async del(key: string): Promise<number> {
        return await this.client.del(key);
    }
}
