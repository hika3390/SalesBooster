import { departmentController } from '@/server/controllers/departmentController';

export async function GET() {
  return departmentController.getAll();
}
