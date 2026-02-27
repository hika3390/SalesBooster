/*
  Warnings:

  - Changed the type of `fieldType` on the `CustomField` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'DATE', 'SELECT');

-- AlterTable
ALTER TABLE "CustomField" DROP COLUMN "fieldType",
ADD COLUMN     "fieldType" "CustomFieldType" NOT NULL;
