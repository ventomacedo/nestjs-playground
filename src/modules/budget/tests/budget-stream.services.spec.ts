import { BudgetService } from '../budget.service';
import { PrismaService } from '@database';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';

let notificationHandler: (msg: { channel: string; payload: string }) => void;

const pgClientMock = {
    connect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue(undefined),
    on: jest.fn((event: string, cb: typeof notificationHandler) => {
        if (event === 'notification') notificationHandler = cb;
    }),
    end: jest.fn().mockResolvedValue(undefined),
};

jest.mock('pg', () => ({
    ...jest.requireActual('pg'),
    Client: jest.fn().mockImplementation(() => pgClientMock),
}));

describe('Stream: Budget', () => {
    let service: BudgetService;
    let prismaMock: DeepMockProxy<PrismaService>;

    beforeAll(() => {
        process.env.DATABASE_URL =
            'postgresql://user:pass@localhost:5432/test_db';
    });

    beforeEach(async () => {
        prismaMock = mockDeep<PrismaService>();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetService,
                {
                    provide: PrismaService,
                    useValue: prismaMock,
                },
            ],
        }).compile();

        service = module.get<BudgetService>(BudgetService);
    });

    it('Should return event form tigger from database', async () => {
        await service.onModuleInit();

        expect(pgClientMock.connect).toHaveBeenCalledTimes(1);
        expect(pgClientMock.query).toHaveBeenCalledWith(
            'LISTEN balance_updates',
        );

        const mockPayload = {
            id: 1,
            data: {
                user_id: '01a025b8-e5f5-75c4-acd8-76bf78a25ee2',
                available: 9000000,
                locked: 1000000,
                version: 2,
                updated_at: '2026-09-05T02:26:45.361',
            },
        };

        const eventPromise = firstValueFrom(service.getNotificationStream());
        notificationHandler({
            channel: 'balance_updates',
            payload: JSON.stringify(mockPayload),
        });

        const result = await eventPromise;
        expect(result).toEqual(mockPayload);
    });
});
