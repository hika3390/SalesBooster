'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface MemberOption {
  id: number;
  name: string;
}

interface GroupData {
  id: number;
  name: string;
  managerId: number | null;
  members: number;
  memberList: { id: number; name: string }[];
}

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  group: GroupData | null;
}

export default function EditGroupModal({ isOpen, onClose, onUpdated, group }: EditGroupModalProps) {
  const [allMembers, setAllMembers] = useState<MemberOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    if (isOpen && group) {
      setName(group.name);
      setManagerId(group.managerId ? String(group.managerId) : '');
      fetch('/api/members')
        .then((res) => res.json())
        .then((data) => setAllMembers(data))
        .catch(console.error);
    }
  }, [isOpen, group]);

  const handleSubmit = async () => {
    if (!group || !name) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          managerId: managerId ? Number(managerId) : null,
        }),
      });
      if (res.ok) {
        onClose();
        await Dialog.success('グループ情報を更新しました。');
        onUpdated();
      } else {
        const data = await res.json();
        await Dialog.error(data.error || '更新に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to update group:', error);
      await Dialog.error('更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button label="キャンセル" variant="outline" color="gray" onClick={onClose} />
      <Button label={submitting ? '更新中...' : '更新'} onClick={handleSubmit} disabled={submitting || !name} />
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="グループを編集" footer={footer} maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">グループ名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">マネージャー</label>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">未設定</option>
            {allMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
