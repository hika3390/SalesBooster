import { NextRequest, NextResponse } from 'next/server';
import { auditLogService } from '../services/auditLogService';

export const auditLogController = {
  async getAll(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;

    try {
      const data = await auditLogService.getAll(page, pageSize);
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
