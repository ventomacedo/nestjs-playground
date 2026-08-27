import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE_PROVIDER } from "src/database/database.provider";
import * as schemas from "../database/schemas/banks.schema";
import { eq } from "drizzle-orm";

@Injectable()
export class BanksService {

    constructor(
        @Inject(DRIZZLE_PROVIDER)
        private db: NodePgDatabase<typeof schemas>
    ){}

    async getBanks() {
        try {
            return await this.db.select().from(schemas.banks);
        } catch (error) {
            throw error;
        }
    }

    async findBankById(id: string) {
        return await this.db.select().from(schemas.banks).where(eq(schemas.banks.id, id));
    }
}