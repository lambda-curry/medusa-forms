import { EllipsisHorizontal, Eye, Trash } from '@medusajs/icons';
import { Checkbox, DropdownMenu } from '@medusajs/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { canSortColumn, getSortingFunction } from '../columnHelpers';
import { CellContent } from '../components/cells/cells';
import type {
  EditableTableCellMeta,
  EditableTableColumnDefinition,
  EditableTableInstance,
  GetCellActionsFn,
} from '../types/cells';

// Hook to create columns for the EditableTable
export const useEditableTableColumns = <T extends Record<string, unknown>>({
  columnDefs,
  getCellActions,
  onView,
  onDelete,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
}: {
  columnDefs: EditableTableColumnDefinition<T>[];
  getCellActions: GetCellActionsFn;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
}): ColumnDef<T>[] => {
  const columns: ColumnDef<T>[] = useMemo(() => {
    const editableColumns = columnDefs.map((columnDef) => _createEditableTableColumn<T>(columnDef, getCellActions));
    const actionsColumn = _createActionsColumn<T>(onView, onDelete);
    const checkboxColumn = enableRowSelection ? _createCheckboxColumn<T>(rowSelection, onRowSelectionChange) : null;

    const allColumns: ColumnDef<T>[] = [];
    if (checkboxColumn) allColumns.push(checkboxColumn);
    allColumns.push(...editableColumns);
    if (actionsColumn) allColumns.push(actionsColumn);

    return allColumns as ColumnDef<T>[];
  }, [columnDefs, getCellActions, enableRowSelection, rowSelection, onRowSelectionChange, onView, onDelete]);

  return columns;
};

// Create a TanStack Table column definition from EditableTable column definition
function _createEditableTableColumn<TRowData extends Record<string, unknown>>(
  columnDef: EditableTableColumnDefinition<TRowData>,
  getCellActions: GetCellActionsFn,
): ColumnDef<TRowData> {
  const minSize = columnDef.minWidth;
  const maxSize = Math.max(columnDef.maxWidth || 0, minSize || 0);
  const fieldKey = columnDef.getFieldKey?.(columnDef.key) || columnDef.key;
  const columnMeta: EditableTableCellMeta = {
    name: columnDef.name,
    type: columnDef.type,
    description: columnDef.description,
    key: fieldKey,
  };

  return {
    id: columnDef.key,
    accessorKey: columnDef.key,
    accessorFn: (row) => row[fieldKey],
    header: columnDef.name,
    size: minSize,
    minSize: minSize,
    maxSize: maxSize,
    enableSorting: (columnDef.enableSorting ?? false) && canSortColumn(columnDef.type),
    enableColumnFilter: columnDef.enableFiltering ?? true,
    enableHiding: columnDef.enableHiding,
    enablePinning: columnDef.isPinnable ?? false,
    enableResizing: false,
    cell: ({ getValue, row, table }) => {
      const value = getValue() as string;
      const rowData = row.original;

      const cellActions = getCellActions({
        meta: columnMeta,
        data: rowData,
        table: table as EditableTableInstance<Record<string, unknown>>,
      });

      const calculatedValue = columnDef.calculateValue ? columnDef.calculateValue(fieldKey, rowData) : value;

      return (
        <CellContent meta={columnMeta} value={calculatedValue} actions={cellActions} cellProps={columnDef.cellProps} />
      );
    },
    // Custom sort function for different field types
    sortingFn: getSortingFunction(columnDef.type),
    meta: { ...columnMeta },
  };
}

// Create checkbox column for row selection
function _createCheckboxColumn<T extends Record<string, unknown>>(
  _rowSelection?: Record<string, boolean>,
  _onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void,
): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 50,
    minSize: 50,
    maxSize: 50,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    enablePinning: false,
  };
}

// Create actions column with Medusa DropdownMenu
function _createActionsColumn<T extends Record<string, unknown>>(
  onView?: (item: T) => void,
  onDelete?: (item: T) => void,
): ColumnDef<T> | null {
  if (!(onView || onDelete)) return null;

  return {
    id: 'actions',
    header: '',
    size: 50,
    minSize: 50,
    maxSize: 50,
    enableSorting: false,
    enableColumnFilter: false,
    enableHiding: false,
    enablePinning: false,
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="p-1 hover:bg-ui-bg-base-hover rounded">
              <EllipsisHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {onView && (
              <DropdownMenu.Item onClick={() => onView(item)} className="gap-x-2">
                <Eye className="text-ui-fg-subtle" />
                View
              </DropdownMenu.Item>
            )}
            {onDelete && (
              <DropdownMenu.Item onClick={() => onDelete(item)} className="gap-x-2">
                <Trash className="text-ui-fg-subtle" />
                Delete
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      );
    },
  };
}
