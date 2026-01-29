'use client';

import React from 'react';

export default function TargetSettings() {
  const targets = [
    { name: '田中太郎', monthly: 500, quarterly: 1500, annual: 6000 },
    { name: '鈴木花子', monthly: 450, quarterly: 1350, annual: 5400 },
    { name: '佐藤次郎', monthly: 600, quarterly: 1800, annual: 7200 },
    { name: '山田美咲', monthly: 400, quarterly: 1200, annual: 4800 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">目標設定</h2>
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option>2025年度</option>
            <option>2026年度</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            一括設定
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">メンバー</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">月間目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">四半期目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">年間目標</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{target.name}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.monthly}万円</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.quarterly}万円</td>
                <td className="px-6 py-4 text-sm text-right text-gray-700">{target.annual}万円</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
