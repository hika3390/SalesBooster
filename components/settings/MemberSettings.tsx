'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import AddMemberModal from './AddMemberModal';
import EditMemberModal from './EditMemberModal';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  departmentId?: number | null;
}

const roleLabel: Record<string, string> = { SALES: '営業', MANAGER: 'マネージャー' };
const statusLabel: Record<string, string> = { ACTIVE: '有効', INACTIVE: '無効' };

export default function MemberSettings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) setMembers(await res.json());
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await Dialog.confirm('このメンバーを削除しますか？');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">メンバー設定</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          メンバーを追加
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">名前</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">メール</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">役割</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ステータス</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{member.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{roleLabel[member.role] || member.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {statusLabel[member.status] || member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingMember(member)} className="text-blue-600 hover:text-blue-800 text-sm mr-3">編集</button>
                  <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800 text-sm">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={fetchMembers}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        onUpdated={fetchMembers}
        member={editingMember}
      />
    </div>
  );
}
