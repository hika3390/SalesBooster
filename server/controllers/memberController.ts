import { NextRequest } from 'next/server';
import { memberService } from '../services/memberService';
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
      return ApiResponse.created(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to create member');
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const member = await memberService.update(id, body);
      return ApiResponse.success(member);
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to update member');
    }
  },

  async delete(id: number) {
    try {
      await memberService.delete(id);
      return ApiResponse.success({ success: true });
    } catch (error) {
      return ApiResponse.fromError(error, 'Failed to delete member');
    }
  },
};
