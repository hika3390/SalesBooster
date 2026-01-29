'use client';

import React from 'react';

export default function LogViewer() {
  const logs = [
    { date: '2025/12/15 14:32', user: '田中太郎', action: '売上データ入力', detail: '500万円 / 商談A' },
    { date: '2025/12/15 13:15', user: '佐藤次郎', action: 'メンバー追加', detail: '山田美咲を追加' },
    { date: '2025/12/15 11:08', user: '鈴木花子', action: '売上データ入力', detail: '320万円 / 商談B' },
    { date: '2025/12/14 17:45', user: '管理者', action: '目標設定変更', detail: '2025年12月の目標を更新' },
    { date: '2025/12/14 16:20', user: '田中太郎', action: 'レポート出力', detail: '月次レポート(PDF)' },
    { date: '2025/12/14 10:00', user: '管理者', action: 'グループ設定変更', detail: '3Aグループの構成を変更' },
    { date: '2025/12/13 15:30', user: '鈴木花子', action: '売上データ修正', detail: '商談Cの金額を修正' },
    { date: '2025/12/13 09:12', user: '管理者', action: 'システム設定変更', detail: 'セッションタイムアウトを変更' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">操作ログ閲覧</h2>
        <div className="flex items-center space-x-2">
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <span className="text-gray-500">〜</span>
          <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            検索
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">日時</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ユーザー</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">詳細</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{log.date}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{log.user}</td>
                <td className="px-6 py-3 text-sm text-gray-700">{log.action}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">全 128 件中 1-8 件を表示</div>
        <div className="flex space-x-1">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">前へ</button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">次へ</button>
        </div>
      </div>
    </div>
  );
}
