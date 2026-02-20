import { memberRepository } from '../repositories/memberRepository';
import { MemberRole, MemberStatus } from '@prisma/client';

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

  async importMembers(members: { name: string; email: string; role?: MemberRole; departmentId?: number }[]) {
    const emails = members.map((m) => m.email);
    const existing = await memberRepository.findByEmails(emails);
    const existingEmails = new Set(existing.map((e) => e.email));

    const results: { created: number; skipped: number; errors: { email: string; reason: string }[] } = {
      created: 0,
      skipped: 0,
      errors: [],
    };

    for (const member of members) {
      if (existingEmails.has(member.email)) {
        results.errors.push({ email: member.email, reason: '既に登録済みのメールアドレスです' });
        continue;
      }
      try {
        await memberRepository.create({
          name: member.name,
          email: member.email,
          role: member.role,
          departmentId: member.departmentId,
        });
        results.created++;
      } catch {
        results.errors.push({ email: member.email, reason: '登録に失敗しました' });
      }
    }

    return results;
  },
};
