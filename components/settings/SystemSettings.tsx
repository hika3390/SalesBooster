'use client';


export default function SystemSettings() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">システム設定</h2>

      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">基本設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" defaultValue="株式会社サンプル" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">会計年度開始月</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>1月</option>
                <option>4月</option>
                <option>7月</option>
                <option>10月</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">通貨単位</label>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>万円</option>
                <option>千円</option>
                <option>円</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">セキュリティ</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">二要素認証</div>
                <div className="text-xs text-gray-500">ログイン時に二要素認証を要求</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">セッションタイムアウト</div>
                <div className="text-xs text-gray-500">無操作時の自動ログアウト時間</div>
              </div>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option>30分</option>
                <option>1時間</option>
                <option>2時間</option>
                <option>なし</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
