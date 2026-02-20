'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import { Dialog } from '@/components/common/Dialog';

interface SalesRecord {
  id: number;
  memberId: number;
  memberName: string;
  amount: number;
  description: string | null;
  recordDate: string;
}

interface MemberOption {
  id: number;
  name: string;
  department: string | null;
}

interface EditSalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  record: SalesRecord | null;
}

export default function EditSalesRecordModal({ isOpen, onClose, onUpdated, record }: EditSalesRecordModalProps) {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/members')
        .then((res) => res.json())
        .then((data) => setMembers(data))
        .catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (record) {
      setMemberId(String(record.memberId));
      setAmount(String(record.amount));
      setMemo(record.description || '');
      const d = new Date(record.recordDate);
      setOrderDate(d.toISOString().slice(0, 16));
    }
  }, [record]);

  const handleSubmit = async () => {
    if (!record || !memberId || !amount) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/sales/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: Number(memberId),
          amount: parseInt(amount) || 0,
          description: memo || undefined,
          recordDate: new Date(orderDate).toISOString(),
        }),
      });

      if (res.ok) {
        onUpdated();
        onClose();
      } else {
        const data = await res.json().catch(() => null);
        await Dialog.error(data?.error || '売上データの更新に失敗しました。');
      }
    } catch {
      await Dialog.error('売上データの更新に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button label="キャンセル" variant="outline" color="gray" onClick={onClose} />
      <Button label={submitting ? '更新中...' : '更　新'} onClick={handleSubmit} disabled={submitting || !memberId || !amount} />
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="売上データ編集" footer={footer}>
      <div className="space-y-4">
        {/* メンバー */}
        <div className="flex items-center">
          <label className="w-24 text-sm text-gray-700 text-right pr-4">メンバー</label>
          <div className="flex-1">
            <Select
              value={memberId}
              onChange={setMemberId}
              options={[
                { value: '', label: '選択してください...' },
                ...members.map((m) => ({ value: String(m.id), label: m.name })),
              ]}
              placeholder="選択してください..."
            />
          </div>
        </div>

        {/* 粗利 */}
        <div className="flex items-center">
          <label className="w-24 text-sm text-gray-700 text-right pr-4">粗利</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder=""
            />
            <span className="text-sm text-blue-600">円</span>
          </div>
        </div>

        {/* 受注日 */}
        <div className="flex items-center">
          <label className="w-24 text-sm text-gray-700 text-right pr-4">受注日</label>
          <div className="flex items-center space-x-2">
            <input
              type="datetime-local"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* 備考 */}
        <div className="flex items-start">
          <label className="w-24 text-sm text-gray-700 text-right pr-4 pt-2">備考</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm h-20 resize-none"
            placeholder="お客様名：&#10;物件名　："
          />
        </div>
      </div>
    </Modal>
  );
}
