import { departmentRepository } from '../repositories/departmentRepository';

export const departmentService = {
  async getAll(tenantId: number) {
    return departmentRepository.findAll(tenantId);
  },
};
