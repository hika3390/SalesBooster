'use client';

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} mx-4`}>
        {/* ヘッダー */}
        <div className="bg-blue-900 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {children}
        </div>

        {/* フッター */}
        {footer && (
          <div className="px-6 py-4 flex justify-center space-x-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
