'use client';

import React from 'react';

export default function IntegrationSettings() {
  const integrations = [
    { name: 'Salesforce', description: 'CRMデータの自動同期', status: '接続済み', icon: 'SF' },
    { name: 'Slack', description: '売上通知の自動投稿', status: '未接続', icon: 'SL' },
    { name: 'Google Sheets', description: 'スプレッドシートへの自動エクスポート', status: '未接続', icon: 'GS' },
    { name: 'Microsoft Teams', description: 'チーム通知の自動投稿', status: '未接続', icon: 'MT' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">外部連携設定</h2>

      <div className="space-y-4">
        {integrations.map((item, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500">{item.description}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                item.status === '接続済み' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {item.status}
              </span>
              <button className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                item.status === '接続済み'
                  ? 'border border-red-300 text-red-600 hover:bg-red-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                {item.status === '接続済み' ? '切断' : '接続'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
