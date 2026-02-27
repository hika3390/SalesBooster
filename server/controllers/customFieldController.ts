import { NextRequest } from 'next/server';
import { customFieldService } from '../services/customFieldService';
import { auditLogService } from '../services/auditLogService';
import { ApiResponse } from '../lib/apiResponse';

export const customFieldController = {
  async getCustomFields(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const activeOnly = searchParams.get('active') === 'true';

      const fields = activeOnly
        ? await customFieldService.getActive()
        : await customFieldService.getAll();

      return ApiResponse.success(fields);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to fetch custom fields');
    }
  },

  async createCustomField(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, fieldType, options, isRequired } = body;

      if (!name || !fieldType) {
        return ApiResponse.badRequest('name, fieldType are required');
      }

      if (!['TEXT', 'DATE', 'SELECT'].includes(fieldType)) {
        return ApiResponse.badRequest('fieldType must be TEXT, DATE, or SELECT');
      }

      if (fieldType === 'SELECT' && (!Array.isArray(options) || options.length === 0)) {
        return ApiResponse.badRequest('SELECT type requires options array');
      }

      const field = await customFieldService.create({
        name,
        fieldType,
        options: fieldType === 'SELECT' ? options : undefined,
        isRequired: isRequired ?? false,
      });

      auditLogService.create({
        request,
        action: 'CUSTOM_FIELD_CREATE',
        detail: `カスタムフィールド「${name}」(${fieldType})を追加`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.created(field);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create custom field');
    }
  },

  async updateCustomField(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const { name, fieldType, options, isRequired, sortOrder, isActive } = body;

      if (fieldType && !['TEXT', 'DATE', 'SELECT'].includes(fieldType)) {
        return ApiResponse.badRequest('fieldType must be TEXT, DATE, or SELECT');
      }

      if (fieldType === 'SELECT' && options !== undefined && (!Array.isArray(options) || options.length === 0)) {
        return ApiResponse.badRequest('SELECT type requires options array');
      }

      const updated = await customFieldService.update(id, {
        name,
        fieldType,
        options: fieldType === 'SELECT' ? options : fieldType ? undefined : undefined,
        isRequired,
        sortOrder,
        isActive,
      });

      if (!updated) {
        return ApiResponse.notFound('カスタムフィールドが見つかりません');
      }

      auditLogService.create({
        request,
        action: 'CUSTOM_FIELD_UPDATE',
        detail: `カスタムフィールドID:${id}を更新`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success(updated);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update custom field');
    }
  },

  async deleteCustomField(request: NextRequest, id: number) {
    try {
      const deleted = await customFieldService.softDelete(id);

      if (!deleted) {
        return ApiResponse.notFound('カスタムフィールドが見つかりません');
      }

      auditLogService.create({
        request,
        action: 'CUSTOM_FIELD_DELETE',
        detail: `カスタムフィールド「${deleted.name}」を無効化`,
      }).catch((err) => console.error('Audit log failed:', err));

      return ApiResponse.success({ message: '削除しました' });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete custom field');
    }
  },
};
