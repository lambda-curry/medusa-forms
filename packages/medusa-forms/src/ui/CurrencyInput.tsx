import { Text, clx } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, MedusaCurrencyInputProps } from './types';

export type CurrencyInputProps = MedusaCurrencyInputProps & BasicFieldProps;

type CurrencyFieldShellProps = Omit<CurrencyInputProps, keyof BasicFieldProps> & {
  formErrors?: BasicFieldProps['formErrors'];
};

/**
 * Currency field chrome that never formats through Number().
 * Medusa's CurrencyInput uses react-currency-input-field, which runs Number(value) and
 * silently corrupts high-precision decimals (IEEE-754).
 */
const CurrencyFieldShell = forwardRef<HTMLInputElement, CurrencyFieldShellProps>(
  ({ symbol, code, size = 'base', disabled, className, onInvalid, ...props }, ref) => {
    return (
      <div
        className={clx(
          'flex items-center gap-x-1',
          'bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-buttons-neutral placeholder-ui-fg-muted text-ui-fg-base transition-fg relative w-full rounded-md',
          'focus-within:shadow-borders-interactive-with-active',
          size === 'base' ? 'txt-compact-medium h-8' : 'txt-compact-small h-7',
          {
            'text-ui-fg-disabled !bg-ui-bg-disabled !shadow-buttons-neutral !placeholder-ui-fg-disabled cursor-not-allowed':
              disabled,
            '!shadow-borders-error invalid:!shadow-borders-error': props['aria-invalid'],
          },
          className,
        )}
      >
        <span
          className={clx('w-fit min-w-[32px] border-r px-2', {
            'py-[9px]': size === 'base',
            'py-[5px]': size === 'small',
          })}
          role="presentation"
        >
          <Text
            size="small"
            leading="compact"
            className={clx('text-ui-fg-muted pointer-events-none select-none uppercase', {
              'text-ui-fg-disabled': disabled,
            })}
          >
            {code}
          </Text>
        </span>
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          onInvalid={onInvalid}
          className="h-full min-w-0 flex-1 appearance-none bg-transparent text-right outline-none disabled:cursor-not-allowed"
        />
        <span
          className={clx('flex w-fit min-w-[32px] items-center justify-center border-l px-2 text-right', {
            'py-[9px]': size === 'base',
            'py-[5px]': size === 'small',
          })}
          role="presentation"
        >
          <Text
            size="small"
            leading="compact"
            className={clx('text-ui-fg-muted pointer-events-none select-none', {
              'text-ui-fg-disabled': disabled,
            })}
          >
            {symbol}
          </Text>
        </span>
      </div>
    );
  },
);

CurrencyFieldShell.displayName = 'CurrencyFieldShell';

const Wrapper = FieldWrapper<CurrencyInputProps>;

/**
 * Precision-safe currency input for form use. Prefer this over Medusa's CurrencyInput when
 * values may exceed float64 precision (or always, for controlled forms).
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>((props, ref) => (
  <Wrapper {...props}>{(inputProps) => <CurrencyFieldShell {...inputProps} ref={ref} />}</Wrapper>
));

CurrencyInput.displayName = 'CurrencyInput';
