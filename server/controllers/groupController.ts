import { NextRequest } from 'next/server';
import { groupService } from '../services/groupService';
import { auditLogService } from '../services/auditLogService';
import { getTenantId } from '../lib/auth';
import { ApiResponse } from '../lib/apiResponse';

export const groupController = {
  async getAll(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const data = await groupService.getAll(tenantId);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      return ApiResponse.serverError();
    }
  },

  async create(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const { name, managerId } = body;

      if (!name) {
        return ApiResponse.badRequest('name is required');
      }

      const group = await groupService.create(tenantId, { name, managerId });

      auditLogService.create(tenantId, {
        request,
        action: 'GROUP_CREATE',
        detail: `グループ「${name}」を作成`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.created(group);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create group');
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const group = await groupService.update(tenantId, id, body);

      auditLogService.create(tenantId, {
        request,
        action: 'GROUP_UPDATE',
        detail: `グループID:${id}の情報を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(group);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update group');
    }
  },

  async delete(request: NextRequest, id: number) {
    try {
      const tenantId = await getTenantId(request);
      await groupService.delete(tenantId, id);

      auditLogService.create(tenantId, {
        request,
        action: 'GROUP_DELETE',
        detail: `グループID:${id}を削除`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete group');
    }
  },

  async syncMembers(request: NextRequest, groupId: number) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const { memberIds } = body;

      if (!Array.isArray(memberIds)) {
        return ApiResponse.badRequest('memberIds must be an array');
      }

      await groupService.syncMembers(tenantId, groupId, memberIds);

      auditLogService.create(tenantId, {
        request,
        action: 'GROUP_SYNC_MEMBERS',
        detail: `グループID:${groupId}のメンバーを同期（${memberIds.length}名）`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to sync group members');
    }
  },
};
