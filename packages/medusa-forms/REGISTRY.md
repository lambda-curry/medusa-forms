# Medusa Forms Registry

This package provides a custom shadcn/ui registry that allows developers to install medusa-forms components using the native shadcn CLI.

## Installation

You can install components from this registry using the shadcn CLI:

```bash
npx shadcn@latest add --registry https://raw.githubusercontent.com/lambda-curry/medusa-forms/main/packages/medusa-forms/registry.json input
```

## Available Components

### Base UI Components

- `field-wrapper` - Core wrapper component with error handling and labels
- `field-error` - Error display component
- `label` - Label component with tooltip support
- `input` - Base input component
- `select` - Base select component
- `field-checkbox` - Base checkbox component
- `textarea` - Base textarea component
- `datepicker` - Base datepicker component
- `currency-input` - Base currency input component

### Controlled Components (React Hook Form)

- `controlled-input` - Input with react-hook-form integration
- `controlled-select` - Select with react-hook-form integration
- `controlled-checkbox` - Checkbox with react-hook-form integration
- `controlled-textarea` - Textarea with react-hook-form integration
- `controlled-datepicker` - DatePicker with react-hook-form integration
- `controlled-currency-input` - CurrencyInput with react-hook-form integration

## Usage Examples

### Installing a single component

```bash
npx shadcn@latest add --registry https://raw.githubusercontent.com/lambda-curry/medusa-forms/main/packages/medusa-forms/registry.json controlled-input
```

### Installing multiple components

```bash
npx shadcn@latest add --registry https://raw.githubusercontent.com/lambda-curry/medusa-forms/main/packages/medusa-forms/registry.json controlled-input controlled-select controlled-checkbox
```

### Using the components

```tsx
import { ControlledInput } from '@/components/ui/controlled-input'
import { ControlledSelect } from '@/components/ui/controlled-select'
import { useForm, FormProvider } from 'react-hook-form'

function MyForm() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form>
        <ControlledInput
          name="email"
          label="Email"
          placeholder="Enter your email"
        />
        
        <ControlledSelect
          name="country"
          label="Country"
          options={[
            { label: 'United States', value: 'us' },
            { label: 'Canada', value: 'ca' },
          ]}
        />
      </form>
    </FormProvider>
  )
}
```

## Component Dependencies

The registry properly handles component dependencies:

- Controlled components depend on their base UI components
- UI components depend on `field-wrapper` when needed
- `field-wrapper` depends on `field-error` and `label`
- All components use `@medusajs/ui` for base styling

## Architecture

### Field Wrapper Pattern

All form components use a consistent wrapper pattern:

- `FieldWrapper` provides consistent layout and error handling
- `Label` component handles labels and tooltips
- `FieldError` handles error message display
- UI components wrap `@medusajs/ui` components

### Controlled Component Pattern

Controlled components use react-hook-form:

- Uses `Controller` from react-hook-form
- Integrates with form context
- Handles form validation and errors
- Preserves component props and types

## Types and Interfaces

- `BasicFieldProps` - Common field properties
- `FieldWrapperProps` - Wrapper component props
- Component-specific props (`InputProps`, `SelectProps`, etc.)
- React Hook Form integration types

