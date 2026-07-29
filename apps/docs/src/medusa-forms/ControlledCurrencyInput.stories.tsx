import { zodResolver } from '@hookform/resolvers/zod';
import { ControlledCurrencyInput } from '@lambdacurry/medusa-forms/controlled/ControlledCurrencyInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { z } from 'zod';

const meta = {
  title: 'Medusa Forms/Controlled Currency Input',
  component: ControlledCurrencyInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    symbol: '$',
    code: 'usd',
  },
} satisfies Meta<typeof ControlledCurrencyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

interface CurrencyFormData {
  price: string | number;
}

// Base wrapper component for stories
const CurrencyInputWithHookForm = ({
  currency = 'USD',
  symbol = '$',
  code = 'usd',
  schema,
  defaultValues = { price: '' },
  ...props
}: {
  currency?: string;
  symbol?: string;
  code?: string;
  schema?: z.ZodSchema<CurrencyFormData>;
  defaultValues?: CurrencyFormData;
  [key: string]: unknown;
}) => {
  const form = useForm<CurrencyFormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px]">
        <ControlledCurrencyInput
          name="price"
          label="Price"
          currency={currency}
          symbol={symbol}
          code={code}
          {...props}
        />
      </div>
    </FormProvider>
  );
};

const CurrencyInputWithStringState = () => {
  const form = useForm<CurrencyFormData>({
    defaultValues: { price: '' },
  });
  const price = form.watch('price');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCurrencyInput<CurrencyFormData> name="price" label="String price" symbol="$" code="usd" />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: price, type: typeof price }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

const CurrencyInputWithRequiredError = () => {
  const form = useForm<CurrencyFormData>({
    defaultValues: { price: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    form.trigger('price').then(() => undefined);
  }, [form]);

  return (
    <FormProvider {...form}>
      <div className="w-[400px]">
        <ControlledCurrencyInput
          name="price"
          label="Required price"
          symbol="$"
          code="usd"
          rules={{ required: 'Price is required' }}
        />
      </div>
    </FormProvider>
  );
};

const CurrencyInputWithValueAsNumber = () => {
  const form = useForm<CurrencyFormData>({
    defaultValues: { price: '' },
  });
  const price = form.watch('price');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCurrencyInput<CurrencyFormData>
          name="price"
          label="Numeric price"
          symbol="$"
          code="usd"
          rules={{ valueAsNumber: true }}
        />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: price, type: typeof price }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

const getStateOutput = (canvas: ReturnType<typeof within>) => canvas.getByText((content) => content.includes('"type"'));
const getInputByName = (canvasElement: HTMLElement, name: string) => {
  const input = canvasElement.querySelector<HTMLInputElement>(`input[name="${name}"]`);

  if (!input) {
    throw new Error(`Input with name "${name}" was not found.`);
  }

  return input;
};

const TRAILING_DECIMAL_DISPLAY = /19\./;

// 1. Different Currency Symbols
export const USDCurrency: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => <CurrencyInputWithHookForm currency="USD" symbol={args.symbol} code={args.code} />,
};

export const EURCurrency: Story = {
  args: {
    name: 'price',
    symbol: '€',
    code: 'eur',
  },
  render: (args) => <CurrencyInputWithHookForm currency="EUR" symbol={args.symbol} code={args.code} />,
};

export const GBPCurrency: Story = {
  args: {
    name: 'price',
    symbol: '£',
    code: 'gbp',
  },
  render: (args) => <CurrencyInputWithHookForm currency="GBP" symbol={args.symbol} code={args.code} />,
};

// 2. Validation with Min/Max Values
const minValidationSchema = z.object({
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !Number.isNaN(num) && num >= 10;
  }, 'Minimum price is $10'),
});

export const MinimumValueValidation: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="USD"
      symbol={args.symbol}
      code={args.code}
      schema={minValidationSchema}
      defaultValues={{ price: '5' }}
      label="Price (Min $10)"
    />
  ),
};

const maxValidationSchema = z.object({
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !Number.isNaN(num) && num <= 1000;
  }, 'Maximum price is $1000'),
});

export const MaximumValueValidation: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="USD"
      symbol={args.symbol}
      code={args.code}
      schema={maxValidationSchema}
      defaultValues={{ price: '1500' }}
      label="Price (Max $1000)"
    />
  ),
};

const rangeValidationSchema = z.object({
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !Number.isNaN(num) && num >= 50 && num <= 500;
  }, 'Price must be between $50 and $500'),
});

export const RangeValidation: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="USD"
      symbol={args.symbol}
      code={args.code}
      schema={rangeValidationSchema}
      defaultValues={{ price: '25' }}
      label="Price ($50 - $500)"
    />
  ),
};

// 3. Error Handling and Validation Messages
const requiredSchema = z.object({
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num > 0;
    }, 'Price must be greater than 0'),
});

export const RequiredFieldValidation: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="USD"
      symbol={args.symbol}
      code={args.code}
      schema={requiredSchema}
      label="Required Price *"
      required
    />
  ),
};

export const RequiredRuleError: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithRequiredError />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => {
      expect(canvas.getByText('Price is required')).toBeInTheDocument();
    });
  },
};

export const DefaultStringValue: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithStringState />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await userEvent.type(input, '1234');

    await waitFor(() => {
      expect(input.value).toContain('1,234');
      expect(state).toHaveTextContent('"value": "1234"');
      expect(state).toHaveTextContent('"type": "string"');
    });
  },
};

