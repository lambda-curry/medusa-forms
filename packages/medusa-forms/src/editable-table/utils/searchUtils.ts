import type { Row } from '@tanstack/react-table';
import type { EditableTableColumnDefinition } from '../types/cells';

/**
 * Custom global filter function that supports calculated values
 * This function searches through both raw data and calculated column values
 */
export function createGlobalFilterFn<T extends Record<string, unknown>>(
  columnDefs: EditableTableColumnDefinition<T>[],
) {
  return (row: Row<T>, _columnId: string, value: string): boolean => {
    const searchValue = value.toLowerCase().trim();

    if (!searchValue) return true;

    const data = row.original;

    // Search through all column definitions
    for (const columnDef of columnDefs) {
      const columnKey = String(columnDef.key);
      let searchableValue = '';

      if (columnDef.calculateValue) {
        // Handle calculated values
        try {
          const calculatedValue = columnDef.calculateValue(columnKey, data);

          if (typeof calculatedValue === 'string') {
            searchableValue = calculatedValue;
          } else if (calculatedValue && typeof calculatedValue === 'object') {
            // Handle object values (like BadgeCellValue)
            if ('title' in calculatedValue && typeof calculatedValue.title === 'string') {
              searchableValue = calculatedValue.title;
            } else if ('status' in calculatedValue && typeof calculatedValue.status === 'string') {
              searchableValue = calculatedValue.status;
            } else {
              // Fallback to JSON string representation
              searchableValue = JSON.stringify(calculatedValue);
            }
          }
        } catch (error) {
          // If calculation fails, skip this column
          continue;
        }
      } else {
        // Handle raw data values
        const rawValue = data[columnKey];
        if (rawValue != null) {
          searchableValue = String(rawValue);
        }
      }

      // Check if the searchable value contains the search term
      if (searchableValue.toLowerCase().includes(searchValue)) {
        return true;
      }
    }

    return false;
  };
}

/**
 * Get searchable text from a calculated value
 */
export function getSearchableText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    // Handle common object patterns
    if ('title' in value && typeof value.title === 'string') {
      return value.title;
    }

    if ('label' in value && typeof value.label === 'string') {
      return value.label;
    }

    if ('name' in value && typeof value.name === 'string') {
      return value.name;
    }

    if ('status' in value && typeof value.status === 'string') {
      return value.status;
    }

    // Fallback to JSON representation
    return JSON.stringify(value);
  }

  return String(value || '');
}

/**
 * Extract all searchable values from a row for debugging
 */
export function extractSearchableValues<T extends Record<string, unknown>>(
  row: T,
  columnDefs: EditableTableColumnDefinition<T>[],
): Record<string, string> {
  const searchableValues: Record<string, string> = {};

  for (const columnDef of columnDefs) {
    const columnKey = String(columnDef.key);

    try {
      if (columnDef.calculateValue) {
        const calculatedValue = columnDef.calculateValue(columnKey, row);
        searchableValues[columnKey] = getSearchableText(calculatedValue);
      } else {
        const rawValue = row[columnKey];
        searchableValues[columnKey] = getSearchableText(rawValue);
      }
    } catch (error) {
      searchableValues[columnKey] = '';
    }
  }

  return searchableValues;
}
