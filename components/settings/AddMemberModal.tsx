'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import Modal from '@/components/common/Modal';

interface Department {
  id: number;
  name: string;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onAdded }: AddMemberModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SALES');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setRole('SALES');
      setDepartmentId('');
      fetch('/api/departments')
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          departmentId: departmentId ? Number(departmentId) : undefined,
        }),
      });
      if (res.ok) {
        onClose();
        await Dialog.success('メンバーを追加しました。');
        onAdded();
      } else {
        const data = await res.json();
        await Dialog.error(data.error || '追加に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to create member:', error);
      await Dialog.error('追加に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        キャンセル
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting || !name || !email}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '追加中...' : '追加'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="メンバーを追加" footer={footer} maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="山田 太郎"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="taro.yamada@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="SALES">営業</option>
            <option value="MANAGER">マネージャー</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">部署</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">未所属</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
