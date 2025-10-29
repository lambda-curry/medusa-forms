import type { SortingState, Table, VisibilityState } from '@tanstack/react-table';
import type { FunctionComponent, ReactNode } from 'react';
import type { EditableColumnType } from './columns';

// Editable Table field definition
export type BaseEditableCellMeta<TDataKey extends string> = {
  name: string;
  description?: string | null;
  type: EditableColumnType;
  key: TDataKey;
  calculateValue?: (key: TDataKey, data: Record<string, unknown>) => string | number | undefined;
};

export type TextEditableTableCellMeta = {
  type: 'text';
};

export type NumberEditableTableCellMeta = {
  type: 'number';
};

export type SelectEditableTableCellMeta = {
  type: 'select';
};

export type AutocompleteEditableTableCellMeta = {
  type: 'autocomplete';
};

export type BadgeEditableTableCellMeta = {
  type: 'badge';
};

// Editable Table field definition
export type EditableTableCellMeta<TDataKey extends string = string> = BaseEditableCellMeta<TDataKey> &
  (
    | TextEditableTableCellMeta
    | NumberEditableTableCellMeta
    | SelectEditableTableCellMeta
    | AutocompleteEditableTableCellMeta
    | BadgeEditableTableCellMeta
  );

// Column definition types
export type BaseEditableTableColumnDefinition = {
  name: string;
  key: string;
  description?: string | null;
  type: EditableColumnType;
  minWidth?: number;
  maxWidth?: number;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableHiding?: boolean;
  isPinnable?: boolean;

  // custom column props
  required?: boolean;
  dependsOn?: string[];
  getFieldKey?: (key: string) => string;
  cellProps?: Record<string, unknown>;
};

export type EditableTableColumnDefinition<T extends Record<string, unknown>> = BaseEditableTableColumnDefinition & {
  key: keyof T;
  /** Calculate the display value for a cell (used for rendering) */
  calculateValue?: (key: keyof T, data: Record<string, unknown>) => unknown;
  /**
   * Calculate the filter value for a cell (used for filtering)
   * Transforms complex values into filterable strings
   * Example: Array -> "Has items" / "No items", Object -> "Present" / "Absent"
   */
  calculateFilterValue?: (value: unknown, key: keyof T, data: Record<string, unknown>) => string;
};

// Cell content component props
export type CellContentProps<TValue = unknown> = {
  meta: EditableTableCellMeta;
  value: TValue;
  actions: EditableCellActions;
  cellProps?: Record<string, unknown>;
};

// Table state for URL persistence (simplified)
export type EditableTableState = {
  globalSearchFilter: string;
  columnVisibility: VisibilityState;
  sorting: SortingState;
};

// Table configuration
export type EditableTableConfig<T extends Record<string, unknown>> = {
  data: T[];
  editableColumns: EditableTableColumnDefinition<T>[];
  enableGlobalFilter?: boolean;
  enableColumnFilters?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableColumnPinning?: boolean;
  enableColumnVisibility?: boolean;
  /** Dynamic column filter patterns (e.g., ['location_levels.*']) for grouping related columns */
  dynamicColumnFilters?: string[];
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
  initialState?: Partial<EditableTableState>;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  getCellActions: GetCellActionsFn;
  getTooltipContent?: (columnKey: string, columnName: string) => string | ReactNode | null;
};

// Cell component map type
export type CellComponentMap = Record<EditableColumnType, FunctionComponent<CellContentProps>>;

// Table instance type for hooks
export type EditableTableInstance<T extends Record<string, unknown>> = Table<T> & {
  getRowData: (rowIndex: number) => T;
};

export type EditableCellActions = {
  save: (updatedValue: unknown) => Promise<string | null>;
  validate: (updatedValue: unknown) => Promise<string | null>;
  getOptions: (
    updatedValue: unknown,
  ) => Promise<{ label: string; value: unknown; usedBy?: { id: string; name: string }[] }[]>;
};

export type GetCellActionsFn = <TRowData extends Record<string, unknown>>(args: {
  meta: EditableTableCellMeta;
  data: TRowData;
  table: EditableTableInstance<Record<string, unknown>>;
}) => EditableCellActions;

export type CellState = {
  isEditing: boolean;
  isSaving: boolean;
  canRetrySave: boolean;
  error: string | null;
  justSaved: boolean;
};

export type CellStatus = 'editing' | 'saving' | 'saved' | 'error' | 'disabled' | 'retry' | 'idle';

export type EditableCellActionHandler<TReturn = unknown> = (args: {
  meta: EditableTableCellMeta;
  data: Record<string, unknown>;
  value: unknown;
  table: EditableTableInstance<Record<string, unknown>>;
}) => Promise<TReturn> | TReturn;

// biome-ignore lint/suspicious/noExplicitAny: It can be any type
export type CellActionsHandlerGetter<TReturn = any> = (key: string) => EditableCellActionHandler<TReturn> | undefined;

export type EditableCellActionsMap = Partial<{
  // biome-ignore lint/suspicious/noExplicitAny: It can be any type
  [key: string]: EditableCellActionHandler<any>;
}>;
