'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Logo from './Logo';
import DisplayModeButton from './DisplayModeButton';
import SalesInputButton from './SalesInputButton';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  onAddSalesClick?: () => void;
  subtitle?: string;
  rightContent?: React.ReactNode;
}

export default function Header({ onAddSalesClick, subtitle, rightContent }: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'ユーザー';

  return (
    <header className="bg-white border-b border-gray-200 p-5">
      <div className="flex items-center justify-between min-h-10">
        <Logo subtitle={subtitle} />

        <div className="flex items-center space-x-3">
          {rightContent ? rightContent : (
            <>
              <DisplayModeButton />
              <SalesInputButton onClick={onAddSalesClick} />
            </>
          )}

          {/* 仕切り */}
          <div className="h-8 w-px bg-gray-300"></div>

          <UserDropdown userName={userName} />
        </div>
      </div>
    </header>
  );
}
