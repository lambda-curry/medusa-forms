import type { ChangeEvent, ComponentProps } from 'react';
import { Controller, type ControllerProps, type FieldValues, type Path, useFormContext } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';
import { type ControlledRules, serializeDisplayValue, splitTransformRules, transformValue } from './valueTransforms';

export type ControlledInputProps<T extends FieldValues> = InputProps &
  Omit<ControllerProps<T>, 'render' | 'rules'> & {
    name: Path<T>;
    rules?: ControlledRules<T>;
  } & ComponentProps<typeof Input> &
  Omit<ControllerProps<T>, 'render' | 'rules'>;

const getEventValue = (evt: ChangeEvent<HTMLInputElement>) => evt.target.value;

export const ControlledInput = <T extends FieldValues>({
  name,
  rules,
  onChange,
  ...props
}: ControlledInputProps<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const { controllerRules, hasTransform } = splitTransformRules(rules);

  return (
    <Controller
      control={control}
      name={name}
      rules={controllerRules}
      render={({ field }) => (
        <Input
          {...field}
          {...props}
          labelClassName={props.labelClassName}
          formErrors={errors}
          {...(hasTransform ? { value: serializeDisplayValue(field.value, rules) } : {})}
          onChange={(evt) => {
            if (onChange) {
              onChange(evt);
            }
            field.onChange(hasTransform ? transformValue(getEventValue(evt), rules) : evt);
          }}
        />
      )}
    />
  );
};
