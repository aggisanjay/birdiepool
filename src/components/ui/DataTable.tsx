'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, emptyMessage = 'No data found' }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = sortKey
    ? [...data].sort(( a: any, b: any ) => {
        const av = a[sortKey] as string; const bv = b[sortKey] as string;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      })
    : data;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {columns.map(( col: any ) => (
                <th key={col.key as string} className={cn('text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider', col.sortable && 'cursor-pointer hover:text-white')}
                  onClick={() => col.sortable && handleSort(col.key as string)}>
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (sortKey === col.key
                      ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                      : <ChevronsUpDown className="w-3 h-3 opacity-40" />)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">{emptyMessage}</td></tr>
            ) : sorted.map(( row: any, i: number ) => (
              <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                {columns.map(( col: any ) => (
                  <td key={col.key as string} className="px-6 py-4 text-slate-300">
                    {col.render ? col.render(row) : String(row[col.key as string] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
