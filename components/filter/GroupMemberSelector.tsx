'use client';

import { useState, useEffect } from 'react';

interface GroupOption {
  id: number;
  name: string;
  memberList: { id: number; name: string }[];
}

interface MemberOption {
  id: number;
  name: string;
}

interface GroupMemberSelectorProps {
  onFilterChange?: (filter: { groupId: string; memberId: string }) => void;
}

export default function GroupMemberSelector({ onFilterChange }: GroupMemberSelectorProps) {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [allMembers, setAllMembers] = useState<MemberOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch(console.error);

    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => setAllMembers(data))
      .catch(console.error);
  }, []);

  const selectedGroup = groups.find((g) => g.id === Number(selectedGroupId));
  const memberOptions = selectedGroupId
    ? selectedGroup?.memberList || []
    : allMembers;

  const handleGroupChange = (value: string) => {
    setSelectedGroupId(value);
    setSelectedMemberId('');
    onFilterChange?.({ groupId: value, memberId: '' });
  };

  const handleMemberChange = (value: string) => {
    setSelectedMemberId(value);
    onFilterChange?.({ groupId: selectedGroupId, memberId: value });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">グループ</label>
        <select
          value={selectedGroupId}
          onChange={(e) => handleGroupChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">すべて</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-600">メンバー</label>
        <select
          value={selectedMemberId}
          onChange={(e) => handleMemberChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">全員</option>
          {memberOptions.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
