import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBankRequestDto } from './dto/update-bank-request.dto';
import { PrismaService } from '@database';
import { Bank } from '@prisma';
@Injectable()
export class BanksService {
    constructor(private db: PrismaService) {}

    async getBanks(): Promise<Bank[]> {
        try {
            const data = await this.db.bank.findMany();
            return data as Bank[];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async findBankById(id: string): Promise<Bank | null> {
        try {
            const bank = await this.db.bank.findFirst({
                where: { id },
            });
            return bank as Bank;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async createBank(
        data: CreateBankRequestDto,
    ): Promise<CreateBanksResponseDto> {
        try {
            const newBank = await this.db.bank.create({
                data: { ...data },
            });
            return newBank;
        } catch (error) {
            throw error;
        }
    }

    async updateBank(
        data: UpdateBankRequestDto,
        id: string,
    ): Promise<CreateBanksResponseDto> {
        try {
            const updatedBank = await this.db.bank.update({
                where: { id },
                data: { ...data },
            });

            if (!updatedBank?.id)
                throw new NotFoundException(
                    `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
                );

            return updatedBank;
        } catch (error) {
            throw error;
        }
    }

    async deleteBank(id: string): Promise<void> {
        try {
            const result = await this.db.bank.delete({
                where: { id },
                select: { id: true },
            });

            if (!result.id)
                throw new NotFoundException(
                    `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
                );
        } catch (error) {
            throw error;
        }
    }
}
