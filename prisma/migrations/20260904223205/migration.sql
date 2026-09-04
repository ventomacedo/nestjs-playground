-- CreateEnum
CREATE TYPE "Type" AS ENUM ('CREDITED', 'WITHDRAW', 'RESERVED', 'REFUNDED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_first_access" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "two_factor_secret" VARCHAR(255),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "balance" (
    "user_id" UUID NOT NULL,
    "available" INTEGER NOT NULL,
    "locked" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "balance_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "banks" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "tax_id" VARCHAR(14) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "fantasy_name" VARCHAR(255) NOT NULL,
    "ispb" VARCHAR(10),
    "compe_code" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'RESERVED',
    "order_id" TEXT NOT NULL,
    "reserve_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "balance" ADD CONSTRAINT "balance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger" ADD CONSTRAINT "ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
