import { NextRequest } from 'next/server';
import { targetService } from '../services/targetService';
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

      const target = await targetService.upsert({
        memberId: Number(memberId),
        monthly: Number(monthly),
        quarterly: Number(quarterly || 0),
        annual: Number(annual || 0),
        year: Number(year),
        month: Number(month),
      });

      return ApiResponse.success(target);
    } catch (error) {
      console.error('Failed to upsert target:', error);
      return ApiResponse.serverError();
    }
  },
};
