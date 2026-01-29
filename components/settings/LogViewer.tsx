'use client';

import { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  date: string;
  user: string;
  action: string;
  detail: string;
}

interface LogResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function LogViewer() {
  const [data, setData] = useState<LogResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 8;

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?page=${page}&pageSize=${pageSize}`);
      if (res.ok) setData(await res.json());
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
  };

  if (loading && !data) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">操作ログ閲覧</h2>
        <div className="flex items-center space-x-2">
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-500">&mdash;</span>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            検索
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">日時</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ユーザー</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">詳細</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(log.date)}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{log.user}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{log.action}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">全 {total} 件中 {startItem}-{endItem} 件を表示</div>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            前へ
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
