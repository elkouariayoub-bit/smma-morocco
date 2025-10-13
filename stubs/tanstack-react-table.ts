import { useMemo, useState } from 'react'

type Row<TData> = { id: string; original: TData }

type HeaderContext<TData> = { table: TableInstance<TData> }
type CellContext<TData> = { row: Row<TData>; getValue: () => unknown; table: TableInstance<TData> }

export type ColumnDef<TData> = {
  id?: string
  header?: React.ReactNode | ((context: HeaderContext<TData>) => React.ReactNode)
  accessorKey?: keyof TData & string
  cell?: (context: CellContext<TData>) => React.ReactNode
}

export type SortingState = Array<{ id: string; desc: boolean }>
export type PaginationState = { pageIndex: number; pageSize: number }

interface TableState {
  sorting: SortingState
  pagination: PaginationState
}

interface UseReactTableOptions<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  state?: Partial<TableState>
  onSortingChange?: (value: SortingState) => void
  onPaginationChange?: (value: PaginationState) => void
  manualPagination?: boolean
  pageCount?: number
}

interface Header<TData> {
  id: string
  column: ColumnDef<TData>
  render: () => React.ReactNode
}

interface HeaderGroup<TData> {
  id: string
  headers: Header<TData>[]
}

interface RowModel<TData> {
  rows: Row<TData>[]
}

export interface TableInstance<TData> {
  getHeaderGroups: () => HeaderGroup<TData>[]
  getRowModel: () => RowModel<TData>
  getState: () => TableState
  setPageIndex: (index: number) => void
  setPageSize: (size: number) => void
  getPageCount: () => number
  getCanPreviousPage: () => boolean
  getCanNextPage: () => boolean
  nextPage: () => void
  previousPage: () => void
  resetSorting: () => void
}

export type Table<TData> = TableInstance<TData>

function generateRowId(index: number) {
  return `row_${index}`
}

export function useReactTable<TData>({
  data,
  columns,
  state,
  onSortingChange,
  onPaginationChange,
  manualPagination = false,
  pageCount,
}: UseReactTableOptions<TData>): TableInstance<TData> {
  const [internalState, setInternalState] = useState<TableState>({
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  })

  const tableState: TableState = {
    sorting: state?.sorting ?? internalState.sorting,
    pagination: state?.pagination ?? internalState.pagination,
  }

  const sortedData = useMemo(() => {
    if (!tableState.sorting.length) return data
    const [{ id, desc }] = tableState.sorting
    const column = columns.find((col) => col.accessorKey === id)
    if (!column?.accessorKey) return data

    return [...data].sort((a, b) => {
      const aValue = (a as Record<string, unknown>)[column.accessorKey!]
      const bValue = (b as Record<string, unknown>)[column.accessorKey!]

      if (aValue === bValue) return 0
      if (aValue == null) return desc ? 1 : -1
      if (bValue == null) return desc ? -1 : 1

      if (aValue > bValue) return desc ? -1 : 1
      if (aValue < bValue) return desc ? 1 : -1
      return 0
    })
  }, [columns, data, tableState.sorting])

  const paginatedRows = useMemo(() => {
    if (manualPagination) {
      return sortedData.map((item, index) => ({ id: generateRowId(index), original: item }))
    }

    const { pageIndex, pageSize } = tableState.pagination
    const start = pageIndex * pageSize
    const end = start + pageSize

    return sortedData.slice(start, end).map((item, index) => ({
      id: generateRowId(start + index),
      original: item,
    }))
  }, [data, manualPagination, sortedData, tableState.pagination])

  const instance: TableInstance<TData> = {
    getHeaderGroups: () => {
      return [
        {
          id: 'header',
          headers: columns.map<Header<TData>>((column, index) => ({
            id: column.accessorKey ?? column.id ?? `col_${index}`,
            column,
            render: () => {
              if (typeof column.header === 'function') {
                return column.header({ table: instance })
              }
              return column.header ?? null
            },
          })),
        },
      ]
    },
    getRowModel: () => ({ rows: paginatedRows }),
    getState: () => tableState,
    setPageIndex: (index: number) => {
      if (onPaginationChange) {
        onPaginationChange({ pageIndex: index, pageSize: tableState.pagination.pageSize })
      } else {
        setInternalState((current) => ({
          ...current,
          pagination: { ...current.pagination, pageIndex: Math.max(0, index) },
        }))
      }
    },
    setPageSize: (size: number) => {
      if (onPaginationChange) {
        onPaginationChange({ pageIndex: tableState.pagination.pageIndex, pageSize: size })
      } else {
        setInternalState((current) => ({
          ...current,
          pagination: { pageIndex: 0, pageSize: Math.max(1, size) },
        }))
      }
    },
    getPageCount: () => {
      if (manualPagination && typeof pageCount === 'number') {
        return pageCount
      }
      if (!tableState.pagination.pageSize) return 0
      return Math.ceil(data.length / tableState.pagination.pageSize)
    },
    getCanPreviousPage: () => tableState.pagination.pageIndex > 0,
    getCanNextPage: () => {
      if (manualPagination && typeof pageCount === 'number') {
        return tableState.pagination.pageIndex + 1 < pageCount
      }
      return tableState.pagination.pageIndex + 1 < instance.getPageCount()
    },
    nextPage: () => {
      if (!instance.getCanNextPage()) return
      instance.setPageIndex(tableState.pagination.pageIndex + 1)
    },
    previousPage: () => {
      if (!instance.getCanPreviousPage()) return
      instance.setPageIndex(tableState.pagination.pageIndex - 1)
    },
    resetSorting: () => {
      if (onSortingChange) {
        onSortingChange([])
      } else {
        setInternalState((current) => ({
          ...current,
          sorting: [],
        }))
      }
    },
  }

  return instance
}
