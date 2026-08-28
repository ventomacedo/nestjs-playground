import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", { mode: 'date' }),

  // Novos campos para 2FA
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(true).notNull(),
  isFirstAccess: boolean("is_first_access").default(true).notNull()
});

export type TUser = typeof users.$inferSelect;
export type TNewUser = typeof users.$inferInsert;