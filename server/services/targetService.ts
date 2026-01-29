import { targetRepository } from '../repositories/targetRepository';

export const targetService = {
  async getAll() {
    const targets = await targetRepository.findAll();
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

  async upsert(data: { memberId: number; monthly: number; quarterly: number; annual: number; year: number; month: number }) {
    return targetRepository.upsert(data);
  },
};
