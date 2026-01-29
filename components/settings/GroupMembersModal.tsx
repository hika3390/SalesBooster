'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog } from '@/components/common/Dialog';
import Modal from '@/components/common/Modal';

interface MemberOption {
  id: number;
  name: string;
  department: string | null;
}

interface GroupData {
  id: number;
  name: string;
  memberList: { id: number; name: string }[];
}

interface GroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  group: GroupData | null;
}

export default function GroupMembersModal({ isOpen, onClose, onUpdated, group }: GroupMembersModalProps) {
  const [allMembers, setAllMembers] = useState<MemberOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && group) {
      setSelectedIds(new Set(group.memberList.map((m) => m.id)));
      setSearch('');
      fetch('/api/members')
        .then((res) => res.json())
        .then((data) => setAllMembers(data))
        .catch(console.error);
    }
  }, [isOpen, group]);

  const filteredMembers = useMemo(() => {
    if (!search) return allMembers;
    const q = search.toLowerCase();
    return allMembers.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.department && m.department.toLowerCase().includes(q))
    );
  }, [allMembers, search]);

  const handleToggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const filteredIds = filteredMembers.map((m) => m.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredMembers.map((m) => m.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!group) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberIds: Array.from(selectedIds) }),
      });
      if (res.ok) {
        onClose();
        await Dialog.success('グループメンバーを更新しました。');
        onUpdated();
      } else {
        const data = await res.json();
        await Dialog.error(data.error || '更新に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to sync group members:', error);
      await Dialog.error('更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every((m) => selectedIds.has(m.id));

  const footer = (
    <>
      <span className="text-sm text-gray-500 mr-auto">{selectedIds.size}名 選択中</span>
      <button
        onClick={onClose}
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        キャンセル
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '保存中...' : '保存'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${group?.name || ''} - メンバー設定`} footer={footer} maxWidth="md">
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・部署で検索..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{filteredMembers.length}名 表示中</span>
          <div className="space-x-2">
            <button onClick={handleSelectAll} className="text-blue-600 hover:text-blue-800 font-medium">
              すべて選択
            </button>
            <button onClick={handleDeselectAll} className="text-gray-500 hover:text-gray-700 font-medium">
              すべて解除
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
          {filteredMembers.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-6">該当するメンバーがいません</div>
          ) : (
            <>
              <label className="flex items-center px-4 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={allFilteredSelected ? handleDeselectAll : handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-600">全選択</span>
              </label>
              {filteredMembers.map((m) => (
                <label key={m.id} className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(m.id)}
                    onChange={() => handleToggle(m.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-800">{m.name}</span>
                  {m.department && (
                    <span className="ml-2 text-xs text-gray-400">{m.department}</span>
                  )}
                </label>
              ))}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
