'use client';

import { useState, useEffect } from 'react';
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
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  const fetchTargets = async () => {
    try {
      const res = await fetch('/api/targets');
      if (res.ok) setTargets(await res.json());
    } catch (error) {
      console.error('Failed to fetch targets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
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
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            一括設定
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">メンバー</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">月間目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">四半期目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">年間目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => (
              <tr key={target.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{target.memberName}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.monthly}万円</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.quarterly}万円</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.annual}万円</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingTarget(target)} className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditTargetModal
        isOpen={!!editingTarget}
        onClose={() => setEditingTarget(null)}
        onUpdated={fetchTargets}
        target={editingTarget}
      />
    </div>
  );
}
