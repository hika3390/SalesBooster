'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header/Header';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import { Dialog } from '@/components/common/Dialog';
import EditSalesRecordModal from '@/components/sales/EditSalesRecordModal';

interface SalesRecord {
  id: number;
  memberId: number;
  memberName: string;
  department: string | null;
  amount: number;
  description: string | null;
  recordDate: string;
  createdAt: string;
}

interface RecordsResponse {
  records: SalesRecord[];
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

const formatAmount = (amount: number) => {
  return amount.toLocaleString();
};

export default function SalesRecordsPage() {
  const [data, setData] = useState<RecordsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);
  const pageSize = 10;

  const fetchRecords = async (page: number) => {
    setLoading(true);
    try {
      setFetchError(null);
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await fetch(`/api/sales/records?${params}`);
      if (res.ok) setData(await res.json());
      else setFetchError('売上データの取得に失敗しました。');
    } catch {
      setFetchError('売上データの取得に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRecords(1);
  };

  const handleDelete = async (record: SalesRecord) => {
    const confirmed = await Dialog.confirm(`${record.memberName}の売上データ（${formatAmount(record.amount)}円）を削除しますか？`);
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/sales/${record.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRecords(currentPage);
      } else {
        const d = await res.json().catch(() => null);
        await Dialog.error(d?.error || '売上データの削除に失敗しました。');
      }
    } catch {
      await Dialog.error('売上データの削除に失敗しました。ネットワーク接続を確認してください。');
    }
  };

  const columns: Column<SalesRecord>[] = [
    {
      key: 'recordDate',
      label: '受注日',
      render: (r) => <span className="text-sm text-gray-600 whitespace-nowrap">{formatDate(r.recordDate)}</span>,
    },
    {
      key: 'memberName',
      label: 'メンバー',
      render: (r) => <span className="text-sm font-medium text-gray-800">{r.memberName}</span>,
    },
    {
      key: 'department',
      label: '部署',
      render: (r) => <span className="text-sm text-gray-600">{r.department || '-'}</span>,
    },
    {
      key: 'amount',
      label: '金額',
      align: 'right',
      render: (r) => <span className="text-sm font-medium text-gray-800">{formatAmount(r.amount)}円</span>,
    },
    {
      key: 'description',
      label: '備考',
      render: (r) => <span className="text-sm text-gray-500 truncate max-w-[200px] block">{r.description || '-'}</span>,
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end space-x-2">
          <Button label="編集" variant="outline" color="blue" onClick={() => setEditingRecord(r)} className="px-3 py-1.5 text-xs" />
          <Button label="削除" variant="outline" color="red" onClick={() => handleDelete(r)} className="px-3 py-1.5 text-xs" />
        </div>
      ),
    },
  ];

  if (loading && !data) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        <Header subtitle="売上データ管理" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (fetchError && !data) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        <Header subtitle="売上データ管理" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-3">{fetchError}</div>
            <button onClick={() => fetchRecords(currentPage)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">再読み込み</button>
          </div>
        </div>
      </div>
    );
  }

  const records = data?.records || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header subtitle="売上データ管理" />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-800">売上データ管理</h2>
          <div className="flex items-center space-x-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto" />
            <span className="text-gray-500 shrink-0">&mdash;</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto" />
            <Button label="検索" onClick={handleSearch} className="shrink-0" />
          </div>
        </div>

        <DataTable
          data={records}
          columns={columns}
          keyField="id"
          emptyMessage="売上データがありません"
          serverPagination={{
            currentPage,
            totalPages,
            total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
          mobileRender={(r) => (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{r.memberName}</span>
                <span className="text-xs text-gray-400">{formatDate(r.recordDate)}</span>
              </div>
              {r.department && <div className="text-xs text-gray-500 mb-1">{r.department}</div>}
              <div className="text-sm font-bold text-gray-800 mb-1">{formatAmount(r.amount)}円</div>
              {r.description && <div className="text-xs text-gray-500 mb-2">{r.description}</div>}
              <div className="flex items-center space-x-2">
                <Button label="編集" variant="outline" color="blue" onClick={() => setEditingRecord(r)} className="px-3 py-1.5 text-xs" />
                <Button label="削除" variant="outline" color="red" onClick={() => handleDelete(r)} className="px-3 py-1.5 text-xs" />
              </div>
            </div>
          )}
        />
      </main>

      <EditSalesRecordModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        onUpdated={() => fetchRecords(currentPage)}
        record={editingRecord}
      />
    </div>
  );
}
