import { targetRepository } from '../repositories/targetRepository';

export const targetService = {
  async getAll(tenantId: number) {
    const targets = await targetRepository.findAll(tenantId);
    return targets.map((t) => ({
      id: t.id,
      userId: t.userId,
      memberName: t.user.name,
      monthly: t.monthly,
      quarterly: t.quarterly,
      annual: t.annual,
      year: t.year,
      month: t.month,
      dataTypeId: t.dataTypeId,
    }));
  },

  async upsert(tenantId: number, data: { userId: string; monthly: number; quarterly: number; annual: number; year: number; month: number; dataTypeId?: number }) {
    return targetRepository.upsert(tenantId, data);
  },
};
