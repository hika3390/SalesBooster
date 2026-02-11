'use client';

interface SalesInputButtonProps {
  onClick?: () => void;
}

export default function SalesInputButton({ onClick }: SalesInputButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-colors"
    >
      <div className="w-10 h-10 flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <span className="text-white text-sm font-medium pr-4">売上入力</span>
    </button>
  );
}
