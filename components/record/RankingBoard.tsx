'use client';

import Image from 'next/image';
import { RankingBoardData, RankingColumn, RankingMember } from '@/types';

interface RankingBoardProps {
  data: RankingBoardData;
  darkMode?: boolean;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString() + '円';
}

function MemberCard({ member, darkMode = false }: { member: RankingMember; darkMode?: boolean }) {
  return (
    <div className="flex flex-col items-center py-3 px-2">
      <div className={`relative w-16 h-16 rounded-sm overflow-hidden border shadow-sm mb-1.5 ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-300 border-gray-200'}`}>
        {member.imageUrl ? (
          <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
            <span className="text-white text-lg font-bold">{member.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className={`text-xs font-bold text-center leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{member.name}</div>
      <div className="text-[10px] text-green-600 font-bold mt-0.5">
        粗利 : {formatAmount(member.amount)}
      </div>
    </div>
  );
}

function EmptyCell() {
  return <div className="py-3 px-2 h-[110px]" />;
}

export default function RankingBoard({ data, darkMode = false }: RankingBoardProps) {
  // 最大順位数を算出
  const maxRank = Math.max(...data.columns.map((col) => col.members.length), 0);

  const rankLabels: string[] = [];
  for (let i = 0; i < maxRank; i++) {
    if (i === 0) rankLabels.push('TOP');
    else rankLabels.push(String(i + 1));
  }

  return (
    <div className={`mx-6 my-4 shadow-sm rounded overflow-auto h-[calc(100%-2rem)] ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`sticky top-0 z-20 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-4">
          <h2 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>RANKING BOARD</h2>
        </div>

        <div style={{ minWidth: 'fit-content' }}>
          {/* ヘッダー行 */}
          <div className={`flex border-b-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            {/* 順位列ヘッダー */}
            <div className={`w-14 shrink-0 sticky left-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`} />
            {/* 各カラムヘッダー */}
            {data.columns.map((col, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[150px] text-center py-2 px-1 border-l ${darkMode ? 'border-gray-600' : 'border-gray-200'} ${
                  col.isTotal ? 'bg-red-600 text-white' : i % 2 === 1 ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : (darkMode ? 'bg-gray-800' : 'bg-white')
                }`}
              >
                <div className={`text-sm font-bold ${!col.isTotal && darkMode ? 'text-gray-100' : ''}`}>{col.label}</div>
                {col.subLabel && <div className="text-[10px] opacity-80">{col.subLabel}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ minWidth: 'fit-content' }}>
        {/* ランキング行 */}
        {rankLabels.map((label, rankIdx) => (
          <div key={rankIdx} className={`flex border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            {/* 順位ラベル */}
            <div className={`w-14 shrink-0 sticky left-0 z-10 flex items-center justify-center border-r ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <span className={`text-sm font-bold ${rankIdx === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {label}
              </span>
            </div>
            {/* 各カラムのメンバー */}
            {data.columns.map((col, colIdx) => {
              const member = col.members.find((m) => m.rank === rankIdx + 1);
              return (
                <div
                  key={colIdx}
                  className={`flex-1 min-w-[150px] border-l flex justify-center ${darkMode ? 'border-gray-600' : 'border-gray-200'} ${
                    colIdx % 2 === 1 && !col.isTotal ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''
                  }`}
                >
                  {member ? <MemberCard member={member} darkMode={darkMode} /> : <EmptyCell />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
