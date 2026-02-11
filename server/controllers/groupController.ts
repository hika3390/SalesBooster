import { NextRequest } from 'next/server';
import { groupService } from '../services/groupService';
import { ApiResponse } from '../lib/apiResponse';

export const groupController = {
  async getAll() {
    try {
      const data = await groupService.getAll();
      return ApiResponse.success(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      return ApiResponse.serverError();
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, managerId } = body;

      if (!name) {
        return ApiResponse.badRequest('name is required');
      }

      const group = await groupService.create({ name, managerId });
      return ApiResponse.created(group);
    } catch (error) {
      console.error('Failed to create group:', error);
      return ApiResponse.serverError();
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const group = await groupService.update(id, body);
      return ApiResponse.success(group);
    } catch (error) {
      console.error('Failed to update group:', error);
      return ApiResponse.serverError();
    }
  },

  async delete(id: number) {
    try {
      await groupService.delete(id);
      return ApiResponse.success({ success: true });
    } catch (error) {
      console.error('Failed to delete group:', error);
      return ApiResponse.serverError();
    }
  },

  async syncMembers(request: NextRequest, groupId: number) {
    try {
      const body = await request.json();
      const { memberIds } = body;

      if (!Array.isArray(memberIds)) {
        return ApiResponse.badRequest('memberIds must be an array');
      }

      await groupService.syncMembers(groupId, memberIds);
      return ApiResponse.success({ success: true });
    } catch (error) {
      console.error('Failed to sync group members:', error);
      return ApiResponse.serverError();
    }
  },
};
