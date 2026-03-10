import { NextRequest } from 'next/server';
import { memberService } from '../services/memberService';
import { auditLogService } from '../services/auditLogService';
import { getTenantId } from '../lib/auth';
import { ApiResponse } from '../lib/apiResponse';

export const memberController = {
  async getAll(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const data = await memberService.getAll(tenantId);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return ApiResponse.serverError();
    }
  },

  async create(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const { name, email, password, role, imageUrl, departmentId } = body;

      if (!name || !email || !password) {
        return ApiResponse.badRequest('name, email and password are required');
      }

      if (password.length < 8) {
        return ApiResponse.badRequest('パスワードは8文字以上で入力してください');
      }

      const member = await memberService.create(tenantId, { name, email, password, role, imageUrl, departmentId });

      auditLogService.create(tenantId, {
        request,
        action: 'USER_CREATE',
        detail: `ユーザー「${name}」(${email})を作成`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.created(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create member');
    }
  },

  async update(request: NextRequest, id: string) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const member = await memberService.update(tenantId, id, body);

      auditLogService.create(tenantId, {
        request,
        action: 'USER_UPDATE',
        detail: `ユーザーID:${id}の情報を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update member');
    }
  },

  async delete(request: NextRequest, id: string) {
    try {
      const tenantId = await getTenantId(request);
      await memberService.delete(tenantId, id);

      auditLogService.create(tenantId, {
        request,
        action: 'USER_DELETE',
        detail: `ユーザーID:${id}を削除`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete member');
    }
  },

  async importMembers(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const body = await request.json();
      const { members } = body;

      if (!Array.isArray(members) || members.length === 0) {
        return ApiResponse.badRequest('members array is required');
      }

      const results = await memberService.importMembers(tenantId, members);

      auditLogService.create(tenantId, {
        request,
        action: 'USER_CREATE',
        detail: `ユーザー一括インポート: ${results.created}件追加, ${results.errors.length}件エラー`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(results);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to import members');
    }
  },
};
