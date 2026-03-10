import { salesRecordRepository } from '../repositories/salesRecordRepository';
import { memberRepository } from '../repositories/memberRepository';
import { targetRepository } from '../repositories/targetRepository';
import { SalesPerson, ReportData, RankingBoardData, RankingColumn, RankingMember } from '@/types';
import { toManyen } from '@/lib/currency';

type MemberWithDepartment = Awaited<ReturnType<typeof memberRepository.findAll>>[number];
type SalesRecordWithMember = Awaited<ReturnType<typeof salesRecordRepository.findByPeriod>>[number];

/** memberIds指定時はDB側で絞り込み、未指定時は全件取得 */
async function fetchMembers(tenantId: number, memberIds?: number[]): Promise<MemberWithDepartment[]> {
  if (memberIds && memberIds.length > 0) {
    return memberRepository.findByIds(memberIds, tenantId);
  }
  return memberRepository.findAll(tenantId);
}

/** レコードの値を数値として取得 */
function getNumericValue(record: SalesRecordWithMember): number {
  return record.value;
}

/** レコード配列からメンバーごとの合計Mapを構築 */
function buildSalesMap(records: SalesRecordWithMember[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const record of records) {
    const value = getNumericValue(record);
    map.set(record.memberId, (map.get(record.memberId) || 0) + value);
  }
  return map;
}

/** 期間内の各月の実際の目標値を合算したMapを構築 */
async function buildTargetMap(tenantId: number, memberIds: number[], startDate: Date, endDate: Date, dataTypeId?: number): Promise<Map<number, number>> {
  const targets = await targetRepository.findByMembersAndPeriodRange(
    memberIds,
    startDate.getFullYear(), startDate.getMonth() + 1,
    endDate.getFullYear(), endDate.getMonth() + 1,
    tenantId,
  );
  // dataTypeIdでフィルタ
  const filtered = dataTypeId
    ? targets.filter((t: { dataTypeId: number | null }) => t.dataTypeId === dataTypeId)
    : targets;
  const map = new Map<number, number>();
  for (const t of filtered) {
    map.set(t.memberId, (map.get(t.memberId) || 0) + (t.monthly || 0));
  }
  return map;
}

