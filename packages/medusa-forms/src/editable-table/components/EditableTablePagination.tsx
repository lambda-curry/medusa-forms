import { Button, Select } from '@medusajs/ui';
import type { Table as TanStackTable } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface EditableTablePaginationProps<T extends Record<string, unknown>> {
  table: TanStackTable<T>;
  pageSizeOptions?: number[];
  labels?: {
    rowsPerPage?: string;
    firstPage?: string;
    previousPage?: string;
    nextPage?: string;
    lastPage?: string;
  };
}

const defaultPageSizeOptions = [20, 30, 40, 50, 100];

const defaultLabels = {
  rowsPerPage: 'Rows per page',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
};

export function EditableTablePagination<T extends Record<string, unknown>>({
  table,
  pageSizeOptions = defaultPageSizeOptions,
  labels = defaultLabels,
}: EditableTablePaginationProps<T>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">{labels.rowsPerPage}</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value: string) => {
            table.setPageSize(Number(value));
          }}
        >
          <Select.Trigger className="h-8 w-[70px]">
            <Select.Value placeholder={table.getState().pagination.pageSize} />
          </Select.Trigger>
          <Select.Content side="top">
            {pageSizeOptions.map((pageSize) => (
              <Select.Item key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="transparent"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{labels.firstPage}</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="transparent"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{labels.previousPage}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="transparent"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{labels.nextPage}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="transparent"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{labels.lastPage}</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
