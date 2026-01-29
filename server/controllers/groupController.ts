import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '../services/groupService';

export const groupController = {
  async getAll() {
    try {
      const data = await groupService.getAll();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, managerId } = body;

      if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
      }

      const group = await groupService.create({ name, managerId });
      return NextResponse.json(group, { status: 201 });
    } catch (error) {
      console.error('Failed to create group:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const group = await groupService.update(id, body);
      return NextResponse.json(group);
    } catch (error) {
      console.error('Failed to update group:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async delete(id: number) {
    try {
      await groupService.delete(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete group:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
