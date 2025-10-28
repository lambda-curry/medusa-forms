import { Funnel } from '@medusajs/icons';
import { Button, Checkbox, DropdownMenu, Input, Text } from '@medusajs/ui';
import type { Table } from '@tanstack/react-table';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import type { EditableTableColumnDefinition } from '../../types/cells';
import {
  EMPTY_FILTER_VALUE,
  formatFilterValue,
  getFilterValueCounts,
  getFilterableColumns,
  getUniqueColumnValues,
} from '../../utils/filterUtils';

export interface FilterDropdownProps<T extends Record<string, unknown>> {
  table: Table<T>;
  columnDefs: EditableTableColumnDefinition<T>[];
  className?: string;
  initialColumn?: keyof T; // Allow opening with a pre-selected column
  onEditingColumnChange?: (column: keyof T | null) => void; // Callback to clear editing state
}

/**
 * FilterDropdown - Dropdown for adding column filters
 * Memoized to prevent unnecessary re-renders
 */
function FilterDropdownComponent<T extends Record<string, unknown>>({
  table,
  columnDefs,
  className,
  initialColumn,
  onEditingColumnChange,
}: FilterDropdownProps<T>) {
  const [selectedColumn, setSelectedColumn] = useState<keyof T | null>(null);
  const [pendingValues, setPendingValues] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);
  const [isValueMenuOpen, setIsValueMenuOpen] = useState(false);

  // Handle initialColumn changes (when user clicks a filter chip)
  useEffect(() => {
    if (initialColumn && initialColumn !== selectedColumn) {
      // Initialize column selection and pending values
      const filter = table.getState().columnFilters.find((f) => f.id === String(initialColumn));
      const existingValues = filter && Array.isArray(filter.value) ? filter.value : [];

      setSelectedColumn(initialColumn);
      setPendingValues(new Set(existingValues));
      setSearchValue('');
      setIsValueMenuOpen(true);

      // Clear the editing state after opening
      if (onEditingColumnChange) {
        onEditingColumnChange(null);
      }
    }
  }, [initialColumn, selectedColumn, table, onEditingColumnChange]);

  // Get filterable columns that are currently visible
  const filterableColumns = useMemo(() => {
    const columns = getFilterableColumns(columnDefs);
    return columns.filter((col) => {
      const column = table.getColumn(String(col.key));
      return column?.getIsVisible();
    });
  }, [columnDefs, table]);

  // Get unique values for the selected column (from all rows, not just filtered)
  const columnValues = useMemo(() => {
    if (!selectedColumn) return [];

    const rows = table.getCoreRowModel().rows; // Get all rows, not just filtered ones
    const columnDef = columnDefs.find((col) => col.key === selectedColumn);
    return getUniqueColumnValues(rows, selectedColumn, columnDef);
  }, [selectedColumn, table, columnDefs]);

  // Get counts for each filter value in the selected column
  const filterValueCounts = useMemo(() => {
    if (!selectedColumn) return new Map<string, number>();

    const rows = table.getCoreRowModel().rows; // Get all rows, not just filtered ones
    const columnDef = columnDefs.find((col) => col.key === selectedColumn);
    return getFilterValueCounts(rows, selectedColumn, columnDef);
  }, [selectedColumn, table, columnDefs]);

  // Filter column values based on search
  const filteredValues = useMemo(() => {
    if (!searchValue.trim()) return columnValues;

    const search = searchValue.toLowerCase();
    return columnValues.filter((value) => formatFilterValue(value).toLowerCase().includes(search));
  }, [columnValues, searchValue]);

  // Get current filter values for selected column from table state
  const currentFilterValues = useMemo(() => {
    if (!selectedColumn) return [];

    const filter = table.getState().columnFilters.find((f) => f.id === String(selectedColumn));
    if (!filter) return [];

    return Array.isArray(filter.value) ? filter.value : [filter.value];
  }, [selectedColumn, table]);

  // Initialize pending values when column is selected or changed
  const handleColumnSelect = useCallback(
    (columnKey: keyof T) => {
      setSelectedColumn(columnKey);

      // Initialize pending values with current filter values for this column
      const filter = table.getState().columnFilters.find((f) => f.id === String(columnKey));
      const existingValues = filter && Array.isArray(filter.value) ? filter.value : [];
      setPendingValues(new Set(existingValues));

      setSearchValue('');
      setIsColumnMenuOpen(false);
      setIsValueMenuOpen(true);
    },
    [table],
  );

  // Handle value toggle (only updates local state, not table state)
  const handleValueToggle = useCallback((value: string) => {
    setPendingValues((prev) => {
      const newValues = new Set(prev);
      if (newValues.has(value)) {
        newValues.delete(value);
      } else {
        newValues.add(value);
      }
      return newValues;
    });
  }, []);

  // Handle apply (apply pending values to table state and close)
  const handleApply = useCallback(() => {
    if (!selectedColumn) return;

    const column = table.getColumn(String(selectedColumn));
    if (!column) return;

    // Apply pending values to table state
    if (pendingValues.size > 0) {
      column.setFilterValue(Array.from(pendingValues));
    } else {
      // Clear the filter (null removes it completely)
      column.setFilterValue(null);
    }

    // Reset state and close dropdown
    setSelectedColumn(null);
    setIsValueMenuOpen(false);
    setIsColumnMenuOpen(false);
    setSearchValue('');
    setPendingValues(new Set());
  }, [selectedColumn, table, pendingValues]);

  // Handle cancel (revert to current filter values)
  const handleCancel = useCallback(() => {
    setSelectedColumn(null);
    setIsValueMenuOpen(false);
    setIsColumnMenuOpen(false);
    setSearchValue('');
    setPendingValues(new Set());
  }, []);

  // Handle value menu close (when user clicks outside)
  const handleValueMenuOpenChange = useCallback(
    (open: boolean) => {
      setIsValueMenuOpen(open);

      // If closing and a column is selected, reset it
      if (!open && selectedColumn) {
        setSelectedColumn(null);
        setSearchValue('');
        setPendingValues(new Set());
      }
    },
    [selectedColumn],
  );

  // Get column name for display
  const selectedColumnName = useMemo(() => {
    if (!selectedColumn) return '';
    return columnDefs.find((col) => col.key === selectedColumn)?.name || '';
  }, [selectedColumn, columnDefs]);

  // Determine if we're clearing an existing filter
  const isClearingFilter = useMemo(() => {
    return pendingValues.size === 0 && currentFilterValues.length > 0;
  }, [pendingValues.size, currentFilterValues.length]);

  // Determine button state and text
  const applyButtonText = isClearingFilter ? 'Clear' : 'Apply';
  const applyButtonDisabled = pendingValues.size === 0 && !isClearingFilter;

  return (
    <div className={className}>
      {/* Column Selection Dropdown */}
      {!selectedColumn && (
        <DropdownMenu open={isColumnMenuOpen} onOpenChange={setIsColumnMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <Button size="small" variant="secondary">
              Add filter
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start" className="min-w-[200px]">
            {filterableColumns.length === 0 ? (
              <div className="px-3 py-2 text-sm text-ui-fg-muted">No filterable columns available</div>
            ) : (
              filterableColumns.map((col) => (
                <DropdownMenu.Item
                  key={String(col.key)}
                  onClick={() => handleColumnSelect(col.key)}
                  className="cursor-pointer"
                >
                  {col.name}
                </DropdownMenu.Item>
              ))
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}

      {/* Value Selection Dropdown */}
      {selectedColumn && (
        <DropdownMenu open={isValueMenuOpen} onOpenChange={handleValueMenuOpenChange}>
          <DropdownMenu.Trigger asChild>
            <Button size="small" variant="secondary">
              <Funnel className="h-4 w-4 mr-1" />
              {selectedColumnName}
              {pendingValues.size > 0 && ` (${pendingValues.size})`}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start" className="min-w-[250px] p-0">
            {/* Search Input */}
            <div className="px-3 py-2 border-b border-ui-border-base">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search values..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-8"
                  size="small"
                />
              </div>
            </div>

            {/* Value List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredValues.length === 0 ? (
                <div className="px-3 py-4 text-sm text-ui-fg-muted text-center">No values found</div>
              ) : (
                <div className="py-1">
                  {filteredValues.map((value) => {
                    const isChecked = pendingValues.has(value);
                    const displayValue = formatFilterValue(value);
                    const isEmptyValue = value === EMPTY_FILTER_VALUE;
                    const count = filterValueCounts.get(value) || 0;

                    return (
                      <div
                        key={value}
                        // biome-ignore lint/a11y/useSemanticElements: Using div to avoid button nesting with Checkbox component
                        role="button"
                        tabIndex={0}
                        onClick={() => handleValueToggle(value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleValueToggle(value);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-ui-bg-base-hover cursor-pointer"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => handleValueToggle(value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center justify-between flex-1">
                          <Text size="small" className={isEmptyValue ? 'text-ui-fg-muted italic' : ''}>
                            {displayValue}
                          </Text>
                          <Text size="small" className="text-ui-fg-muted">
                            ({count})
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-ui-border-base">
              <Button size="small" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="small" variant="primary" onClick={handleApply} disabled={applyButtonDisabled}>
                {applyButtonText}
              </Button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const FilterDropdown = memo(FilterDropdownComponent) as typeof FilterDropdownComponent;