export const ValueAsNumber: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithValueAsNumber />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await userEvent.type(input, '1234');

    await waitFor(() => {
      expect(input.value).toContain('1,234');
      expect(state).toHaveTextContent('"value": 1234');
      expect(state).toHaveTextContent('"type": "number"');
    });

    await userEvent.clear(input);

    await waitFor(() => {
      expect(input.value).toBe('');
      expect(state).toHaveTextContent('"value": null');
      expect(state).toHaveTextContent('"type": "number"');
    });
  },
};

const CurrencyInputWithSetValueAs = () => {
  const form = useForm<CurrencyFormData>({
    defaultValues: { price: '' },
  });
  const price = form.watch('price');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCurrencyInput<CurrencyFormData>
          name="price"
          label="Nullable numeric price"
          symbol="$"
          code="usd"
          step={0.01}
          rules={{
            setValueAs: (value) => {
              if (value == null || value === '') {
                return null;
              }
              const parsed = typeof value === 'number' ? value : Number(value);
              return Number.isFinite(parsed) ? parsed : null;
            },
          }}
        />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: price, type: typeof price }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

/**
 * Accept, store, and preserve decimal currency values such as 19.99.
 * Reported failure (pre-fix): valueAsNumber coerces "19." → 19 and rewrites the input,
 * so typing "19.99" becomes "1999" (or otherwise loses the decimal).
 */
export const DecimalValueSupport: Story = {
  tags: ['decimal-currency', 'test'],
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithValueAsNumber />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await userEvent.click(input);
    await userEvent.type(input, '19.99');

    await waitFor(() => {
      expect(input.value).toContain('19.99');
      expect(state).toHaveTextContent('"value": 19.99');
      expect(state).toHaveTextContent('"type": "number"');
    });
  },
};

/**
 * Intermediate decimal point must remain while typing (e.g. "19.").
 * Reported failure (pre-fix): trailing "." is stripped as soon as valueAsNumber runs.
 */
export const DecimalTypingIntermediate: Story = {
  tags: ['decimal-currency', 'test'],
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithValueAsNumber />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await userEvent.click(input);
    await userEvent.type(input, '19.');

    await waitFor(() => {
      // Draft display keeps the trailing decimal while focused; form value is coerced to 19
      expect(input.value).toMatch(TRAILING_DECIMAL_DISPLAY);
      expect(state).toHaveTextContent('"value": 19');
      expect(state).toHaveTextContent('"type": "number"');
    });

    await userEvent.type(input, '99');

    await waitFor(() => {
      expect(input.value).toContain('19.99');
      expect(state).toHaveTextContent('"value": 19.99');
    });
  },
};

const CurrencyInputWithExistingDecimal = () => {
  const form = useForm<CurrencyFormData>({
    defaultValues: { price: 19.99 },
  });
  const price = form.watch('price');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCurrencyInput<CurrencyFormData>
          name="price"
          label="Existing decimal price"
          symbol="$"
          code="usd"
          step={0.01}
          rules={{ valueAsNumber: true }}
        />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: price, type: typeof price }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

/**
 * Editing an existing decimal must not truncate or block valid input.
 * Reported failure (pre-fix): replacing 19.99 with 20.50 loses the decimal while typing.
 */
export const EditPreservesDecimals: Story = {
  tags: ['decimal-currency', 'test'],
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithExistingDecimal />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await waitFor(() => {
      expect(input.value).toContain('19.99');
      expect(state).toHaveTextContent('"value": 19.99');
    });

    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, '20.50');

    await waitFor(() => {
      expect(input.value).toContain('20.5');
      expect(state).toHaveTextContent('"value": 20.5');
      expect(state).toHaveTextContent('"type": "number"');
    });
  },
};

/**
 * Same decimal path consumers use (setValueAs → nullable number), e.g. Sezzle min/max.
 * Reported failure (pre-fix): setValueAs Number() coercion strips intermediate decimals.
 */
export const SetValueAsPreservesDecimals: Story = {
  tags: ['decimal-currency', 'test'],
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: () => <CurrencyInputWithSetValueAs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'price');
    const state = getStateOutput(canvas);

    await userEvent.click(input);
    await userEvent.type(input, '20.50');

    await waitFor(() => {
      expect(input.value).toContain('20.5');
      expect(state).toHaveTextContent('"value": 20.5');
      expect(state).toHaveTextContent('"type": "number"');
    });
  },
};

const customValidationSchema = z.object({
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !Number.isNaN(num) && num >= 1 && num <= 100;
  }, 'Custom error: Price must be between $1 and $100'),
});

export const CustomValidationMessage: Story = {
  args: {
    name: 'price',
    symbol: '$',
    code: 'usd',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="USD"
      symbol={args.symbol}
      code={args.code}
      schema={customValidationSchema}
      defaultValues={{ price: '150' }}
      label="Custom Validation Messages"
    />
  ),
};

// 4. Different Currency Codes
export const JPYCurrency: Story = {
  args: {
    name: 'price',
    symbol: '¥',
    code: 'jpy',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="JPY"
      symbol={args.symbol}
      code={args.code}
      defaultValues={{ price: '11000' }}
      label="Price (JPY)"
    />
  ),
};

export const CADCurrency: Story = {
  args: {
    name: 'price',
    symbol: 'C$',
    code: 'cad',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="CAD"
      symbol={args.symbol}
      code={args.code}
      defaultValues={{ price: '125.75' }}
      label="Price (CAD)"
    />
  ),
};

export const AUDCurrency: Story = {
  args: {
    name: 'price',
    symbol: 'A$',
    code: 'aud',
  },
  render: (args) => (
    <CurrencyInputWithHookForm
      currency="AUD"
      symbol={args.symbol}
      code={args.code}
      defaultValues={{ price: '135.50' }}
      label="Price (AUD)"
    />
  ),
};
