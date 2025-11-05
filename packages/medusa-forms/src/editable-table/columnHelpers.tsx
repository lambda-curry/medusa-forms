import type { ColumnDef } from '@tanstack/react-table';
import type { EditableTableCellMeta } from './types/cells';
import type { EditableColumnType } from './types/columns';

export const canSortColumn = (type: EditableColumnType) => ['text', 'number'].includes(type);

// Get default column sizing based on field type
export function getDefaultColumnSizing(type: EditableColumnType): number {
  switch (type) {
    case 'number':
      return 120;
    case 'badge':
      return 100;
    case 'select':
    case 'autocomplete':
      return 180;
    default:
      return 200;
  }
}

// Get filter function based on field type
export function getFilterFunction(type: string) {
  switch (type) {
    case 'boolean':
      return 'equals';
    case 'number':
      return 'includesString'; // Use includesString for now, can be customized later
    case 'date':
      return 'includesString'; // Use includesString for now, can be customized later
    default:
      return 'includesString';
  }
}

// Get sorting function based on field type
export function getSortingFunction(type: string) {
  switch (type) {
    case 'number':
      return 'basic';
    case 'date':
      return 'datetime';
    case 'boolean':
      return 'basic';
    default:
      return 'alphanumeric';
  }
}

// Helper to get column class names based on type
export function getColumnHeaderClassName(colDef: ColumnDef<Record<string, unknown>>): string {
  const baseClasses = 'flex items-center gap-2 text-left justify-between';

  const meta = colDef.meta as EditableTableCellMeta;
  switch (meta?.type) {
    default:
      return `${baseClasses}`;
  }
}
