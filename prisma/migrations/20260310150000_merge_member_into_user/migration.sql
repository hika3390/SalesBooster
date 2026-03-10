-- =============================================================
-- Migration: Merge Member table into User table
-- Member (Int PK) → User (String PK) に統合
-- =============================================================

-- 1. User テーブルに新カラム追加
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "departmentId" INTEGER;

-- UserStatus enum を作成
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus" USING "status"::"UserStatus";
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"UserStatus";

-- User に department FK 追加
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- User に tenantId+email のユニーク制約追加（NULLのtenantIdは除外されるので問題なし）
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_email_key" UNIQUE ("tenantId", "email");

-- 2. Member のデータを User に移行
-- Member ごとに User レコードを作成（パスワードは仮のハッシュ、後で管理者が再設定）
INSERT INTO "User" ("id", "email", "password", "name", "role", "status", "imageUrl", "departmentId", "tenantId", "createdAt", "updatedAt")
SELECT
  -- cuid 的なユニークIDを生成
  'migrated_' || m."id"::TEXT,
  -- email がすでに User に存在する場合は member_{id}_ プレフィックスを付与
  CASE
    WHEN EXISTS (SELECT 1 FROM "User" u WHERE u."email" = m."email")
    THEN 'member_' || m."id"::TEXT || '_' || m."email"
    ELSE m."email"
  END,
  -- ダミーパスワード（bcrypt hash of 'ChangeMe123!'）
  '$2a$10$dummyHashForMigrationPleaseChangePassword000',
  m."name",
  'USER'::"UserRole",
  m."status"::TEXT::"UserStatus",
  m."imageUrl",
  m."departmentId",
  m."tenantId",
  m."createdAt",
  m."updatedAt"
FROM "Member" m;

-- 3. SalesRecord: memberId (Int) → userId (String)
ALTER TABLE "SalesRecord" ADD COLUMN "userId" TEXT;

UPDATE "SalesRecord" sr
SET "userId" = 'migrated_' || sr."memberId"::TEXT;

ALTER TABLE "SalesRecord" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SalesRecord" ADD CONSTRAINT "SalesRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "SalesRecord" DROP CONSTRAINT IF EXISTS "SalesRecord_memberId_fkey";
ALTER TABLE "SalesRecord" DROP COLUMN "memberId";

-- 4. Target: memberId (Int) → userId (String)
-- まず既存のユニーク制約を削除
ALTER TABLE "Target" DROP CONSTRAINT IF EXISTS "Target_tenantId_memberId_year_month_dataTypeId_key";

ALTER TABLE "Target" ADD COLUMN "userId" TEXT;

UPDATE "Target" t
SET "userId" = 'migrated_' || t."memberId"::TEXT;

ALTER TABLE "Target" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Target" ADD CONSTRAINT "Target_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Target" DROP CONSTRAINT IF EXISTS "Target_memberId_fkey";
ALTER TABLE "Target" DROP COLUMN "memberId";

-- 新しいユニーク制約
ALTER TABLE "Target" ADD CONSTRAINT "Target_tenantId_userId_year_month_dataTypeId_key" UNIQUE ("tenantId", "userId", "year", "month", "dataTypeId");

-- 5. GroupMember: memberId (Int) → userId (String)
-- 既存のユニーク制約を削除
ALTER TABLE "GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_groupId_memberId_key";

ALTER TABLE "GroupMember" ADD COLUMN "userId" TEXT;

UPDATE "GroupMember" gm
SET "userId" = 'migrated_' || gm."memberId"::TEXT;

ALTER TABLE "GroupMember" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "GroupMember" DROP CONSTRAINT IF EXISTS "GroupMember_memberId_fkey";
ALTER TABLE "GroupMember" DROP COLUMN "memberId";

-- 新しいユニーク制約
ALTER TABLE "GroupMember" ADD CONSTRAINT "GroupMember_groupId_userId_key" UNIQUE ("groupId", "userId");

-- 6. Member テーブルと関連 enum を削除
DROP TABLE "Member";
DROP TYPE "MemberRole";
DROP TYPE "MemberStatus";

-- 7. AuditAction enum の更新（MEMBER_* → USER_*）
-- PostgreSQL では enum の値を直接リネームできるので ALTER TYPE を使用
ALTER TYPE "AuditAction" RENAME VALUE 'MEMBER_CREATE' TO 'USER_CREATE';
ALTER TYPE "AuditAction" RENAME VALUE 'MEMBER_UPDATE' TO 'USER_UPDATE';
ALTER TYPE "AuditAction" RENAME VALUE 'MEMBER_DELETE' TO 'USER_DELETE';
