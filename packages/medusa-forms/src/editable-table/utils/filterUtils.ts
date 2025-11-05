import type { ColumnFilter, Row } from '@tanstack/react-table';
import type { EditableTableColumnDefinition } from '../types/cells';

// Special value to represent empty/null/undefined in filters
export const EMPTY_FILTER_VALUE = '__EMPTY__';
export const EMPTY_FILTER_LABEL = '(empty)';

/**
 * Extract unique values from a column, including "empty" values
 * Uses calculateFilterValue if available to transform values for filtering
 */
export function getUniqueColumnValues<T extends Record<string, unknown>>(
  rows: Row<T>[],
  columnKey: keyof T,
  columnDef?: EditableTableColumnDefinition<T>,
): string[] {
  const values = new Set<string>();
  let hasEmpty = false;

  for (const row of rows) {
    const data = row.original;
    let value: unknown;

    // Use calculateValue if available (for computed columns like badges)
    if (columnDef?.calculateValue) {
      value = columnDef.calculateValue(columnKey, data);
    } else {
      value = data[columnKey];
    }

    // Handle empty values
    if (value === null || value === undefined || value === '') {
      hasEmpty = true;
      continue;
    }

    // Apply calculateFilterValue if available to transform the value for filtering
    let filterValue: string;
    if (columnDef?.calculateFilterValue) {
      filterValue = columnDef.calculateFilterValue(value, columnKey, data);
    } else {
      filterValue = String(value);
    }

    // Add to set if not empty
    if (filterValue.trim()) {
      values.add(filterValue);
    } else {
      hasEmpty = true;
    }
  }

  // Sort values alphabetically
  const sortedValues = Array.from(values).sort((a, b) => a.localeCompare(b));

  // Add empty option at the end if there are empty values
  if (hasEmpty) {
    sortedValues.push(EMPTY_FILTER_VALUE);
  }

  return sortedValues;
}

/**
 * Get filterable columns from column definitions
 */
export function getFilterableColumns<T extends Record<string, unknown>>(
  columnDefs: EditableTableColumnDefinition<T>[],
): EditableTableColumnDefinition<T>[] {
  return columnDefs.filter((col) => col.enableFiltering !== false);
}

/**
 * Custom column filter function that handles empty values and arrays
 * Uses calculateFilterValue if available to transform values for comparison
 */
export function columnFilterFn<T extends Record<string, unknown>>(
  row: Row<T>,
  columnId: string,
  filterValue: unknown,
  columnDef?: EditableTableColumnDefinition<T>,
): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true; // No filter applied
  }

  const data = row.original;
  const columnKey = columnId as keyof T;
  let cellValue: unknown;

  // Use calculateValue if available
  if (columnDef?.calculateValue) {
    cellValue = columnDef.calculateValue(columnKey, data);
  } else {
    cellValue = data[columnKey];
  }

  // Handle empty value filter
  const hasEmptyFilter = filterValue.includes(EMPTY_FILTER_VALUE);
  const isEmpty = cellValue === null || cellValue === undefined || cellValue === '';

  if (isEmpty && hasEmptyFilter) {
    return true;
  }

  if (isEmpty) {
    return false;
  }

  // Apply calculateFilterValue if available to transform the value for comparison
  let stringValue: string;
  if (columnDef?.calculateFilterValue) {
    stringValue = columnDef.calculateFilterValue(cellValue, columnKey, data);
  } else {
    stringValue = String(cellValue);
  }

  // Filter out empty filter value and check if it matches any filter value (OR logic)
  const otherFilters = filterValue.filter((v) => v !== EMPTY_FILTER_VALUE);

  return otherFilters.some((filterVal) => stringValue === String(filterVal));
}

/**
 * Format filter value for display (handle empty values)
 */
export function formatFilterValue(value: string): string {
  return value === EMPTY_FILTER_VALUE ? EMPTY_FILTER_LABEL : value;
}

/**
 * Get active filters from column filters state
 */
export function getActiveFilters(columnFilters: ColumnFilter[]): Map<string, string[]> {
  const activeFilters = new Map<string, string[]>();

  for (const filter of columnFilters) {
    const values = Array.isArray(filter.value) ? filter.value : [filter.value];
    const stringValues = values.filter((v): v is string => typeof v === 'string' && v !== '');

    if (stringValues.length > 0) {
      activeFilters.set(String(filter.id), stringValues);
    }
  }

  return activeFilters;
}

/**
 * Check if a column has active filters
 */
export function hasColumnFilter(columnFilters: ColumnFilter[], columnId: string): boolean {
  const filter = columnFilters.find((f) => f.id === columnId);
  if (!filter) return false;

  const values = Array.isArray(filter.value) ? filter.value : [filter.value];
  return values.some((v) => typeof v === 'string' && v !== '');
}

/**
 * Count total number of active filters
 */
export function countActiveFilters(columnFilters: ColumnFilter[]): number {
  return getActiveFilters(columnFilters).size;
}

/**
 * Get count of rows for each filter value in a column
 */
export function getFilterValueCounts<T extends Record<string, unknown>>(
  rows: Row<T>[],
  columnKey: keyof T,
  columnDef?: EditableTableColumnDefinition<T>,
): Map<string, number> {
  const counts = new Map<string, number>();
  let emptyCount = 0;

  for (const row of rows) {
    const data = row.original;
    let value: unknown;

    // Use calculateValue if available (for computed columns like badges)
    if (columnDef?.calculateValue) {
      value = columnDef.calculateValue(columnKey, data);
    } else {
      value = data[columnKey];
    }

    // Handle empty values
    if (value === null || value === undefined || value === '') {
      emptyCount++;
      continue;
    }

    // Apply calculateFilterValue if available to transform the value for filtering
    let filterValue: string;
    if (columnDef?.calculateFilterValue) {
      filterValue = columnDef.calculateFilterValue(value, columnKey, data);
    } else {
      filterValue = String(value);
    }

    // Count non-empty values
    if (filterValue.trim()) {
      const currentCount = counts.get(filterValue) || 0;
      counts.set(filterValue, currentCount + 1);
    } else {
      emptyCount++;
    }
  }

  // Add empty count if there are empty values
  if (emptyCount > 0) {
    counts.set(EMPTY_FILTER_VALUE, emptyCount);
  }

  return counts;
}
