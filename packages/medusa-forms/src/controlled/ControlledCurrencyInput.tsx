import type * as React from 'react';
import { Controller, type ControllerProps, type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { CurrencyInput, type CurrencyInputProps } from '../ui/CurrencyInput';
import { type ControlledRules, serializeDisplayValue, splitTransformRules, transformValue } from './valueTransforms';

/** Match a valid number: optional leading minus, digits, optional single decimal point + digits */
const NUMERIC_VALUE_REGEX = /^-?\d*\.?\d*/;
const NON_NUMERIC_REGEX = /[^0-9.-]/g;

export type ControlledCurrencyInputProps<T extends FieldValues> = CurrencyInputProps &
  Omit<ControllerProps<T>, 'render' | 'control' | 'rules'> & {
    name: Path<T>;
    rules?: ControlledRules<T>;
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
      render={({ field }) => {
        return (
          <CurrencyInput
            {...field}
            {...props}
            formErrors={errors}
            {...(hasTransform ? { value: serializeDisplayValue(field.value, rules) } : {})}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (onChange) {
                onChange(e);
              }

              const cleaned = e.target.value.replace(NON_NUMERIC_REGEX, '');
              const value = cleaned.match(NUMERIC_VALUE_REGEX)?.[0] ?? '';
              field.onChange(hasTransform ? transformValue(value, rules) : value);
            }}
          />
        );
      }}
    />
  );
};
