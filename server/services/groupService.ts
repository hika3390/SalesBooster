import { groupRepository } from '../repositories/groupRepository';

export const groupService = {
  async getAll(tenantId: number) {
    const groups = await groupRepository.findAll(tenantId);
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      managerId: g.managerId,
      members: g.members.length,
      memberList: g.members.map((gm) => ({
        id: gm.member.id,
        name: gm.member.name,
      })),
    }));
  },

  async getById(tenantId: number, id: number) {
    return groupRepository.findById(id, tenantId);
  },

  async create(tenantId: number, data: { name: string; managerId?: number }) {
    return groupRepository.create(tenantId, data);
  },

  async update(tenantId: number, id: number, data: { name?: string; managerId?: number }) {
    await groupRepository.update(id, tenantId, data);
    return groupRepository.findById(id, tenantId);
  },

  async delete(tenantId: number, id: number) {
    const existing = await groupRepository.findById(id, tenantId);
    if (!existing) return null;
    await groupRepository.delete(id, tenantId);
    return existing;
  },

  async syncMembers(tenantId: number, groupId: number, memberIds: number[]) {
    return groupRepository.syncMembers(groupId, tenantId, memberIds);
  },
};
