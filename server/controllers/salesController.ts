import { NextRequest, NextResponse } from 'next/server';
import { salesService } from '../services/salesService';
import { groupService } from '../services/groupService';

async function resolveMemberIds(searchParams: URLSearchParams): Promise<number[] | undefined> {
  const memberId = searchParams.get('memberId');
  const groupId = searchParams.get('groupId');

  if (memberId) {
    return [Number(memberId)];
  }

  if (groupId) {
    const group = await groupService.getById(Number(groupId));
    if (group) {
      return group.members.map((gm) => gm.memberId);
    }
    return [];
  }

  return undefined;
}

export const salesController = {
  async getSalesByPeriod(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // startDate/endDateが指定されていない場合は当月をデフォルトにする
    const now = new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const { salesPeople, recordCount } = await salesService.getSalesByDateRange(startDate, endDate, memberIds);
      return NextResponse.json({ data: salesPeople, recordCount });
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async createSalesRecord(request: NextRequest) {
    try {
      const body = await request.json();
      const { memberId, amount, description, recordDate } = body;

      if (!memberId || !amount || !recordDate) {
        return NextResponse.json({ error: 'memberId, amount, recordDate are required' }, { status: 400 });
      }

      const record = await salesService.createSalesRecord({
        memberId: Number(memberId),
        amount: Number(amount),
        description,
        recordDate: new Date(recordDate),
      });

      return NextResponse.json(record, { status: 201 });
    } catch (error) {
      console.error('Failed to create sales record:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getDateRange() {
    try {
      const dateRange = await salesService.getDateRange();
      return NextResponse.json(dateRange);
    } catch (error) {
      console.error('Failed to fetch date range:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getCumulativeSales(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), 0, 1);
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getCumulativeSales(startDate, endDate, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch cumulative sales data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getReportData(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getReportData(startDate, endDate, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getTrendData(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startDate = startDateParam ? new Date(startDateParam) : new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getTrendData(startDate, endDate, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getRankingBoardData(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    // 直近3ヶ月固定（期間パラメータは無視）
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getRankingBoardData(startDate, endDate, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch ranking board data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
