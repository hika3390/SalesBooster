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
    const year = Number(searchParams.get('year')) || new Date().getFullYear();
    const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const { salesPeople, recordCount } = await salesService.getSalesByPeriod(year, month, memberIds);
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

  async getCumulativeSales(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year')) || new Date().getFullYear();
    const startMonth = Number(searchParams.get('startMonth')) || 1;
    const endMonth = Number(searchParams.get('endMonth')) || new Date().getMonth() + 1;

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getCumulativeSales(year, startMonth, endMonth, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch cumulative sales data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async getTrendData(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get('year')) || new Date().getFullYear();
    const months = Number(searchParams.get('months')) || 6;

    try {
      const memberIds = await resolveMemberIds(searchParams);
      const data = await salesService.getTrendData(year, months, memberIds);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
