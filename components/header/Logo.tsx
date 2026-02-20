'use client';

import { useRouter } from 'next/navigation';

interface LogoProps {
  subtitle?: string;
}

export default function Logo({ subtitle }: LogoProps) {
  const router = useRouter();

  return (
    <div className="flex items-center">
      <button
        onClick={() => router.push('/')}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-blue-600">Sales Booster</h1>
      </button>
      {subtitle && (
        <>
          <span className="text-gray-300 mx-4">|</span>
          <span className="text-lg font-semibold text-gray-700">{subtitle}</span>
        </>
      )}
    </div>
  );
}
