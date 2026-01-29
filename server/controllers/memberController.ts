import { NextRequest, NextResponse } from 'next/server';
import { memberService } from '../services/memberService';

export const memberController = {
  async getAll() {
    try {
      const data = await memberService.getAll();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const body = await request.json();
      const { name, email, role, imageUrl, departmentId } = body;

      if (!name || !email) {
        return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
      }

      const member = await memberService.create({ name, email, role, imageUrl, departmentId });
      return NextResponse.json(member, { status: 201 });
    } catch (error) {
      console.error('Failed to create member:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async update(request: NextRequest, id: number) {
    try {
      const body = await request.json();
      const member = await memberService.update(id, body);
      return NextResponse.json(member);
    } catch (error) {
      console.error('Failed to update member:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },

  async delete(id: number) {
    try {
      await memberService.delete(id);
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Failed to delete member:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
