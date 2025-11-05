import { XMarkMini } from '@medusajs/icons';
import { Button, clx } from '@medusajs/ui';
import { memo } from 'react';
import { formatFilterValue } from '../../utils/filterUtils';

export interface FilterChipProps {
  columnName: string;
  values: string[];
  onRemove: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * FilterChip - Displays an active column filter with remove button
 * Memoized to prevent unnecessary re-renders
 */
export const FilterChip = memo<FilterChipProps>(({ columnName, values, onRemove, onClick, className }) => {
  // Format the filter values for display
  const displayValue = values.length === 1 ? formatFilterValue(values[0]) : `${values.length} selected`;

  return (
    <div
      className={clx(
        'flex items-center justify-center gap-1.5 px-2 py-1 bg-ui-bg-base border border-ui-border-base rounded-md',
        'hover:bg-ui-bg-base-hover transition-colors text-xs',
        className,
      )}
    >
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={clx('inline-flex items-center gap-1.5', onClick ? 'cursor-pointer' : 'cursor-default', className)}
      >
        <span className="text-ui-fg-subtle font-medium">{columnName}:</span>
        <span className="text-ui-fg-base">{displayValue}</span>
      </div>
      <Button
        variant="transparent"
        onClick={(e) => {
          e.stopPropagation();

          onRemove();
        }}
        className="p-1 hover:bg-ui-bg-base-hover"
        aria-label={`Remove ${columnName} filter`}
      >
        <XMarkMini className="h-3 w-3" />
      </Button>
    </div>
  );
});

FilterChip.displayName = 'FilterChip';
