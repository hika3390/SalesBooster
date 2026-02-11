import { departmentService } from '../services/departmentService';
import { ApiResponse } from '../lib/apiResponse';

export const departmentController = {
  async getAll() {
    try {
      const data = await departmentService.getAll();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return ApiResponse.serverError();
    }
  },
};
