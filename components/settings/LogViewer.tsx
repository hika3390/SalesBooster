'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';

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

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};

export default function LogViewer() {
  const [data, setData] = useState<LogResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const pageSize = 8;

  const fetchLogs = async (page: number) => {
    setLoading(true);
    try {
      setFetchError(null);
      const res = await fetch(`/api/audit-logs?page=${page}&pageSize=${pageSize}`);
      if (res.ok) setData(await res.json());
      else setFetchError('操作ログの取得に失敗しました。');
    } catch {
      setFetchError('操作ログの取得に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const columns: Column<LogEntry>[] = [
    {
      key: 'date',
      label: '日時',
      render: (log) => <span className="text-sm text-gray-600 whitespace-nowrap">{formatDate(log.date)}</span>,
    },
    {
      key: 'user',
      label: 'ユーザー',
      render: (log) => <span className="text-sm font-medium text-gray-800">{log.user}</span>,
    },
    {
      key: 'action',
      label: '操作',
      render: (log) => <span className="text-sm text-gray-700">{log.action}</span>,
    },
    {
      key: 'detail',
      label: '詳細',
      render: (log) => <span className="text-sm text-gray-500">{log.detail}</span>,
    },
  ];

  if (loading && !data) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  if (fetchError && !data) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-3">{fetchError}</div>
        <button onClick={() => fetchLogs(currentPage)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">再読み込み</button>
      </div>
    );
  }

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">操作ログ閲覧</h2>
        <div className="flex items-center space-x-2">
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-500">&mdash;</span>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <Button label="検索" />
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        keyField="id"
        emptyMessage="操作ログがありません"
        serverPagination={{
          currentPage,
          totalPages,
          total,
          pageSize,
          onPageChange: setCurrentPage,
        }}
      />
    </div>
  );
}
