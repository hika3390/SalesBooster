'use client';

interface SalesPerson {
  rank: number;
  name: string;
  sales: number;
  target: number;
  achievement: number;
  imageUrl?: string;
  department?: string;
}

interface SalesPersonCardProps {
  person: SalesPerson;
  index: number;
  top20Index: number;
  low20Index: number;
  columnWidth: number;
}

export default function SalesPersonCard({ person, index, top20Index, low20Index, columnWidth }: SalesPersonCardProps) {
  // 背景色の取得
  const getBackgroundColor = (index: number): string => {
    if (index < top20Index) return 'bg-red-50';
    if (index < low20Index) return 'bg-blue-50';
    return 'bg-blue-100';
  };

  // バッジの取得（TOP 20%で達成率100%以上）
  const getBadge = (index: number, person: SalesPerson) => {
    if (index < top20Index && person.achievement >= 100) {
      return (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex-1 border-r border-gray-200 ${getBackgroundColor(index)}`}
      style={{ minWidth: `${columnWidth}px` }}
    >
      {/* 順位 */}
      <div className="text-center py-2 border-b border-gray-200 bg-gray-50">
        <div className="text-lg font-bold text-gray-800">{person.rank}位</div>
      </div>

      {/* メンバー */}
      <div className="flex flex-col items-center py-2 border-b border-gray-200">
        <div className="text-[9px] text-gray-600 mb-1">メンバー</div>
        <div className="relative mb-1.5">
          {/* プロフィール画像 */}
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden border border-white shadow-sm">
            {person.imageUrl ? (
              <img
                src={person.imageUrl}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                <span className="text-white text-xs font-bold">
                  {person.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          {getBadge(index, person)}
        </div>
        <div className="text-[9px] text-center font-medium text-gray-800 leading-tight px-1">
          {person.name}
        </div>
        {person.department && (
          <div className="text-[8px] text-gray-500 mt-0.5">{person.department}</div>
        )}
      </div>

      {/* 実績金額・達成率 */}
      <div className="text-center py-2 border-b border-gray-200">
        <div className="text-base font-bold text-gray-800">{person.sales}万円</div>
        <div
          className={`text-sm font-bold mt-1 ${
            person.achievement >= 100
              ? 'text-red-600'
              : person.achievement >= 80
              ? 'text-blue-600'
              : 'text-gray-600'
          }`}
        >
          {person.achievement}%
        </div>
      </div>

      {/* 目標 */}
      <div className="text-center py-2 border-b border-gray-200">
        <div className="text-[9px] text-gray-600 mb-1">目標</div>
        <div className="text-[11px] font-semibold text-gray-700">
          {person.target}万円
        </div>
      </div>
    </div>
  );
}
