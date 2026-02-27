'use client';

import { useState, useMemo } from 'react';
import ImportModal, { ImportField, MappedRow, PreviewColumn, ParsedRow } from '@/components/common/ImportModal';
import type { CustomFieldDefinition } from '@/types/customField';

interface Member {
  id: number;
  name: string;
}

interface ImportSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const FIXED_FIELDS: ImportField[] = [
  { value: 'memberName', label: 'メンバー名 *', required: true, autoMapKeywords: ['メンバー', '名前', 'name', '担当', '営業'] },
  { value: 'amount', label: '金額 *', required: true, autoMapKeywords: ['金額', '売上', 'amount', '粗利'] },
  { value: 'recordDate', label: '受注日 *', required: true, autoMapKeywords: ['受注日', '日付', 'date', '契約日'] },
  { value: 'description', label: '備考', required: false, autoMapKeywords: ['備考', 'memo', 'description', 'メモ', '説明'] },
];

const FIXED_PREVIEW_COLUMNS: PreviewColumn[] = [
  {
    key: 'memberName',
    label: 'メンバー',
    render: (row) => row.memberName || <span className="text-red-400">-</span>,
  },
  {
    key: 'amount',
    label: '金額',
    render: (row) => row.amount ? `${Number(row.amount).toLocaleString()}円` : <span className="text-red-400">-</span>,
  },
  {
    key: 'recordDate',
    label: '受注日',
    render: (row) => row.recordDate || <span className="text-red-400">-</span>,
  },
  { key: 'description', label: '備考', render: (row) => row.description || '-' },
];

function parseDate(value: string): Date | null {
  if (!value) return null;
  // ISO形式 or yyyy/mm/dd or yyyy-mm-dd
  const d = new Date(value.replace(/\//g, '-'));
  if (!isNaN(d.getTime())) return d;
  return null;
}

function parseAmount(value: string): number | null {
  if (!value) return null;
  // カンマ、円記号、¥、スペースを除去
  const cleaned = value.replace(/[,，円¥￥\s]/g, '');
  const num = Number(cleaned);
  if (isNaN(num)) return null;
  return Math.round(num);
}

export default function ImportSalesModal({ isOpen, onClose, onImported }: ImportSalesModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [customFieldDefs, setCustomFieldDefs] = useState<CustomFieldDefinition[]>([]);

  const fields: ImportField[] = useMemo(() => {
    const dynamicFields: ImportField[] = customFieldDefs.map((field) => ({
      value: `cf_${field.id}`,
      label: `${field.name}${field.isRequired ? ' *' : ''}`,
      required: field.isRequired,
      autoMapKeywords: [field.name],
    }));
    return [...FIXED_FIELDS, ...dynamicFields];
  }, [customFieldDefs]);

  const previewColumns: PreviewColumn[] = useMemo(() => {
    const dynamicColumns: PreviewColumn[] = customFieldDefs.map((field) => ({
      key: `cf_${field.id}`,
      label: field.name,
      render: (row: MappedRow) => row[`cf_${field.id}`] || '-',
    }));
    return [...FIXED_PREVIEW_COLUMNS, ...dynamicColumns];
  }, [customFieldDefs]);

  const handleOpen = () => {
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch(console.error);
    fetch('/api/custom-fields?active=true')
      .then((res) => res.json())
      .then((data) => setCustomFieldDefs(data))
      .catch(console.error);
  };

  const buildMappedData = (rows: ParsedRow[], mapping: Record<string, string>): MappedRow[] => {
    const memberNameHeader = Object.keys(mapping).find((k) => mapping[k] === 'memberName');
    const amountHeader = Object.keys(mapping).find((k) => mapping[k] === 'amount');
    const dateHeader = Object.keys(mapping).find((k) => mapping[k] === 'recordDate');
    const descHeader = Object.keys(mapping).find((k) => mapping[k] === 'description');

    return rows.map((row) => {
      const rawName = memberNameHeader ? row[memberNameHeader].trim() : '';
      const rawAmount = amountHeader ? row[amountHeader].trim() : '';
      const rawDate = dateHeader ? row[dateHeader].trim() : '';
      const desc = descHeader ? row[descHeader].trim() : '';

      const errors: string[] = [];

      if (!rawName) errors.push('メンバー名が未入力');
      const member = members.find((m) => m.name === rawName);
      if (rawName && !member) errors.push(`メンバー「${rawName}」が見つかりません`);

      const amount = parseAmount(rawAmount);
      if (!rawAmount) errors.push('金額が未入力');
      else if (amount === null) errors.push(`金額「${rawAmount}」が不正`);

      const date = parseDate(rawDate);
      if (!rawDate) errors.push('受注日が未入力');
      else if (!date) errors.push(`受注日「${rawDate}」が不正`);

      // カスタムフィールド値を収集
      const cfValues: Record<string, string> = {};
      for (const field of customFieldDefs) {
        const cfKey = `cf_${field.id}`;
        const cfHeader = Object.keys(mapping).find((k) => mapping[k] === cfKey);
        const cfVal = cfHeader ? row[cfHeader].trim() : '';
        if (cfVal) cfValues[cfKey] = cfVal;
        if (field.isRequired && !cfVal) errors.push(`${field.name}が未入力`);
      }

      return {
        memberName: rawName,
        memberId: member ? String(member.id) : undefined,
        amount: amount !== null ? String(amount) : undefined,
        recordDate: date ? date.toISOString() : undefined,
        description: desc || undefined,
        ...cfValues,
        error: errors.length > 0 ? errors.join(', ') : undefined,
      } as MappedRow;
    });
  };

  const handleImport = async (validRows: MappedRow[]) => {
    const payload = validRows.map((row) => {
      const customFields: Record<string, string> = {};
      for (const field of customFieldDefs) {
        const val = row[`cf_${field.id}`];
        if (val) customFields[String(field.id)] = val;
      }

      return {
        memberId: Number(row.memberId),
        amount: Number(row.amount),
        recordDate: row.recordDate!,
        description: row.description || undefined,
        ...(Object.keys(customFields).length > 0 ? { customFields } : {}),
      };
    });

    const res = await fetch('/api/sales/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: payload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || 'インポートに失敗しました。');
    }

    const result = await res.json();
    return {
      message: `インポート完了: ${result.created}件の売上データを追加しました。`,
    };
  };

  return (
    <ImportModal
      isOpen={isOpen}
      onClose={onClose}
      onImported={onImported}
      titlePrefix="売上データ"
      fields={fields}
      previewColumns={previewColumns}
      buildMappedData={buildMappedData}
      onImport={handleImport}
      onOpen={handleOpen}
    />
  );
}
