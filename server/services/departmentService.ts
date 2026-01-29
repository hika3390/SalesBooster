import { departmentRepository } from '../repositories/departmentRepository';

export const departmentService = {
  async getAll() {
    return departmentRepository.findAll();
  },
};
