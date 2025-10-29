import { ArrowPath, Check, ExclamationCircle, LockClosedSolid, PencilSquare } from '@medusajs/icons';
import { Tooltip, clx } from '@medusajs/ui';
import type { ReactNode } from 'react';
import type { CellStatus } from '../../types/cells';

export const CellStatusIndicator = ({
  status,
  error,
  className,
}: {
  status: CellStatus;
  error: string | null;
  className?: string;
}) => {
  let icon: ReactNode | null = null;
  let tooltip: string | undefined;

  switch (status) {
    case 'editing':
      icon = <PencilSquare className="h-4 w-4 text-ui-tag-orange-icon" />;
      tooltip = 'Editing...';
      break;
    case 'saving':
      icon = (
        <div className="h-4 w-4 border-2 border-ui-tag-blue-icon border-t-transparent rounded-full animate-spin" />
      );
      tooltip = 'Saving...';
      break;
    case 'saved':
      icon = <Check className="h-4 w-4 text-ui-tag-green-icon" />;
      tooltip = 'Saved successfully';
      break;
    case 'error':
      icon = <ExclamationCircle className="h-4 w-4 text-ui-tag-red-icon" />;
      tooltip = error || 'An error occurred';
      break;
    case 'disabled':
      icon = <LockClosedSolid className="h-4 w-4 text-ui-tag-neutral-icon" />;
      tooltip = 'Field is disabled';
      break;
    case 'retry':
      icon = <ArrowPath className="h-4 w-4 text-ui-tag-orange-icon" />;
      tooltip = error ? `Retry... ${error}` : 'Retry...';
      break;
    default:
      icon = null;
  }

  if (!icon) return null;

  return (
    <div className={clx('absolute right-2 top-1/2 -translate-y-1/2 flex items-center w-4', className)}>
      {tooltip ? (
        <Tooltip content={tooltip}>
          <div className="flex items-center cursor-help">{icon}</div>
        </Tooltip>
      ) : (
        icon
      )}
    </div>
  );
};
