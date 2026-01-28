'use client';

import React, { useState } from 'react';
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

export default function SalesInputModal({ isOpen, onClose, onSubmit }: SalesInputModalProps) {
  const [member, setMember] = useState('');
  const [amount, setAmount] = useState('');
  const [contracts, setContracts] = useState('1');
  const [orderDate, setOrderDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
  });
  const [memo, setMemo] = useState('');

  const handleSubmit = () => {
    onSubmit({
      member,
      amount: parseInt(amount) || 0,
      contracts: parseInt(contracts) || 0,
      orderDate,
      memo,
    });
    // フォームをリセット
    setMember('');
    setAmount('');
    setContracts('1');
    setMemo('');
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const footer = (
    <>
      <button
        onClick={handleCancel}
        className="px-8 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100"
      >
        キャンセル
      </button>
      <button
        onClick={handleSubmit}
        className="px-8 py-2 bg-blue-900 text-white rounded text-sm hover:bg-blue-800"
      >
        追　加
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
              value={member}
              onChange={(e) => setMember(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">選択してく...</option>
              <option value="伊藤 敬人">伊藤 敬人</option>
              <option value="西山 知輝">西山 知輝</option>
              <option value="高嶋 直樹">高嶋 直樹</option>
              <option value="岩ヶ谷 由紀">岩ヶ谷 由紀</option>
              <option value="岡崎 淳介">岡崎 淳介</option>
            </select>
            <span className="text-gray-400">&lt;</span>
            <select className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
              <option>全社</option>
              <option>本社</option>
              <option>支店1</option>
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
