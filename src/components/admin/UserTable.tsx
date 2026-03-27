'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import Link from 'next/link';

interface UserRow { id: string; full_name: string; email: string; role: string; created_at: string; subscriptions?: Record<string, unknown>[]; }

export function UserTable({ users: initialUsers }: { users: UserRow[] }) {
  const [search, setSearch] = useState('');
  const filtered = initialUsers.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'full_name', label: 'Name', sortable: true, render: (row: UserRow) => (
      <div><Link href={`/admin/users/${row.id}`} className="font-medium text-white hover:text-emerald-400">{row.full_name}</Link><p className="text-xs text-slate-400">{row.email}</p></div>
    )},
    { key: 'role', label: 'Role', render: (row: UserRow) => (
      <Badge variant={row.role === 'admin' ? 'accent' : 'default'}>{row.role}</Badge>
    )},
    { key: 'subscription', label: 'Subscription', render: (row: UserRow) => {
      const active = row.subscriptions?.find((s) => ['active','trialing'].includes(s.status as string));
      return active ? <Badge variant="success">{active.interval as string}</Badge> : <span className="text-slate-500 text-xs">None</span>;
    }},
    { key: 'created_at', label: 'Joined', sortable: true, render: (row: UserRow) => (
      <span className="text-slate-400 text-xs">{new Date(row.created_at).toLocaleDateString('en-GB')}</span>
    )},
    { key: 'actions', label: '', render: (row: UserRow) => (
      <Link href={`/admin/users/${row.id}`} className="text-xs text-emerald-400 hover:text-emerald-300">View →</Link>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
      </div>
      <DataTable data={filtered} columns={columns} emptyMessage="No users found" />
    </div>
  );
}
