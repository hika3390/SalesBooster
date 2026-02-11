'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import EditTargetModal from './EditTargetModal';

interface Target {
  id: number;
  memberId: number;
  memberName: string;
  monthly: number;
  quarterly: number;
  annual: number;
  year: number;
  month: number;
}

export default function TargetSettings() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  const fetchTargets = async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/targets');
      if (res.ok) setTargets(await res.json());
      else setFetchError('目標情報の取得に失敗しました。');
    } catch {
      setFetchError('目標情報の取得に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const columns: Column<Target>[] = [
    {
      key: 'memberName',
      label: 'メンバー',
      render: (t) => <span className="text-sm font-medium text-gray-800">{t.memberName}</span>,
    },
    {
      key: 'monthly',
      label: '月間目標',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-700">{t.monthly}万円</span>,
    },
    {
      key: 'quarterly',
      label: '四半期目標',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-700">{t.quarterly}万円</span>,
    },
    {
      key: 'annual',
      label: '年間目標',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-700">{t.annual}万円</span>,
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: (t) => (
        <button onClick={() => setEditingTarget(t)} className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-3">{fetchError}</div>
        <button onClick={fetchTargets} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">再読み込み</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">目標設定</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option>2025年度</option>
            <option>2026年度</option>
          </select>
          <Button label="一括設定" />
        </div>
      </div>

      <DataTable
        data={targets}
        columns={columns}
        keyField="id"
        searchPlaceholder="メンバー名で検索..."
        searchFilter={(t, q) => t.memberName.toLowerCase().includes(q)}
        emptyMessage="目標データがありません"
      />

      <EditTargetModal
        isOpen={!!editingTarget}
        onClose={() => setEditingTarget(null)}
        onUpdated={fetchTargets}
        target={editingTarget}
      />
    </div>
  );
}
