import type { IdentifiedColumnDef } from '@tanstack/react-table';
import type { FlattenType } from './utils';

// Column Definition Types
export type EditableColumnType = 'text' | 'number' | 'select' | 'autocomplete' | 'badge';

type BaseEditableColumnDefinition<T extends Record<string, unknown>> = FlattenType<
  Pick<IdentifiedColumnDef<T>, 'maxSize' | 'minSize' | 'size'> & {
    id: keyof T;
    header: string;

    // custom column props
    type: EditableColumnType;
    placeholder?: string;
    required?: boolean;
    dependsOn?: string[];
    getFieldKey?: (key: keyof T) => string;
  }
>;

export type EditableTextColumnDefinition<T extends Record<string, unknown>> = BaseEditableColumnDefinition<T> & {
  type: 'text';
};

type EditableNumberColumnDefinition<T extends Record<string, unknown>> = BaseEditableColumnDefinition<T> & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

type EditableSelectColumnDefinition<T extends Record<string, unknown>> = BaseEditableColumnDefinition<T> & {
  type: 'select';
  // options: { value: string; label: string }[];
};

type EditableAutocompleteColumnDefinition<T extends Record<string, unknown>> = BaseEditableColumnDefinition<T> & {
  type: 'autocomplete';
  // loadOptions: (args: Record<string, unknown>) => Promise<{ value: string; label: string }[]>;
};

type EditableBadgeColumnDefinition<T extends Record<string, unknown>> = BaseEditableColumnDefinition<T> & {
  type: 'badge';
};

export type EditableColumnDefinition<T extends Record<string, unknown>> =
  | EditableTextColumnDefinition<T>
  | EditableNumberColumnDefinition<T>
  | EditableSelectColumnDefinition<T>
  | EditableAutocompleteColumnDefinition<T>
  | EditableBadgeColumnDefinition<T>;
