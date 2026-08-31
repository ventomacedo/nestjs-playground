import { NotFoundException } from '@nestjs/common';

import { BanksService } from './banks.service';
import { banks } from '../database/schemas/banks.schema';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { UpdateBankRequestDto } from './dto/update-bank-request.dto';

describe('BanksService', () => {
    let banksService: BanksService;
    let db: {
        select: jest.Mock;
        insert: jest.Mock;
        update: jest.Mock;
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
            select: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
        };
        banksService = new BanksService(db as never);
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getBanks', () => {
        it('retorna a lista de instituições financeiras não removidas', async () => {
            const where = jest.fn().mockResolvedValue([bank]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            const result = await banksService.getBanks();

            expect(result).toEqual([bank]);
            expect(where).toHaveBeenCalledWith(expect.anything());
        });

        it('retorna lista vazia quando a consulta falha', async () => {
            const where = jest.fn().mockRejectedValue(new Error('db offline'));
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            const result = await banksService.getBanks();

            expect(result).toEqual([]);
        });
    });

    describe('findBankById', () => {
        it('retorna a instituição encontrada pelo id', async () => {
            const where = jest.fn().mockResolvedValue([bank]);
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            const result = await banksService.findBankById(bank.id);

            expect(result).toEqual([bank]);
        });

        it('retorna lista vazia quando a consulta falha', async () => {
            const where = jest.fn().mockRejectedValue(new Error('db offline'));
            db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({ where }),
            });

            const result = await banksService.findBankById(bank.id);

            expect(result).toEqual([]);
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

        it('cria e retorna a instituição financeira', async () => {
            const returning = jest.fn().mockResolvedValue([bank]);
            const values = jest.fn().mockReturnValue({ returning });
            db.insert.mockReturnValue({ values });

            const result = await banksService.createBank(createDto);

            expect(db.insert).toHaveBeenCalledWith(banks);
            expect(values).toHaveBeenCalledWith({ ...createDto });
            expect(result).toEqual(bank);
        });

        it('propaga o erro quando a inserção falha', async () => {
            const error = new Error('insert failed');
            db.insert.mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(error),
                }),
            });

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

        it('atualiza e retorna a instituição financeira', async () => {
            const returning = jest.fn().mockResolvedValue([bank]);
            const where = jest.fn().mockReturnValue({ returning });
            const set = jest.fn().mockReturnValue({ where });
            db.update.mockReturnValue({ set });

            const result = await banksService.updateBank(updateDto, bank.id);

            expect(set).toHaveBeenCalledWith({ ...updateDto });
            expect(result).toEqual(bank);
        });

        it('lança NotFoundException quando nenhum registro é atualizado', async () => {
            const returning = jest.fn().mockResolvedValue([]);
            db.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({ returning }),
                }),
            });

            await expect(
                banksService.updateBank(updateDto, 'unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propaga o erro quando a atualização falha', async () => {
            const error = new Error('update failed');
            db.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockRejectedValue(error),
                    }),
                }),
            });

            await expect(
                banksService.updateBank(updateDto, bank.id),
            ).rejects.toThrow(error);
        });
    });

    describe('deleteBank', () => {
        it('marca a instituição como removida', async () => {
            const where = jest.fn().mockResolvedValue({ rowCount: 1 });
            const set = jest.fn().mockReturnValue({ where });
            db.update.mockReturnValue({ set });

            await expect(
                banksService.deleteBank(bank.id),
            ).resolves.toBeUndefined();
            expect(set).toHaveBeenCalledWith({
                deletedAt: expect.any(Date) as Date,
            });
        });

        it('lança NotFoundException quando nenhum registro é removido', async () => {
            const where = jest.fn().mockResolvedValue({ rowCount: 0 });
            db.update.mockReturnValue({
                set: jest.fn().mockReturnValue({ where }),
            });

            await expect(
                banksService.deleteBank('unknown-id'),
            ).rejects.toBeInstanceOf(NotFoundException);
        });

        it('propaga o erro quando a remoção falha', async () => {
            const error = new Error('delete failed');
            db.update.mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockRejectedValue(error),
                }),
            });

            await expect(banksService.deleteBank(bank.id)).rejects.toThrow(
                error,
            );
        });
    });
});
