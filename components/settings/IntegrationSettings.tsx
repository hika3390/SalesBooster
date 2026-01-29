'use client';

import React, { useState, useEffect } from 'react';

interface Integration {
  id: number;
  name: string;
  description: string;
  status: string;
  icon: string;
}

const statusLabel: Record<string, string> = { CONNECTED: '接続済み', DISCONNECTED: '未接続' };

export default function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations');
      if (res.ok) setIntegrations(await res.json());
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggle = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchIntegrations();
    } catch (error) {
      console.error('Failed to update integration:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">外部連携設定</h2>

      <div className="space-y-4">
        {integrations.map((item) => {
          const displayStatus = statusLabel[item.status] || item.status;
          const isConnected = item.status === 'CONNECTED';

          return (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between">
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
                  isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {displayStatus}
                </span>
                <button
                  onClick={() => handleToggle(item.id, item.status)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    isConnected
                      ? 'border border-red-300 text-red-600 hover:bg-red-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isConnected ? '切断' : '接続'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
