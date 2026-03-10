-- CreateEnum
CREATE TYPE "DataValueType" AS ENUM ('NUMBER', 'TEXT', 'TIME');

-- CreateTable
CREATE TABLE "DataType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "valueType" "DataValueType" NOT NULL DEFAULT 'NUMBER',
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataType_tenantId_idx" ON "DataType"("tenantId");

-- AddForeignKey
ALTER TABLE "DataType" ADD CONSTRAINT "DataType_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: SalesRecord - add value and dataTypeId
ALTER TABLE "SalesRecord" ADD COLUMN "value" TEXT NOT NULL DEFAULT '0';
ALTER TABLE "SalesRecord" ADD COLUMN "dataTypeId" INTEGER;

-- CreateIndex
CREATE INDEX "SalesRecord_dataTypeId_idx" ON "SalesRecord"("dataTypeId");

-- AddForeignKey
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_dataTypeId_fkey" FOREIGN KEY ("dataTypeId") REFERENCES "DataType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Target - add dataTypeId
ALTER TABLE "Target" ADD COLUMN "dataTypeId" INTEGER;

-- CreateIndex
CREATE INDEX "Target_dataTypeId_idx" ON "Target"("dataTypeId");

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_dataTypeId_fkey" FOREIGN KEY ("dataTypeId") REFERENCES "DataType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old unique index and create new one with dataTypeId
DROP INDEX "Target_tenantId_memberId_year_month_key";
CREATE UNIQUE INDEX "Target_tenantId_memberId_year_month_dataTypeId_key" ON "Target"("tenantId", "memberId", "year", "month", "dataTypeId");

-- Add AuditAction enum values
ALTER TYPE "AuditAction" ADD VALUE 'DATA_TYPE_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'DATA_TYPE_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'DATA_TYPE_DELETE';

-- Seed: Create default DataType for each existing tenant and link existing records
DO $$
DECLARE
    t RECORD;
    dt_id INTEGER;
BEGIN
    FOR t IN SELECT id FROM "Tenant" LOOP
        INSERT INTO "DataType" ("name", "unit", "valueType", "isActive", "isDefault", "tenantId", "updatedAt")
        VALUES ('売上', '円', 'NUMBER', true, true, t.id, NOW())
        RETURNING id INTO dt_id;

        -- Link existing SalesRecords to default DataType
        UPDATE "SalesRecord" SET "dataTypeId" = dt_id, "value" = CAST("amount" AS TEXT) WHERE "tenantId" = t.id AND "dataTypeId" IS NULL;

        -- Link existing Targets to default DataType
        UPDATE "Target" SET "dataTypeId" = dt_id WHERE "tenantId" = t.id AND "dataTypeId" IS NULL;
    END LOOP;
END $$;
