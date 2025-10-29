import { clx } from '@medusajs/ui';
import { type ChangeEvent, type ReactNode, type RefObject, useCallback } from 'react';
import type { CellContentProps } from '../../../types/cells';
import { getCellStatusClassName, getStatusIndicator } from '../../../utils/cell-status';
import { CellStatusIndicator } from '../../cells/CellStatusIndicator';
import { Autocomplete } from './Autocomplete';
import { useAutocompleteCell } from './hooks';

export interface AutocompleteCellProps extends CellContentProps<string | undefined> {}

export const AutocompleteCell = ({ meta, value: defaultValue, actions, cellProps }: AutocompleteCellProps) => {
  const {
    inputValue,
    isDropdownOpen,
    filteredOptions,
    cellState,
    inputRef,
    handleInputChange,
    handleInputBlur,
    handleInputFocus,
    handleOptionSelect,
    handleKeyDown,
  } = useAutocompleteCell(defaultValue, actions, meta);

  const cellStatus = getStatusIndicator({
    isEditing: cellState.isEditing,
    isSaving: cellState.isSaving,
    canRetrySave: cellState.canRetrySave,
    error: cellState.error,
    justSaved: cellState.justSaved,
  });

  const showIndicator = cellStatus !== 'idle';

  // Convert options to suggestions (just labels)
  const suggestions = filteredOptions.map((opt) => opt.label);

  // Map selected label back to option
  const handleSelect = (selectedLabel: string) => {
    const option = filteredOptions.find((opt) => opt.label === selectedLabel);
    if (option) {
      handleOptionSelect(option);
    }
  };

  // Handle change for controlled input
  const handleChange = (value: string) => {
    handleInputChange({ target: { value } } as ChangeEvent<HTMLInputElement>);
  };

  const getTooltipContent = useCallback(
    (suggestion: string): ReactNode | null => {
      const option = filteredOptions.find((opt) => opt.label === suggestion);
      if (option?.usedBy?.length === undefined) {
        return null;
      }

      return (
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium">{`${option.usedBy.length} item${option.usedBy.length > 1 ? 's' : ''} using this value:`}</span>
          <ul className="flex flex-col gap-1 list-disc list-inside">
            {option.usedBy.map((usedBy) => (
              <li key={usedBy.id}>{usedBy.name}</li>
            ))}
          </ul>
        </div>
      );
    },
    [filteredOptions],
  );

  return (
    <div className="flex items-center w-full h-full relative">
      <Autocomplete
        {...cellProps}
        suggestions={suggestions}
        value={inputValue}
        onChange={handleChange}
        onSelect={handleSelect}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        inputRef={inputRef as RefObject<HTMLInputElement>}
        preFiltered={true}
        open={isDropdownOpen && suggestions.length > 0}
        getTooltipContent={getTooltipContent}
        placeholder=""
        className={clx(
          'txt-compact-small size-full outline-none transition-all duration-200',
          'ring-0 focus:ring-0 focus:outline-none shadow-none focus:shadow-none',
          'truncate focus:text-clip',
          getCellStatusClassName(cellStatus),
          showIndicator && 'pr-8',
        )}
      />
      {showIndicator && <CellStatusIndicator status={cellStatus} error={cellState.error} />}
    </div>
  );
};
