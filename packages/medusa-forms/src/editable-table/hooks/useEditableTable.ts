import type { Row, RowSelectionState } from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';

import type { EditableTableConfig, EditableTableInstance } from '../types/cells';
import { columnFilterFn } from '../utils/filterUtils';
import { createGlobalFilterFn } from '../utils/searchUtils';
import { useEditableTableColumns } from './useEditableTableColumns';
import { useEditableTableUrlState } from './useEditableTableUrlState';

// Main hook for EditableTable functionality
export function useEditableTable<T extends Record<string, unknown>>(config: EditableTableConfig<T>) {
  const {
    data,
    editableColumns,
    enableGlobalFilter = true,
    enableColumnFilters = true,
    enableSorting = true,
    enablePagination = true,
    onView,
    onDelete,
    getCellActions,
    dynamicColumnFilters,
  } = config;

  // URL state management
  const { tableState, updateTableState, resetTableState } = useEditableTableUrlState(
    editableColumns,
    dynamicColumnFilters,
  );

  // Create column definitions
  const columns = useEditableTableColumns({
    columnDefs: editableColumns,
    getCellActions,
    onView,
    onDelete,
    enableRowSelection: config.enableRowSelection,
    rowSelection: config.rowSelection,
    onRowSelectionChange: config.onRowSelectionChange,
  });

  // Create custom global filter function that supports calculated values
  const globalFilterFn = useMemo(() => createGlobalFilterFn(editableColumns), [editableColumns]);

  // Create custom column filter function that supports calculated values and empty values
  const customColumnFilterFn = useMemo(
    () => (row: Row<T>, columnId: string, filterValue: unknown) =>
      columnFilterFn(
        row,
        columnId,
        filterValue,
        editableColumns.find((col) => String(col.key) === columnId),
      ),
    [editableColumns],
  );

  // Memoize table configuration to prevent re-renders
  const tableConfig = useMemo(
    () => ({
      data,
      columns,
      // Use row ID for stable row selection (assumes data has 'id' field)
      getRowId: (row: T, index: number) => {
        // Try common ID field names
        if ('id' in row && typeof row.id === 'string') return row.id;
        if ('id' in row && typeof row.id === 'number') return String(row.id);
        // Fallback to index if no ID field found (not ideal but required for TanStack Table)
        return String(index);
      },
      // Core features
      getCoreRowModel: getCoreRowModel(),

      // Filtering
      getFilteredRowModel: enableColumnFilters ? getFilteredRowModel() : undefined,
      enableGlobalFilter,
      enableColumnFilters,
      globalFilterFn,
      // Default column filter function for all columns
      defaultColumn: {
        filterFn: customColumnFilterFn,
      },

      // Sorting
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      enableSorting,
      enableMultiSort: true,

      // Pagination
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

      // State management
      state: {
        globalFilter: tableState.globalFilter,
        columnFilters: tableState.columnFilters,
        sorting: tableState.sorting,
        pagination: tableState.pagination,
        ...(config.enableRowSelection && config.rowSelection !== undefined
          ? { rowSelection: config.rowSelection }
          : {}),
      },

      // State update handlers
      onGlobalFilterChange: updateTableState.setGlobalFilter,
      onColumnFiltersChange: updateTableState.setColumnFilters,
      onSortingChange: updateTableState.setSorting,
      onPaginationChange: updateTableState.setPagination,
      ...(config.enableRowSelection && config.onRowSelectionChange
        ? {
            onRowSelectionChange: (
              updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState),
            ) => {
              if (typeof updaterOrValue === 'function') {
                const currentSelection = config.rowSelection || {};
                const newSelection = updaterOrValue(currentSelection);
                config.onRowSelectionChange?.(newSelection);
              } else {
                config.onRowSelectionChange?.(updaterOrValue);
              }
            },
          }
        : {}),

      // Manual pagination for server-side pagination (if needed)
      manualPagination: false,
      manualSorting: false,
      manualFiltering: false,
    }),
    [
      data,
      columns,
      enableColumnFilters,
      enableGlobalFilter,
      enableSorting,
      enablePagination,
      tableState,
      updateTableState,
      globalFilterFn,
      customColumnFilterFn,
      config.enableRowSelection,
      config.rowSelection,
      config.onRowSelectionChange,
    ],
  );

  // Create table instance
  const table = useReactTable(tableConfig) as EditableTableInstance<T>;

  // Add helper method to get row data
  table.getRowData = (rowIndex: number) => {
    const row = table.getRowModel().rows[rowIndex];
    return row?.original;
  };

  // Table utilities
  const tableUtils = {
    // Reset all table state
    resetTable: resetTableState,

    // Filtering helpers
    setGlobalFilter: (value: string) => {
      table.setGlobalFilter(value);
    },

    clearGlobalFilter: () => {
      table.setGlobalFilter('');
    },

    setColumnFilter: (columnId: string, value: unknown) => {
      table.getColumn(columnId)?.setFilterValue(value);
    },

    clearColumnFilter: (columnId: string) => {
      table.getColumn(columnId)?.setFilterValue(undefined);
    },

    clearAllFilters: () => {
      table.resetColumnFilters();
      table.resetGlobalFilter();
    },

    // Sorting helpers
    sortColumn: (columnId: string, desc = false) => {
      table.getColumn(columnId)?.toggleSorting(desc);
    },

    clearSorting: () => {
      table.resetSorting();
    },

    // Pagination helpers
    goToPage: (pageIndex: number) => {
      table.setPageIndex(pageIndex);
    },

    nextPage: () => {
      table.nextPage();
    },

    previousPage: () => {
      table.previousPage();
    },

    setPageSize: (pageSize: number) => {
      table.setPageSize(pageSize);
    },

    // Data helpers
    getSelectedRows: () => table.getSelectedRowModel().rows,
    getFilteredRows: () => table.getFilteredRowModel().rows,
    getAllRows: () => table.getCoreRowModel().rows,
  };

  return {
    table,
    tableState,
    updateTableState,
    ...tableUtils,
  };
}
