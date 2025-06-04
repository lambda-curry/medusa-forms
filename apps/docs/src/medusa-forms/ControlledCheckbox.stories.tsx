import { ControlledCheckbox } from '@lambdacurry/medusa-forms/controlled/ControlledCheckbox';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';

const meta = {
  title: 'Medusa Forms/Controlled Checkbox',
  component: ControlledCheckbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Usage Story
const BasicCheckboxForm = () => {
  const form = useForm({
    defaultValues: {
      terms: false,
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCheckbox name="terms" label="I agree to the terms and conditions" />
      </div>
    </FormProvider>
  );
};

export const BasicUsage: Story = {
  render: () => <BasicCheckboxForm />,
};

// Required Validation Story
const RequiredValidationForm = () => {
  const form = useForm({
    defaultValues: {
      required: false,
    },
  });

  const onSubmit = (data: unknown) => {
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-4">
        <ControlledCheckbox
          name="required"
          label="This field is required"
          rules={{
            required: 'You must check this box',
          }}
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Submit
        </button>
        {form.formState.errors.required && (
          <p className="text-red-500 text-sm">{form.formState.errors.required.message}</p>
        )}
      </form>
    </FormProvider>
  );
};

export const RequiredValidation: Story = {
  render: () => <RequiredValidationForm />,
};

// Multiple Checkboxes Story
const MultipleCheckboxesForm = () => {
  const form = useForm({
    defaultValues: {
      newsletter: false,
      marketing: false,
      updates: false,
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <h3 className="text-lg font-semibold">Email Preferences</h3>
        <ControlledCheckbox name="newsletter" label="Subscribe to newsletter" />
        <ControlledCheckbox name="marketing" label="Receive marketing emails" />
        <ControlledCheckbox name="updates" label="Get product updates" />
      </div>
    </FormProvider>
  );
};

export const MultipleCheckboxes: Story = {
  render: () => <MultipleCheckboxesForm />,
};

// Disabled State Story
const DisabledCheckboxForm = () => {
  const form = useForm({
    defaultValues: {
      disabled: true,
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledCheckbox name="disabled" label="This checkbox is disabled" disabled />
      </div>
    </FormProvider>
  );
};

export const DisabledState: Story = {
  render: () => <DisabledCheckboxForm />,
};
