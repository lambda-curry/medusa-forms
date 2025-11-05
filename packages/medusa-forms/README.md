# @lambdacurry/medusa-forms

Form and data management components for Medusa Admin applications.

## Installation

```bash
npm install @lambdacurry/medusa-forms
```

**Peer dependencies:** See [Requirements](#requirements) below.

## Components

- **Controlled Form Components** - React Hook Form integrated inputs, selects, checkboxes, etc.
- **EditableTable** - Inline-editing table with validation, auto-save, sorting, filtering, and URL state persistence
- **UI Components** - Low-level form components

## Documentation

📚 **[Interactive Examples & Full Documentation](https://lambda-curry.github.io/forms)**

Component-specific guides:
- [EditableTable Complete Guide](./src/editable-table/README.md) - Setup, providers, examples, troubleshooting

## Quick Start

```typescript
// Controlled form components
import { ControlledInput, ControlledSelect } from '@lambdacurry/medusa-forms/controlled';

// EditableTable
import { EditableTable } from '@lambdacurry/medusa-forms/editable-table';

// UI components
import { Input, Select } from '@lambdacurry/medusa-forms/ui';
```

See [Storybook](https://lambda-curry.github.io/forms) for live examples.

## Requirements

**All components:**
- React 18.3+ or 19.0+
- @medusajs/ui 4.0.0+
- @medusajs/icons 2.0.0+
- react-hook-form 7.49.0+

**EditableTable additional:**
- @tanstack/react-query 5.0.0+
- @tanstack/react-table 8.21.0+
- nuqs 2.6.0+
- use-debounce 10.0.0+
- lucide-react 0.263.0+

See [EditableTable docs](./src/editable-table/README.md#installation--peer-dependencies) for detailed setup.

## License

MIT
