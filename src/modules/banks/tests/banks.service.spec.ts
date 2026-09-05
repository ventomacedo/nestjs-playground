import { NotFoundException } from '@nestjs/common';

import { BanksService } from '../banks.service';
import { CreateBankRequestDto } from '../dto/create-bank-request.dto';
import { UpdateBankRequestDto } from '../dto/update-bank-request.dto';

describe('BanksService', () => {
    let banksService: BanksService;
    let db: {
        bank: {
            findMany: jest.Mock;
            findFirst: jest.Mock;
            create: jest.Mock;
            update: jest.Mock;
            delete: jest.Mock;
        };
    };

    const bank = {
        id: 'bank-id',
        taxId: '11222333000181',
        name: 'Monopoly Bank',
        fantasyName: 'Banco imobiliário',
        ispb: '001',
        compeCode: '00000001',
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
    };

    beforeEach(() => {
        db = {
            bank: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        banksService = new BanksService(db as never);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getBanks', () => {
        it('returns the list of financial institutions', async () => {
            db.bank.findMany.mockResolvedValue([bank]);

            const result = await banksService.getBanks();

            expect(db.bank.findMany).toHaveBeenCalledWith();
            expect(result).toEqual([bank]);
        });

        it('returns an empty list when the query fails', async () => {
            db.bank.findMany.mockRejectedValue(new Error('db offline'));

            const result = await banksService.getBanks();

            expect(result).toEqual([]);
        });
    });

    describe('findBankById', () => {
        it('returns the institution found by id', async () => {
            db.bank.findFirst.mockResolvedValue(bank);

            const result = await banksService.findBankById(bank.id);

            expect(db.bank.findFirst).toHaveBeenCalledWith({
                where: { id: bank.id },
            });
            expect(result).toEqual(bank);
        });

        it('returns null when the query fails', async () => {
            db.bank.findFirst.mockRejectedValue(new Error('db offline'));

            const result = await banksService.findBankById(bank.id);

            expect(result).toBeNull();
        });
    });

    describe('createBank', () => {
        const createDto: CreateBankRequestDto = {
            taxId: bank.taxId,
            name: bank.name,
            fantasyName: bank.fantasyName,
            ispb: bank.ispb,
            compeCode: bank.compeCode,
        };

        it('creates and returns the financial institution', async () => {
            db.bank.create.mockResolvedValue(bank);

            const result = await banksService.createBank(createDto);

            expect(db.bank.create).toHaveBeenCalledWith({
                data: { ...createDto },
            });
            expect(result).toEqual(bank);
        });

        it('propagates the error when creation fails', async () => {
            const error = new Error('create failed');
            db.bank.create.mockRejectedValue(error);

            await expect(banksService.createBank(createDto)).rejects.toThrow(
                error,
            );
        });
    });

    describe('updateBank', () => {
        const updateDto: UpdateBankRequestDto = {
            taxId: bank.taxId,
            name: bank.name,
            fantasyName: bank.fantasyName,
            ispb: bank.ispb,
            compeCode: bank.compeCode,
        };

        it('updates and returns the financial institution', async () => {
            db.bank.update.mockResolvedValue(bank);

            const result = await banksService.updateBank(updateDto, bank.id);

            expect(db.bank.update).toHaveBeenCalledWith({
                where: { id: bank.id },
                data: { ...updateDto },
            });
            expect(result).toEqual(bank);
        });

        it('throws NotFoundException when no record is updated', async () => {
            db.bank.update.mockResolvedValue(null);

            await expect(
                banksService.updateBank(updateDto, 'unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propagates the error when the update fails', async () => {
            const error = new Error('update failed');
            db.bank.update.mockRejectedValue(error);

            await expect(
                banksService.updateBank(updateDto, bank.id),
            ).rejects.toThrow(error);
        });
    });

    describe('deleteBank', () => {
        it('removes the financial institution', async () => {
            db.bank.delete.mockResolvedValue({ id: bank.id });

            await expect(
                banksService.deleteBank(bank.id),
            ).resolves.toBeUndefined();
            expect(db.bank.delete).toHaveBeenCalledWith({
                where: { id: bank.id },
                select: { id: true },
            });
        });

        it('throws NotFoundException when no record is removed', async () => {
            db.bank.delete.mockResolvedValue({ id: undefined });

            await expect(
                banksService.deleteBank('unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propagates the error when removal fails', async () => {
            const error = new Error('delete failed');
            db.bank.delete.mockRejectedValue(error);

            await expect(banksService.deleteBank(bank.id)).rejects.toThrow(
                error,
            );
        });
    });
});
