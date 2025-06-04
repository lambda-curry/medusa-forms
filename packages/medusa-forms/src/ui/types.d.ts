import type { CalendarDate, CalendarDateTime, Granularity } from '@internationalized/date';
import type { BaseDatePickerProps } from '@medusajs/ui';
import type { ReactNode, RefAttributes } from 'react';
import type * as React from 'react';
import type { Props, SelectInstance } from 'react-select';
import type { CreatableProps } from 'react-select/creatable';

export interface BasicFieldProps {
  label?: ReactNode;
  labelClassName?: string;
  labelTooltip?: ReactNode;
  wrapperClassName?: string;
  errorClassName?: string;
  formErrors?: { [x: string]: unknown };
  name?: string;
}

export interface FieldWrapperProps<T> extends BasicFieldProps, T {
  children: (args: T) => ReactNode;
}

export type TextAreaProps = Omit<
  React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
  'ref'
> &
  React.RefAttributes<HTMLTextAreaElement>;

export type MedusaCurrencyInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'step'> & {
  symbol: string;
  code: string;
  size?: 'small' | 'base';
  defaultValue?: string | number;
  step?: number;
};

export type MedusaInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: 'small' | 'base';
};

type Option = {
  label: string;
  value: string;
};

type IsMulti = boolean;
type Group = {
  label: string;
  options: Option[];
};

type DatePickerValueProps = {
  defaultValue?: Date | null;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  isDateUnavailable?: (date: Date) => boolean;
  minValue?: Date;
  maxValue?: Date;
  shouldCloseOnSelect?: boolean;
  granularity?: Granularity;
  size?: 'base' | 'small';
  className?: string;
  modal?: boolean;
};
interface DatePickerProps
  extends Omit<BaseDatePickerProps<CalendarDateTime | CalendarDate>, keyof DatePickerValueProps>,
    DatePickerValueProps {}

// export type DatePickerProps = (
//   | {
//       mode?: 'single';
//       presets?: DatePreset[];
//       defaultValue?: Date;
//       value?: Date;
//       onChange?: (date: Date | null) => void;
//     }
//   | {
//       mode: 'range';
//       presets?: DateRangePreset[];
//       defaultValue?: DateRange;
//       value?: DateRange;
//       onChange?: (dateRange: DateRange | null) => void;
//     }
// ) &
//   PickerProps;

export type SearchableSelectProps = Props<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

export type CreatableSelectProps = CreatableProps<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

interface SelectProps extends React.ComponentPropsWithRef {
  size?: 'base' | 'small';
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: Direction;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}
