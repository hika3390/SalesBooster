-- CreateEnum
CREATE TYPE "CustomSlideType" AS ENUM ('IMAGE', 'YOUTUBE', 'TEXT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'CUSTOM_SLIDE_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'CUSTOM_SLIDE_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'CUSTOM_SLIDE_DELETE';

-- AlterEnum
ALTER TYPE "DisplayViewType" ADD VALUE 'CUSTOM_SLIDE';

-- AlterTable
ALTER TABLE "DisplayConfigView" ADD COLUMN     "customSlideId" INTEGER;

-- CreateTable
CREATE TABLE "CustomSlide" (
    "id" SERIAL NOT NULL,
    "slideType" "CustomSlideType" NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomSlide_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DisplayConfigView" ADD CONSTRAINT "DisplayConfigView_customSlideId_fkey" FOREIGN KEY ("customSlideId") REFERENCES "CustomSlide"("id") ON DELETE SET NULL ON UPDATE CASCADE;
