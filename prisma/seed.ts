import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 12;

function getAdminPassword(): string {
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'SEED_ADMIN_PASSWORD 環境変数が設定されていません。\n' +
      `.env ファイルに SEED_ADMIN_PASSWORD を設定してください（${MIN_PASSWORD_LENGTH}文字以上）`
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `SEED_ADMIN_PASSWORD は${MIN_PASSWORD_LENGTH}文字以上である必要があります（現在: ${password.length}文字）`
    );
  }
  return password;
}

async function main() {
  const adminPassword = getAdminPassword();

  // --- 初期ユーザー ---
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@salesbooster.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'admin@salesbooster.com',
      password: hashSync(adminPassword, 10),
      name: '管理者',
      role: 'ADMIN',
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

  console.log('Sales records created (January)');

  // --- 売上レコード（2026年2月分のサンプル） ---
  const salesDataFeb: { amount: number; day: number }[][] = [
    // 田中太郎
    [{ amount: 800000, day: 3 }, { amount: 650000, day: 5 }, { amount: 420000, day: 7 }],
    // 佐藤花子
    [{ amount: 500000, day: 2 }, { amount: 700000, day: 4 }, { amount: 350000, day: 6 }],
    // 鈴木一郎
    [{ amount: 600000, day: 1 }, { amount: 400000, day: 3 }, { amount: 300000, day: 6 }],
    // 高橋美咲
    [{ amount: 450000, day: 2 }, { amount: 550000, day: 5 }],
    // 渡辺健太
    [{ amount: 380000, day: 1 }, { amount: 420000, day: 4 }, { amount: 300000, day: 7 }],
    // 伊藤達也
    [{ amount: 500000, day: 3 }, { amount: 350000, day: 6 }],
    // 山本大輔
    [{ amount: 400000, day: 2 }, { amount: 300000, day: 5 }],
    // 中村悠介
    [{ amount: 350000, day: 1 }, { amount: 250000, day: 4 }, { amount: 200000, day: 7 }],
    // 小林誠
    [{ amount: 300000, day: 3 }, { amount: 400000, day: 6 }],
    // 加藤結衣
    [{ amount: 280000, day: 2 }, { amount: 350000, day: 5 }],
    // 吉田雄介
    [{ amount: 250000, day: 1 }, { amount: 300000, day: 4 }],
    // 山田麻衣
    [{ amount: 200000, day: 3 }, { amount: 350000, day: 6 }],
    // 佐々木翔
    [{ amount: 180000, day: 2 }, { amount: 280000, day: 5 }],
    // 松本美穂
    [{ amount: 150000, day: 4 }, { amount: 200000, day: 7 }],
    // 井上拓海
    [{ amount: 120000, day: 1 }],
    // 木村陽子
    [{ amount: 100000, day: 3 }],
    // 林智也
    [],
    // 清水咲良
    [],
    // 山口健
    [],
    // 森田愛
    [],
  ];

  for (let i = 0; i < members.length && i < salesDataFeb.length; i++) {
    for (const record of salesDataFeb[i]) {
      await prisma.salesRecord.create({
        data: {
          memberId: members[i].id,
          amount: record.amount,
          description: '2月サンプル売上データ',
          recordDate: new Date(2026, 1, record.day),
        },
      });
    }
  }

  // 2月の目標
  for (const member of members) {
    await prisma.target.upsert({
      where: { memberId_year_month: { memberId: member.id, year: 2026, month: 2 } },
      update: {},
      create: {
        memberId: member.id,
        monthly: 1000000,
        quarterly: 3000000,
        annual: 12000000,
        year: 2026,
        month: 2,
      },
    });
  }

  console.log('Sales records & targets created (February)');

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

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
