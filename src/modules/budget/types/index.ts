import { Type } from '@prisma';

export type UpdateLedger = {
    userId: string;
    type: Type;
    orderId: string;
    reserveId: string;
    amount: number;
};
