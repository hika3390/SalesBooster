'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import AddGroupModal from './AddGroupModal';
import EditGroupModal from './EditGroupModal';
import GroupMembersModal from './GroupMembersModal';

interface Group {
  id: number;
  name: string;
  members: number;
  managerId: number | null;
  memberList: { id: number; name: string }[];
}

export default function GroupSettings() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [membersGroup, setMembersGroup] = useState<Group | null>(null);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) setGroups(await res.json());
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = await Dialog.confirm('このグループを削除しますか？');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchGroups();
    } catch (error) {
      console.error('Failed to delete group:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">グループ設定</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          グループを追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-800">{group.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>メンバー数</span>
                <span className="font-medium text-gray-800">{group.members}名</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => setMembersGroup(group)} className="flex-1 px-3 py-1.5 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">メンバー</button>
              <button onClick={() => setEditingGroup(group)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">編集</button>
              <button onClick={() => handleDelete(group.id)} className="flex-1 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">削除</button>
            </div>
          </div>
        ))}
      </div>

      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={fetchGroups}
      />

      <EditGroupModal
        isOpen={!!editingGroup}
        onClose={() => setEditingGroup(null)}
        onUpdated={fetchGroups}
        group={editingGroup}
      />

      <GroupMembersModal
        isOpen={!!membersGroup}
        onClose={() => setMembersGroup(null)}
        onUpdated={fetchGroups}
        group={membersGroup}
      />
    </div>
  );
}
