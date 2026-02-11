import { salesRecordRepository } from '../repositories/salesRecordRepository';
import { memberRepository } from '../repositories/memberRepository';
import { targetRepository } from '../repositories/targetRepository';
import { SalesPerson, ReportData, RankingBoardData, RankingColumn, RankingMember } from '@/types';
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

    const targets = await targetRepository.findByMembersAndPeriod(
      members.map((m: MemberWithDepartment) => m.id), startYear, startMonth
    );
    const targetByMember = new Map<number, number>();
    for (const t of targets) {
      targetByMember.set(t.memberId, (t.monthly || 0) * monthCount);
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

    const targets = await targetRepository.findByMembersAndPeriod(
      members.map((m: MemberWithDepartment) => m.id), startYear, startMonth
    );
    const targetByMember = new Map<number, number>();
    for (const t of targets) {
      targetByMember.set(t.memberId, (t.monthly || 0) * monthCount);
    }

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

    salesPeople.sort((a, b) => b.sales - a.sales);
    salesPeople.forEach((p, i) => (p.rank = i + 1));

    return salesPeople;
  },

  async getTrendData(startDate: Date, endDate: Date, memberIds?: number[]) {
    // 全期間を1回のクエリで取得
    const periodStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59);
    const records = await salesRecordRepository.findByPeriod(periodStart, periodEnd, memberIds);

    // JS側で月別に集計
    const monthlyMap = new Map<string, number>();
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    for (const r of records) {
      const d = new Date(r.recordDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.amount);
    }

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

    // --- 月別集計 ---
    const monthlyMap = new Map<string, number>();
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const r of records) {
      const d = new Date(r.recordDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + r.amount);
    }

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
    const allMembers = await memberRepository.findAll();
    const targetMembers = memberIds ? allMembers.filter((m: MemberWithDepartment) => memberIds.includes(m.id)) : allMembers;
    const targets = await targetRepository.findByMembersAndPeriod(
      targetMembers.map((m: MemberWithDepartment) => m.id), now.getFullYear(), now.getMonth() + 1
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
    const allMembers = await memberRepository.findAll();
    const members = memberIds
      ? allMembers.filter((m: MemberWithDepartment) => memberIds.includes(m.id))
      : allMembers;

    // 全期間のレコードを取得
    const allRecords = await salesRecordRepository.findByPeriod(startDate, endDate, memberIds);

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
};
