'use client';

import React from 'react';

export default function MemberSettings() {
  const members = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', role: '営業', status: '有効' },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', role: '営業', status: '有効' },
    { id: 3, name: '佐藤次郎', email: 'sato@example.com', role: 'マネージャー', status: '有効' },
    { id: 4, name: '山田美咲', email: 'yamada@example.com', role: '営業', status: '無効' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">メンバー設定</h2>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
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
                <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    member.status === '有効' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm mr-3">編集</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
