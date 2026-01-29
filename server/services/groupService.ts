import { groupRepository } from '../repositories/groupRepository';

export const groupService = {
  async getAll() {
    const groups = await groupRepository.findAll();
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

  async getById(id: number) {
    return groupRepository.findById(id);
  },

  async create(data: { name: string; managerId?: number }) {
    return groupRepository.create(data);
  },

  async update(id: number, data: { name?: string; managerId?: number }) {
    return groupRepository.update(id, data);
  },

  async delete(id: number) {
    return groupRepository.delete(id);
  },

  async addMember(groupId: number, memberId: number) {
    return groupRepository.addMember(groupId, memberId);
  },

  async removeMember(groupId: number, memberId: number) {
    return groupRepository.removeMember(groupId, memberId);
  },
};
