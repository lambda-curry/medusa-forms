import { ControlledInput } from '@lambdacurry/medusa-forms/controlled/ControlledInput';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { FormProvider, useForm } from 'react-hook-form';

const meta = {
  title: 'Medusa Forms/Controlled Input',
  component: ControlledInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledInput>;

export default meta;
type Story = StoryObj<typeof meta>;

interface InputFormData {
  username: string;
  quantity: number | string;
  optionalAmount: number | null | string;
  startDate: Date | string;
}

const ControlledInputWithHookForm = () => {
  const form = useForm<InputFormData>({
    defaultValues: {
      username: '',
      quantity: '',
      optionalAmount: '',
      startDate: '',
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px]">
        <ControlledInput name="username" label="Username" placeholder="Enter your username" />
      </div>
    </FormProvider>
  );
};

const NumberInputWithHookForm = () => {
  const form = useForm<InputFormData>({
    defaultValues: {
      username: '',
      quantity: '',
      optionalAmount: '',
      startDate: '',
    },
  });
  const quantity = form.watch('quantity');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledInput<InputFormData>
          name="quantity"
          type="number"
          label="Quantity"
          rules={{ valueAsNumber: true }}
        />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: quantity, type: typeof quantity }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

const NullableNumberInputWithHookForm = () => {
  const form = useForm<InputFormData>({
    defaultValues: {
      username: '',
      quantity: '',
      optionalAmount: '',
      startDate: '',
    },
  });
  const optionalAmount = form.watch('optionalAmount');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledInput<InputFormData>
          name="optionalAmount"
          type="number"
          label="Optional amount"
          rules={{
            setValueAs: (value) => (value === '' ? null : Number(value)),
          }}
        />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: optionalAmount, type: typeof optionalAmount }, null, 2)}
        </pre>
      </div>
    </FormProvider>
  );
};

const DateInputWithHookForm = () => {
  const form = useForm<InputFormData>({
    defaultValues: {
      username: '',
      quantity: '',
      optionalAmount: '',
      startDate: '',
    },
  });
  const startDate = form.watch('startDate');

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledInput<InputFormData> name="startDate" type="date" label="Start date" rules={{ valueAsDate: true }} />
        <pre className="rounded bg-gray-100 p-2 text-xs">
          {JSON.stringify({ value: startDate, type: typeof startDate }, null, 2)}
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

export const WithReactHookForm: Story = {
  args: {
    name: 'username',
    label: 'Username',
    placeholder: 'Enter your username',
  },
  render: () => <ControlledInputWithHookForm />,
  play: async ({ canvasElement }) => {
    const input = getInputByName(canvasElement, 'username');

    await userEvent.type(input, 'validuser');

    expect(input).toHaveValue('validuser');
  },
};

export const ValueAsNumber: Story = {
  render: () => <NumberInputWithHookForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'quantity');
    const state = getStateOutput(canvas);

    await userEvent.type(input, '42');

    await waitFor(() => {
      expect(input).toHaveValue(42);
      expect(state).toHaveTextContent('"value": 42');
      expect(state).toHaveTextContent('"type": "number"');
    });

    await userEvent.clear(input);

    await waitFor(() => {
      expect(input).toHaveValue(null);
      expect(state).toHaveTextContent('"value": null');
      expect(state).toHaveTextContent('"type": "number"');
    });
  },
};

export const SetValueAs: Story = {
  render: () => <NullableNumberInputWithHookForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'optionalAmount');
    const state = getStateOutput(canvas);

    await userEvent.type(input, '12');

    await waitFor(() => {
      expect(input).toHaveValue(12);
      expect(state).toHaveTextContent('"value": 12');
      expect(state).toHaveTextContent('"type": "number"');
    });

    await userEvent.clear(input);

    await waitFor(() => {
      expect(input).toHaveValue(null);
      expect(state).toHaveTextContent('"value": null');
      expect(state).toHaveTextContent('"type": "object"');
    });
  },
};

export const ValueAsDate: Story = {
  render: () => <DateInputWithHookForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = getInputByName(canvasElement, 'startDate');
    const state = getStateOutput(canvas);

    await userEvent.type(input, '2026-06-24');

    await waitFor(() => {
      expect(input).toHaveValue('2026-06-24');
      expect(state).toHaveTextContent('"value": "2026-06-24T');
      expect(state).toHaveTextContent('"type": "object"');
    });

    await userEvent.clear(input);

    await waitFor(() => {
      expect(input).toHaveValue('');
      expect(state).toHaveTextContent('"value": null');
      expect(state).toHaveTextContent('"type": "object"');
    });
  },
};
