'use client';


export default function DisplaySettings() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">ディスプレイモード設定</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">モード選択</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer bg-blue-50">
              <div className="text-center mb-3">
                <svg className="w-10 h-10 mx-auto text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center font-semibold text-sm text-blue-700">通常モード</div>
              <div className="text-center text-xs text-gray-500 mt-1">標準的な操作画面</div>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors">
              <div className="text-center mb-3">
                <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" />
                </svg>
              </div>
              <div className="text-center font-semibold text-sm text-gray-700">プレゼンモード</div>
              <div className="text-center text-xs text-gray-500 mt-1">会議向け大画面表示</div>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors">
              <div className="text-center mb-3">
                <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="text-center font-semibold text-sm text-gray-700">自動切替モード</div>
              <div className="text-center text-xs text-gray-500 mt-1">一定時間で画面切替</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">自動切替設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">切替間隔</div>
                <div className="text-xs text-gray-500">画面が自動で切り替わる間隔</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>10秒</option>
                <option>30秒</option>
                <option>1分</option>
                <option>5分</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">データ更新間隔</div>
                <div className="text-xs text-gray-500">売上データの自動更新間隔</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>1分</option>
                <option>5分</option>
                <option>15分</option>
                <option>30分</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
