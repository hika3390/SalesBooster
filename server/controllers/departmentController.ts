import { NextResponse } from 'next/server';
import { departmentService } from '../services/departmentService';

export const departmentController = {
  async getAll() {
    try {
      const data = await departmentService.getAll();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  },
};
