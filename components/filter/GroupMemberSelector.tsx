'use client';

import React from 'react';

export default function GroupMemberSelector() {
  return (
    <div className="flex items-center space-x-4">
      {/* グループ選択 */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">グループ</label>
        <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
          <option>&lt;3Aグループ&gt;支店1</option>
          <option>グループ2</option>
          <option>グループ3</option>
        </select>
      </div>

      {/* メンバー/グループ全員 */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">メンバー</label>
        <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white">
          <option>グループ全員</option>
          <option>メンバー1</option>
          <option>メンバー2</option>
        </select>
      </div>
    </div>
  );
}
