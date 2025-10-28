'use client';

import { Input, clx } from '@medusajs/ui';
import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AutocompleteSuggestion } from './AutocompleteSuggestion';

interface AutocompleteProps {
  suggestions: string[];
  placeholder?: string;
  onSelect?: (value: string) => void;
  className?: string;
  // Optional controlled props
  value?: string;
  onChange?: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
  /** Skip internal filtering - suggestions are already filtered */
  preFiltered?: boolean;
  /** Control dropdown open state externally */
  open?: boolean;
  // Event handlers
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Tooltip content for each suggestion - can be string or React component */
  getTooltipContent?: (suggestion: string) => string | React.ReactNode;
}

export function Autocomplete({
  suggestions,
  placeholder = 'Search...',
  onSelect,
  className,
  value: controlledValue,
  onChange: controlledOnChange,
  inputRef: externalInputRef,
  preFiltered = false,
  open: controlledOpen,
  onBlur: externalOnBlur,
  onFocus: externalOnFocus,
  onKeyDown: externalOnKeyDown,
  getTooltipContent,
}: AutocompleteProps) {
  const [internalValue, setInternalValue] = useState('');
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const internalInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal state
  const isControlled = controlledValue !== undefined;
  const inputValue = isControlled ? controlledValue : internalValue;
  const inputRef = externalInputRef || internalInputRef;
  const isOpenControlled = controlledOpen !== undefined;
  const isOpen = isOpenControlled ? controlledOpen : internalIsOpen;
  const setIsOpen = isOpenControlled ? () => {} : setInternalIsOpen;

  const filteredSuggestions = useMemo(() => {
    if (preFiltered) return suggestions;
    if (!inputValue.trim()) return [];
    return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(inputValue.toLowerCase()));
  }, [inputValue, suggestions, preFiltered]);

  useEffect(() => {
    // Skip auto-open when open state is controlled externally
    if (isOpenControlled) return;

    if (filteredSuggestions.length > 0) {
      setIsOpen(true);
      setHighlightedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [filteredSuggestions, isOpenControlled, setIsOpen]);

  const handleSelect = (value: string) => {
    if (isControlled) {
      controlledOnChange?.(value);
    } else {
      setInternalValue(value);
    }
    setIsOpen(false);
    onSelect?.(value);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isControlled) {
      controlledOnChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Call external handler first
    externalOnKeyDown?.(e);

    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSuggestions[highlightedIndex]) {
          handleSelect(filteredSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    externalOnFocus?.(e);
    if (!isOpenControlled && filteredSuggestions.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Check if the blur is happening because we're clicking inside the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && listboxRef.current?.contains(relatedTarget)) {
      // Don't close if clicking inside dropdown
      return;
    }

    externalOnBlur?.(e);
    if (!isOpenControlled) {
      setTimeout(() => setIsOpen(false), 200);
    }
  };

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, inputRef]);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      const highlightedElement = listboxRef.current.children[highlightedIndex] as HTMLElement;
      highlightedElement?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <>
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="autocomplete-listbox"
        aria-activedescendant={isOpen ? `autocomplete-option-${highlightedIndex}` : undefined}
        aria-autocomplete="list"
        className={clx('pr-10', className)}
        autoComplete="off"
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={listboxRef}
          id="autocomplete-listbox"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            minWidth: `${dropdownPosition.width}px`,
          }}
          className="z-50 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-flyout max-h-60 overflow-auto max-w-[240px]"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <AutocompleteSuggestion
              key={suggestion}
              suggestion={suggestion}
              index={index}
              highlightedIndex={highlightedIndex}
              inputValue={inputValue}
              getTooltipContent={getTooltipContent}
              onSelect={handleSelect}
              onMouseEnter={setHighlightedIndex}
            />
          ))}
        </div>
      )}

      <output className="sr-only" aria-live="polite">
        {isOpen ? `${filteredSuggestions.length} suggestions available` : 'No suggestions'}
      </output>
    </>
  );
}
