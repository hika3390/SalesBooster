'use client';

import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Select from './common/Select';
import { Dialog } from './common/Dialog';
import CustomFieldsRenderer from './sales/CustomFieldsRenderer';
import type { CustomFieldDefinition, CustomFieldValues } from '@/types/customField';

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
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<CustomFieldValues>({});

  useEffect(() => {
    if (isOpen) {
      fetch('/api/members')
        .then((res) => res.json())
        .then((data) => setMembers(data))
        .catch(console.error);
      fetch('/api/custom-fields?active=true')
        .then((res) => res.json())
        .then((data) => setCustomFieldDefs(data))
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!memberId || !amount) return;

    // 必須カスタムフィールドのバリデーション
    for (const field of customFieldDefs) {
      if (field.isRequired && !customFieldValues[String(field.id)]?.trim()) {
        await Dialog.error(`「${field.name}」は必須項目です。`);
        return;
      }
    }

    // 空でない値のみ送信
    const filteredCustomFields: Record<string, string> = {};
    for (const [key, val] of Object.entries(customFieldValues)) {
      if (val.trim()) filteredCustomFields[key] = val;
    }

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
          ...(Object.keys(filteredCustomFields).length > 0 ? { customFields: filteredCustomFields } : {}),
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
        setCustomFieldValues({});
        onClose();
      } else {
        const data = await res.json().catch(() => null);
        await Dialog.error(data?.error || '売上の登録に失敗しました。');
      }
    } catch {
      await Dialog.error('売上の登録に失敗しました。ネットワーク接続を確認してください。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const footer = (
    <>
      <Button label="キャンセル" variant="outline" color="gray" onClick={handleCancel} />
      <Button label={submitting ? '送信中...' : '追　加'} onClick={handleSubmit} disabled={submitting || !memberId || !amount} />
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

        {/* カスタムフィールド */}
        <CustomFieldsRenderer
          fields={customFieldDefs}
          values={customFieldValues}
          onChange={(id, val) => setCustomFieldValues((prev) => ({ ...prev, [id]: val }))}
        />
      </div>
    </Modal>
  );
}
