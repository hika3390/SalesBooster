'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/common/Dialog';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';

interface Department {
  id: number;
  name: string;
}

interface MemberData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string | null;
  departmentId?: number | null;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  member: MemberData | null;
}

export default function EditMemberModal({ isOpen, onClose, onUpdated, member }: EditMemberModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('SALES');
  const [status, setStatus] = useState('ACTIVE');
  const [departmentId, setDepartmentId] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      setName(member.name);
      setEmail(member.email);
      setRole(member.role);
      setStatus(member.status);
      setDepartmentId(member.departmentId ? String(member.departmentId) : '');
      fetch('/api/departments')
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(console.error);
    }
  }, [isOpen, member]);

  const handleSubmit = async () => {
    if (!member || !name || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          status,
          departmentId: departmentId ? Number(departmentId) : null,
        }),
      });
      if (res.ok) {
        onClose();
        await Dialog.success('メンバー情報を更新しました。');
        onUpdated();
      } else {
        const data = await res.json();
        await Dialog.error(data.error || '更新に失敗しました。');
      }
    } catch (error) {
      console.error('Failed to update member:', error);
      await Dialog.error('更新に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button label="キャンセル" variant="outline" color="gray" onClick={onClose} />
      <Button label={submitting ? '更新中...' : '更新'} onClick={handleSubmit} disabled={submitting || !name || !email} />
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="メンバーを編集" footer={footer} maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">役割</label>
          <Select
            value={role}
            onChange={setRole}
            options={[
              { value: 'SALES', label: '営業' },
              { value: 'MANAGER', label: 'マネージャー' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: 'ACTIVE', label: '有効' },
              { value: 'INACTIVE', label: '無効' },
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">部署</label>
          <Select
            value={departmentId}
            onChange={setDepartmentId}
            options={[
              { value: '', label: '未所属' },
              ...departments.map((d) => ({ value: String(d.id), label: d.name })),
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}
