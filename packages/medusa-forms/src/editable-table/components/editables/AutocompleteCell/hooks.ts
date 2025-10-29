import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebounce } from 'use-debounce';
import { useCellState } from '../../../hooks/useCellState';
import type { EditableCellActions, EditableTableCellMeta } from '../../../types/cells';
import { filterOptions, sortOptions } from './utils';

export const useAutocompleteOptions = (
  getOptionsFn: ((updatedValue: unknown) => Promise<{ label: string; value: unknown }[]>) | undefined,
  inputValue: string | undefined,
  meta: EditableTableCellMeta,
) => {
  return useQuery<{ label: string; value: unknown }[]>({
    queryKey: ['table.autocomplete-options', meta.key, inputValue],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (!getOptionsFn) return [];

      const result = await getOptionsFn(inputValue);
      return result;
    },
    enabled: !!getOptionsFn,
  });
};

export const useAutocompleteCell = (
  defaultValue: string | undefined,
  actions: {
    save: EditableCellActions['save'];
    getOptions: EditableCellActions['getOptions'];
  },
  meta: EditableTableCellMeta,
) => {
  const cellState = useCellState();
  const [inputValue, setInputValue] = useState(defaultValue || '');

  // Debounce input value for getOptions calls
  const [debouncedInputValue] = useDebounce(inputValue, 300);

  const { data: options = [] } = useAutocompleteOptions(actions.getOptions, debouncedInputValue, meta);

  const sortedOptions = useMemo(() => {
    return sortOptions(options);
  }, [options]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter options based on input value (search by label)
  const filteredOptions = useMemo(() => {
    return filterOptions(sortedOptions, inputValue, 10);
  }, [inputValue, sortedOptions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset highlighted index when filtered options change
  // biome-ignore lint/correctness/useExhaustiveDependencies: only run when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  const hasValueChanged = useCallback(
    (value: unknown) => {
      return defaultValue?.toString() !== value?.toString();
    },
    [defaultValue],
  );

  const _save = useCallback(
    async (value: unknown) => {
      cellState.setIsEditing(false);
      cellState.setIsSaving(true);

      const error = await actions.save(value).catch(() => {
        cellState.setCanRetrySave(true);

        return 'An error occurred. Please try again.';
      });

      cellState.setError(error);
      cellState.setIsSaving(false);
    },
    [actions, cellState],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (!hasValueChanged(newValue)) {
        cellState.setIsSaving(false);
        cellState.setIsEditing(false);
        return;
      }

      cellState.setError(null);
      cellState.setCanRetrySave(false);
      cellState.setIsEditing(true);
    },
    [cellState, hasValueChanged],
  );

  const handleInputBlur = useCallback(
    async (e: FocusEvent<HTMLInputElement>) => {
      // Don't trigger blur save if clicking on dropdown
      if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
        return;
      }

      const newValue = e.target.value;

      if (!hasValueChanged(newValue)) {
        cellState.setIsSaving(false);
        setIsDropdownOpen(false);
        return;
      }

      cellState.setError(null);
      cellState.setCanRetrySave(false);
      cellState.setIsEditing(true);

      await _save(newValue);
      setIsDropdownOpen(false);
    },
    [_save, cellState, hasValueChanged],
  );

  const handleInputFocus = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  const handleOptionSelect = useCallback(
    async ({ value }: { label: string; value: unknown }) => {
      setInputValue(value as string);
      setIsDropdownOpen(false);

      if (!hasValueChanged(value as string)) {
        cellState.setIsSaving(false);
        cellState.setIsEditing(false);
        return;
      }

      cellState.setError(null);
      cellState.setCanRetrySave(false);
      cellState.setIsEditing(true);

      await _save(value);

      // Return focus to input
      inputRef.current?.focus();
    },
    [_save, cellState, hasValueChanged],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!isDropdownOpen || filteredOptions.length === 0) {
        if (e.key === 'ArrowDown') {
          setIsDropdownOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[highlightedIndex]);
          } else {
            // Just close dropdown, let the debounced save handle it
            setIsDropdownOpen(false);
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setIsDropdownOpen(false);
          setHighlightedIndex(-1);
          break;
        }
        default: {
          break;
        }
      }
    },
    [isDropdownOpen, filteredOptions, highlightedIndex, handleOptionSelect],
  );

  return {
    // State
    inputValue,
    isDropdownOpen,
    highlightedIndex,
    filteredOptions,
    cellState,

    // Refs
    inputRef,
    dropdownRef,

    // Handlers
    handleInputChange,
    handleInputBlur,
    handleInputFocus,
    handleOptionSelect,
    handleKeyDown,
    setHighlightedIndex,
  };
};
