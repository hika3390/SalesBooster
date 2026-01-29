import { PrismaClient } from '../app/generated/prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // --- 初期ユーザー ---
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salesbooster.com' },
    update: {},
    create: {
      email: 'admin@salesbooster.com',
      password: hashSync('password123', 10),
      name: '管理者',
    },
  });

  console.log('User created:', adminUser.email);

  // --- 部署 ---
  const honsha = await prisma.department.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: '本社' },
  });
  const eigyobu = await prisma.department.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: '営業部' },
  });

  console.log('Departments created:', honsha.name, eigyobu.name);

  // --- メンバー ---
  const membersData = [
    { name: '田中太郎', email: 'tanaka@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { name: '佐藤花子', email: 'sato.hanako@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { name: '鈴木一郎', email: 'suzuki@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { name: '高橋美咲', email: 'takahashi@example.com', role: 'SALES' as const, departmentId: 2, imageUrl: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { name: '渡辺健太', email: 'watanabe@example.com', role: 'SALES' as const, departmentId: 2, imageUrl: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { name: '伊藤達也', email: 'ito@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/6.jpg' },
    { name: '山本大輔', email: 'yamamoto@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/7.jpg' },
    { name: '中村悠介', email: 'nakamura@example.com', role: 'SALES' as const, departmentId: 2, imageUrl: 'https://randomuser.me/api/portraits/men/8.jpg' },
    { name: '小林誠', email: 'kobayashi@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/9.jpg' },
    { name: '加藤結衣', email: 'kato@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/10.jpg' },
    { name: '吉田雄介', email: 'yoshida@example.com', role: 'SALES' as const, departmentId: 2, imageUrl: 'https://randomuser.me/api/portraits/men/11.jpg' },
    { name: '山田麻衣', email: 'yamada@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { name: '佐々木翔', email: 'sasaki@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/13.jpg' },
    { name: '松本美穂', email: 'matsumoto@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/14.jpg' },
    { name: '井上拓海', email: 'inoue@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/15.jpg' },
    { name: '木村陽子', email: 'kimura@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/16.jpg' },
    { name: '林智也', email: 'hayashi@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/17.jpg' },
    { name: '清水咲良', email: 'shimizu@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/18.jpg' },
    { name: '山口健', email: 'yamaguchi@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/men/19.jpg' },
    { name: '森田愛', email: 'morita@example.com', role: 'SALES' as const, departmentId: 1, imageUrl: 'https://randomuser.me/api/portraits/women/20.jpg' },
  ];

  for (const data of membersData) {
    await prisma.member.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
  }

  console.log('Members created:', membersData.length);

  // --- グループ ---
  const groupsData = [
    { id: 1, name: '3Aグループ 支店1', managerId: null },
    { id: 2, name: '3Bグループ 支店2', managerId: null },
    { id: 3, name: '3Cグループ 本社', managerId: null },
  ];

  for (const data of groupsData) {
    await prisma.group.upsert({
      where: { id: data.id },
      update: {},
      create: data,
    });
  }

  console.log('Groups created:', groupsData.length);

  // --- 目標 ---
  const members = await prisma.member.findMany();
  for (const member of members) {
    await prisma.target.upsert({
      where: { memberId_year_month: { memberId: member.id, year: 2026, month: 1 } },
      update: {},
      create: {
        memberId: member.id,
        monthly: 1000000,
        quarterly: 3000000,
        annual: 12000000,
        year: 2026,
        month: 1,
      },
    });
  }

  console.log('Targets created for', members.length, 'members');

  // --- 売上レコード（2026年1月分のサンプル） ---
  const salesAmounts = [2460000, 1600000, 1360000, 1350000, 1260000, 950000, 890000, 860000, 780000, 670000, 640000, 590000, 540000, 290000, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < members.length && i < salesAmounts.length; i++) {
    if (salesAmounts[i] > 0) {
      await prisma.salesRecord.create({
        data: {
          memberId: members[i].id,
          amount: salesAmounts[i],
          description: 'サンプル売上データ',
          recordDate: new Date(2026, 0, 15),
        },
      });
    }
  }

  console.log('Sales records created');

  // --- 外部連携 ---
  const integrationsData = [
    { name: 'Salesforce', description: 'CRMデータの自動同期', status: 'CONNECTED' as const, icon: 'SF' },
    { name: 'Slack', description: '売上通知の自動投稿', status: 'DISCONNECTED' as const, icon: 'SL' },
    { name: 'Google Sheets', description: 'スプレッドシートへの自動エクスポート', status: 'DISCONNECTED' as const, icon: 'GS' },
    { name: 'Microsoft Teams', description: 'チーム通知の自動投稿', status: 'DISCONNECTED' as const, icon: 'MT' },
  ];

  for (let i = 0; i < integrationsData.length; i++) {
    await prisma.integration.upsert({
      where: { id: i + 1 },
      update: {},
      create: { id: i + 1, ...integrationsData[i] },
    });
  }

  console.log('Integrations created:', integrationsData.length);

  // --- 操作ログ ---
  const logsData = [
    { action: '売上データ入力', detail: '500万円 / 商談A' },
    { action: 'メンバー追加', detail: '山田美咲を追加' },
    { action: '目標設定変更', detail: '田中太郎の月間目標を600万円に変更' },
    { action: 'グループ設定変更', detail: '3Aグループに新メンバー追加' },
    { action: '売上データ入力', detail: '300万円 / 商談B' },
    { action: 'レポート出力', detail: '月次レポートをPDF出力' },
    { action: 'メンバーステータス変更', detail: '山田美咲を無効に変更' },
    { action: 'システム設定変更', detail: '通知設定を更新' },
  ];

  for (const data of logsData) {
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        ...data,
      },
    });
  }

  console.log('Audit logs created:', logsData.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