/** メンバー・売上Map・目標MapからランキングつきSalesPerson配列を構築 */
function buildSalesPeople(
  members: MemberWithDepartment[],
  salesMap: Map<number, number>,
  targetMap: Map<number, number>,
  useManyen: boolean = true,
): SalesPerson[] {
  const salesPeople: SalesPerson[] = members.map((member) => {
    const salesRaw = salesMap.get(member.id) || 0;
    const targetRaw = targetMap.get(member.id) || 0;
    const sales = useManyen ? toManyen(salesRaw) : salesRaw;
    const target = useManyen ? toManyen(targetRaw) : targetRaw;
    const achievement = targetRaw > 0 ? Math.round((salesRaw / targetRaw) * 100) : 0;

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

/** 期間内の月別合計Mapを構築（0初期化つき） */
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
    const value = getNumericValue(r);
    map.set(key, (map.get(key) || 0) + value);
  }
  return map;
}

export const salesService = {
  async getSalesByDateRange(tenantId: number, startDate: Date, endDate: Date, memberIds?: number[], dataTypeId?: number): Promise<{ salesPeople: SalesPerson[]; recordCount: number }> {
    const [records, members] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, tenantId, memberIds, dataTypeId),
      fetchMembers(tenantId, memberIds),
    ]);

    const salesMap = buildSalesMap(records);
    const ids = members.map((m) => m.id);
    const targetMap = await buildTargetMap(tenantId, ids, startDate, endDate, dataTypeId);
    const salesPeople = buildSalesPeople(members, salesMap, targetMap);

    return { salesPeople, recordCount: records.length };
  },

  async getCumulativeSales(tenantId: number, startDate: Date, endDate: Date, memberIds?: number[], dataTypeId?: number): Promise<SalesPerson[]> {
    const [records, members] = await Promise.all([
      salesRecordRepository.findByPeriod(startDate, endDate, tenantId, memberIds, dataTypeId),
      fetchMembers(tenantId, memberIds),
    ]);

    const salesMap = buildSalesMap(records);
    const ids = members.map((m) => m.id);
    const targetMap = await buildTargetMap(tenantId, ids, startDate, endDate, dataTypeId);

    return buildSalesPeople(members, salesMap, targetMap);
  },

  async getTrendData(tenantId: number, startDate: Date, endDate: Date, memberIds?: number[], dataTypeId?: number) {
    const periodStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const periodEnd = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59);
    const records = await salesRecordRepository.findByPeriod(periodStart, periodEnd, tenantId, memberIds, dataTypeId);

    const monthlyMap = buildMonthlyMap(startDate, endDate, records);

    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, totalValue]) => {
        const m = parseInt(month.split('-')[1]);
        return {
          month,
          sales: toManyen(totalValue),
          displayMonth: `${m}月`,
        };
      });
  },

  async getDateRange(tenantId: number): Promise<{ minDate: Date; maxDate: Date } | null> {
    const minDate = await salesRecordRepository.findMinDate(tenantId);
    if (!minDate) return null;
    return { minDate, maxDate: new Date() };
  },

  async getReportData(tenantId: number, startDate: Date, endDate: Date, memberIds?: number[], dataTypeId?: number): Promise<ReportData> {
    const records = await salesRecordRepository.findByPeriod(startDate, endDate, tenantId, memberIds, dataTypeId);

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
      dayAmounts[dow] += getNumericValue(r);
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
      const value = getNumericValue(r);
      if (date <= 10) periodAmounts[0] += value;
      else if (date <= 20) periodAmounts[1] += value;
      else periodAmounts[2] += value;
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
    const members = await fetchMembers(tenantId, memberIds);
    const targets = await targetRepository.findByMembersAndPeriod(
      members.map((m) => m.id), now.getFullYear(), now.getMonth() + 1, tenantId
    );
    const filteredTargets = dataTypeId
      ? targets.filter((t: { dataTypeId: number | null }) => t.dataTypeId === dataTypeId)
      : targets;
    const monthlyTarget = toManyen(filteredTargets.reduce((sum: number, t: { monthly: number }) => sum + (t.monthly || 0), 0));

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

  async getRankingBoardData(tenantId: number, startDate: Date, endDate: Date, memberIds?: number[], dataTypeId?: number): Promise<RankingBoardData> {
    const [members, allRecords] = await Promise.all([
      fetchMembers(tenantId, memberIds),
      salesRecordRepository.findByPeriod(startDate, endDate, tenantId, memberIds, dataTypeId),
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
        salesByMember.set(r.memberId, (salesByMember.get(r.memberId) || 0) + getNumericValue(r));
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

  async createSalesRecord(tenantId: number, data: { memberId: number; value: number; description?: string; recordDate: Date; customFields?: Record<string, string>; dataTypeId?: number }) {
    const record = await salesRecordRepository.create(tenantId, data);
    return record;
  },

  async getSalesRecords(tenantId: number, page: number, pageSize: number, filters?: { startDate?: Date; endDate?: Date; memberId?: number; memberIds?: number[]; dataTypeId?: number }) {
    const { records, total } = await salesRecordRepository.findPaginated(page, pageSize, tenantId, filters);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      records: records.map((r) => ({
        id: r.id,
        memberId: r.memberId,
        memberName: r.member.name,
        department: r.member.department?.name || null,
        value: r.value,
        dataTypeId: r.dataTypeId,
        dataType: r.dataType ? { id: r.dataType.id, name: r.dataType.name, unit: r.dataType.unit } : null,
        description: r.description,
        customFields: (r.customFields as Record<string, string>) || null,
        recordDate: r.recordDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  async getAllSalesRecords(tenantId: number, filters?: { startDate?: Date; endDate?: Date; memberId?: number; memberIds?: number[]; dataTypeId?: number }) {
    const records = await salesRecordRepository.findAll(tenantId, filters);
    return records.map((r) => ({
      id: r.id,
      memberId: r.memberId,
      memberName: r.member.name,
      department: r.member.department?.name || null,
      value: r.value,
      dataTypeId: r.dataTypeId,
      dataType: r.dataType ? { id: r.dataType.id, name: r.dataType.name, unit: r.dataType.unit } : null,
      description: r.description,
      customFields: (r.customFields as Record<string, string>) || null,
      recordDate: r.recordDate.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
  },

  async updateSalesRecord(tenantId: number, id: number, data: { memberId?: number; value?: number; description?: string; recordDate?: Date; customFields?: Record<string, string>; dataTypeId?: number }) {
    const existing = await salesRecordRepository.findById(id, tenantId);
    if (!existing) return null;
    await salesRecordRepository.update(id, tenantId, data);
    return salesRecordRepository.findById(id, tenantId);
  },

  async deleteSalesRecord(tenantId: number, id: number) {
    const existing = await salesRecordRepository.findById(id, tenantId);
    if (!existing) return null;
    await salesRecordRepository.remove(id, tenantId);
    return existing;
  },

  async importSalesRecords(tenantId: number, records: { memberId: number; value: number; recordDate: string; description?: string; customFields?: Record<string, string>; dataTypeId?: number }[]) {
    const data = records.map((r) => ({
      memberId: r.memberId,
      value: r.value,
      description: r.description || undefined,
      recordDate: new Date(r.recordDate),
      dataTypeId: r.dataTypeId,
      ...(r.customFields ? { customFields: r.customFields } : {}),
    }));

    const result = await salesRecordRepository.createMany(tenantId, data);
    return { created: result.count };
  },
};
