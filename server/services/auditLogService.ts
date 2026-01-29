import { auditLogRepository } from '../repositories/auditLogRepository';

export const auditLogService = {
  async getAll(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [logs, total] = await Promise.all([
      auditLogRepository.findAll({ skip, take: pageSize }),
      auditLogRepository.count(),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        date: log.createdAt.toISOString(),
        user: log.user?.name || '不明',
        action: log.action,
        detail: log.detail || '',
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async create(data: { userId: string; action: string; detail?: string }) {
    return auditLogRepository.create(data);
  },
};
