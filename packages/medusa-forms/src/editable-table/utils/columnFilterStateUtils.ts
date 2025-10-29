import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Utility functions for managing column filter state and URL serialization
 */

// Helper to encode column key for URL (replace dots with double underscores)
export function encodeColumnKeyForUrl(columnKey: string): string {
  return columnKey.replace(/\./g, '__');
}

// Helper to decode column key from URL (replace double underscores with dots)
export function decodeColumnKeyFromUrl(urlKey: string): string {
  return urlKey.replace(/__/g, '.');
}

// Helper to check if a column key matches a pattern (e.g., "location_levels.*")
export function matchesPattern(columnKey: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    return columnKey === pattern;
  }

  const regexPattern = pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(columnKey);
}

// Extract the group name from a pattern (e.g., "location_levels.*" -> "location_levels")
export function extractGroupName(pattern: string): string {
  return pattern.replace(/\.\*$/, '');
}

// Extract the column ID from a column key (e.g., "location_levels.sloc_123" -> "sloc_123")
export function extractColumnId(columnKey: string, groupName: string): string {
  const prefix = `${groupName}.`;
  if (columnKey.startsWith(prefix)) {
    return columnKey.slice(prefix.length);
  }
  return columnKey;
}

/**
 * Serialize column filters to URL parameters
 * Returns both cf_* parameters and multi-parser parameters
 */
export function serializeColumnFilters(
  filters: ColumnFiltersState,
  dynamicColumnFilters?: string[],
): Record<string, string[] | null> {
  const result: Record<string, string[] | null> = {};
  const dynamicGroups: Record<string, string[]> = {};

  // Group filters by pattern
  for (const filter of filters) {
    const columnKey = String(filter.id);
    const filterValues = Array.isArray(filter.value) ? filter.value : [filter.value];
    const values = filterValues.filter((v): v is string => typeof v === 'string' && v !== '');

    if (values.length === 0) continue;

    // Check if this column matches any dynamic pattern
    let matchedPattern: string | null = null;
    if (dynamicColumnFilters) {
      for (const pattern of dynamicColumnFilters) {
        if (matchesPattern(columnKey, pattern)) {
          matchedPattern = pattern;
          break;
        }
      }
    }

    if (matchedPattern) {
      // Dynamic filter: use multi-parser format
      const groupName = extractGroupName(matchedPattern);
      const columnId = extractColumnId(columnKey, groupName);

      // Format: "columnId:filterValue"
      if (!dynamicGroups[groupName]) {
        dynamicGroups[groupName] = [];
      }
      for (const value of values) {
        dynamicGroups[groupName].push(`${columnId}:${value}`);
      }
    } else {
      // Regular filter: use cf_* format
      const encodedKey = encodeColumnKeyForUrl(columnKey);
      result[`cf_${encodedKey}`] = values;
    }
  }

  // Add dynamic groups to result with cf_ prefix
  for (const [groupName, entries] of Object.entries(dynamicGroups)) {
    result[`cf_${groupName}`] = entries.length > 0 ? entries : null;
  }

  return result;
}

/**
 * Deserialize column filters from URL parameters (nuqs state only)
 */
export function deserializeColumnFilters(
  urlParams: Record<string, string[] | null>,
  dynamicColumnFilters?: string[],
): ColumnFiltersState {
  const filters: ColumnFiltersState = [];

  // Build a map of group names for dynamic filters
  const dynamicGroupNames = new Set<string>();
  if (dynamicColumnFilters) {
    for (const pattern of dynamicColumnFilters) {
      dynamicGroupNames.add(extractGroupName(pattern));
    }
  }

  // Get filters from urlParams (nuqs state only)
  for (const [key, value] of Object.entries(urlParams)) {
    if (!(value && Array.isArray(value)) || value.length === 0) continue;

    // Check if this is a cf_* parameter
    if (key.startsWith('cf_')) {
      const paramName = key.slice(3); // Remove 'cf_' prefix

      // Check if this is a dynamic filter group
      if (dynamicGroupNames.has(paramName)) {
        // Multi-parser format: "columnId:filterValue"
        const groupName = paramName;
        const filtersByColumn: Record<string, string[]> = {};

        for (const entry of value) {
          if (!entry || typeof entry !== 'string') continue;

          const colonIndex = entry.indexOf(':');
          if (colonIndex === -1) continue;

          const columnId = entry.slice(0, colonIndex);
          const filterValue = entry.slice(colonIndex + 1);

          if (columnId && filterValue) {
            const fullColumnKey = `${groupName}.${columnId}`;
            if (!filtersByColumn[fullColumnKey]) {
              filtersByColumn[fullColumnKey] = [];
            }
            filtersByColumn[fullColumnKey].push(filterValue);
          }
        }

        // Add each column's filters
        for (const [columnKey, filterValues] of Object.entries(filtersByColumn)) {
          if (filterValues.length > 0) {
            filters.push({ id: columnKey, value: filterValues });
          }
        }
      } else {
        // Regular cf_* format (single column)
        const encodedColumnId = paramName;
        const columnId = decodeColumnKeyFromUrl(encodedColumnId); // Decode column key
        const decodedValues = value.filter((v) => v?.trim());
        if (decodedValues.length > 0) {
          filters.push({ id: columnId, value: decodedValues });
        }
      }
    }
  }

  return filters;
}

/**
 * Build a set of dynamic group names from filter patterns
 */
export function buildDynamicGroupNames(dynamicColumnFilters?: string[]): Set<string> {
  const groups = new Set<string>();
  if (dynamicColumnFilters) {
    for (const pattern of dynamicColumnFilters) {
      groups.add(extractGroupName(pattern));
    }
  }
  return groups;
}
