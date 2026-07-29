import type * as React from 'react';
import { useRef, useState } from 'react';
import {
  Controller,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useFormContext,
} from 'react-hook-form';
import { CurrencyInput, type CurrencyInputProps } from '../ui/CurrencyInput';
import { formatCurrencyGroups } from './currencyPrecision';
import { type ControlledRules, serializeDisplayValue, splitTransformRules, transformValue } from './valueTransforms';

/** Strip non-numeric characters; keep a leading minus and at most one decimal point. */
const NON_NUMERIC_REGEX = /[^0-9.-]/g;
const DECIMAL_POINT = '.';

const stripToNumeric = (raw: string): { isNegative: boolean; unsigned: string } => {
  const cleaned = raw.replace(NON_NUMERIC_REGEX, '');
  const isNegative = cleaned.startsWith('-');
  return { isNegative, unsigned: cleaned.replace(/-/g, '') };
};

/** True when the input contains more than one decimal point (after stripping junk). */
export const hasMultipleDecimalPoints = (raw: string): boolean => {
  const { unsigned } = stripToNumeric(raw);
  return unsigned.indexOf(DECIMAL_POINT) !== unsigned.lastIndexOf(DECIMAL_POINT);
};

export const normalizeCurrencyInputValue = (raw: string): string => {
  const { isNegative, unsigned } = stripToNumeric(raw);
  const decimalIndex = unsigned.indexOf(DECIMAL_POINT);
  const value =
    decimalIndex === -1
      ? unsigned
      : `${unsigned.slice(0, decimalIndex + 1)}${unsigned
          .slice(decimalIndex + 1)
          .split(DECIMAL_POINT)
          .join('')}`;
  return isNegative ? `-${value}` : value;
};

const isDecimalKey = (key: string) => key === DECIMAL_POINT || key === 'Decimal';

const toDisplayValue = <T extends FieldValues>(
  value: unknown,
  rules: ControlledRules<T> | undefined,
  hasTransform: boolean,
): string => {
  if (!hasTransform) {
    return String(value ?? '');
  }
  const serialized = serializeDisplayValue(value, rules);
  return Array.isArray(serialized) ? serialized.join('') : serialized;
};

type CurrencyInputValueChangeValues = {
  float: number | null;
  formatted: string;
  value: string;
};

export type ControlledCurrencyInputProps<T extends FieldValues> = CurrencyInputProps &
  Omit<ControllerProps<T>, 'render' | 'control' | 'rules'> & {
    name: Path<T>;
    rules?: ControlledRules<T>;
    /** When true, skip thousand separators while blurred. */
    disableGroupSeparators?: boolean;
    /** Accepted for API compatibility; ignored (prefer onChange / Controller). */
    onValueChange?: (value: string | undefined, name?: string, values?: CurrencyInputValueChangeValues) => void;
  };

type CurrencyFieldRenderProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  inputProps: Omit<ControlledCurrencyInputProps<T>, 'name' | 'rules' | 'onChange' | 'onValueChange'>;
  rules: ControlledRules<T> | undefined;
  hasTransform: boolean;
  formErrors: ReturnType<typeof useFormContext>['formState']['errors'];
  onChange?: CurrencyInputProps['onChange'];
};

const ControlledCurrencyInputField = <T extends FieldValues>({
  field,
  inputProps,
  rules,
  hasTransform,
  formErrors,
  onChange,
}: CurrencyFieldRenderProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);
  const [draft, setDraft] = useState(() => toDisplayValue(field.value, rules, hasTransform));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });

  const { onFocus, onBlur, onKeyDown, onBeforeInput, disableGroupSeparators, ...restProps } = inputProps;
  // While focused, draft preserves intermediate text (e.g. "19.") without group separators.
  // When blurred, derive from field.value and optionally group with string-only formatting.
  const rawDisplay = isFocused ? draft : toDisplayValue(field.value, rules, hasTransform);
  const displayValue = formatCurrencyGroups(rawDisplay, !(isFocused || disableGroupSeparators));

  const rememberSelection = (el: HTMLInputElement) => {
    selectionRef.current = {
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    };
  };

  const restoreSelection = () => {
    const el = inputRef.current;
    if (!el) {
      return;
    }
    const { start, end } = selectionRef.current;
    requestAnimationFrame(() => {
      el.setSelectionRange(start, end);
    });
  };

  const commitValue = (raw: string) => {
    // Ignore keystrokes/pastes that would introduce a second decimal point (otherwise the
    // previous "." is dropped and digits rejoin, which feels like the decimal "moved").
    if (hasMultipleDecimalPoints(raw)) {
      restoreSelection();
      return;
    }

    const value = normalizeCurrencyInputValue(raw);
    setDraft(value);
    field.onChange(hasTransform ? transformValue(value, rules) : value);
  };

  const blockExtraDecimal = (event: { preventDefault: () => void }) => {
    if (draft.includes(DECIMAL_POINT)) {
      event.preventDefault();
    }
  };

  return (
    <CurrencyInput
      {...field}
      {...restProps}
      ref={(node) => {
        inputRef.current = node;
        field.ref(node);
      }}
      formErrors={formErrors}
      value={displayValue}
      onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
        setDraft(toDisplayValue(field.value, rules, hasTransform));
        setIsFocused(true);
        rememberSelection(event.currentTarget);
        onFocus?.(event);
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        field.onBlur();
        onBlur?.(event);
      }}
      onSelect={(event: React.SyntheticEvent<HTMLInputElement>) => {
        rememberSelection(event.currentTarget);
        restProps.onSelect?.(event);
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        rememberSelection(event.currentTarget);
        if (isDecimalKey(event.key)) {
          blockExtraDecimal(event);
        }
        onKeyDown?.(event);
      }}
      onBeforeInput={(event: React.InputEvent<HTMLInputElement>) => {
        if (typeof event.data === 'string' && event.data.includes(DECIMAL_POINT)) {
          blockExtraDecimal(event);
        }
        onBeforeInput?.(event);
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        commitValue(event.target.value);
      }}
    />
  );
};

export const ControlledCurrencyInput = <T extends FieldValues>({
  name,
  rules,
  onChange,
  onValueChange: _consumerOnValueChange,
  ...props
}: ControlledCurrencyInputProps<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const { controllerRules, hasTransform } = splitTransformRules(rules);

  return (
    <Controller<T>
      control={control}
      name={name}
      rules={controllerRules}
      render={({ field }) => (
        <ControlledCurrencyInputField
          field={field}
          inputProps={props}
          rules={rules}
          hasTransform={hasTransform}
          formErrors={errors}
          onChange={onChange}
        />
      )}
    />
  );
};
