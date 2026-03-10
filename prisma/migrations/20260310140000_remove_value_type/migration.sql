-- AlterTable: Remove valueType column from DataType
ALTER TABLE "DataType" DROP COLUMN "valueType";

-- DropEnum
DROP TYPE "DataValueType";

-- AlterTable: Change SalesRecord.value from String to Int
ALTER TABLE "SalesRecord" ALTER COLUMN "value" SET DEFAULT 0;
ALTER TABLE "SalesRecord" ALTER COLUMN "value" TYPE INTEGER USING "value"::INTEGER;
