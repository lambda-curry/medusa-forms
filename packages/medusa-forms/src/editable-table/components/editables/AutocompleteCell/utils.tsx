import type { EditableCellActions } from '../../../types/cells';

// Sort options with priority: (new) first, (current) second, then alphabetical
export const sortOptions = (options: { label: string; value: unknown }[]) => {
  return options.sort((a, b) => {
    const aIsCurrent = a.label.endsWith(' (current)');
    const bIsCurrent = b.label.endsWith(' (current)');
    const aIsNew = a.label.endsWith(' (new)');
    const bIsNew = b.label.endsWith(' (new)');

    // New options first
    if (aIsNew && !bIsNew) return -1;
    if (!aIsNew && bIsNew) return 1;

    // Current options second
    if (aIsCurrent && !bIsCurrent && !bIsNew) return -1;
    if (!aIsCurrent && bIsCurrent && !aIsNew) return 1;

    // Everything else alphabetically
    return a.label.localeCompare(b.label);
  });
};

// Filter options based on input value (search by label)
export const filterOptions = (
  options: Awaited<ReturnType<EditableCellActions['getOptions']>>,
  inputValue: string,
  maxResults = 10,
) => {
  if (!inputValue.trim()) {
    return options.slice(0, maxResults); // Show first 10 when empty
  }

  const search = inputValue.toLowerCase();
  return options.filter((option) => option.label.toLowerCase().includes(search)).slice(0, maxResults);
};
