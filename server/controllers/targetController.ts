import { NextRequest } from 'next/server';
import { targetService } from '../services/targetService';
import { auditLogService } from '../services/auditLogService';
import { ApiResponse } from '../lib/apiResponse';

export const targetController = {
  async getAll() {
    try {
      const data = await targetService.getAll();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      return ApiResponse.serverError();
    }
  },

  async upsert(request: NextRequest) {
    try {
      const body = await request.json();
      const { memberId, monthly, quarterly, annual, year, month } = body;

      if (!memberId || monthly === undefined || !year || !month) {
        return ApiResponse.badRequest('memberId, monthly, year, month are required');
      }

      const numMemberId = Number(memberId);
      const numYear = Number(year);
      const numMonth = Number(month);

      const target = await targetService.upsert({
        memberId: numMemberId,
        monthly: Number(monthly),
        quarterly: Number(quarterly || 0),
        annual: Number(annual || 0),
        year: numYear,
        month: numMonth,
      });

      auditLogService.create({
        request,
        action: 'TARGET_UPSERT',
        detail: `メンバーID:${numMemberId}の${numYear}/${numMonth}月目標を設定`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(target);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to upsert target');
    }
  },
};
