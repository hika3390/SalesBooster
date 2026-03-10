-- AlterTable: Remove the legacy "amount" column from SalesRecord
-- Data has already been migrated to the "value" (String) column in the previous migration

ALTER TABLE "SalesRecord" DROP COLUMN "amount";
