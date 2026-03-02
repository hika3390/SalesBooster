'use client';

import { useState, useEffect, useCallback } from 'react';
import { DisplayConfig, DisplayViewConfig, DEFAULT_DISPLAY_CONFIG, TransitionType, CustomSlideData } from '@/types/display';
import { VIEW_TYPE_LABELS } from '@/types';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import AddCustomSlideModal from './AddCustomSlideModal';

const MESSAGE_DISPLAY_MS = 3000;

interface GroupOption {
  id: number;
  name: string;
}

interface MemberOption {
  id: number;
  name: string;
}

const SLIDE_TYPE_LABELS: Record<string, string> = {
  IMAGE: '画像',
  YOUTUBE: 'YouTube',
  TEXT: 'テキスト',
};

export default function DisplaySettings() {
  const [config, setConfig] = useState<DisplayConfig>(DEFAULT_DISPLAY_CONFIG);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customSlides, setCustomSlides] = useState<CustomSlideData[]>([]);
  const [showAddSlideModal, setShowAddSlideModal] = useState(false);
  const [deletingSlideId, setDeletingSlideId] = useState<number | null>(null);

  const loadCustomSlides = useCallback(async () => {
    try {
      const res = await fetch('/api/custom-slides');
      const data = await res.json();
      const slides: CustomSlideData[] = Array.isArray(data) ? data : [];
      setCustomSlides(slides);
      return slides;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      // 設定とカスタムスライドを並列で読み込み
      const [configData, slides] = await Promise.all([
        fetch('/api/settings/display')
          .then((res) => {
            if (!res.ok) throw new Error('API error');
            return res.json();
          })
          .catch(() => null),
        loadCustomSlides(),
      ]);

      let loadedConfig: DisplayConfig;
      if (!configData || !configData.views || !Array.isArray(configData.views)) {
        loadedConfig = DEFAULT_DISPLAY_CONFIG;
      } else {
        loadedConfig = { ...DEFAULT_DISPLAY_CONFIG, ...configData };
      }

      // 孤立したカスタムスライド（ビューに紐付いていないもの）をビューに追加
      const linkedSlideIds = new Set(
        loadedConfig.views
          .filter((v) => v.viewType === 'CUSTOM_SLIDE' && v.customSlideId)
          .map((v) => v.customSlideId)
      );
      const orphanSlides = slides.filter((s) => !linkedSlideIds.has(s.id));
      if (orphanSlides.length > 0) {
        const newViews = [
          ...loadedConfig.views,
          ...orphanSlides.map((s, i) => ({
            viewType: 'CUSTOM_SLIDE' as const,
            enabled: true,
            duration: 15,
            order: loadedConfig.views.length + i,
            title: s.title || SLIDE_TYPE_LABELS[s.slideType] || 'カスタムスライド',
            customSlideId: s.id,
          })),
        ];
        loadedConfig = { ...loadedConfig, views: newViews };
        // 孤立スライドをDisplayConfigViewにも永続化
        fetch('/api/settings/display', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loadedConfig),
        }).catch(() => {});
      }

      setConfig(loadedConfig);
    };

    loadAll();

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
  }, [loadCustomSlides]);

  const saveConfig = async (configToSave: DisplayConfig) => {
    const res = await fetch('/api/settings/display', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configToSave),
    });
    if (!res.ok) throw new Error('保存に失敗しました');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveConfig(config);
      setMessage({ type: 'success', text: '設定を保存しました' });
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

  const handleSlideCreated = async () => {
    setShowAddSlideModal(false);
    try {
      const res = await fetch('/api/custom-slides');
      const slides: CustomSlideData[] = await res.json();
      setCustomSlides(slides);
      const latest = slides[slides.length - 1];
      if (latest) {
        const newConfig: DisplayConfig = {
          ...config,
          views: [
            ...config.views,
            {
              viewType: 'CUSTOM_SLIDE' as const,
              enabled: true,
              duration: 15,
              order: config.views.length,
              title: latest.title || SLIDE_TYPE_LABELS[latest.slideType] || 'カスタムスライド',
              customSlideId: latest.id,
            },
          ],
        };
        setConfig(newConfig);
        await saveConfig(newConfig);
        setMessage({ type: 'success', text: 'スライドを追加しました' });
        setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS);
      }
    } catch {
      setMessage({ type: 'error', text: 'スライドの追加に失敗しました' });
      setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS);
    }
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (!confirm('このスライドを削除しますか？')) return;
    setDeletingSlideId(slideId);
    try {
      const res = await fetch(`/api/custom-slides/${slideId}`, { method: 'DELETE' });
      if (res.ok) {
        setCustomSlides((prev) => prev.filter((s) => s.id !== slideId));
        const newConfig: DisplayConfig = {
          ...config,
          views: config.views
            .filter((v) => !(v.viewType === 'CUSTOM_SLIDE' && v.customSlideId === slideId))
            .map((v, i) => ({ ...v, order: i })),
        };
        setConfig(newConfig);
        await saveConfig(newConfig);
        setMessage({ type: 'success', text: 'スライドを削除しました' });
        setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS);
      }
    } catch {
      setMessage({ type: 'error', text: 'スライドの削除に失敗しました' });
      setTimeout(() => setMessage(null), MESSAGE_DISPLAY_MS);
    } finally {
      setDeletingSlideId(null);
    }
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

  const isYouTubeSlide = (view: DisplayViewConfig) =>
    view.viewType === 'CUSTOM_SLIDE'
    && customSlides.find((s) => s.id === view.customSlideId)?.slideType === 'YOUTUBE';

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
                  <th className="px-4 py-3 text-left font-medium text-gray-600 w-44">ビュー名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">表示タイトル</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-20">有効</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-32">表示秒数</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 w-28">操作</th>
                </tr>
              </thead>
              <tbody>
                {config.views.map((view, index) => (
                  <tr key={`${view.viewType}-${view.customSlideId ?? index}`} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {view.viewType === 'CUSTOM_SLIDE'
                        ? `カスタムスライド (${SLIDE_TYPE_LABELS[customSlides.find((s) => s.id === view.customSlideId)?.slideType ?? ''] || ''})`
                        : VIEW_TYPE_LABELS[view.viewType]}
                    </td>
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
                      {isYouTubeSlide(view) ? (
                        <span className="text-sm text-gray-400">動画終了まで</span>
                      ) : (
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
                      )}
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
                        {view.viewType === 'CUSTOM_SLIDE' && (
                          <button
                            onClick={() => view.customSlideId && handleDeleteSlide(view.customSlideId)}
                            disabled={deletingSlideId === view.customSlideId}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="スライドを削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
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
              <div key={`${view.viewType}-${view.customSlideId ?? index}`} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
                    <span className="text-sm font-medium text-gray-800">
                      {view.viewType === 'CUSTOM_SLIDE'
                        ? `カスタムスライド (${SLIDE_TYPE_LABELS[customSlides.find((s) => s.id === view.customSlideId)?.slideType ?? ''] || ''})`
                        : VIEW_TYPE_LABELS[view.viewType]}
                    </span>
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
                  {isYouTubeSlide(view) ? (
                    <span className="text-xs text-gray-400">動画終了まで</span>
                  ) : (
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
                  )}
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
                    {view.viewType === 'CUSTOM_SLIDE' && (
                      <button
                        onClick={() => view.customSlideId && handleDeleteSlide(view.customSlideId)}
                        disabled={deletingSlideId === view.customSlideId}
                        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="スライドを削除"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* スライド追加ボタン */}
          <div className="mt-4">
            <Button
              label="カスタムスライドを追加"
              onClick={() => setShowAddSlideModal(true)}
              disabled={customSlides.length >= 10}
              title={customSlides.length >= 10 ? '上限の10件に達しています' : undefined}
              variant="outline"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            />
            <p className="text-xs text-gray-400 mt-1.5">画像・YouTube動画・テキストをローテーションに追加（最大10件）</p>
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
              <Select
                value={String(config.dataRefreshInterval)}
                onChange={(v) => setConfig((prev) => ({ ...prev, dataRefreshInterval: Number(v) }))}
                options={[
                  { value: '60000', label: '1分' },
                  { value: '300000', label: '5分' },
                  { value: '900000', label: '15分' },
                  { value: '1800000', label: '30分' },
                ]}
                className="w-full sm:w-auto sm:min-w-[200px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">トランジション効果</div>
                <div className="text-xs text-gray-500">ビュー切替時のアニメーション</div>
              </div>
              <Select
                value={config.transition}
                onChange={(v) => setConfig((prev) => ({ ...prev, transition: v as TransitionType }))}
                options={[
                  { value: 'NONE', label: 'なし' },
                  { value: 'FADE', label: 'フェード' },
                  { value: 'SLIDE_LEFT', label: 'スライド（左）' },
                  { value: 'SLIDE_RIGHT', label: 'スライド（右）' },
                ]}
                className="w-full sm:w-auto sm:min-w-[200px]"
              />
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
              <Select
                value={config.filter.groupId}
                onChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, groupId: v, memberId: '' },
                  }))
                }
                options={[
                  { value: '', label: '全グループ' },
                  ...groups.map((g) => ({ value: String(g.id), label: g.name })),
                ]}
                className="w-full sm:w-auto sm:min-w-[200px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium text-gray-700">メンバー</div>
                <div className="text-xs text-gray-500">表示対象のメンバー</div>
              </div>
              <Select
                value={config.filter.memberId}
                onChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, memberId: v },
                  }))
                }
                options={[
                  { value: '', label: '全メンバー' },
                  ...members.map((m) => ({ value: String(m.id), label: m.name })),
                ]}
                className="w-full sm:w-auto sm:min-w-[200px]"
              />
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

        <AddCustomSlideModal
          open={showAddSlideModal}
          onClose={() => setShowAddSlideModal(false)}
          onCreated={handleSlideCreated}
        />

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
