'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';

interface Integration {
  id: number;
  name: string;
  description: string;
  status: string;
  icon: string;
  config: {
    channelAccessToken?: string;
    groupId?: string;
  } | null;
}

export default function IntegrationSettings() {
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [channelAccessToken, setChannelAccessToken] = useState('');
  const [groupId, setGroupId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchIntegration = async () => {
    try {
      const res = await fetch('/api/integrations');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const line = data.find((i: Integration) => i.name === 'LINE Messaging API') || null;
      setIntegration(line);
      if (line?.config) {
        setChannelAccessToken(line.config.channelAccessToken || '');
        setGroupId(line.config.groupId || '');
      }
    } catch {
      setMessage({ type: 'error', text: '連携情報の取得に失敗しました。' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegration();
  }, []);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveConfig = async () => {
    if (!integration) return;
    if (!channelAccessToken.trim() || !groupId.trim()) {
      showMsg('error', 'Channel Access Token と Group ID を入力してください。');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { channelAccessToken: channelAccessToken.trim(), groupId: groupId.trim() } }),
      });
      if (res.ok) {
        await fetchIntegration();
        showMsg('success', '設定を保存しました。');
      } else {
        const data = await res.json().catch(() => null);
        showMsg('error', data?.error || '設定の保存に失敗しました。');
      }
    } catch {
      showMsg('error', '設定の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!channelAccessToken.trim() || !groupId.trim()) {
      showMsg('error', 'Channel Access Token と Group ID を入力してください。');
      return;
    }

    setTesting(true);
    try {
      const res = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelAccessToken: channelAccessToken.trim(), groupId: groupId.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        showMsg('success', 'テスト送信に成功しました。LINEグループを確認してください。');
      } else {
        showMsg('error', data?.error || 'テスト送信に失敗しました。');
      }
    } catch {
      showMsg('error', 'テスト送信に失敗しました。');
    } finally {
      setTesting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!integration) return;
    const newStatus = integration.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';

    setToggling(true);
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchIntegration();
        showMsg('success', newStatus === 'CONNECTED' ? '接続しました。' : '切断しました。');
      } else {
        const data = await res.json().catch(() => null);
        showMsg('error', data?.error || 'ステータスの更新に失敗しました。');
      }
    } catch {
      showMsg('error', 'ステータスの更新に失敗しました。');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">読み込み中...</div>;
  }

  if (!integration) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-3">LINE Messaging API の連携設定が見つかりません。</div>
        <button onClick={fetchIntegration} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">再読み込み</button>
      </div>
    );
  }

  const isConnected = integration.status === 'CONNECTED';
  const hasConfig = !!(integration.config?.channelAccessToken && integration.config?.groupId);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">外部連携設定</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src="/line-icon.svg"
              alt="LINE"
              className="w-12 h-12 rounded-lg"
            />
            <div>
              <div className="font-semibold text-gray-800">LINE Messaging API</div>
              <div className="text-sm text-gray-500">{integration.description}</div>
            </div>
          </div>
          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isConnected ? '接続済み' : '未接続'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel Access Token</label>
            <div className="flex items-center space-x-2">
              <input
                type={showToken ? 'text' : 'password'}
                value={channelAccessToken}
                onChange={(e) => setChannelAccessToken(e.target.value)}
                placeholder="Channel Access Token を入力"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                title={showToken ? '非表示' : '表示'}
              >
                {showToken ? '隠す' : '表示'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="通知先のグループ ID を入力"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button
            label={testing ? '送信中...' : 'テスト送信'}
            onClick={handleTestSend}
            color="gray"
            variant="outline"
            disabled={testing || !channelAccessToken.trim() || !groupId.trim()}
          />
          <Button
            label={saving ? '保存中...' : '設定を保存'}
            onClick={handleSaveConfig}
            color="blue"
            disabled={saving || !channelAccessToken.trim() || !groupId.trim()}
          />
          <Button
            label={toggling ? '処理中...' : (isConnected ? '切断' : '接続')}
            onClick={handleToggleStatus}
            color={isConnected ? 'red' : 'green'}
            variant={isConnected ? 'outline' : 'solid'}
            disabled={toggling || (!hasConfig && !isConnected)}
          />
        </div>

        {!hasConfig && !isConnected && (
          <p className="mt-3 text-xs text-gray-400">接続するには、先に設定を保存してください。</p>
        )}
      </div>
    </div>
  );
}
