import { NextRequest } from 'next/server';
import { tenantService } from '../services/tenantService';
import { auditLogService } from '../services/auditLogService';
import { requireSuperAdmin } from '../lib/auth';
import { ApiResponse } from '../lib/apiResponse';

export const tenantController = {
  async getAll(request: NextRequest) {
    try {
      await requireSuperAdmin(request);
      const tenants = await tenantService.getAll();
      return ApiResponse.success(tenants);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to fetch tenants');
    }
  },

  async getById(request: NextRequest, id: number) {
    try {
      await requireSuperAdmin(request);
      const tenant = await tenantService.getById(id);
      if (!tenant) {
        return ApiResponse.notFound('テナントが見つかりません');
      }
      return ApiResponse.success(tenant);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to fetch tenant');
    }
  },

  async create(request: NextRequest) {
    try {
      await requireSuperAdmin(request);
      const body = await request.json();
      const { name, slug, adminEmail, adminPassword, adminName } = body;

      if (!name || !slug || !adminEmail || !adminPassword) {
        return ApiResponse.badRequest('name, slug, adminEmail, adminPassword are required');
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        return ApiResponse.badRequest('slugは英小文字・数字・ハイフンのみ使用可能です');
      }

      if (adminPassword.length < 8) {
        return ApiResponse.badRequest('パスワードは8文字以上で設定してください');
      }

      const tenant = await tenantService.create({ name, slug, adminEmail, adminPassword, adminName });

      auditLogService.createWithTenantId(
        request, tenant.id, 'TENANT_CREATE',
        `テナント「${name}」(${slug})を作成`,
      ).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.created(tenant);
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return ApiResponse.conflict('このslugは既に使用されています');
      }
      return ApiResponse.fromError(error, 'Failed to create tenant');
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      await requireSuperAdmin(request);
      const body = await request.json();
      const { name, slug, isActive } = body;

      if (slug && !/^[a-z0-9-]+$/.test(slug)) {
        return ApiResponse.badRequest('slugは英小文字・数字・ハイフンのみ使用可能です');
      }

      const tenant = await tenantService.update(id, { name, slug, isActive });

      auditLogService.createWithTenantId(
        request, id, 'TENANT_UPDATE',
        `テナントID:${id}を更新`,
      ).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(tenant);
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_SLUG') {
        return ApiResponse.conflict('このslugは既に使用されています');
      }
      return ApiResponse.fromError(error, 'Failed to update tenant');
    }
  },
};
