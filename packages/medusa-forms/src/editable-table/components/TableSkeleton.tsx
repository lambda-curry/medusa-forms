import { Table, clx } from '@medusajs/ui';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

const SkeletonRow = ({ columns }: { columns: number }) => (
  <Table.Row className="txt-compact-small">
    {Array.from({ length: columns }).map((_, index) => (
      <Table.Cell key={`skeleton-row-cell-${index.toString()}`} className="relative p-1 h-12">
        <div className="relative h-full w-full flex items-center">
          <div className="h-4 bg-ui-bg-subtle rounded animate-pulse w-full" />
        </div>
      </Table.Cell>
    ))}
  </Table.Row>
);

const SkeletonHeader = ({ columns }: { columns: number }) => (
  <Table.Header className="txt-compact-small-plus bg-ui-bg-subtle sticky top-0">
    <Table.Row>
      {Array.from({ length: columns }).map((_, index) => (
        <Table.HeaderCell key={`skeleton-header-cell-${index.toString()}`} className="text-left w-full p-2">
          <div className="h-4 bg-ui-bg-subtle rounded animate-pulse w-3/4" />
        </Table.HeaderCell>
      ))}
    </Table.Row>
  </Table.Header>
);

export const TableSkeleton = ({ columns = 6, rows = 8, className }: TableSkeletonProps) => {
  return (
    <div className={clx('w-full space-y-4', className)}>
      <div className="flex size-full flex-col border border-ui-border-base rounded-lg bg-ui-bg-base shadow-borders-base">
        <div className="size-full overflow-hidden">
          <div className="relative h-full select-none overflow-auto outline-none">
            <Table className="text-ui-fg-subtle w-full border-collapse">
              <SkeletonHeader columns={columns} />
              <Table.Body>
                {Array.from({ length: rows }).map((_, index) => (
                  <SkeletonRow key={`skeleton-row-${index.toString()}`} columns={columns} />
                ))}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
