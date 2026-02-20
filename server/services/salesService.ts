import { salesRecordRepository } from '../repositories/salesRecordRepository';
import { memberRepository } from '../repositories/memberRepository';
import { targetRepository } from '../repositories/targetRepository';
import { SalesPerson, ReportData, RankingBoardData, RankingColumn, RankingMember } from '@/types';
import { toManyen } from '@/lib/currency';

type MemberWithDepartment = Awaited<ReturnType<typeof memberRepository.findAll>>[number];
type SalesRecordWithMember = Awaited<ReturnType<typeof salesRecordRepository.findByPeriod>>[number];

/** memberIds指定時はDB側で絞り込み、未指定時は全件取得 */
async function fetchMembers(memberIds?: number[]): Promise<MemberWithDepartment[]> {
  if (memberIds && memberIds.length > 0) {
    return memberRepository.findByIds(memberIds);
  }
  return memberRepository.findAll();
}

/** レコード配列からメンバーごとの売上合計Mapを構築 */
function buildSalesMap(records: SalesRecordWithMember[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const record of records) {
    map.set(record.memberId, (map.get(record.memberId) || 0) + record.amount);
  }
  return map;
}

/** 期間内の各月の実際の目標値を合算したMapを構築 */
async function buildTargetMap(memberIds: number[], startDate: Date, endDate: Date): Promise<Map<number, number>> {
  const targets = await targetRepository.findByMembersAndPeriodRange(
    memberIds,
    startDate.getFullYear(), startDate.getMonth() + 1,
    endDate.getFullYear(), endDate.getMonth() + 1,
  );
  const map = new Map<number, number>();
  for (const t of targets) {
    map.set(t.memberId, (map.get(t.memberId) || 0) + (t.monthly || 0));
  }
  return map;
}

/** メンバー・売上Map・目標MapからランキングつきSalesPerson配列を構築 */
function buildSalesPeople(
  members: MemberWithDepartment[],
  salesMap: Map<number, number>,
  targetMap: Map<number, number>,
): SalesPerson[] {
  const salesPeople: SalesPerson[] = members.map((member) => {
    const salesYen = salesMap.get(member.id) || 0;
    const targetYen = targetMap.get(member.id) || 0;
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
}

/** 期間内の月別売上Mapを構築（0初期化つき） */
function buildMonthlyMap(startDate: Date, endDate: Date, records: SalesRecordWithMember[]): Map<string, number> {
  const map = new Map<string, number>();
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (cursor <= end) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, 0);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const r of records) {
    const d = new Date(r.recordDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + r.amount);
  }
  return map;
}

