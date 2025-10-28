import { Table, clx } from '@medusajs/ui';
import { type ReactNode, useMemo } from 'react';
import { useEditableCellActions } from '../hooks/useEditableCellActions';
import { useEditableTable } from '../hooks/useEditableTable';
import type { EditableCellActionFn, EditableTableConfig } from '../types/cells';
import { EditableTableContent } from './EditableTableContent';
import { EditableTableControls } from './EditableTableControls';
import { TableSkeleton } from './TableSkeleton';

interface EditableTableProps<T extends Record<string, unknown>> extends Omit<EditableTableConfig<T>, 'getCellActions'> {
  tableId?: string;
  showControls?: boolean;
  showPagination?: boolean;
  showInfo?: boolean;
  className?: string;
  loading?: boolean;
  getValidateHandler: (key: string) => EditableCellActionFn<Record<string, unknown>, string | null> | undefined;
  getSaveHandler: (key: string) => EditableCellActionFn<Record<string, unknown>, string | null> | undefined;
  getOptionsHandler: (
    key: string,
  ) => EditableCellActionFn<Record<string, unknown>, { label: string; value: unknown }[]> | undefined;
  // Additional actions to render in table controls
  additionalActions?: ReactNode;
}

// Main EditableTable component
export function EditableTable<T extends Record<string, unknown>>({
  tableId,
  showControls = true,
  showPagination = true,
  showInfo = true,
  className,
  loading = false,
  data,
  getValidateHandler,
  getSaveHandler,
  getOptionsHandler,
  additionalActions,
  ...inputConfig
}: EditableTableProps<T>) {
  const config = useMemo(
    () => ({
      ...inputConfig,
      data,
    }),
    [inputConfig, data],
  );

  const getCellActionsFn = useEditableCellActions({ getValidateHandler, getSaveHandler, getOptionsHandler });

  const { table } = useEditableTable(
    {
      ...config,
      data,
      getCellActions: getCellActionsFn,
    },
    tableId,
  );

  // Show skeleton if loading
  if (loading) {
    const columnCount = inputConfig.editableColumns?.length || 6;
    return <TableSkeleton columns={columnCount} rows={8} className={className} />;
  }

  return (
    <div className={clx('w-full', className)}>
      {/* Table Controls */}
      {showControls && (
        <EditableTableControls
          table={table}
          columnDefs={inputConfig.editableColumns}
          showGlobalFilter={config.enableGlobalFilter}
          showColumnVisibility={config.enableColumnVisibility}
          showColumnPinning={config.enableColumnPinning}
          showColumnFilters={config.enableColumnFilters}
          showSorting={config.enableSorting}
          searchDebounceMs={1000}
          additionalActions={additionalActions}
        />
      )}

      {/* Table Container */}
      <div className="flex size-full flex-col pb-2">
        {/* Table Content */}
        <EditableTableContent table={table} getTooltipContent={inputConfig.getTooltipContent} />

        {/* Pagination */}
        {showPagination && (
          <Table.Pagination
            pageCount={table.getPageCount()}
            pageSize={table.getState().pagination.pageSize}
            pageIndex={table.getState().pagination.pageIndex}
            canPreviousPage={table.getCanPreviousPage()}
            canNextPage={table.getCanNextPage()}
            previousPage={table.previousPage}
            nextPage={table.nextPage}
            count={table.getRowCount()}
          />
        )}
      </div>
    </div>
  );
}
