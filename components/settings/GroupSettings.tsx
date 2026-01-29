'use client';

import React from 'react';

export default function GroupSettings() {
  const groups = [
    { id: 1, name: '3Aグループ 支店1', members: 8, manager: '佐藤次郎' },
    { id: 2, name: '3Bグループ 支店2', members: 6, manager: '高橋一郎' },
    { id: 3, name: '3Cグループ 本社', members: 10, manager: '伊藤健太' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">グループ設定</h2>
        <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          グループを追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">{group.name}</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>メンバー数</span>
                <span className="font-medium text-gray-800">{group.members}名</span>
              </div>
              <div className="flex justify-between">
                <span>マネージャー</span>
                <span className="font-medium text-gray-800">{group.manager}</span>
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">編集</button>
              <button className="flex-1 px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