export const salesService = {
  async getSalesByDateRange(startDate: Date, endDate: Date, memberIds?: number[]): Promise<{ salesPeople: SalesPerson[]; recordCount: number }> {
    const [records, members] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, memberIds),
      fetchMembers(memberIds),
    ]);

    const salesMap = buildSalesMap(records);
    const ids = members.map((m) => m.id);
    const targetMap = await buildTargetMap(ids, startDate, endDate);
    const salesPeople = buildSalesPeople(members, salesMap, targetMap);

    return { salesPeople, recordCount: records.length };
  },

  async getCumulativeSales(startDate: Date, endDate: Date, memberIds?: number[]): Promise<SalesPerson[]> {
    const [records, members] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, memberIds),
      fetchMembers(memberIds),
    ]);

    const salesMap = buildSalesMap(records);
    const ids = members.map((m) => m.id);
    const targetMap = await buildTargetMap(ids, startDate, endDate);

    return buildSalesPeople(members, salesMap, targetMap);
  },

  async getTrendData(startDate: Date, endDate: Date, memberIds?: number[]) {
    const periodStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59);
    const records = await salesRecordRepository.findByPeriod(periodStart, periodEnd, memberIds);

    const monthlyMap = buildMonthlyMap(startDate, endDate, records);

    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, totalYen]) => {
        const m = parseInt(month.split('-')[1]);
        return {
          month,
          sales: toManyen(totalYen),
          displayMonth: `${m}月`,
        };
      });
  },

  async getDateRange(): Promise<{ minDate: Date; maxDate: Date } | null> {
    const minDate = await salesRecordRepository.findMinDate();
    if (!minDate) return null;
    return { minDate, maxDate: new Date() };
  },

  async getReportData(startDate: Date, endDate: Date, memberIds?: number[]): Promise<ReportData> {
    const records = await salesRecordRepository.findByPeriod(startDate, endDate, memberIds);

    const monthlyMap = buildMonthlyMap(startDate, endDate, records);

    const sortedMonths = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const salesValues = sortedMonths.map(([, v]) => toManyen(v));

    const monthlyTrend = sortedMonths.map(([month, amount], i) => {
      const [y, m] = month.split('-');
      let movingAvg: number | null = null;
      if (i >= 2) {
        movingAvg = Math.round((salesValues[i] + salesValues[i - 1] + salesValues[i - 2]) / 3);
      }
      return {
        month,
        displayMonth: `${y.slice(2)}/${m}`,
        sales: toManyen(amount),
        movingAvg,
      };
    });

    // --- 累計推移 ---
    let cumulative = 0;
    const cumulativeTrend = sortedMonths.map(([month, amount]) => {
      cumulative += toManyen(amount);
      const [y, m] = month.split('-');
      return {
        month,
        displayMonth: `${y.slice(2)}/${m}`,
        cumulative,
      };
    });

    // --- 曜日別集計 ---
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayAmounts = new Array(7).fill(0);
    for (const r of records) {
      const dow = new Date(r.recordDate).getDay();
      dayAmounts[dow] += r.amount;
    }
    const dayTotal = dayAmounts.reduce((a: number, b: number) => a + b, 0) || 1;
    const dayOfWeekRatio = dayNames.map((day, i) => ({
      day,
      amount: toManyen(dayAmounts[i]),
      ratio: Math.round((dayAmounts[i] / dayTotal) * 100),
    }));

    // --- 前中後比率 ---
    const periodAmounts = [0, 0, 0]; // 前半(1-10), 中盤(11-20), 後半(21-)
    for (const r of records) {
      const date = new Date(r.recordDate).getDate();
      if (date <= 10) periodAmounts[0] += r.amount;
      else if (date <= 20) periodAmounts[1] += r.amount;
      else periodAmounts[2] += r.amount;
    }
    const periodTotal = periodAmounts.reduce((a, b) => a + b, 0) || 1;
    const periodLabels = ['前半10日間', '中盤10日間', '後半10日間'];
    const periodRatio = periodLabels.map((period, i) => ({
      period,
      amount: toManyen(periodAmounts[i]),
      ratio: Math.round((periodAmounts[i] / periodTotal) * 100),
    }));

    // --- 統計情報 ---
    const now = new Date();
    const recentMonths = sortedMonths.slice(-3);
    const recentSales = recentMonths.map(([, v]) => toManyen(v));
    const monthlyAvg = recentSales.length > 0 ? Math.round(recentSales.reduce((a, b) => a + b, 0) / recentSales.length) : 0;

    // 直近3ヶ月の日数を概算（各月30日とする）
    const totalDays = recentMonths.length * 30;
    const totalRecentSales = recentSales.reduce((a, b) => a + b, 0);
    const dailyAvg = totalDays > 0 ? Math.round((totalRecentSales / totalDays) * 10) / 10 : 0;

    // 目標取得（直近月の目標）
    const members = await fetchMembers(memberIds);
    const targets = await targetRepository.findByMembersAndPeriod(
      members.map((m) => m.id), now.getFullYear(), now.getMonth() + 1
    );
    const monthlyTarget = toManyen(targets.reduce((sum, t) => sum + (t.monthly || 0), 0));

    const targetDays = dailyAvg > 0 ? Math.round((monthlyTarget / dailyAvg) * 10) / 10 : 0;
    const targetMonths = monthlyAvg > 0 ? Math.round((monthlyTarget / monthlyAvg) * 10) / 10 : 0;

    // 着地予測: 今月の実績 + 残日数 × 日平均
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthSales = toManyen(monthlyMap.get(currentMonthKey) || 0);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - now.getDate();
    const landingPrediction = Math.round((currentMonthSales + remainingDays * dailyAvg) * 10) / 10;
    const landingMonth = `${String(now.getFullYear()).slice(2)}/${String(now.getMonth() + 1).padStart(2, '0')}`;

    return {
      monthlyTrend,
      cumulativeTrend,
      dayOfWeekRatio,
      periodRatio,
      stats: { monthlyAvg, dailyAvg, targetDays, targetMonths, landingPrediction, landingMonth },
    };
  },

  async getRankingBoardData(startDate: Date, endDate: Date, memberIds?: number[]): Promise<RankingBoardData> {
    const [members, allRecords] = await Promise.all([
      fetchMembers(memberIds),
      salesRecordRepository.findByPeriod(startDate, endDate, memberIds),
    ]);

    // --- 月ごとのカラムを生成（新しい月から並べる）---
    const monthKeys: string[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      monthKeys.push(`${y}-${String(m).padStart(2, '0')}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    monthKeys.reverse(); // 新しい月が左に

    const buildRanking = (records: SalesRecordWithMember[]): RankingMember[] => {
      const salesByMember = new Map<number, number>();
      for (const r of records) {
        salesByMember.set(r.memberId, (salesByMember.get(r.memberId) || 0) + r.amount);
      }
      const ranked = members
        .map((m: MemberWithDepartment) => ({
          name: m.name,
          imageUrl: m.imageUrl || undefined,
          amount: salesByMember.get(m.id) || 0,
        }))
        .filter((m: { amount: number }) => m.amount > 0)
        .sort((a: { amount: number }, b: { amount: number }) => b.amount - a.amount)
        .map((m: { name: string; imageUrl?: string; amount: number }, i: number) => ({
          rank: i + 1,
          ...m,
        }));
      return ranked;
    };

    // 月別カラム
    const monthColumns: RankingColumn[] = monthKeys.map((key) => {
      const [y, m] = key.split('-');
      const monthRecords = allRecords.filter((r: SalesRecordWithMember) => {
        const d = new Date(r.recordDate);
        return d.getFullYear() === parseInt(y) && d.getMonth() + 1 === parseInt(m);
      });
      return {
        label: `${y}/${m}`,
        isTotal: false,
        members: buildRanking(monthRecords),
      };
    });

    // TOTAL カラム
    const startLabel = `${String(startDate.getFullYear()).slice(2)}/${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const endLabel = `${String(endDate.getFullYear()).slice(2)}/${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    const totalColumn: RankingColumn = {
      label: 'TOTAL',
      subLabel: `${startLabel}〜${endLabel}`,
      isTotal: true,
      members: buildRanking(allRecords),
    };

    return { columns: [totalColumn, ...monthColumns] };
  },

  async createSalesRecord(data: { memberId: number; amount: number; description?: string; recordDate: Date }) {
    const record = await salesRecordRepository.create(data);
    return record;
  },

  async getSalesRecords(page: number, pageSize: number, filters?: { startDate?: Date; endDate?: Date; memberId?: number }) {
    const { records, total } = await salesRecordRepository.findPaginated(page, pageSize, filters);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      records: records.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        memberName: r.member.name,
        department: r.member.department?.name || null,
        amount: r.amount,
        description: r.description,
        recordDate: r.recordDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async updateSalesRecord(id: number, data: { memberId?: number; amount?: number; description?: string; recordDate?: Date }) {
    const existing = await salesRecordRepository.findById(id);
    if (!existing) return null;
    return salesRecordRepository.update(id, data);
  },

  async deleteSalesRecord(id: number) {
    const existing = await salesRecordRepository.findById(id);
    if (!existing) return null;
    await salesRecordRepository.remove(id);
    return existing;
  },
};
