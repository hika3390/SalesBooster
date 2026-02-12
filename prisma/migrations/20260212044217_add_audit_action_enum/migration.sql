/*
  Warnings:

  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DisplayTransition" AS ENUM ('NONE', 'FADE', 'SLIDE_LEFT', 'SLIDE_RIGHT');

-- CreateEnum
CREATE TYPE "DisplayViewType" AS ENUM ('PERIOD_GRAPH', 'CUMULATIVE_GRAPH', 'TREND_GRAPH', 'REPORT', 'RECORD');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'MEMBER_CREATE', 'MEMBER_UPDATE', 'MEMBER_DELETE', 'GROUP_CREATE', 'GROUP_UPDATE', 'GROUP_DELETE', 'GROUP_SYNC_MEMBERS', 'SALES_RECORD_CREATE', 'TARGET_UPSERT', 'SETTINGS_UPDATE', 'INTEGRATION_STATUS_UPDATE', 'DISPLAY_CONFIG_UPDATE');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL;

-- CreateTable
CREATE TABLE "DisplayConfig" (
    "id" SERIAL NOT NULL,
    "loop" BOOLEAN NOT NULL DEFAULT true,
    "dataRefreshInterval" INTEGER NOT NULL DEFAULT 60000,
    "filterGroupId" TEXT NOT NULL DEFAULT '',
    "filterMemberId" TEXT NOT NULL DEFAULT '',
    "transition" "DisplayTransition" NOT NULL DEFAULT 'NONE',
    "companyLogoUrl" TEXT NOT NULL DEFAULT '',
    "teamName" TEXT NOT NULL DEFAULT '',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisplayConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisplayConfigView" (
    "id" SERIAL NOT NULL,
    "displayConfigId" INTEGER NOT NULL,
    "viewType" "DisplayViewType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DisplayConfigView_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisplayConfigView" ADD CONSTRAINT "DisplayConfigView_displayConfigId_fkey" FOREIGN KEY ("displayConfigId") REFERENCES "DisplayConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
