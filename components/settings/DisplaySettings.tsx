'use client';

import { useState, useEffect } from 'react';
import { DisplayConfig, DisplayViewConfig, DEFAULT_DISPLAY_CONFIG, TransitionType } from '@/types/display';
import { VIEW_TYPE_LABELS } from '@/types';
import Button from '@/components/common/Button';

const MESSAGE_DISPLAY_MS = 3000;

interface GroupOption {
  id: number;
  name: string;
}

interface MemberOption {
  id: number;
  name: string;
}

export default function DisplaySettings() {
  const [config, setConfig] = useState<DisplayConfig>(DEFAULT_DISPLAY_CONFIG);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // 設定を読み込み
    fetch('/api/settings/display')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (!data.views || !Array.isArray(data.views)) {
          setConfig(DEFAULT_DISPLAY_CONFIG);
        } else {
          setConfig({ ...DEFAULT_DISPLAY_CONFIG, ...data });
        }
      })
      .catch(() => setConfig(DEFAULT_DISPLAY_CONFIG));

    // グループ一覧を読み込み
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => setGroups(data.map((g: { id: number; name: string }) => ({ id: g.id, name: g.name }))))
      .catch(() => {});

    // メンバー一覧を読み込み
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => setMembers(data.map((m: { id: number; name: string }) => ({ id: m.id, name: m.name }))))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings/display', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '設定を保存しました' });
      } else {
        setMessage({ type: 'error', text: '保存に失敗しました' });
      }
    } catch {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS);
    }
  };

  const updateView = (index: number, updates: Partial<DisplayViewConfig>) => {
    setConfig((prev) => ({
      ...prev,
      views: prev.views.map((v, i) => (i === index ? { ...v, ...updates } : v)),
    }));
  };

  const moveView = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.views.length) return;

    setConfig((prev) => {
      const newViews = [...prev.views];
      const temp = newViews[index];
      newViews[index] = newViews[targetIndex];
      newViews[targetIndex] = temp;
      return {
        ...prev,
        views: newViews.map((v, i) => ({ ...v, order: i })),
      };
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">ディスプレイモード設定</h2>

      <div className="space-y-6">
        {/* ビュー設定 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 mb-4">表示ビュー設定</h3>

          {/* PC: テーブル表示 */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-16">順番</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">ビュー名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">表示タイトル</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-20">有効</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-32">表示秒数</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {config.views.map((view, index) => (
                  <tr key={view.viewType} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{VIEW_TYPE_LABELS[view.viewType]}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={view.title}
                        onChange={(e) => updateView(index, { title: e.target.value })}
                        placeholder={VIEW_TYPE_LABELS[view.viewType]}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={view.enabled}
                        onChange={(e) => updateView(index, { enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <input
                          type="number"
                          value={view.duration}
                          onChange={(e) => updateView(index, { duration: Math.max(5, parseInt(e.target.value) || 5) })}
                          min={5}
                          max={600}
                          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                        />
                        <span className="text-gray-500">秒</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => moveView(index, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveView(index, 'down')}
                          disabled={index === config.views.length - 1}
                          className={`p-1 rounded ${index === config.views.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル: カードリスト表示 */}
          <div className="md:hidden space-y-3">
            {config.views.map((view, index) => (
              <div key={view.viewType} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{VIEW_TYPE_LABELS[view.viewType]}</span>
                  </div>
                  <label className="flex items-center space-x-1.5">
                    <span className="text-xs text-gray-500">有効</span>
                    <input
                      type="checkbox"
                      checked={view.enabled}
                      onChange={(e) => updateView(index, { enabled: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>
                </div>
                <div className="mb-2">
                  <input
                    type="text"
                    value={view.title}
                    onChange={(e) => updateView(index, { title: e.target.value })}
                    placeholder={VIEW_TYPE_LABELS[view.viewType]}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={view.duration}
                      onChange={(e) => updateView(index, { duration: Math.max(5, parseInt(e.target.value) || 5) })}
                      min={5}
                      max={600}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs text-gray-500">秒</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveView(index, 'up')}
                      disabled={index === 0}
                      className={`p-1.5 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveView(index, 'down')}
                      disabled={index === config.views.length - 1}
                      className={`p-1.5 rounded ${index === config.views.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 再生設定 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 mb-4">再生設定</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">ループ再生</div>
                <div className="text-xs text-gray-500">最後のビューの後に最初に戻る</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.loop}
                  onChange={(e) => setConfig((prev) => ({ ...prev, loop: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">データ更新間隔</div>
                <div className="text-xs text-gray-500">売上データの自動更新間隔</div>
              </div>
              <select
                value={config.dataRefreshInterval}
                onChange={(e) => setConfig((prev) => ({ ...prev, dataRefreshInterval: Number(e.target.value) }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <option value={60000}>1分</option>
                <option value={300000}>5分</option>
                <option value={900000}>15分</option>
                <option value={1800000}>30分</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">トランジション効果</div>
                <div className="text-xs text-gray-500">ビュー切替時のアニメーション</div>
              </div>
              <select
                value={config.transition}
                onChange={(e) => setConfig((prev) => ({ ...prev, transition: e.target.value as TransitionType }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <option value="NONE">なし</option>
                <option value="FADE">フェード</option>
                <option value="SLIDE_LEFT">スライド（左）</option>
                <option value="SLIDE_RIGHT">スライド（右）</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">ダークモード</div>
                <div className="text-xs text-gray-500">ディスプレイ画面を暗い配色にする</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.darkMode}
                  onChange={(e) => setConfig((prev) => ({ ...prev, darkMode: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* フィルター設定 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 mb-4">フィルター設定</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">グループ</div>
                <div className="text-xs text-gray-500">表示対象のグループ</div>
              </div>
              <select
                value={config.filter.groupId}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, groupId: e.target.value, memberId: '' },
                  }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <option value="">全グループ</option>
                {groups.map((g) => (
                  <option key={g.id} value={String(g.id)}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">メンバー</div>
                <div className="text-xs text-gray-500">表示対象のメンバー</div>
              </div>
              <select
                value={config.filter.memberId}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, memberId: e.target.value },
                  }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white w-full sm:w-auto sm:min-w-[200px]"
              >
                <option value="">全メンバー</option>
                {members.map((m) => (
                  <option key={m.id} value={String(m.id)}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 表示情報設定 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="font-semibold text-gray-800 mb-4">表示情報設定</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">チーム名</div>
                <div className="text-xs text-gray-500">ディスプレイ画面に表示するチーム名</div>
              </div>
              <input
                type="text"
                value={config.teamName}
                onChange={(e) => setConfig((prev) => ({ ...prev, teamName: e.target.value }))}
                placeholder="例: 営業1課"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[200px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">会社ロゴURL</div>
                <div className="text-xs text-gray-500">ディスプレイ画面に表示するロゴ画像のURL</div>
              </div>
              <input
                type="url"
                value={config.companyLogoUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, companyLogoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto sm:min-w-[300px]"
              />
            </div>
          </div>
        </div>

        {/* 操作ボタン */}
        <div className="flex items-center justify-end space-x-3">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </span>
          )}
          <Button
            label={saving ? '保存中...' : '設定を保存'}
            onClick={handleSave}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
}
