import { Input, clx } from '@medusajs/ui';
import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useCellState } from '../../hooks/useCellState';
import type { CellContentProps } from '../../types/cells';
import { SAVE_DELAY_MS, getCellStatusClassName, getStatusIndicator } from '../../utils/cell-status';
import { CellStatusIndicator } from '../cells/CellStatusIndicator';

function isValidNumberInput(value: string): boolean {
  if (!value || value.trim() === '') return false;

  // Regex explanation:
  // ^        - start of string
  // \d+      - one or more digits (handles whole numbers like "0", "123")
  // (\.\d+)? - optional group: dot followed by one or more digits (handles ".5", ".123")
  // $        - end of string
  return /^\d+(\.\d+)?$/.test(value.trim());
}

export const InputCell = ({
  meta,
  value: defaultValue,
  actions,
  cellProps,
}: CellContentProps<string | number | undefined>) => {
  const cellState = useCellState();
  const hasValueChanged = useCallback(
    (value: string | number | undefined) => {
      return defaultValue?.toString() !== value?.toString();
    },
    [defaultValue],
  );

  const _save = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      cellState.setIsEditing(false);

      if (meta.type === 'number' && !isValidNumberInput(e.target.value)) {
        cellState.setError('Please enter a valid number');

        return;
      }

      cellState.setIsSaving(true);

      const error = await actions.save(e.target.value).catch((e) => {
        cellState.setCanRetrySave(true);

        return 'An error occurred. Please try again.';
      });

      cellState.setError(error);
      cellState.setIsSaving(false);
    },
    [actions, cellState, meta.key],
  );

  const debouncedSave = useDebouncedCallback(_save, SAVE_DELAY_MS);

  const onChangeHandler = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasValueChanged(e.target.value)) {
        cellState.setIsSaving(false);
        return;
      }

      cellState.setError(null);
      cellState.setCanRetrySave(false);
      cellState.setIsEditing(true);

      await debouncedSave(e);
    },
    [debouncedSave, cellState],
  );
  const onBlurHandler = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!hasValueChanged(e.target.value)) {
        cellState.setIsSaving(false);
        return;
      }

      cellState.setError(null);
      cellState.setCanRetrySave(false);
      cellState.setIsEditing(true);

      debouncedSave.cancel();
      await _save(e);
    },
    [debouncedSave, _save, cellState],
  );

  const isSavePending = debouncedSave.isPending();

  const cellStatus = getStatusIndicator({
    isEditing: cellState.isEditing,
    isSaving: cellState.isSaving,
    canRetrySave: cellState.canRetrySave,
    error: cellState.error,
    justSaved: cellState.justSaved,
  });

  const showIndicator = cellStatus !== 'idle';
  const showLeftIndicator = showIndicator && meta.type === 'number';
  const showRightIndicator = showIndicator && meta.type === 'text';

  return (
    <div className="flex items-center w-full h-full relative">
      {showLeftIndicator && <CellStatusIndicator status={cellStatus} error={cellState.error} className="left-2 z-10" />}
      <Input
        {...cellProps}
        type={meta.type as 'text' | 'number'}
        defaultValue={defaultValue}
        onChange={onChangeHandler}
        onBlur={onBlurHandler}
        // onKeyDown={onKeyDown}
        className={clx(
          'txt-compact-small size-full outline-none transition-all duration-200',
          'ring-0 focus:ring-0 focus:outline-none shadow-none focus:shadow-none',
          'truncate focus:text-clip',
          getCellStatusClassName(cellStatus),
          meta.type === 'number' && showIndicator && 'pl-8',
          meta.type === 'text' && showIndicator && 'pr-8',
          // isDisabled && 'opacity-60 cursor-not-allowed bg-ui-bg-disabled',
        )}
      />
      {showRightIndicator && <CellStatusIndicator status={cellStatus} error={cellState.error} />}
    </div>
  );
};
