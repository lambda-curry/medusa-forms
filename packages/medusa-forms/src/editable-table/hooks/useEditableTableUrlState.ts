import type { ColumnFiltersState, PaginationState, SortingState, Updater } from '@tanstack/react-table';
import { createParser, parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useCallback, useMemo, useRef } from 'react';
import type { EditableTableColumnDefinition } from '../types/cells';
import {
  buildDynamicGroupNames,
  deserializeColumnFilters,
  encodeColumnKeyForUrl,
  matchesPattern,
  serializeColumnFilters,
} from '../utils/columnFilterStateUtils';

// Compact URL state for EditableTable
export type EditableTableUrlState = {
  q: string; // Global search/filter
  sort: string; // Sort column with optional - prefix for desc
  page: number; // Current page
  pageSize: number; // Page size
  // Column filters are added dynamically as cf_columnKey: string[]
  // Dynamic filters are added as multi-parsers (e.g., location_levels: string[])
};

// Default values (not persisted in URL when default)
const DEFAULT_VALUES: EditableTableUrlState = {
  q: '',
  sort: '',
  page: 0,
  pageSize: 20,
};

// Create parameter keys with optional table ID prefix
function createParameterKeys(tableId = '') {
  const prefix = tableId ? `${tableId}_` : '';

  return {
    q: `${prefix}q`,
    sort: `${prefix}sort`,
    page: `${prefix}page`,
    pageSize: `${prefix}pageSize`,
  };
}

// Serialize sorting to compact format
function serializeSorting(sorting: SortingState): string {
  if (!sorting.length) return '';

  const sort = sorting[0]; // Only single column sorting
  return sort.desc ? `-${sort.id}` : sort.id;
}

// Deserialize sorting from compact format
function deserializeSorting(sortStr: string): SortingState {
  if (!sortStr.trim()) return [];

  const isDesc = sortStr.startsWith('-');
  const columnId = isDesc ? sortStr.slice(1) : sortStr;

  return [{ id: columnId, desc: isDesc }];
}

// Find first non-avatar column for default sorting
function getDefaultSortColumn<T extends Record<string, unknown>>(
  columnsDef: EditableTableColumnDefinition<T>[],
): string {
  // First try core columns
  for (const column of columnsDef) {
    if (column.enableSorting !== false) {
      return String(column.key);
    }
  }

  // Fallback to first column
  return columnsDef.length > 0 ? String(columnsDef[0].key) : '';
}

