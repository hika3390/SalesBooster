'use client';

import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';

interface SalesInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SalesInputData) => void;
}

interface SalesInputData {
  member: string;
  amount: number;
  contracts: number;
  orderDate: string;
  memo: string;
}

interface MemberOption {
  id: number;
  name: string;
  department: string | null;
}

export default function SalesInputModal({ isOpen, onClose, onSubmit }: SalesInputModalProps) {
  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [contracts, setContracts] = useState('1');
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
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

  const handleSubmit = async () => {
    if (!memberId || !amount) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: Number(memberId),
          amount: parseInt(amount) || 0,
          description: memo || undefined,
          recordDate: new Date(orderDate).toISOString(),
        }),
      });

      if (res.ok) {
        const selectedMember = members.find((m) => m.id === Number(memberId));
        onSubmit({
          member: selectedMember?.name || '',
          amount: parseInt(amount) || 0,
          contracts: parseInt(contracts) || 0,
          orderDate,
          memo,
        });
        setMemberId('');
        setAmount('');
        setContracts('1');
        setMemo('');
        onClose();
      }
    } catch (error) {
      console.error('Failed to create sales record:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const footer = (
    <>
      <button
        onClick={handleCancel}
        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        キャンセル
      </button>
      <button
        onClick={handleSubmit}
        disabled={submitting || !memberId || !amount}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? '送信中...' : '追　加'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="契約速報"
      footer={footer}
    >
      <div className="space-y-4">
        {/* メンバー */}
        <div className="flex items-center">
          <label className="w-24 text-sm text-gray-700 text-right pr-4">メンバー</label>
          <div className="flex-1 flex items-center space-x-2">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">選択してください...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
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

        {/* 契約 */}
        <div className="flex items-center">
          <label className="w-24 text-sm text-gray-700 text-right pr-4">契約</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={contracts}
              onChange={(e) => setContracts(e.target.value)}
              className="w-32 border border-gray-300 rounded px-3 py-2 text-sm"
              min="1"
            />
            <span className="text-sm text-blue-600">件</span>
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
