import { PrismaService } from '@database';
import { Injectable } from '@nestjs/common';
import { Balance } from '@prisma';

@Injectable()
export class BudgetService {
    constructor(private db: PrismaService) {}

    public async getBalance(id: string): Promise<Balance | null> {
        try {
            const balance = await this.db.balance.findFirst({
                where: { userId: id },
                orderBy: { version: 'desc' },
            });
            return balance;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
