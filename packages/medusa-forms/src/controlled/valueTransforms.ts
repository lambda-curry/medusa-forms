import type { FieldValues, Path, RegisterOptions } from 'react-hook-form';

export type ControlledRules<T extends FieldValues> = Omit<RegisterOptions<T, Path<T>>, 'disabled'>;
type ControllerRules<T extends FieldValues> = Omit<ControlledRules<T>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;

export const splitTransformRules = <T extends FieldValues>(
  rules: ControlledRules<T> | undefined,
): { controllerRules: ControllerRules<T>; hasTransform: boolean } => {
  const { valueAsNumber, valueAsDate, setValueAs, ...controllerRules } = rules ?? {};

  return {
    controllerRules,
    hasTransform: Boolean(valueAsNumber || valueAsDate || setValueAs),
  };
};

export const transformValue = <T extends FieldValues>(value: string, rules: ControlledRules<T> | undefined) => {
  if (rules?.valueAsNumber) {
    return value === '' ? Number.NaN : +value;
  }

  if (rules?.valueAsDate) {
    return new Date(value);
  }

  if (typeof rules?.setValueAs === 'function') {
    return rules.setValueAs(value);
  }

  return value;
};

const isInvalidDate = (value: Date) => Number.isNaN(value.getTime());

export const serializeDisplayValue = <T extends FieldValues>(value: unknown, rules: ControlledRules<T> | undefined) => {
  if (value == null) {
    return '';
  }

  if (rules?.valueAsNumber) {
    return typeof value === 'number' && Number.isNaN(value) ? '' : String(value);
  }

  if (rules?.valueAsDate) {
    if (!(value instanceof Date) || isInvalidDate(value)) {
      return '';
    }

    return value.toISOString().slice(0, 10);
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return String(value);
};
