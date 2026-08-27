import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';

export const banks = pgTable("banks", {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    taxId: varchar("tax_id", { length: 14 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    fantasyName: varchar("fantasy_name", { length: 255 }).notNull(),
    ispb: varchar("ispb", { length: 10 }),
    compeCode: varchar("compe_code", { length: 100 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at"),
    deletedAt: timestamp("deleted_at")
});

export type TBanks = typeof banks.$inferSelect;
export type TNewBank = typeof banks.$inferInsert;