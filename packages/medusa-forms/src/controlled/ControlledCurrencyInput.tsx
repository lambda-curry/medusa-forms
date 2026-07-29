import type * as React from 'react';
import { useState } from 'react';
import {
  Controller,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useFormContext,
} from 'react-hook-form';
import { CurrencyInput, type CurrencyInputProps } from '../ui/CurrencyInput';
import { type ControlledRules, serializeDisplayValue, splitTransformRules, transformValue } from './valueTransforms';

/** Strip non-numeric characters; keep a leading minus and at most one decimal point. */
const NON_NUMERIC_REGEX = /[^0-9.-]/g;

export const normalizeCurrencyInputValue = (raw: string): string => {
  const cleaned = raw.replace(NON_NUMERIC_REGEX, '');
  const isNegative = cleaned.startsWith('-');
  const unsigned = cleaned.replace(/-/g, '');
  const [whole, ...rest] = unsigned.split('.');
  const value = rest.length > 0 ? `${whole}.${rest.join('')}` : whole;
  return isNegative ? `-${value}` : value;
};

const toDisplayValue = <T extends FieldValues>(
  value: unknown,
  rules: ControlledRules<T> | undefined,
  hasTransform: boolean,
) => (hasTransform ? serializeDisplayValue(value, rules) : String(value ?? ''));

export type ControlledCurrencyInputProps<T extends FieldValues> = CurrencyInputProps &
  Omit<ControllerProps<T>, 'render' | 'control' | 'rules'> & {
    name: Path<T>;
    rules?: ControlledRules<T>;
  };

type CurrencyFieldRenderProps<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  inputProps: Omit<ControlledCurrencyInputProps<T>, 'name' | 'rules' | 'onChange'>;
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

  const { onFocus, onBlur, ...restProps } = inputProps;
  // While focused, draft preserves intermediate text (e.g. "19."). When blurred, derive
  // from field.value so resets/defaults stay in sync without effect-driven mirroring.
  const displayValue = isFocused ? draft : toDisplayValue(field.value, rules, hasTransform);

  return (
    <CurrencyInput
      {...field}
      {...restProps}
      formErrors={formErrors}
      value={displayValue}
      onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
        setDraft(toDisplayValue(field.value, rules, hasTransform));
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        field.onBlur();
        onBlur?.(event);
      }}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);

        const value = normalizeCurrencyInputValue(event.target.value);
        setDraft(value);
        field.onChange(hasTransform ? transformValue(value, rules) : value);
      }}
    />
  );
};

export const ControlledCurrencyInput = <T extends FieldValues>({
  name,
  rules,
  onChange,
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
