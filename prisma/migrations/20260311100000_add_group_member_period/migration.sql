-- AlterTable: GroupMemberにstartMonth/endMonthを追加
ALTER TABLE "GroupMember" ADD COLUMN "startMonth" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "GroupMember" ADD COLUMN "endMonth" TIMESTAMP(3);

-- DropConstraint: 旧ユニーク制約を削除（constraint として削除する必要がある）
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_userId_key";

-- CreateIndex: 新しいユニーク制約（同一グループ・同一ユーザー・同一開始月の重複を防止）
CREATE UNIQUE INDEX "GroupMember_groupId_userId_startMonth_key" ON "GroupMember"("groupId", "userId", "startMonth");

-- CreateIndex: 月ベースのメンバー検索用インデックス
CREATE INDEX "GroupMember_userId_startMonth_endMonth_idx" ON "GroupMember"("userId", "startMonth", "endMonth");
