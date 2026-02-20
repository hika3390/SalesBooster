import { NextRequest } from 'next/server';
import { memberService } from '../services/memberService';
import { auditLogService } from '../services/auditLogService';
import { ApiResponse } from '../lib/apiResponse';

export const memberController = {
  async getAll() {
    try {
      const data = await memberService.getAll();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return ApiResponse.serverError();
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, email, role, imageUrl, departmentId } = body;

      if (!name || !email) {
        return ApiResponse.badRequest('name and email are required');
      }

      const member = await memberService.create({ name, email, role, imageUrl, departmentId });

      auditLogService.create({
        request,
        action: 'MEMBER_CREATE',
        detail: `メンバー「${name}」(${email})を作成`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.created(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create member');
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const member = await memberService.update(id, body);

      auditLogService.create({
        request,
        action: 'MEMBER_UPDATE',
        detail: `メンバーID:${id}の情報を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update member');
    }
  },

  async delete(request: NextRequest, id: number) {
    try {
      await memberService.delete(id);

      auditLogService.create({
        request,
        action: 'MEMBER_DELETE',
        detail: `メンバーID:${id}を削除`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete member');
    }
  },

  async importMembers(request: NextRequest) {
    try {
      const body = await request.json();
      const { members } = body;

      if (!Array.isArray(members) || members.length === 0) {
        return ApiResponse.badRequest('members array is required');
      }

      const results = await memberService.importMembers(members);

      auditLogService.create({
        request,
        action: 'MEMBER_CREATE',
        detail: `メンバー一括インポート: ${results.created}件追加, ${results.errors.length}件エラー`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(results);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to import members');
    }
  },
};
