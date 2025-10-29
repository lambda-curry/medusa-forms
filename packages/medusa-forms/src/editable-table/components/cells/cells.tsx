import { StatusBadge } from '@medusajs/ui';
import type { ComponentProps } from 'react';
import type { CellContentProps } from '../../types/cells';
import { AutocompleteCell } from '../editables/AutocompleteCell/AutocompleteCell';
import { InputCell } from '../editables/InputCell';

const PlaceholderCell = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-muted-foreground">-</span>
    </div>
  );
};

// Text cell component
const TextCell = ({ meta, value, actions, cellProps }: CellContentProps<string | undefined>) => {
  return <InputCell meta={meta} actions={actions} value={value} cellProps={cellProps} />;
};

export type BadgeCellValue = {
  status: 'active' | 'inactive';
  title: string;
};

// Badge cell component for arrays or multiple values
const BadgeCell = ({ value }: CellContentProps<BadgeCellValue | undefined>) => {
  if (!value?.status) {
    return <PlaceholderCell />;
  }

  const colorMap: { [key: string]: ComponentProps<typeof StatusBadge>['color'] } = {
    active: 'green',
    inactive: 'red',
    warning: 'orange',
  };

  const color = colorMap[value.status] ?? colorMap.inactive;

  return (
    <div className="flex flex-wrap gap-1">
      <StatusBadge color={color}>{value.title}</StatusBadge>
    </div>
  );
};

// Number cell component
const NumberCell = ({ meta, value = 0, actions, cellProps }: CellContentProps<number | undefined>) => {
  return <InputCell meta={meta} value={value} actions={actions} cellProps={cellProps} />;
};

const ViewOnlyCell = ({ value }: CellContentProps<unknown>) => {
  return <span className="text-muted-foreground">{Array.isArray(value) ? value.join(', ') : value?.toString()}</span>;
};

// Main cell content component
export const CellContent = (props: CellContentProps) => {
  switch (props.meta.type) {
    case 'text':
      return <TextCell {...props} value={props.value as string | undefined} />;
    case 'badge':
      return <BadgeCell {...props} value={props.value as BadgeCellValue | undefined} />;
    case 'number':
      return <NumberCell {...props} value={props.value as number | undefined} />;
    case 'select':
      return <ViewOnlyCell {...props} value={props.value as string | undefined} />;
    case 'autocomplete':
      return <AutocompleteCell {...props} value={props.value as string | undefined} />;
    default:
      return <span className="text-muted-foreground">-</span>;
  }
};