export function useEditableTableUrlState<T extends Record<string, unknown>>(
  columnsDef: EditableTableColumnDefinition<T>[],
  dynamicColumnFilters?: string[],
) {
  const paramKeys = createParameterKeys();

  // Flag to prevent circular updates when we update URL state
  const isUpdatingFromUrl = useRef(false);

  // Get default sort column
  const defaultSortColumn = useMemo(() => getDefaultSortColumn(columnsDef), [columnsDef]);

  // Build a set of dynamic group names
  const dynamicGroupNames = useMemo(() => buildDynamicGroupNames(dynamicColumnFilters), [dynamicColumnFilters]);

  // Build parsers for regular column filters (non-dynamic)
  const columnFilterParsers = useMemo(() => {
    const parsers: Record<string, ReturnType<typeof parseAsArrayOf<string>>> = {};

    for (const column of columnsDef) {
      if (column.enableFiltering === false) continue;

      const columnKey = String(column.key);

      // Check if this column matches any dynamic pattern
      let isDynamic = false;
      if (dynamicColumnFilters) {
        for (const pattern of dynamicColumnFilters) {
          if (matchesPattern(columnKey, pattern)) {
            isDynamic = true;
            break;
          }
        }
      }

      // Only create cf_* parser if not dynamic
      if (!isDynamic) {
        const encodedKey = encodeColumnKeyForUrl(columnKey);
        const filterKey = `cf_${encodedKey}`;
        parsers[filterKey] = parseAsArrayOf(parseAsString).withDefault([]);
      }
    }

    return parsers;
  }, [columnsDef, dynamicColumnFilters]);

  // Build multi-parsers for dynamic column groups (with cf_ prefix)
  const dynamicFilterParsers = useMemo(() => {
    const parsers: Record<string, ReturnType<typeof createParser<string[]>>> = {};

    for (const groupName of dynamicGroupNames) {
      // Create a multi-parser for this group with cf_ prefix
      parsers[`cf_${groupName}`] = createParser({
        parse: (value: string) => {
          // Parse comma-separated values
          return value.split(',').filter((v) => v.trim());
        },
        serialize: (value: string[]) => {
          // Serialize to comma-separated string
          return value.join(',');
        },
      }).withDefault([]);
    }

    return parsers;
  }, [dynamicGroupNames]);

  // Combine base parsers with column filter parsers and dynamic parsers
  const allParsers = useMemo(
    () => ({
      [paramKeys.q]: parseAsString.withDefault(DEFAULT_VALUES.q),
      [paramKeys.sort]: parseAsString.withDefault(defaultSortColumn),
      [paramKeys.page]: parseAsInteger.withDefault(DEFAULT_VALUES.page),
      [paramKeys.pageSize]: parseAsInteger.withDefault(DEFAULT_VALUES.pageSize),
      ...columnFilterParsers,
      ...dynamicFilterParsers,
    }),
    [paramKeys, defaultSortColumn, columnFilterParsers, dynamicFilterParsers],
  );

  // Use nuqs for URL state management
  const [urlState, setUrlState] = useQueryStates(allParsers, {
    // Clear defaults from URL
    clearOnDefault: true,
  });

  // Memoize pagination state separately to prevent circular updates
  const paginationState = useMemo(
    () => ({
      pageIndex: Number(urlState[paramKeys.page] || DEFAULT_VALUES.page),
      pageSize: Number(urlState[paramKeys.pageSize] || DEFAULT_VALUES.pageSize),
    }),
    [urlState[paramKeys.page], urlState[paramKeys.pageSize], paramKeys.page, paramKeys.pageSize],
  );

  // Extract column filters from URL state - memoized to prevent re-renders
  const columnFiltersState = useMemo(() => {
    return deserializeColumnFilters(urlState as Record<string, string[] | null>, dynamicColumnFilters);
  }, [urlState, dynamicColumnFilters]);

  // Convert URL state to TanStack Table state - memoized with stable references
  const tableState = useMemo(() => {
    const globalFilter = String(urlState[paramKeys.q] || '');
    const sorting = deserializeSorting(String(urlState[paramKeys.sort] || defaultSortColumn));

    return {
      globalFilter,
      columnFilters: columnFiltersState,
      sorting,
      pagination: paginationState,
    };
  }, [
    urlState[paramKeys.q],
    urlState[paramKeys.sort],
    paramKeys.q,
    paramKeys.sort,
    defaultSortColumn,
    columnFiltersState,
    paginationState,
  ]);

  // Helper function to handle updater functions
  const handleUpdater = useCallback(<T>(updaterOrValue: Updater<T>, currentValue: T): T => {
    return typeof updaterOrValue === 'function' ? (updaterOrValue as (old: T) => T)(currentValue) : updaterOrValue;
  }, []);

  // Update functions for each state property - memoized separately to avoid re-renders
  const setGlobalFilter = useCallback(
    (updaterOrValue: Updater<string>) => {
      const newValue = handleUpdater(updaterOrValue, tableState.globalFilter);
      setUrlState({
        [paramKeys.q]: newValue || null, // null removes from URL if empty
      });
    },
    [tableState.globalFilter, setUrlState, paramKeys.q, handleUpdater],
  );

  const setSorting = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newValue = handleUpdater(updaterOrValue, tableState.sorting);
      const serialized = serializeSorting(newValue);
      setUrlState({
        [paramKeys.sort]: serialized || defaultSortColumn, // fallback to default
      });
    },
    [tableState.sorting, setUrlState, paramKeys.sort, handleUpdater, defaultSortColumn],
  );

  const setColumnFilters = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      const currentValue = columnFiltersState;
      const newValue = handleUpdater(updaterOrValue, currentValue);

      // Serialize both old and new states to determine what changed
      const currentSerialized = serializeColumnFilters(currentValue, dynamicColumnFilters);
      const newSerialized = serializeColumnFilters(newValue, dynamicColumnFilters);

      // Build updates object: first clear old keys, then set new values
      const updates: Record<string, string[] | null> = {};

      // Clear all old filter keys (set to null)
      for (const key of Object.keys(currentSerialized)) {
        updates[key] = null;
      }

      // Set new filter values
      for (const [key, value] of Object.entries(newSerialized)) {
        updates[key] = value;
      }

      setUrlState(updates);
    },
    [columnFiltersState, setUrlState, handleUpdater, dynamicColumnFilters],
  );

  const setPagination = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      // Prevent circular updates
      if (isUpdatingFromUrl.current) {
        return;
      }

      const newValue = handleUpdater(updaterOrValue, tableState.pagination);

      // Check if the value actually changed
      const hasChanged =
        newValue.pageIndex !== tableState.pagination.pageIndex || newValue.pageSize !== tableState.pagination.pageSize;

      // Only update URL if values actually changed
      if (hasChanged) {
        isUpdatingFromUrl.current = true;
        setUrlState({
          [paramKeys.page]: newValue.pageIndex !== undefined ? newValue.pageIndex : null,
          [paramKeys.pageSize]: newValue.pageSize || null,
        });
        // Reset flag after a short delay to allow URL update to complete
        setTimeout(() => {
          isUpdatingFromUrl.current = false;
        }, 100);
      }
    },
    [tableState.pagination, setUrlState, paramKeys.page, paramKeys.pageSize, handleUpdater],
  );

  // Stable reference for updateTableState
  const updateTableState = useMemo(
    () => ({
      setGlobalFilter,
      setSorting,
      setColumnFilters,
      setPagination,
    }),
    [setGlobalFilter, setSorting, setColumnFilters, setPagination],
  );

  // Reset function
  const resetTableState = useCallback(() => {
    // Clear all filters (both cf_* and dynamic groups)
    const clearFilters: Record<string, null> = {};

    // Clear cf_* filters
    for (const key of Object.keys(columnFilterParsers)) {
      clearFilters[key] = null;
    }

    // Clear dynamic filter groups (with cf_ prefix)
    for (const groupName of dynamicGroupNames) {
      clearFilters[`cf_${groupName}`] = null;
    }

    setUrlState({
      [paramKeys.q]: null,
      [paramKeys.sort]: defaultSortColumn,
      [paramKeys.page]: null,
      [paramKeys.pageSize]: null,
      ...clearFilters,
    });
  }, [setUrlState, paramKeys, defaultSortColumn, columnFilterParsers, dynamicGroupNames]);

  return {
    tableState,
    updateTableState,
    resetTableState,
  };
}
