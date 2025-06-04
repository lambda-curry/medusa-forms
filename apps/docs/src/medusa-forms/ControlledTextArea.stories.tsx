import { ControlledTextArea } from '@lambdacurry/medusa-forms/controlled/ControlledTextArea';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormProvider, useForm } from 'react-hook-form';

const meta = {
  title: 'Medusa Forms/Controlled Text Area',
  component: ControlledTextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ControlledTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Usage Story
const BasicTextAreaForm = () => {
  const form = useForm({
    defaultValues: {
      description: '',
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledTextArea name="description" label="Description" placeholder="Enter your description here..." />
      </div>
    </FormProvider>
  );
};

export const BasicUsage: Story = {
  render: () => <BasicTextAreaForm />,
};

// Required Validation Story
const RequiredValidationForm = () => {
  const form = useForm({
    defaultValues: {
      feedback: '',
    },
  });

  const onSubmit = (data: unknown) => {
    alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-4">
        <ControlledTextArea
          name="feedback"
          label="Feedback"
          placeholder="Please provide your feedback..."
          rules={{
            required: 'Feedback is required',
          }}
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Submit
        </button>
        {form.formState.errors.feedback && (
          <p className="text-red-500 text-sm">{form.formState.errors.feedback.message}</p>
        )}
      </form>
    </FormProvider>
  );
};

export const RequiredValidation: Story = {
  render: () => <RequiredValidationForm />,
};

// Character Limit Story
const CharacterLimitForm = () => {
  const form = useForm({
    defaultValues: {
      limitedText: '',
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledTextArea
          name="limitedText"
          label="Limited Text (max 100 characters)"
          placeholder="Type up to 100 characters..."
          rules={{
            maxLength: {
              value: 100,
              message: 'Text cannot exceed 100 characters',
            },
          }}
        />
        {form.formState.errors.limitedText && (
          <p className="text-red-500 text-sm">{form.formState.errors.limitedText.message}</p>
        )}
      </div>
    </FormProvider>
  );
};

export const CharacterLimit: Story = {
  render: () => <CharacterLimitForm />,
};

// Disabled State Story
const DisabledTextAreaForm = () => {
  const form = useForm({
    defaultValues: {
      disabledText: 'This text area is disabled',
    },
  });

  return (
    <FormProvider {...form}>
      <div className="w-[400px] space-y-4">
        <ControlledTextArea name="disabledText" label="Disabled Text Area" disabled />
      </div>
    </FormProvider>
  );
};

export const DisabledState: Story = {
  render: () => <DisabledTextAreaForm />,
};
