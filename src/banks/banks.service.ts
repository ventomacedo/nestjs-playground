import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE_PROVIDER } from 'src/database/database.provider';
import * as schemas from '../database/schemas/banks.schema';
import { and, eq, isNull } from 'drizzle-orm';
import { CreateBankRequestDto } from './dto/create-bank-request.dto';
import { CreateBanksResponseDto } from './dto/create-bank-response.dto';
import { UpdateBankRequestDto } from './dto/update-bank-request.dto';

@Injectable()
export class BanksService {
    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: NodePgDatabase<typeof schemas>,
    ) {}

    async getBanks(): Promise<schemas.TBanks[]> {
        try {
            return await this.db
                .select()
                .from(schemas.banks)
                .where(isNull(schemas.banks.deletedAt));
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async findBankById(id: string): Promise<schemas.TBanks[]> {
        try {
            return await this.db
                .select()
                .from(schemas.banks)
                .where(
                    and(
                        eq(schemas.banks.id, id),
                        isNull(schemas.banks.deletedAt),
                    ),
                );
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createBank(
        data: CreateBankRequestDto,
    ): Promise<CreateBanksResponseDto> {
        try {
            const [newBank] = await this.db
                .insert(schemas.banks)
                .values({ ...data })
                .returning();
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
            const [updatedBank] = await this.db
                .update(schemas.banks)
                .set({ ...data })
                .where(eq(schemas.banks.id, id))
                .returning();

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
            const result = await this.db
                .update(schemas.banks)
                .set({ deletedAt: new Date() })
                .where(eq(schemas.banks.id, id));

            if (result.rowCount === 0)
                throw new NotFoundException(
                    `Nenhum registro encontrado com o ID ${id} ou nada foi alterado.`,
                );
        } catch (error) {
            throw error;
        }
    }
}
