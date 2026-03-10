'use client';

import { useState, useEffect } from 'react';
import DataTable, { Column } from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import EditTargetModal from './EditTargetModal';
import type { DataTypeInfo } from '@/types';

interface Target {
  id: number;
  memberId: number;
  memberName: string;
  monthly: number;
  quarterly: number;
  annual: number;
  year: number;
  month: number;
  dataTypeId: number | null;
}

export default function TargetSettings() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [dataTypes, setDataTypes] = useState<DataTypeInfo[]>([]);
  const [selectedDataTypeId, setSelectedDataTypeId] = useState('');

  useEffect(() => {
    fetch('/api/data-types?active=true')
      .then((res) => res.ok ? res.json() : [])
      .then((data: DataTypeInfo[]) => {
        setDataTypes(data);
        const defaultType = data.find((dt) => dt.isDefault);
        if (defaultType) setSelectedDataTypeId(String(defaultType.id));
        else if (data.length > 0) setSelectedDataTypeId(String(data[0].id));
      })
      .catch(() => setDataTypes([]));
  }, []);

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

  const selectedDataType = dataTypes.find((dt) => String(dt.id) === selectedDataTypeId);
  const unitLabel = selectedDataType?.unit || '';

  // データ種類でフィルタ
  const filteredTargets = selectedDataTypeId
    ? targets.filter((t) => t.dataTypeId === Number(selectedDataTypeId) || (!t.dataTypeId && selectedDataType?.isDefault))
    : targets;

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
      render: (t) => <span className="text-sm text-gray-700">{t.monthly}{unitLabel ? `${unitLabel}` : ''}</span>,
    },
    {
      key: 'quarterly',
      label: '四半期目標',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-700">{t.quarterly}{unitLabel ? `${unitLabel}` : ''}</span>,
    },
    {
      key: 'annual',
      label: '年間目標',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-700">{t.annual}{unitLabel ? `${unitLabel}` : ''}</span>,
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: (t) => (
        <Button label="編集" variant="outline" color="blue" onClick={() => setEditingTarget(t)} className="px-3 py-1.5 text-xs" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">目標設定</h2>
        <div className="flex items-center space-x-2">
          {/* データ種類セレクタ */}
          {dataTypes.length > 1 && (
            <div className="flex gap-1 mr-2">
              {dataTypes.map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setSelectedDataTypeId(String(dt.id))}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    selectedDataTypeId === String(dt.id)
                      ? 'text-white border-transparent'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  style={
                    selectedDataTypeId === String(dt.id)
                      ? { backgroundColor: dt.color || '#3B82F6' }
                      : undefined
                  }
                >
                  {dt.name}
                </button>
              ))}
            </div>
          )}
          <Select
            value="2025年度"
            onChange={() => {}}
            options={[
              { value: '2025年度', label: '2025年度' },
              { value: '2026年度', label: '2026年度' },
            ]}
          />
          <Button label="一括設定" />
        </div>
      </div>

      <DataTable
        data={filteredTargets}
        columns={columns}
        keyField="id"
        searchPlaceholder="メンバー名で検索..."
        searchFilter={(t, q) => t.memberName.toLowerCase().includes(q)}
        emptyMessage="目標データがありません"
        mobileRender={(t) => (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">{t.memberName}</span>
              <Button label="編集" variant="outline" color="blue" onClick={() => setEditingTarget(t)} className="px-3 py-1.5 text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-400">月間</div>
                <div className="text-gray-700 font-medium">{t.monthly}{unitLabel}</div>
              </div>
              <div>
                <div className="text-gray-400">四半期</div>
                <div className="text-gray-700 font-medium">{t.quarterly}{unitLabel}</div>
              </div>
              <div>
                <div className="text-gray-400">年間</div>
                <div className="text-gray-700 font-medium">{t.annual}{unitLabel}</div>
              </div>
            </div>
          </div>
        )}
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
