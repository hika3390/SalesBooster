import { salesRecordRepository } from '../repositories/salesRecordRepository';
import { memberRepository } from '../repositories/memberRepository';
import { targetRepository } from '../repositories/targetRepository';
import { SalesPerson } from '@/types';
import { toManyen } from '@/lib/currency';

type MemberWithDepartment = Awaited<ReturnType<typeof memberRepository.findAll>>[number];
type SalesRecordWithMember = Awaited<ReturnType<typeof salesRecordRepository.findByPeriod>>[number];

export const salesService = {
  async getSalesByDateRange(startDate: Date, endDate: Date, memberIds?: number[]): Promise<{ salesPeople: SalesPerson[]; recordCount: number }> {
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

    // 目標を取得（期間内の月数分を合算）
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    const targets = await Promise.all(
      members.map((m: MemberWithDepartment) => targetRepository.findByMemberAndPeriod(m.id, startYear, startMonth))
    );
    const targetByMember = new Map<number, number>();
    for (let i = 0; i < members.length; i++) {
      targetByMember.set(members[i].id, (targets[i]?.monthly || 0) * monthCount);
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

    return { salesPeople, recordCount: records.length };
  },

  async getCumulativeSales(startDate: Date, endDate: Date, memberIds?: number[]): Promise<SalesPerson[]> {
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
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const monthCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    const targets = await Promise.all(
      members.map((m: MemberWithDepartment) => targetRepository.findByMemberAndPeriod(m.id, startYear, startMonth))
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

  async getTrendData(startDate: Date, endDate: Date, memberIds?: number[]) {
    const results: { month: string; sales: number; displayMonth: string }[] = [];

    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;

      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0, 23, 59, 59);

      const records = await salesRecordRepository.findByPeriod(monthStart, monthEnd, memberIds);
      const totalSalesYen = records.reduce((sum: number, r: SalesRecordWithMember) => sum + r.amount, 0);

      results.push({
        month: `${y}-${String(m).padStart(2, '0')}`,
        sales: toManyen(totalSalesYen),
        displayMonth: `${m}月`,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return results;
  },

  async getDateRange(): Promise<{ minDate: Date; maxDate: Date } | null> {
    const minDate = await salesRecordRepository.findMinDate();
    if (!minDate) return null;
    return { minDate, maxDate: new Date() };
  },

  async createSalesRecord(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    const record = await salesRecordRepository.create(data);
    return record;
  },
};
