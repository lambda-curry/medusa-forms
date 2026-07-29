import type * as React from 'react';
import { useEffect, useState } from 'react';
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

/** Match a valid number: optional leading minus, digits, optional single decimal point + digits */
const NUMERIC_VALUE_REGEX = /^-?\d*\.?\d*/;
const NON_NUMERIC_REGEX = /[^0-9.-]/g;

export const normalizeCurrencyInputValue = (raw: string): string => {
  const cleaned = raw.replace(NON_NUMERIC_REGEX, '');
  return cleaned.match(NUMERIC_VALUE_REGEX)?.[0] ?? '';
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

  // While focused, draft is the source of truth so intermediate values like "19." survive
  // valueAsNumber / setValueAs coercion. Sync from the field when blurred (resets/defaults).
  useEffect(() => {
    if (!isFocused) {
      setDraft(toDisplayValue(field.value, rules, hasTransform));
    }
  }, [field.value, hasTransform, isFocused, rules]);

  const { onFocus, onBlur, ...restProps } = inputProps;

  return (
    <CurrencyInput
      {...field}
      {...restProps}
      formErrors={formErrors}
      value={draft}
      onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
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
