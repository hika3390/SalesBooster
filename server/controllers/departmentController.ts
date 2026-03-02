import { NextRequest } from 'next/server';
import { departmentService } from '../services/departmentService';
import { getTenantId } from '../lib/auth';
import { ApiResponse } from '../lib/apiResponse';

export const departmentController = {
  async getAll(request: NextRequest) {
    try {
      const tenantId = await getTenantId(request);
      const data = await departmentService.getAll(tenantId);
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return ApiResponse.serverError();
    }
  },
};
