'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import Button from '@/components/common/Button';
import SettingsSidebar, { SettingsSection } from '@/components/settings/SettingsSidebar';
import MemberSettings from '@/components/settings/MemberSettings';
import GroupSettings from '@/components/settings/GroupSettings';
import GraphSettings from '@/components/settings/GraphSettings';
import DisplaySettings from '@/components/settings/DisplaySettings';
import TargetSettings from '@/components/settings/TargetSettings';
import ReportSettings from '@/components/settings/ReportSettings';
import RecordSettings from '@/components/settings/RecordSettings';
import EmailSettings from '@/components/settings/EmailSettings';
import SystemSettings from '@/components/settings/SystemSettings';
import IntegrationSettings from '@/components/settings/IntegrationSettings';
import LogViewer from '@/components/settings/LogViewer';

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('member');

  const renderContent = () => {
    switch (activeSection) {
      case 'member': return <MemberSettings />;
      case 'group': return <GroupSettings />;
      case 'graph': return <GraphSettings />;
      case 'display': return <DisplaySettings />;
      case 'target': return <TargetSettings />;
      case 'report': return <ReportSettings />;
      case 'record': return <RecordSettings />;
      case 'email': return <EmailSettings />;
      case 'system': return <SystemSettings />;
      case 'integration': return <IntegrationSettings />;
      case 'log': return <LogViewer />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ヘッダー */}
      <Header
        subtitle="管理画面"
        rightContent={
          <Button label="ダッシュボードに戻る" variant="outline" color="gray" onClick={() => router.push('/')} />
        }
        activeSettingsSection={activeSection}
        onSettingsSectionChange={setActiveSection}
      />

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
