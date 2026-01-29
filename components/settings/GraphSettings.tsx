'use client';


export default function GraphSettings() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">グラフ設定</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">表示設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">デフォルトグラフ種類</div>
                <div className="text-xs text-gray-500">初期表示時のグラフタイプ</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>期間グラフ</option>
                <option>累計グラフ</option>
                <option>推移グラフ</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">デフォルト期間単位</div>
                <div className="text-xs text-gray-500">初期表示時の期間単位</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>月</option>
                <option>週</option>
                <option>日</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">グラフバースタイル</div>
                <div className="text-xs text-gray-500">棒グラフの見た目</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>3D円柱</option>
                <option>フラット</option>
                <option>角丸</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">カラー設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">TOP 20% カラー</div>
                <div className="text-xs text-gray-500">上位者のグラフ色</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 border border-gray-200 cursor-pointer"></div>
                <span className="text-sm text-gray-600">#F59E0B</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">CENTER カラー</div>
                <div className="text-xs text-gray-500">中位者のグラフ色</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500 border border-gray-200 cursor-pointer"></div>
                <span className="text-sm text-gray-600">#0EA5E9</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">LOW 20% カラー</div>
                <div className="text-xs text-gray-500">下位者のグラフ色</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 border border-gray-200 cursor-pointer"></div>
                <span className="text-sm text-gray-600">#14B8A6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
