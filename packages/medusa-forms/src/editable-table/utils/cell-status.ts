import { clx } from '@medusajs/ui';
import type { CellState, CellStatus } from '../types/cells';

export const SAVE_DELAY_MS = 2000;

export const getStatusIndicator = (cellState: CellState): CellStatus => {
  if (cellState.isEditing) return 'editing';
  if (cellState.isSaving) return 'saving';
  if (cellState.canRetrySave) return 'retry';
  if (cellState.error) return 'error';
  if (cellState.justSaved) return 'saved';

  return 'idle';
};

export const getCellStatusClassName = (status: CellStatus) => {
  switch (status) {
    case 'editing':
      return clx(
        'border-2 bg-transparent text-ui-fg-base',
        'hover:bg-ui-bg-subtle focus:bg-ui-bg-subtle',
        'bg-ui-tag-orange-bg/10 border-2 border-ui-tag-orange-border/50',
      );
    case 'saving':
      return clx(
        'border-2 bg-transparent text-ui-fg-base',
        'hover:bg-ui-bg-subtle focus:bg-ui-bg-subtle',
        'bg-ui-bg-subtle',
      );
    case 'saved':
      return clx('border-2 border-ui-tag-green-border bg-ui-tag-green-bg text-ui-tag-green-text rounded-md');
    case 'error':
      return clx('border-2 border-ui-tag-red-border bg-ui-tag-red-bg text-ui-tag-red-text rounded-md');
    case 'disabled':
      return clx(
        'border-2 border-ui-tag-neutral-border bg-ui-tag-neutral-bg text-ui-tag-neutral-text rounded-md opacity-60',
      );
    default:
      return clx('border-none bg-transparent text-ui-fg-base', 'hover:bg-ui-bg-subtle focus:bg-ui-bg-subtle');
  }
};
