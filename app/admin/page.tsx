'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import { Dialog } from '@/components/common/Dialog';
import CreateTenantModal from '@/components/admin/CreateTenantModal';

interface Tenant {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; members: number };
}

const formatDate = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'SUPER_ADMIN') {
      router.replace('/');
    }
  }, [status, session, router]);

  const fetchTenants = async () => {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(Array.isArray(data) ? data : data?.data ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'SUPER_ADMIN') {
      fetchTenants();
    }
  }, [status, session]);

  const handleToggleActive = async (tenant: Tenant) => {
    const action = tenant.isActive ? '無効化' : '有効化';
    const confirmed = await Dialog.confirm(`テナント「${tenant.name}」を${action}しますか？`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !tenant.isActive }),
      });
      if (res.ok) {
        fetchTenants();
      } else {
        await Dialog.error(`${action}に失敗しました`);
      }
    } catch {
      await Dialog.error('ネットワークエラーが発生しました');
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (t) => <span className="text-sm text-gray-600">{t.id}</span>,
    },
    {
      key: 'name',
      label: 'テナント名',
      render: (t) => <span className="text-sm font-medium text-gray-800">{t.name}</span>,
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (t) => <span className="text-sm text-gray-500 font-mono">{t.slug}</span>,
    },
    {
      key: 'isActive',
      label: 'ステータス',
      render: (t) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {t.isActive ? '有効' : '無効'}
        </span>
      ),
    },
    {
      key: 'users',
      label: 'ユーザー数',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-600">{t._count.users}</span>,
    },
    {
      key: 'members',
      label: 'メンバー数',
      align: 'right',
      render: (t) => <span className="text-sm text-gray-600">{t._count.members}</span>,
    },
    {
      key: 'createdAt',
      label: '作成日',
      render: (t) => <span className="text-sm text-gray-500">{formatDate(t.createdAt)}</span>,
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: (t) => (
        <Button
          label={t.isActive ? '無効化' : '有効化'}
          variant="outline"
          color={t.isActive ? 'red' : 'green'}
          onClick={() => handleToggleActive(t)}
          className="px-3 py-1.5 text-xs"
        />
      ),
    },
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-100">
        <Header subtitle="テナント管理" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header subtitle="テナント管理" />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">テナント管理</h2>
          <Button label="テナント追加" onClick={() => setIsCreateModalOpen(true)} />
        </div>

        <DataTable
          data={tenants}
          columns={columns}
          keyField="id"
          emptyMessage="テナントがありません"
          mobileRender={(t) => (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{t.name}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  t.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {t.isActive ? '有効' : '無効'}
                </span>
              </div>
              <div className="text-xs text-gray-500 font-mono mb-1">{t.slug}</div>
              <div className="text-xs text-gray-400 mb-2">
                ユーザー: {t._count.users} / メンバー: {t._count.members} / 作成日: {formatDate(t.createdAt)}
              </div>
              <Button
                label={t.isActive ? '無効化' : '有効化'}
                variant="outline"
                color={t.isActive ? 'red' : 'green'}
                onClick={() => handleToggleActive(t)}
                className="px-3 py-1.5 text-xs"
              />
            </div>
          )}
        />
      </main>

      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={fetchTenants}
      />
    </div>
  );
}
