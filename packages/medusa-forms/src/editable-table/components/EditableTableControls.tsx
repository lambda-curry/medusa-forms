import { DescendingSorting, SidebarRight, XMarkMini } from '@medusajs/icons';
import { Button, Input, clx } from '@medusajs/ui';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { EditableTableColumnDefinition } from '../types/cells';
import { countActiveFilters, getActiveFilters } from '../utils/filterUtils';
import { FilterChip } from './filters/FilterChip';
import { FilterDropdown } from './filters/FilterDropdown';

interface EditableTableControlsProps<T extends Record<string, unknown>> {
  table: TanStackTable<T>;
  columnDefs: EditableTableColumnDefinition<T>[];
  showGlobalFilter?: boolean;
  showColumnVisibility?: boolean;
  showColumnPinning?: boolean;
  showColumnFilters?: boolean;
  showSorting?: boolean;
  className?: string;
  searchDebounceMs?: number; // Configurable debounce time
  // Additional action buttons to render on the right side
  additionalActions?: ReactNode;
}

/**
 * EditableTableControls - Component for table controls like search, filters, column visibility
 * Includes global search functionality with debouncing and URL persistence
 */
export function EditableTableControls<T extends Record<string, unknown>>({
  table,
  columnDefs,
  showGlobalFilter = false,
  showColumnVisibility = false,
  showColumnPinning = false,
  showColumnFilters = false,
  showSorting = false,
  className,
  searchDebounceMs = 1000, // Default 1 second
  additionalActions,
}: EditableTableControlsProps<T>) {
  // Use a ref to track the input element for uncontrolled behavior
  const inputRef = useRef<HTMLInputElement>(null);

  // Track which column filter is being edited (for reopening dropdown)
  const [editingColumnKey, setEditingColumnKey] = useState<keyof T | null>(null);

  // Debounced search handler with configurable delay
  const debouncedSearch = useDebouncedCallback((value: string) => {
    table.setGlobalFilter(value);
  }, searchDebounceMs);

  // Get column filters from table state
  const columnFilters = table.getState().columnFilters;

  // Get active filters - memoized with proper dependency
  const activeFilters = useMemo(() => {
    return getActiveFilters(columnFilters);
  }, [columnFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return countActiveFilters(columnFilters);
  }, [columnFilters]);

  // Handle remove individual filter
  const handleRemoveFilter = useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId);
      column?.setFilterValue(null); // null removes the filter
    },
    [table],
  );

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    table.resetColumnFilters();
  }, [table]);

  // Initialize input value from table state on mount
  useEffect(() => {
    if (inputRef.current) {
      const currentGlobalFilter = table.getState().globalFilter || '';
      if (inputRef.current.value !== currentGlobalFilter) {
        inputRef.current.value = currentGlobalFilter;
      }
    }
  }, []); // Only run on mount

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // No need to set state - input is uncontrolled
    debouncedSearch(value); // Debounced filter update
  };

  // Early return if no controls are enabled
  if (
    !showGlobalFilter &&
    !showColumnVisibility &&
    !showColumnPinning &&
    !showColumnFilters &&
    !showSorting &&
    !additionalActions
  ) {
    return null;
  }

  return (
    <div className={clx('flex flex-col gap-2 border-b border-ui-border-base', className)}>
      {/* Top Row: Add Filter + Search + Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-2">
        {/* Left Side: Add Filter + Search */}
        <div className="flex flex-1 justify-between gap-2 max-md:w-full">
          {/* Add Filter Dropdown */}
          {showColumnFilters && (
            <FilterDropdown
              table={table}
              columnDefs={columnDefs}
              initialColumn={editingColumnKey || undefined}
              onEditingColumnChange={setEditingColumnKey}
            />
          )}

          {/* Global Search Filter */}
          {showGlobalFilter && (
            <div className="relative">
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search"
                onChange={handleSearchChange}
                className="pl-9 md:w-64"
                size="small"
              />
            </div>
          )}
        </div>

        {/* Right Side: Sort + Column Controls + Additional Actions */}
        <div className="flex justify-end md:items-center gap-2 max-md:w-full">
          {/* Sorting Button */}
          {showSorting && (
            <Button size="small" variant="secondary">
              <DescendingSorting className="h-4 w-4 mr-1" />
              Name
            </Button>
          )}

          {/* Column Visibility Toggle */}
          {showColumnVisibility && (
            <Button size="small" variant="secondary" className="flex items-center gap-1">
              <SidebarRight className="h-4 w-4" />
            </Button>
          )}

          {/* Column Pinning Controls */}
          {showColumnPinning && <div>{/* Column pinning implementation - future enhancement */}</div>}

          {/* Additional Actions from parent component */}
          {additionalActions}
        </div>
      </div>

      {/* Active Filters Row */}
      {showColumnFilters && activeFilterCount > 0 && (
        <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
          {Array.from(activeFilters.entries()).map(([columnId, values]) => {
            const columnDef = columnDefs.find((col) => String(col.key) === columnId);
            const columnName = columnDef?.name || columnId;
            const columnKey = columnDef?.key;

            return (
              <FilterChip
                key={columnId}
                columnName={columnName}
                values={values}
                onRemove={() => {
                  handleRemoveFilter(columnId);
                  setEditingColumnKey(null);
                }}
                onClick={() => {
                  if (columnKey) {
                    setEditingColumnKey(columnKey);
                  }
                }}
              />
            );
          })}

          {activeFilterCount > 1 && (
            <Button size="small" variant="transparent" onClick={handleClearAllFilters} className="text-ui-fg-muted">
              <XMarkMini className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
