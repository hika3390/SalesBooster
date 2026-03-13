-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('MAN_YEN', 'SEN_YEN', 'YEN', 'KEN', 'HOUR', 'MIN', 'PIECE', 'TIME', 'PERSON');

-- AlterTable: convert existing string values to enum
-- Step 1: Add a temporary column with the new enum type
ALTER TABLE "DataType" ADD COLUMN "unit_new" "Unit" NOT NULL DEFAULT 'MAN_YEN';

-- Step 2: Migrate existing string values to enum values
UPDATE "DataType" SET "unit_new" = CASE "unit"
    WHEN '万円' THEN 'MAN_YEN'::"Unit"
    WHEN '千円' THEN 'SEN_YEN'::"Unit"
    WHEN '円' THEN 'YEN'::"Unit"
    WHEN '件' THEN 'KEN'::"Unit"
    WHEN '時間' THEN 'HOUR'::"Unit"
    WHEN '分' THEN 'MIN'::"Unit"
    WHEN '個' THEN 'PIECE'::"Unit"
    WHEN '回' THEN 'TIME'::"Unit"
    WHEN '人' THEN 'PERSON'::"Unit"
    ELSE 'MAN_YEN'::"Unit"
END;

-- Step 3: Drop old column and rename new one
ALTER TABLE "DataType" DROP COLUMN "unit";
ALTER TABLE "DataType" RENAME COLUMN "unit_new" TO "unit";
