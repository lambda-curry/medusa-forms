import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import type { BaseDatePickerProps, Granularity } from '@medusajs/ui';
import type { ReactNode, RefAttributes } from 'react';
import type * as React from 'react';
import type { CalendarProps } from 'react-calendar';
import type { GroupBase, Props, SelectInstance } from 'react-select';
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

interface Option {
  label: string;
  value: string;
}

type IsMulti = boolean;
type Group = GroupBase<Option>;

interface Translations {
  [key: string]: string;
}

interface PickerProps extends CalendarProps {
  /**
   * The class name to apply on the date picker.
   */
  className?: string;
  /**
   * Whether the date picker's input is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the date picker's input is required.
   */
  required?: boolean;
  /**
   * The date picker's placeholder.
   */
  placeholder?: string;
  /**
   * The date picker's size.
   */
  size?: 'small' | 'base';
  /**
   * Whether to show a time picker along with the date picker.
   */
  showTimePicker?: boolean;
  /**
   * Translation keys for the date picker. Use this to localize the date picker.
   */
  translations?: Translations;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-required'?: boolean;
}

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

export type SearchableSelectProps = Props<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

export type CreatableSelectProps = CreatableProps<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

interface SelectProps extends React.ComponentPropsWithRef<'select'> {
  size?: 'base' | 'small';
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: 'ltr' | 'rtl';
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}
