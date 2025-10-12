'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDownUp, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

type SortDirection = 'asc' | 'desc';

type SortState<T> = {
  key: keyof T;
  direction: SortDirection;
} | null;

export function DataTable<T extends { id: string }>({ data, columns, pageSize = 6 }: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState<SortState<T>>(null);
  const [page, setPage] = useState(0);

  const filteredData = useMemo(() => {
    if (!search) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortState) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valueA = a[sortState.key];
      const valueB = b[sortState.key];
      if (valueA === valueB) return 0;
      if (valueA == null) return 1;
      if (valueB == null) return -1;
      if (valueA < valueB) return sortState.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortState]);

  const paginated = useMemo(() => {
    const start = page * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(sortedData.length / pageSize));

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    setPage(0);
    setSortState((prev) => {
      if (!prev || prev.key !== column.key) {
        return { key: column.key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: column.key, direction: 'desc' };
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filter posts"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>
          <Button type="button" variant="ghost" className="hidden gap-2 sm:inline-flex" title="Advanced filters coming soon">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
        <span className="text-sm text-slate-500">{sortedData.length} scheduled posts</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-surface-subtle text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => {
                const isActive = sortState?.key === column.key;
                return (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className={cn('px-6 py-3 text-left font-semibold', column.align === 'right' && 'text-right')}
                  >
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 text-left text-xs uppercase tracking-wide text-slate-500 transition-base',
                        column.align === 'right' && 'justify-end',
                        column.sortable && 'hover:text-slate-900'
                      )}
                      onClick={() => handleSort(column)}
                      disabled={!column.sortable}
                    >
                      {column.label}
                      {column.sortable && <ArrowDownUp className={cn('h-4 w-4 transition-transform', isActive && sortState?.direction === 'desc' && 'rotate-180')} />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginated.map((row) => (
              <tr key={row.id} className="transition-base hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn('px-6 py-4 text-sm text-slate-600', column.align === 'right' && 'text-right text-slate-500')}
                  >
                    {column.render ? column.render(row[column.key], row) : (row[column.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-slate-500">
                  No posts match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-slate-500">
          Page <span className="font-semibold text-slate-700">{page + 1}</span> of{' '}
          <span className="font-semibold text-slate-700">{pageCount}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
            disabled={page + 1 >= pageCount}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
