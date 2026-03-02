-- CreateEnum: UserRole に SUPER_ADMIN を追加
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN' BEFORE 'ADMIN';

-- AuditAction に TENANT 系アクションを追加
ALTER TYPE "AuditAction" ADD VALUE 'TENANT_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'TENANT_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'TENANT_DELETE';

-- CreateTable: Tenant
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Tenant slug unique
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- Insert default tenant
INSERT INTO "Tenant" ("id", "name", "slug", "isActive", "createdAt", "updatedAt")
VALUES (1, 'デフォルト', 'default', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Reset sequence for Tenant
SELECT setval('"Tenant_id_seq"', 1, true);

-- ─── Add tenantId to all tables with DEFAULT 1 for existing data ───

-- User (nullable for SUPER_ADMIN)
ALTER TABLE "User" ADD COLUMN "tenantId" INTEGER DEFAULT 1;
UPDATE "User" SET "tenantId" = 1 WHERE "tenantId" IS NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Department
ALTER TABLE "Department" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Member
ALTER TABLE "Member" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Member" ADD CONSTRAINT "Member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Group
ALTER TABLE "Group" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- GroupMember
ALTER TABLE "GroupMember" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SalesRecord
ALTER TABLE "SalesRecord" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Target
ALTER TABLE "Target" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Target" ADD CONSTRAINT "Target_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SystemSetting
ALTER TABLE "SystemSetting" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Integration
ALTER TABLE "Integration" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DisplayConfig
ALTER TABLE "DisplayConfig" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "DisplayConfig" ADD CONSTRAINT "DisplayConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CustomSlide
ALTER TABLE "CustomSlide" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "CustomSlide" ADD CONSTRAINT "CustomSlide_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CustomField
ALTER TABLE "CustomField" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "CustomField" ADD CONSTRAINT "CustomField_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AuditLog
ALTER TABLE "AuditLog" ADD COLUMN "tenantId" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Update unique constraints ───

-- Member: email unique → (tenantId, email) unique
DROP INDEX "Member_email_key";
CREATE UNIQUE INDEX "Member_tenantId_email_key" ON "Member"("tenantId", "email");

-- SystemSetting: key unique → (tenantId, key) unique
DROP INDEX "SystemSetting_key_key";
CREATE UNIQUE INDEX "SystemSetting_tenantId_key_key" ON "SystemSetting"("tenantId", "key");

-- Target: (memberId, year, month) unique → (tenantId, memberId, year, month) unique
DROP INDEX "Target_memberId_year_month_key";
CREATE UNIQUE INDEX "Target_tenantId_memberId_year_month_key" ON "Target"("tenantId", "memberId", "year", "month");

-- ─── Add indexes for performance ───

CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "Department_tenantId_idx" ON "Department"("tenantId");
CREATE INDEX "Member_tenantId_idx" ON "Member"("tenantId");
CREATE INDEX "Group_tenantId_idx" ON "Group"("tenantId");
CREATE INDEX "GroupMember_tenantId_idx" ON "GroupMember"("tenantId");
CREATE INDEX "SalesRecord_tenantId_idx" ON "SalesRecord"("tenantId");
CREATE INDEX "Target_tenantId_idx" ON "Target"("tenantId");
CREATE INDEX "SystemSetting_tenantId_idx" ON "SystemSetting"("tenantId");
CREATE INDEX "Integration_tenantId_idx" ON "Integration"("tenantId");
CREATE INDEX "DisplayConfig_tenantId_idx" ON "DisplayConfig"("tenantId");
CREATE INDEX "CustomSlide_tenantId_idx" ON "CustomSlide"("tenantId");
CREATE INDEX "CustomField_tenantId_idx" ON "CustomField"("tenantId");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- ─── Remove DEFAULT 1 from columns (no longer needed after migration) ───

ALTER TABLE "Department" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Member" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Group" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "GroupMember" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "SalesRecord" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Target" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "SystemSetting" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "Integration" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "DisplayConfig" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "CustomSlide" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "CustomField" ALTER COLUMN "tenantId" DROP DEFAULT;
ALTER TABLE "AuditLog" ALTER COLUMN "tenantId" DROP DEFAULT;
