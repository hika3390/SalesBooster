import { NextRequest } from 'next/server';
import { salesService } from '../services/salesService';
import { groupService } from '../services/groupService';
import { auditLogService } from '../services/auditLogService';
import { lineNotificationService } from '../services/lineNotificationService';
import { memberRepository } from '../repositories/memberRepository';
import { ApiResponse } from '../lib/apiResponse';

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
      return ApiResponse.success({ data: salesPeople, recordCount });
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      return ApiResponse.serverError();
    }
  },

  async createSalesRecord(request: NextRequest) {
    try {
      const body = await request.json();
      const { memberId, amount, description, recordDate, customFields } = body;

      if (!memberId || !amount || !recordDate) {
        return ApiResponse.badRequest('memberId, amount, recordDate are required');
      }

      const numAmount = Number(amount);
      const numMemberId = Number(memberId);

      const record = await salesService.createSalesRecord({
        memberId: numMemberId,
        amount: numAmount,
        description,
        recordDate: new Date(recordDate),
        ...(customFields ? { customFields } : {}),
      });

      auditLogService.create({
        request,
        action: 'SALES_RECORD_CREATE',
        detail: `メンバーID:${numMemberId}の売上${numAmount}円を記録`,
      }).catch((err) => console.error('Audit log failed:', err));

      memberRepository.findById(numMemberId).then((member) => {
        if (member) {
          lineNotificationService.sendSalesNotification({
            memberName: member.name,
            amount: numAmount,
            recordDate: new Date(recordDate),
          });
        }
      }).catch((err) => console.error('LINE notification failed:', err));

      return ApiResponse.created(record);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create sales record');
    }
  },

  async getDateRange() {
    try {
      const dateRange = await salesService.getDateRange();
      return ApiResponse.success(dateRange);
    } catch (error) {
      console.error('Failed to fetch date range:', error);
      return ApiResponse.serverError();
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
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch cumulative sales data:', error);
      return ApiResponse.serverError();
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
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      return ApiResponse.serverError();
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
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch trend data:', error);
      return ApiResponse.serverError();
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
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch ranking board data:', error);
      return ApiResponse.serverError();
    }
  },

  async getSalesRecords(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const memberIdParam = searchParams.get('memberId');
    const groupIdParam = searchParams.get('groupId');

    const filters: { startDate?: Date; endDate?: Date; memberId?: number; memberIds?: number[] } = {};
    if (startDateParam) filters.startDate = new Date(startDateParam);
    if (endDateParam) filters.endDate = new Date(`${endDateParam}T23:59:59`);
    if (memberIdParam) {
      filters.memberId = Number(memberIdParam);
    } else if (groupIdParam) {
      const memberIds = await resolveMemberIds(searchParams);
      if (memberIds) filters.memberIds = memberIds;
    }

    try {
      const data = await salesService.getSalesRecords(page, pageSize, filters);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch sales records:', error);
      return ApiResponse.serverError();
    }
  },

  async updateSalesRecord(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const { memberId, amount, description, recordDate, customFields } = body;

      if (!memberId || !amount || !recordDate) {
        return ApiResponse.badRequest('memberId, amount, recordDate are required');
      }

      const updated = await salesService.updateSalesRecord(id, {
        memberId: Number(memberId),
        amount: Number(amount),
        description: description || undefined,
        recordDate: new Date(recordDate),
        ...(customFields !== undefined ? { customFields } : {}),
      });

      if (!updated) {
        return ApiResponse.notFound('売上レコードが見つかりません');
      }

      auditLogService.create({
        request,
        action: 'SALES_RECORD_UPDATE',
        detail: `売上ID:${id}を更新（メンバーID:${memberId}, 金額:${amount}円）`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(updated);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update sales record');
    }
  },

  async importSalesRecords(request: NextRequest) {
    try {
      const body = await request.json();
      const { records } = body;

      if (!Array.isArray(records) || records.length === 0) {
        return ApiResponse.badRequest('records array is required');
      }

      const results = await salesService.importSalesRecords(records);

      auditLogService.create({
        request,
        action: 'SALES_RECORD_CREATE',
        detail: `売上データ一括インポート: ${results.created}件追加`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(results);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to import sales records');
    }
  },

  async exportSalesRecords(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const memberIdParam = searchParams.get('memberId');
    const groupIdParam = searchParams.get('groupId');

    const filters: { startDate?: Date; endDate?: Date; memberId?: number; memberIds?: number[] } = {};
    if (startDateParam) filters.startDate = new Date(startDateParam);
    if (endDateParam) filters.endDate = new Date(`${endDateParam}T23:59:59`);
    if (memberIdParam) {
      filters.memberId = Number(memberIdParam);
    } else if (groupIdParam) {
      const memberIds = await resolveMemberIds(searchParams);
      if (memberIds) filters.memberIds = memberIds;
    }

    try {
      const data = await salesService.getAllSalesRecords(filters);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to export sales records:', error);
      return ApiResponse.serverError();
    }
  },

  async deleteSalesRecord(request: NextRequest, id: number) {
    try {
      const deleted = await salesService.deleteSalesRecord(id);

      if (!deleted) {
        return ApiResponse.notFound('売上レコードが見つかりません');
      }

      auditLogService.create({
        request,
        action: 'SALES_RECORD_DELETE',
        detail: `売上ID:${id}を削除（メンバー:${deleted.member.name}, 金額:${deleted.amount}円）`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ message: '削除しました' });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete sales record');
    }
  },
};
