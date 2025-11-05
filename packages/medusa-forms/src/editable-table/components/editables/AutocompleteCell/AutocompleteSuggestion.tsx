'use client';

import { Button, Tooltip, clx } from '@medusajs/ui';
import type { ReactNode } from 'react';

const highlightMatch = (text: string, query: string) => {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={`autocomplete-suggestion-part-${index.toString()}`} className="text-foreground">
            {part}
          </strong>
        ) : (
          <span key={`autocomplete-suggestion-part-${index.toString()}`}>{part}</span>
        ),
      )}
    </>
  );
};

interface AutocompleteSuggestionProps {
  suggestion: string;
  index: number;
  highlightedIndex: number;
  inputValue: string;
  getTooltipContent?: (suggestion: string) => string | ReactNode;
  onSelect: (value: string) => void;
  onMouseEnter: (index: number) => void;
}

export const AutocompleteSuggestion = ({
  suggestion,
  index,
  highlightedIndex,
  inputValue,
  getTooltipContent,
  onSelect,
  onMouseEnter,
}: AutocompleteSuggestionProps) => {
  const tooltipContent = getTooltipContent?.(suggestion);

  const button = (
    <Button
      type="button"
      variant="transparent"
      id={`autocomplete-option-${index}`}
      aria-selected={index === highlightedIndex}
      onMouseDown={(e) => {
        // Prevent blur on the input
        e.preventDefault();
        onSelect(suggestion);
      }}
      onClick={() => onSelect(suggestion)}
      onMouseEnter={() => onMouseEnter(index)}
      className={clx(
        'w-full text-left transition-colors txt-compact-small',
        index === highlightedIndex && 'bg-ui-bg-base-hover',
      )}
    >
      <span className="w-full text-left">{highlightMatch(suggestion, inputValue)}</span>
    </Button>
  );

  return tooltipContent ? (
    <Tooltip key={suggestion} content={tooltipContent} side="right" maxWidth={300}>
      {button}
    </Tooltip>
  ) : (
    button
  );
};
