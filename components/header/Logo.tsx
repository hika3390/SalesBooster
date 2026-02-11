'use client';

interface LogoProps {
  subtitle?: string;
}

export default function Logo({ subtitle }: LogoProps) {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-blue-600">Sales Booster</h1>
      </div>
      {subtitle && (
        <>
          <span className="text-gray-300 mx-4">|</span>
          <span className="text-lg font-semibold text-gray-700">{subtitle}</span>
        </>
      )}
    </div>
  );
}
