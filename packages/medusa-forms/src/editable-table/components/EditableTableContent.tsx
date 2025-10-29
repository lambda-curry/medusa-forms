import { Table, Text, clx } from '@medusajs/ui';
import { Button } from '@medusajs/ui';
import { type ColumnDef, type Table as TanStackTable, flexRender } from '@tanstack/react-table';
import { ArrowDownUp, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import type { ReactNode } from 'react';
import { getColumnHeaderClassName } from '../columnHelpers';
import { TooltipColumnHeader } from './TooltipColumnHeader';

interface EditableTableContentProps<T extends Record<string, unknown>> {
  table: TanStackTable<T>;
  className?: string;
  getTooltipContent?: (columnKey: string, columnName: string) => string | ReactNode | null;
}

export function EditableTableContent<T extends Record<string, unknown>>({
  table,
  className,
  getTooltipContent,
}: EditableTableContentProps<T>) {
  return (
    <div className={clx('size-full overflow-hidden', className)}>
      <div className="relative h-full select-none overflow-auto outline-none">
        <Table className="text-ui-fg-subtle w-full">
          <Table.Header className="txt-compact-small-plus bg-ui-bg-subtle sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header, headerIndex) => {
                  // Calculate left offset for pinned columns
                  let leftOffset = 0;
                  if (header.column.getIsPinned() === 'left') {
                    const pinnedColumns = table.getState().columnPinning.left || [];
                    const currentColumnIndex = pinnedColumns.indexOf(header.column.id);
                    if (currentColumnIndex > 0) {
                      // Sum up the widths of all previous pinned columns
                      for (let i = 0; i < currentColumnIndex; i++) {
                        const prevColumn = table.getColumn(pinnedColumns[i]);
                        if (prevColumn) {
                          leftOffset += prevColumn.getSize();
                        }
                      }
                    }
                  }

                  return (
                    <Table.HeaderCell
                      key={header.id}
                      className={clx(
                        'text-left w-full p-2',
                        'relative',
                        {
                          '!pl-4': header.id === 'select',
                        },
                        header.column.getCanSort() && 'cursor-pointer select-none hover:bg-ui-bg-base-hover',
                        // Sticky pinned columns with proper z-index stacking
                        {
                          'sticky bg-card border-r': header.column.getIsPinned() === 'left',
                          'sticky bg-card': header.column.getIsPinned() === 'left',
                          'sticky right-0 bg-card border-l': header.column.getIsPinned() === 'right',
                        },
                      )}
                      style={{
                        width: header.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                        ...(header.column.getIsPinned() === 'left' && {
                          left: `${leftOffset}px`,
                          zIndex: 20 - headerIndex, // Higher z-index for columns to the left
                        }),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={clx(
                            getColumnHeaderClassName(header.column.columnDef as ColumnDef<Record<string, unknown>>),
                            !header.column.getCanSort() && 'cursor-default',
                          )}
                        >
                          <TooltipColumnHeader
                            columnKey={header.column.id}
                            columnName={
                              typeof header.column.columnDef.header === 'string'
                                ? header.column.columnDef.header
                                : header.column.id
                            }
                            getTooltipContent={getTooltipContent}
                          >
                            <Text
                              size="base"
                              weight="plus"
                              className={clx('text-ui-fg-subtle', header.column.getIsSorted() && 'text-ui-fg-base')}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </Text>
                          </TooltipColumnHeader>

                          {/* Sort indicator */}
                          {header.column.getCanSort() && (
                            <div className={clx('text-ui-fg-muted', header.column.getIsSorted() && 'text-ui-fg-base')}>
                              {{
                                asc: <ArrowUpWideNarrow className="w-5 h-5" />,
                                desc: <ArrowDownWideNarrow className="w-5 h-5" />,
                              }[header.column.getIsSorted() as string] ?? (
                                <ArrowDownUp className="w-5 h-5 text-ui-fg-subtle/50" />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Column resizer */}
                      {header.column.getCanResize() && (
                        <Button
                          type="button"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-border opacity-0 hover:opacity-100 active:opacity-100 border-0 p-0"
                          aria-label="Resize column"
                        />
                      )}
                    </Table.HeaderCell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Header>

          <Table.Body className="border-none">
            {table.getRowModel().rows?.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <Table.Row
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="txt-compact-small border-none"
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    // Calculate left offset for pinned columns
                    let leftOffset = 0;
                    if (cell.column.getIsPinned() === 'left') {
                      const pinnedColumns = table.getState().columnPinning.left || [];
                      const currentColumnIndex = pinnedColumns.indexOf(cell.column.id);
                      if (currentColumnIndex > 0) {
                        // Sum up the widths of all previous pinned columns
                        for (let i = 0; i < currentColumnIndex; i++) {
                          const prevColumn = table.getColumn(pinnedColumns[i]);
                          if (prevColumn) {
                            leftOffset += prevColumn.getSize();
                          }
                        }
                      }
                    }

                    return (
                      <Table.Cell
                        key={cell.id}
                        className={clx('relative p-1 h-12', {
                          '!pl-4': cell.column.id === 'select',

                          // Sticky pinned columns with proper z-index stacking
                          sticky: cell.column.getIsPinned() === 'left',
                          'sticky right-0': cell.column.getIsPinned() === 'right',
                        })}
                        data-row-index={rowIndex}
                        data-column-index={cellIndex}
                        style={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.columnDef.minSize,
                          maxWidth: cell.column.columnDef.maxSize,
                          ...(cell.column.getIsPinned() === 'left' && {
                            left: `${leftOffset}px`,
                            zIndex: 20 - cellIndex, // Higher z-index for columns to the left
                          }),
                        }}
                      >
                        <div className="relative h-full w-full flex items-center">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))
            ) : (
              <Table.Row>
                <td colSpan={table.getAllColumns().length} className="h-24 text-center">
                  No results found.
                </td>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
