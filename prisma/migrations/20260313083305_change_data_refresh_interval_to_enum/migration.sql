/*
  Warnings:

  - The `dataRefreshInterval` column on the `DisplayConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DataRefreshInterval" AS ENUM ('SECONDS_10', 'SECONDS_30', 'MINUTES_1', 'MINUTES_5', 'MINUTES_15', 'MINUTES_30');

-- AlterTable
ALTER TABLE "DisplayConfig" DROP COLUMN "dataRefreshInterval",
ADD COLUMN     "dataRefreshInterval" "DataRefreshInterval" NOT NULL DEFAULT 'SECONDS_10';
