import { targetRepository } from '../repositories/targetRepository';

export const targetService = {
  async getAll(tenantId: number) {
    const targets = await targetRepository.findAll(tenantId);
    return targets.map((t) => ({
      id: t.id,
      memberId: t.memberId,
      memberName: t.member.name,
      monthly: t.monthly,
      quarterly: t.quarterly,
      annual: t.annual,
      year: t.year,
      month: t.month,
    }));
  },

  async upsert(tenantId: number, data: { memberId: number; monthly: number; quarterly: number; annual: number; year: number; month: number }) {
    return targetRepository.upsert(tenantId, data);
  },
};
