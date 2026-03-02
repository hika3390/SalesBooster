import { NextRequest } from 'next/server';
import { targetService } from '../services/targetService';
import { auditLogService } from '../services/auditLogService';
import { getTenantId } from '../lib/auth';
import { ApiResponse } from '../lib/apiResponse';

export const targetController = {
  async getAll(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const data = await targetService.getAll(tenantId);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch targets:', error);
      return ApiResponse.serverError();
    }
  },

  async upsert(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const { memberId, monthly, quarterly, annual, year, month } = body;

      if (!memberId || monthly === undefined || !year || !month) {
        return ApiResponse.badRequest('memberId, monthly, year, month are required');
      }

      const numMemberId = Number(memberId);
      const numYear = Number(year);
      const numMonth = Number(month);

      const target = await targetService.upsert(tenantId, {
        memberId: numMemberId,
        monthly: Number(monthly),
        quarterly: Number(quarterly || 0),
        annual: Number(annual || 0),
        year: numYear,
        month: numMonth,
      });

      auditLogService.create(tenantId, {
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
