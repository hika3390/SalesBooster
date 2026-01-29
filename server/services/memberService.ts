import { memberRepository } from '../repositories/memberRepository';
import { MemberRole, MemberStatus } from '@/app/generated/prisma/client';

export const memberService = {
  async getAll() {
    const members = await memberRepository.findAll();
    return members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      imageUrl: m.imageUrl,
      department: m.department?.name || null,
      departmentId: m.departmentId,
    }));
  },

  async getById(id: number) {
    return memberRepository.findById(id);
  },

  async create(data: { name: string; email: string; role?: MemberRole; imageUrl?: string; departmentId?: number }) {
    return memberRepository.create({
      name: data.name,
      email: data.email,
      role: data.role,
      imageUrl: data.imageUrl,
      departmentId: data.departmentId,
    });
  },

  async update(id: number, data: { name?: string; email?: string; role?: MemberRole; status?: MemberStatus; imageUrl?: string; departmentId?: number }) {
    return memberRepository.update(id, data);
  },

  async delete(id: number) {
    return memberRepository.delete(id);
  },
};
