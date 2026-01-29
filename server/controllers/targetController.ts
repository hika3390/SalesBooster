import { NextRequest, NextResponse } from 'next/server';
import { targetService } from '../services/targetService';

export const targetController = {
  async getAll() {
    try {
      const data = await targetService.getAll();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async upsert(request: NextRequest) {
    try {
      const body = await request.json();
      const { memberId, monthly, quarterly, annual, year, month } = body;

      if (!memberId || monthly === undefined || !year || !month) {
        return NextResponse.json({ error: 'memberId, monthly, year, month are required' }, { status: 400 });
      }

      const target = await targetService.upsert({
        memberId: Number(memberId),
        monthly: Number(monthly),
        quarterly: Number(quarterly || 0),
        annual: Number(annual || 0),
        year: Number(year),
        month: Number(month),
      });

      return NextResponse.json(target);
    } catch (error) {
      console.error('Failed to upsert target:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
