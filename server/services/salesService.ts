import { salesRecordRepository } from '../repositories/salesRecordRepository';
import { memberRepository } from '../repositories/memberRepository';
import { targetRepository } from '../repositories/targetRepository';
import { SalesPerson } from '@/types';
import { toManyen } from '@/lib/currency';

type MemberWithDepartment = Awaited<ReturnType<typeof memberRepository.findAll>>[number];
type SalesRecordWithMember = Awaited<ReturnType<typeof salesRecordRepository.findByPeriod>>[number];

export const salesService = {
  async getSalesByPeriod(year: number, month: number, memberIds?: number[]): Promise<SalesPerson[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [records, allMembers] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, memberIds),
      memberRepository.findAll(),
    ]);

    const members = memberIds
      ? allMembers.filter((m: MemberWithDepartment) => memberIds.includes(m.id))
      : allMembers;

    // メンバーごとの売上合計を計算
    const salesByMember = new Map<number, number>();
    for (const record of records) {
      const current = salesByMember.get(record.memberId) || 0;
      salesByMember.set(record.memberId, current + record.amount);
    }

    // 目標を取得
    const targets = await Promise.all(
      members.map((m: MemberWithDepartment) => targetRepository.findByMemberAndPeriod(m.id, year, month))
    );
    const targetByMember = new Map<number, number>();
    for (let i = 0; i < members.length; i++) {
      targetByMember.set(members[i].id, targets[i]?.monthly || 0);
    }

    // SalesPerson形式に変換してランキング（万円単位）
    const salesPeople: SalesPerson[] = members.map((member: MemberWithDepartment) => {
      const salesYen = salesByMember.get(member.id) || 0;
      const targetYen = targetByMember.get(member.id) || 0;
      const sales = toManyen(salesYen);
      const target = toManyen(targetYen);
      const achievement = targetYen > 0 ? Math.round((salesYen / targetYen) * 100) : 0;

      return {
        rank: 0,
        name: member.name,
        sales,
        target,
        achievement,
        imageUrl: member.imageUrl || undefined,
        department: member.department?.name || undefined,
      };
    });

    // 売上順にソートしてランクを付与
    salesPeople.sort((a, b) => b.sales - a.sales);
    salesPeople.forEach((p, i) => (p.rank = i + 1));

    return salesPeople;
  },

  async getCumulativeSales(year: number, startMonth: number, endMonth: number, memberIds?: number[]): Promise<SalesPerson[]> {
    const startDate = new Date(year, startMonth - 1, 1);
    const endDate = new Date(year, endMonth, 0, 23, 59, 59);

    const [records, allMembers] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, memberIds),
      memberRepository.findAll(),
    ]);

    const members = memberIds
      ? allMembers.filter((m: MemberWithDepartment) => memberIds.includes(m.id))
      : allMembers;

    const salesByMember = new Map<number, number>();
    for (const record of records) {
      const current = salesByMember.get(record.memberId) || 0;
      salesByMember.set(record.memberId, current + record.amount);
    }

    // 累計目標を計算（月数 × 月間目標）
    const monthCount = endMonth - startMonth + 1;
    const targets = await Promise.all(
      members.map((m: MemberWithDepartment) => targetRepository.findByMemberAndPeriod(m.id, year, startMonth))
    );

    const salesPeople: SalesPerson[] = members.map((member: MemberWithDepartment, i: number) => {
      const salesYen = salesByMember.get(member.id) || 0;
      const targetYen = (targets[i]?.monthly || 0) * monthCount;
      const sales = toManyen(salesYen);
      const target = toManyen(targetYen);
      const achievement = targetYen > 0 ? Math.round((salesYen / targetYen) * 100) : 0;

      return {
        rank: 0,
        name: member.name,
        sales,
        target,
        achievement,
        imageUrl: member.imageUrl || undefined,
        department: member.department?.name || undefined,
      };
    });

    salesPeople.sort((a, b) => b.sales - a.sales);
    salesPeople.forEach((p, i) => (p.rank = i + 1));

    return salesPeople;
  },

  async getTrendData(year: number, months: number, memberIds?: number[]) {
    const results: { month: string; sales: number; displayMonth: string }[] = [];

    for (let i = 0; i < months; i++) {
      const targetMonth = new Date(year, -i, 1);
      const y = targetMonth.getFullYear();
      const m = targetMonth.getMonth() + 1;

      const startDate = new Date(y, m - 1, 1);
      const endDate = new Date(y, m, 0, 23, 59, 59);

      const records = await salesRecordRepository.findByPeriod(startDate, endDate, memberIds);
      const totalSalesYen = records.reduce((sum: number, r: SalesRecordWithMember) => sum + r.amount, 0);

      results.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        sales: toManyen(totalSalesYen),
        displayMonth: `${m}月`,
      });
    }

    return results.reverse();
  },

  async createSalesRecord(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    return salesRecordRepository.create(data);
  },
};
