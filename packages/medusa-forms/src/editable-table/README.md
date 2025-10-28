# EditableTable Component

## Overview

The `EditableTable` is a powerful, feature-rich React component built for the Medusa2 admin interface that provides inline editing capabilities for tabular data. It combines the flexibility of TanStack Table with real-time validation, auto-save functionality, and URL state persistence to create an efficient data management experience.

## Installation & Peer Dependencies

### Required Peer Dependencies

The EditableTable component requires the following peer dependencies to be installed in your project:

```bash
yarn add @medusajs/ui@^4.0.0 \
         @medusajs/icons@^2.0.0 \
         @tanstack/react-query@^5.0.0 \
         @tanstack/react-table@^8.21.0 \
         lucide-react@^0.263.0 \
         nuqs@^2.6.0 \
         react@^18.3.0 \
         react-hook-form@^7.49.0 \
         use-debounce@^10.0.0
```

| Package | Version | Purpose |
|---------|---------|---------|
| `@medusajs/ui` | ^4.0.0 | Medusa UI design system components (Table, Tooltip, Input, Select, etc.) |
| `@medusajs/icons` | ^2.0.0 | Icon components used throughout the table |
| `@tanstack/react-query` | ^5.0.0 | Data fetching and caching for autocomplete cells |
| `@tanstack/react-table` | ^8.21.0 | Core table functionality (sorting, filtering, pagination) |
| `lucide-react` | ^0.263.0 | Additional icon components |
| `nuqs` | ^2.6.0 | URL state management for table state persistence |
| `react` | ^18.3.0 or ^19.0.0 | React framework |
| `react-hook-form` | ^7.49.0 | Form state management (not directly used by EditableTable but required) |
| `use-debounce` | ^10.0.0 | Debounced validation and save operations |

### Optional Dependencies

For virtual scrolling support with large datasets:
```bash
yarn add @tanstack/react-virtual@^3.10.0
```

## Storybook Setup Requirements

> **Prerequisites:** Make sure you have installed all [peer dependencies](#installation--peer-dependencies) before setting up Storybook stories.

The `EditableTable` component requires several context providers to function correctly in Storybook (or any standalone environment). Below are the required providers and the errors you'll encounter if they're missing:

### Required Providers

#### 1. NuqsAdapter (URL State Management)
**Package:** `nuqs` (peer dependency)  
**Error if missing:**
```
[nuqs] nuqs requires an adapter to work with your framework.
```

**Why needed:** The EditableTable uses `nuqs` for URL state persistence (search, filters, pagination, sorting). In Storybook, which doesn't have a framework router, you need the React adapter.

**Setup:**
```typescript
import { NuqsAdapter } from 'nuqs/adapters/react';
```

#### 2. QueryClientProvider (React Query)
**Package:** `@tanstack/react-query` (peer dependency)  
**Error if missing:**
```
No QueryClient set, use QueryClientProvider to set one
```

**Why needed:** The EditableTable's autocomplete cells and async operations depend on React Query for data fetching and caching.

**Setup:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
```

#### 3. TooltipProvider (Medusa UI)
**Package:** `@medusajs/ui` (peer dependency)  
**Error if missing:**
```
`Tooltip` must be used within `TooltipProvider`
```

**Why needed:** The EditableTable uses tooltips for column headers and cell status indicators. Medusa UI's Tooltip component requires a provider.

**Setup:**
```typescript
import { TooltipProvider } from '@medusajs/ui';
```

#### 4. Toaster (Medusa UI - Optional but Recommended)
**Package:** `@medusajs/ui` (peer dependency)  
**Why needed:** For displaying toast notifications for validation errors, save confirmations, etc.

**Setup:**
```typescript
import { Toaster } from '@medusajs/ui';
```

### Complete Storybook Decorator Example

Here's the complete decorator setup for EditableTable stories with all required imports:

```typescript
// Component imports
import { EditableTable } from '@lambdacurry/medusa-forms/editable-table';
import type { EditableTableColumnDefinition } from '@lambdacurry/medusa-forms/editable-table';

// Provider imports
import { Toaster, TooltipProvider } from '@medusajs/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';

// Storybook imports
import type { Meta } from '@storybook/react-vite';

// React imports
import { useState } from 'react';

const meta = {
  title: 'Your Stories/Editable Table',
  component: EditableTable,
  decorators: [
    (Story) => {
      // Initialize React Query client
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 1000 * 60 * 5, // 5 minutes
          },
        },
      });

      return (
        <NuqsAdapter>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="p-6 bg-ui-bg-subtle min-h-screen">
                <Story />
              </div>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </NuqsAdapter>
      );
    },
  ],
} satisfies Meta<typeof EditableTable>;

export default meta;
```

**Key Imports Explained:**
- `EditableTable` - Main component from medusa-forms package
- `Toaster`, `TooltipProvider` - From `@medusajs/ui` peer dependency
- `QueryClient`, `QueryClientProvider` - From `@tanstack/react-query` peer dependency
- `NuqsAdapter` - From `nuqs` peer dependency (React adapter for standalone usage)

### Provider Hierarchy

The providers must be nested in this specific order (outermost to innermost):

```
NuqsAdapter                    ← URL state management
  └─ QueryClientProvider       ← React Query context
      └─ TooltipProvider       ← Medusa UI tooltips
          └─ Your Content
          └─ Toaster           ← Toast notifications (sibling to content)
```

### Troubleshooting

| Error Message | Missing Provider | Package | Solution |
|---------------|------------------|---------|----------|
| `nuqs requires an adapter` | `NuqsAdapter` | `nuqs` | Wrap in `<NuqsAdapter>` from `nuqs/adapters/react` |
| `No QueryClient set` | `QueryClientProvider` | `@tanstack/react-query` | Wrap in `<QueryClientProvider client={queryClient}>` |
| `Tooltip must be used within TooltipProvider` | `TooltipProvider` | `@medusajs/ui` | Wrap in `<TooltipProvider>` from `@medusajs/ui` |
| Toast notifications not appearing | `Toaster` | `@medusajs/ui` | Add `<Toaster />` component from `@medusajs/ui` |
| Icons not rendering | `@medusajs/icons` | `@medusajs/icons` | Ensure peer dependency is installed |
| Table functionality broken | `@tanstack/react-table` | `@tanstack/react-table` | Ensure peer dependency is installed |

### Production Usage

In a production Medusa Admin application, these providers are typically already set up at the app level:
- Next.js or React Router provides the routing context for `nuqs`
- React Query is configured globally
- Medusa UI providers are included in the app shell

You only need to configure these providers explicitly in isolated environments like Storybook or standalone demos.

## Key Features

- **Inline Editing**: Edit data directly in table cells without navigation
- **Real-time Validation**: Immediate feedback with Zod schema validation
- **Auto-save**: Debounced saving with visual status indicators
- **URL State Persistence**: Table state (search, sort, pagination) persists in URL
- **Column Management**: Sorting, filtering, pinning, and resizing
- **Loading States**: Built-in skeleton loading with customizable row/column counts
- **Tooltip Support**: Column headers can display helpful tooltips
- **Pagination**: Configurable pagination with customizable page sizes
- **Modular Architecture**: Separated concerns with dedicated components
- **Performance Optimized**: Handles 50+ rows efficiently with virtualization support
- **Accessibility**: Full keyboard navigation and screen reader support
- **Type Safety**: End-to-end TypeScript support with strict typing
- **Stable Rendering**: Prevents unnecessary re-renders and state resets

## Architecture

### Core Components

```
EditableTable/
├── components/
│   ├── EditableTable.tsx          # Main table component (orchestrator)
│   ├── EditableTableContent.tsx   # Table content with headers and rows
│   ├── EditableTableControls.tsx  # Table controls (search, filters, etc.)
│   ├── EditableTablePagination.tsx # Pagination component
│   ├── TableSkeleton.tsx          # Loading skeleton component
│   ├── TooltipColumnHeader.tsx    # Column header with tooltip support
│   ├── LoadingStates.tsx          # Loading state components
│   ├── cells/
│   │   ├── cells.tsx              # Cell type implementations
│   │   └── CellStatusIndicator.tsx # Visual status indicators
│   └── editables/
│       └── InputCell.tsx          # Editable input cell component
├── hooks/
│   ├── useEditableTable.ts        # Main table logic hook
│   ├── useEditableTableColumns.tsx # Column definitions
│   ├── useEditableTableUrlState.ts # URL state management
│   └── useEditableCellActions.ts   # Cell action handlers
├── types/
│   ├── cells.ts                   # Type definitions for cells
│   ├── columns.ts                 # Column type definitions
│   └── utils.ts                   # Utility types
└── columnHelpers.tsx              # Column utility functions
```

### Technology Stack

- **TanStack Table v8**: Core table functionality with sorting, filtering, and pagination
- **TanStack Virtual v3**: Performance optimization for large datasets (available but not implemented by default)
- **nuqs**: URL state management with type safety
- **Zod**: Schema validation for real-time field validation
- **Medusa UI**: Design system components (Table, Button, Select, Tooltip, etc.)
- **use-debounce**: Debounced operations for validation and save
- **Lucide React**: Icons for UI elements (sorting, pagination, etc.)

## Usage Example

### Basic Implementation

```tsx
import { EditableTable } from '../EditableTable/components/EditableTable';
import type { EditableTableColumnDefinition } from '../EditableTable/types/cells';

// Define your data type
interface MyData {
  id: string;
  name: string;
  quantity: number;
  status: 'active' | 'inactive';
}

// Define column configuration
const columns: EditableTableColumnDefinition<MyData>[] = [
  {
    name: 'Name',
    key: 'name',
    type: 'text',
    placeholder: 'Enter name',
    required: true,
  },
  {
    name: 'Quantity',
    key: 'quantity',
    type: 'number',
    placeholder: '0',
    cellProps: { min: 0, max: 999999 },
  },
];

// Validation handlers
const getValidateHandler = (key: string) => {
  return async ({ value }) => {
    // Your validation logic
    if (key === 'name' && !value) {
      return 'Name is required';
    }
    return null;
  };
};

// Save handlers
const getSaveHandler = (key: string) => {
  return async ({ value, data, table }) => {
    // Your save logic
    await updateRecord(data.id, { [key]: value });
    
    // Access table instance for advanced operations
    // - Get all rows: table.getCoreRowModel().rows
    // - Get filtered rows: table.getFilteredRowModel().rows
    // - Get specific row data: table.getRowData(rowIndex)
    
    return null;
  };
};

// Options handlers (for autocomplete columns)
const getOptionsHandler = (key: string) => {
  return async ({ value }) => {
    // Return options for autocomplete fields
    if (key === 'category') {
      const searchTerm = String(value || '').toLowerCase();
      const categories = await fetchCategories(searchTerm);
      return categories.map(cat => ({ label: cat.name, value: cat.id }));
    }
    return [];
  };
};

// Component usage
export const MyEditableTable = () => {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <EditableTable<MyData>
      data={data}
      editableColumns={columns}
      getValidateHandler={getValidateHandler}
      getSaveHandler={getSaveHandler}
      getOptionsHandler={getOptionsHandler}
      loading={loading}
      showControls={true}
      showPagination={true}
      enableGlobalFilter={true}
      enableSorting={true}
      enablePagination={true}
      tableId="my-table" // Optional: for URL state persistence
    />
  );
};
```

## Column Types

### Text Column
```tsx
{
  name: 'Title',
  key: 'title',
  type: 'text',
  placeholder: 'Enter title',
  required: true,
}
```

### Number Column
```tsx
{
  name: 'Quantity',
  key: 'quantity',
  type: 'number',
  placeholder: '0',
  cellProps: {
    min: 0,
    max: 999999,
    step: 1,
  },
}
```

### Badge Column (Read-only with Status)
```tsx
{
  name: 'Status',
  key: 'status',
  type: 'badge',
  calculateValue: (key, data) => ({
    status: data.isActive ? 'active' : 'inactive',
    title: data.isActive ? 'Active' : 'Inactive',
  }),
}
```

### Autocomplete Column
```tsx
{
  name: 'Category',
  key: 'category',
  type: 'autocomplete',
  placeholder: 'Search categories...',
  required: false,
}
```

**Features:**
- Debounced search as user types
- Async option loading via `getOptionsHandler`
- Dropdown with filtered suggestions
- Keyboard navigation support
- Can show additional metadata in tooltips (e.g., "used by X items")

**Options Handler Example:**
```tsx
const getOptionsHandler = (key: string) => {
  return async ({ value }) => {
    if (key === 'category') {
      const searchTerm = String(value || '').toLowerCase();
      const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports'];
      
      return categories
        .filter((cat) => cat.toLowerCase().includes(searchTerm))
        .map((cat) => ({ label: cat, value: cat }));
    }
    return [];
  };
};
```

### Select Column (Future Enhancement)
```tsx
{
  name: 'Status',
  key: 'status',
  type: 'select',
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ],
}
```

## Loading States

The EditableTable includes built-in loading state support with skeleton components:

### Basic Loading State

```tsx
<EditableTable
  data={data}
  editableColumns={columns}
  loading={isLoading} // Shows skeleton when true
  getValidateHandler={getValidateHandler}
  getSaveHandler={getSaveHandler}
/>
```

### Custom Skeleton Configuration

The skeleton automatically adapts to your column count, but you can customize it:

```tsx
// The skeleton will show the same number of columns as your editableColumns
const columns = [
  { name: 'Name', key: 'name', type: 'text' },
  { name: 'Email', key: 'email', type: 'text' },
  { name: 'Status', key: 'status', type: 'badge' },
]; // 3 columns = 3 skeleton columns

<EditableTable
  loading={true}
  editableColumns={columns} // Skeleton shows 3 columns
  // ... other props
/>
```

## Tooltip Support

Add helpful tooltips to column headers to provide additional context:

### Basic Tooltip Implementation

```tsx
const getTooltipContent = (columnKey: string, columnName: string) => {
  const tooltips = {
    sku: 'Stock Keeping Unit - unique identifier for inventory items',
    serial_number: 'Optional unique serial number for tracking individual items',
    condition_description: 'Detailed description of the item\'s current condition',
  };
  
  return tooltips[columnKey] || null;
};

<EditableTable
  data={data}
  editableColumns={columns}
  getTooltipContent={getTooltipContent}
  // ... other props
/>
```

### Advanced Tooltip with JSX Content

```tsx
const getTooltipContent = (columnKey: string, columnName: string) => {
  if (columnKey === 'location_levels') {
    return (
      <div>
        <strong>Stock Quantities</strong>
        <p>Current inventory levels at each location</p>
        <ul>
          <li>• Min: 0 items</li>
          <li>• Max: 999,999 items</li>
        </ul>
      </div>
    );
  }
  return null;
};
```

## Pagination

The table includes a comprehensive pagination system:

### Default Pagination

```tsx
<EditableTable
  enablePagination={true}
  showPagination={true}
  // ... other props
/>
```

### Custom Page Size Options

```tsx
// The pagination component supports custom page sizes
// Default options: [20, 30, 40, 50, 100]
// This is handled internally by the pagination component
```

### Pagination Features

- **Page Size Selection**: Users can choose how many rows to display
- **Navigation Controls**: First, Previous, Next, Last page buttons
- **Page Information**: Shows current page and total pages
- **URL Persistence**: Page state is saved in URL parameters

## Validation System

### Schema-based Validation with Zod

```tsx
import { z } from 'zod';

const mySchema = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  email: z.string().email('Invalid email format'),
};

const getValidateHandler = (key: string) => {
  return async ({ value }) => {
    const schema = mySchema[key];
    if (!schema) return null;
    
    const result = schema.safeParse(value);
    if (!result.success) {
      return result.error.errors[0]?.message || 'Invalid value';
    }
    return null;
  };
};
```

### Real-time Validation Flow

1. **User Input**: User types in a cell
2. **Debounced Validation**: Validation runs after 300ms delay
3. **Visual Feedback**: Cell shows validation status (error/success)
4. **Error Display**: Error message appears below cell
5. **Save Prevention**: Invalid data cannot be saved

## Save System

### Auto-save

```tsx
const getSaveHandler = (key: string) => {
  return async ({ value, data, meta }) => {
    try {
      // Validate before saving
      const validationError = await validateField(key, value);
      if (validationError) return validationError;
      
      // Check if value actually changed
      if (value === data[key]) return null;
      
      // Perform the save operation
      await updateRecord(data.id, { [key]: value });
      
      // Return null for success
      return null;
    } catch (error) {
      // Return error message
      return error.message || 'Save failed';
    }
  };
};
```

### Save States and Visual Indicators

- **Idle**: Default state, no visual indicator
- **Editing**: Orange border while typing
- **Saving**: Gray background during save
- **Saved**: Green border/background for 2 seconds
- **Error**: Red border/background with error message
- **Retry**: Option to retry failed saves

## Options System

The `getOptionsHandler` provides autocomplete suggestions for cells of type `autocomplete`. It's called when users type in autocomplete fields.

### Basic Options Handler

```tsx
const getOptionsHandler = (key: string) => {
  return async ({ value }) => {
    const searchTerm = String(value || '').toLowerCase();
    
    if (key === 'category') {
      // Fetch or filter options based on search term
      const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports'];
      
      return categories
        .filter(cat => cat.toLowerCase().includes(searchTerm))
        .map(cat => ({ label: cat, value: cat }));
    }
    
    return []; // Return empty array for non-autocomplete fields
  };
};
```

### API-based Options

```tsx
const getOptionsHandler = (key: string) => {
  return async ({ value }) => {
    const searchTerm = String(value || '').toLowerCase();
    
    if (key === 'supplier') {
      // Fetch from API
      const response = await fetch(`/api/suppliers?search=${searchTerm}`);
      const suppliers = await response.json();
      
      return suppliers.map(s => ({ 
        label: s.name, 
        value: s.id 
      }));
    }
    
    return [];
  };
};
```

### Options with Metadata

You can include additional metadata in options for enhanced tooltips:

```tsx
const getOptionsHandler = (key: string) => {
  return async ({ value }) => {
    if (key === 'location') {
      const locations = await fetchLocations(value);
      
      return locations.map(loc => ({
        label: loc.name,
        value: loc.id,
        // Additional metadata for tooltips
        usedBy: loc.inventoryItems?.map(item => ({
          id: item.id,
          name: item.name
        }))
      }));
    }
    return [];
  };
};
```

### Options Format

Options must follow this structure:

```tsx
type Option = {
  label: string;           // Display text in dropdown
  value: unknown;          // Value to save when selected
  usedBy?: Array<{        // Optional: for tooltip metadata
    id: string;
    name: string;
  }>;
};
```

## Accessing Table Instance in Handlers

All handler functions (`getValidateHandler`, `getSaveHandler`, and `getOptionsHandler`) receive the table instance as a parameter. This allows you to access table state and data for advanced use cases.

### Table Instance API

```tsx
// Handler signature
type EditableCellActionFn<TData, TReturn> = (args: {
  meta: EditableTableCellMeta;
  data: TData;
  value: unknown;
  table: EditableTableInstance<TData>; // Table instance (always available)
}) => Promise<TReturn>;

// Available methods on table instance
interface EditableTableInstance<T> {
  // Core data access
  getCoreRowModel(): { rows: Row<T>[] };
  getFilteredRowModel(): { rows: Row<T>[] };
  getSortedRowModel(): { rows: Row<T>[] };
  getRowData(rowIndex: number): T;
  
  // State access
  getState(): TableState;
  getPageCount(): number;
  getCanNextPage(): boolean;
  getCanPreviousPage(): boolean;
  
  // All TanStack Table methods available
  // See: https://tanstack.com/table/latest/docs/api/core/table
}
```

### Use Case: Validation with Table Context

```tsx
// Validate uniqueness across all rows
const getValidateHandler = (key: string) => {
  return async ({ value, data, table }) => {
    if (key === 'sku') {
      // Check if SKU is unique across all rows
      const allRows = table.getCoreRowModel().rows;
      const duplicate = allRows.find(row => 
        row.original.sku === value && row.original.id !== data.id
      );
      
      if (duplicate) {
        return 'SKU must be unique';
      }
    }
    return null;
  };
};
```

### Use Case: Dynamic Options from Table Data

```tsx
// Get autocomplete options from existing table data
const getOptionsHandler = (key: string) => {
  return async ({ value, data, table }) => {
    if (key === 'category') {
      const searchTerm = String(value || '').toLowerCase();
      
      // Get all unique categories from filtered rows
      const filteredRows = table.getFilteredRowModel().rows;
      const uniqueCategories = new Set<string>();
      
      for (const row of filteredRows) {
        const category = row.getValue('category');
        if (category && typeof category === 'string') {
          uniqueCategories.add(category);
        }
      }
      
      // Convert to option format and filter by search term
      return Array.from(uniqueCategories)
        .filter(cat => cat.toLowerCase().includes(searchTerm))
        .sort()
        .map(cat => ({ label: cat, value: cat }));
    }
    return [];
  };
};
```

### Use Case: Conditional Save Based on Table State

```tsx
// Save with context from other rows
const getSaveHandler = (key: string) => {
  return async ({ value, data, table }) => {
    if (key === 'quantity') {
      // Get total quantity across all rows
      const allRows = table.getCoreRowModel().rows;
      const totalQuantity = allRows.reduce((sum, row) => 
        sum + (Number(row.getValue('quantity')) || 0), 
        0
      );
      
      // Validate against total
      if (totalQuantity + Number(value) > 10000) {
        return 'Total quantity cannot exceed 10,000';
      }
      
      // Proceed with save
      await updateRecord(data.id, { [key]: value });
      return null;
    }
    return null;
  };
};
```

### Use Case: Cross-Field Validation

```tsx
// Validate based on related row data
const getValidateHandler = (key: string) => {
  return async ({ value, data, table }) => {
    if (key === 'max_quantity') {
      const minQuantity = data.min_quantity;
      
      if (Number(value) < Number(minQuantity)) {
        return 'Max quantity must be greater than min quantity';
      }
      
      // Check if any other row has conflicting ranges
      const allRows = table.getCoreRowModel().rows;
      const conflicts = allRows.filter(row => {
        if (row.original.id === data.id) return false;
        const otherMin = Number(row.original.min_quantity);
        const otherMax = Number(row.original.max_quantity);
        const currentMin = Number(minQuantity);
        const currentMax = Number(value);
        
        // Check for overlapping ranges
        return (currentMin <= otherMax && currentMax >= otherMin);
      });
      
      if (conflicts.length > 0) {
        return 'Quantity range overlaps with another row';
      }
    }
    return null;
  };
};
```

### Best Practices

1. **Use for read-only operations**: The table instance is for reading state, not mutating
   ```tsx
   // ✅ Good - Read data
   const allCategories = table.getCoreRowModel().rows.map(r => r.original.category);
   
   // ❌ Bad - Don't mutate table state directly
   // table.setRowSelection({ ...});
   ```

2. **Consider performance**: Accessing all rows can be expensive for large datasets
   ```tsx
   // ✅ Good - Use filtered rows when possible
   const visibleRows = table.getFilteredRowModel().rows;
   
   // ⚠️  Be cautious - Getting all rows can be slow
   const allRows = table.getCoreRowModel().rows;
   ```

3. **Type safety**: The table instance is properly typed
   ```tsx
   // TypeScript knows the exact row type
   const row: EditableInventoryItemData = table.getRowData(0);
   ```

4. **Access is always available**: The table parameter is always provided to handlers
   ```tsx
   // ✅ No need for optional chaining
   const totalRows = table.getRowCount();
   ```

## URL State Management

### Persistent Table State

The table automatically persists the following state in the URL:

```tsx
type EditableTableUrlState = {
  q: string;        // Global search query
  sort: string;     // Sort column (with - prefix for desc)
  page: number;     // Current page number
  pageSize: number; // Items per page
};
```

### Multi-table Support

```tsx
// Each table can have its own URL namespace
<EditableTable
  tableId="inventory"  // Creates inventory_q, inventory_sort, etc.
  data={inventoryData}
  // ... other props
/>

<EditableTable
  tableId="products"   // Creates products_q, products_sort, etc.
  data={productData}
  // ... other props
/>
```

### Dynamic Column Filters

For columns created at runtime (e.g., stock locations from API), use dynamic filters to group related columns under a single URL parameter.

**Problem:** Individual parsers for each column don't work with async-loaded columns.

**Solution:** Group columns with a pattern using multi-parser format.

```tsx
// Define columns with matching pattern
const columns = [
  { name: 'SKU', key: 'sku', type: 'text' },
  { 
    name: 'Location A', 
    key: 'location_levels.sloc_123',  // Matches: location_levels.*
    type: 'number',
    calculateFilterValue: (value) => {
      const qty = Number(value);
      return qty === 0 ? 'Out of stock' : qty < 100 ? '< 100' : '100+';
    }
  },
  // More location columns...
];

// Enable dynamic filters
<EditableTable
  editableColumns={columns}
  dynamicColumnFilters={['location_levels.*']}  // Group matching columns
  // ... other props
/>
```

**URL Format:** `?cf_location_levels=sloc_123:100+,sloc_456:Out%20of%20stock`

**Benefits:**
- Works with async-loaded columns
- Clean, readable URLs
- Single multi-parser handles all matching columns
- Better performance

**When to use:**
- ✅ Columns created from API data
- ✅ Multiple similar columns
- ✅ Columns which column headers that depend on dynamic data. For example: stock locations

## Performance and Stability Guidelines

### Preventing Re-render Issues

The EditableTable is designed to prevent unnecessary re-renders that can cause cell state resets and poor user experience. Follow these patterns to ensure optimal performance:

#### 1. Memoize Column Definitions in Custom Hooks

```tsx
// ✅ Correct - Memoize inside the hook
export const useInventoryItemColumnsDefinition = (stockLocations) => {
  return useMemo(() => {
    const inventoryColumns = [
      // ... column definitions
    ];
    return inventoryColumns;
  }, [stockLocations]);
};

// ❌ Incorrect - Creates new array every render
export const useInventoryItemColumnsDefinition = (stockLocations) => {
  return stockLocations.map(location => ({ ...columnDef }));
};
```

#### 2. Stabilize Handler Functions

```tsx
// ✅ Correct - Use useCallback for stable references
const getSaveHandler = useCallback((key: string) => {
  return async ({ value, data }) => {
    // Save logic
  };
}, [dependencies]);

// ❌ Incorrect - New function every render
const getSaveHandler = (key: string) => {
  return async ({ value, data }) => {
    // Save logic
  };
};
```

#### 3. Memoize Complex Props

```tsx
// ✅ Correct - Memoize object props
const tableConfig = useMemo(() => ({
  data,
  columns,
  handlers: { validate: getValidateHandler, save: getSaveHandler }
}), [data, columns, getValidateHandler, getSaveHandler]);

// ❌ Incorrect - New object every render
const tableConfig = {
  data,
  columns,
  handlers: { validate: getValidateHandler, save: getSaveHandler }
};
```

#### 4. Never Call Hooks Inside Other Hooks

```tsx
// ❌ Incorrect - Violates Rules of Hooks
const columns = useMemo(() => useInventoryItemColumnsDefinition(stockLocations), [stockLocations]);

// ✅ Correct - Call hook normally, memoize inside the hook
const columns = useInventoryItemColumnsDefinition(stockLocations);
```

### Common Pitfalls to Avoid

1. **Unstable Column References**: Always memoize column definitions inside custom hooks
2. **New Function References**: Use `useCallback` for handler functions
3. **Object Recreation**: Memoize complex objects passed as props
4. **Hook Violations**: Never call hooks inside `useMemo`, `useCallback`, or other hooks

## Component Props

### EditableTable Props

```tsx
interface EditableTableProps<T extends Record<string, unknown>> {
  // Required props
  data: T[];
  editableColumns: EditableTableColumnDefinition<T>[];
  getValidateHandler: (key: string) => EditableCellActionFn<Record<string, unknown>, string | null> | undefined;
  getSaveHandler: (key: string) => EditableCellActionFn<Record<string, unknown>, string | null> | undefined;
  getOptionsHandler: (key: string) => EditableCellActionFn<Record<string, unknown>, { label: string; value: unknown }[]> | undefined;
  
  // Optional configuration
  tableId?: string;                    // For URL state persistence
  loading?: boolean;                   // Shows skeleton when true
  className?: string;                  // Additional CSS classes
  
  // UI Controls
  showControls?: boolean;              // Show table controls (default: true)
  showPagination?: boolean;            // Show pagination (default: true)
  showInfo?: boolean;                  // Show table info (default: true)
  
  // Table Features
  enableGlobalFilter?: boolean;        // Enable global search
  enableColumnFilters?: boolean;       // Enable column-specific filters
  enableSorting?: boolean;             // Enable column sorting
  enablePagination?: boolean;          // Enable pagination
  enableColumnPinning?: boolean;       // Enable column pinning
  enableColumnVisibility?: boolean;    // Enable column show/hide
  enableRowSelection?: boolean;        // Enable row selection
  
  // Event Handlers
  onView?: (item: T) => void;          // Row view handler
  onDelete?: (item: T) => void;        // Row delete handler
  rowSelection?: Record<string, boolean>; // Row selection state
  onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
  
  // Advanced Features
  getTooltipContent?: (columnKey: string, columnName: string) => string | React.ReactNode | null;
  initialState?: Partial<EditableTableState>; // Initial table state
}
```

### Column Definition Props

```tsx
interface EditableTableColumnDefinition<T> {
  // Basic properties
  name: string;                        // Display name
  key: keyof T;                       // Data key
  type: EditableColumnType;           // Cell type ('text' | 'number' | 'badge' | 'select' | 'autocomplete')
  
  // Optional configuration
  description?: string | null;         // Column description
  placeholder?: string;               // Input placeholder
  required?: boolean;                 // Is field required
  
  // Layout
  minWidth?: number;                  // Minimum column width
  maxWidth?: number;                  // Maximum column width
  
  // Features
  enableSorting?: boolean;            // Enable sorting for this column
  enableFiltering?: boolean;          // Enable filtering for this column
  enableHiding?: boolean;             // Allow hiding this column
  isPinnable?: boolean;               // Allow pinning this column
  
  // Dependencies and validation
  dependsOn?: string[];               // Fields this column depends on
  cellProps?: Record<string, unknown>; // Props passed to cell component
  
  // Value calculation
  calculateValue?: (key: keyof T, data: Record<string, unknown>) => unknown;
  getFieldKey?: (key: string) => string; // Custom field key transformation
}
```

## Real-World Example: Inventory Table

The `EditableInventoryTable` serves as a comprehensive implementation example, demonstrating all the patterns and features of the EditableTable component.

### Implementation Overview

```tsx
// my-medusa-app/src/admin/components/EditableInventoryTable/EditableInventoryTable.tsx
export const EditableInventoryTable = () => {
  // Data fetching
  const { data: inventoryData } = useAdminListInventoryItems();
  const { data: stockLocationData } = useAdminListStockLocations();
  const { data: productConditionsData } = useAdminListProductConditions();

  // Data transformation
  const inventoryItems = useMemo(
    () => mapInventoryItemToEditableItems(
      inventoryData?.inventory_items,
      stockLocations,
      productConditionsData?.product_conditions,
    ),
    [inventoryData, stockLocations, productConditionsData],
  );

  // Column definitions
  const columns = useInventoryItemColumnsDefinition(stockLocations);

  // Action handlers
  const getValidateHandler = useInventoryCellValidateHandlers();
  const getSaveHandler = useInventoryCellSaveHandlers();

  return (
    <EditableTable<EditableInventoryItemData>
      data={inventoryItems}
      editableColumns={columns}
      getValidateHandler={getValidateHandler}
      getSaveHandler={getSaveHandler}
    />
  );
};
```

### Data Type Definition

```tsx
// types.ts
export type EditableInventoryItemData = {
  id?: string;
  sku?: string;
  title?: string;
  [location_level: `location_levels.${string}`]: number | undefined;
  product_condition_id?: string;
  condition?: string;
  serial_number?: string;
  condition_description?: string;
  product_variants?: InventoryItem['variants'];
  condition_photos?: ImageFile[];
};
```

### Dynamic Column Generation

```tsx
// useInventoryItemColumnsDefinition.tsx
const mapLocationLevelColumnsDefinition = (
  stockLocations: HttpTypes.AdminStockLocation[],
): EditableTableColumnDefinition<EditableInventoryItemData>[] => {
  return stockLocations.map((location) => ({
    name: location.name || location.id.slice(-3),
    key: createLocationLevelsKey(location.id), // "location_levels.{locationId}"
    type: 'number',
    placeholder: '0',
    required: false,
    dependsOn: ['title'],
    cellProps: { min: 0, max: 999999, step: 1 },
  }));
};
```

### Validation Schema

```tsx
// inventorySchema.ts
export const inventorySchema = {
  sku: z.string()
    .min(3, 'SKU must be at least 3 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores'),
    
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
    
  serial_number: z.string()
    .refine((val) => val === '' || val?.length >= 3, 'Serial number must be at least 3 characters')
    .optional(),
    
  'location_levels.*': z.object({
    location_id: z.string().min(1, 'This location is not available'),
    stocked_quantity: z.coerce.number().int().min(0).max(999999).default(0),
  }),
};
```

### Save Handler Implementation

```tsx
// useInventoryCellSaveHandlers.ts
export const useInventoryCellSaveHandlers = (): SaverFn => {
  const { mutateAsync: updateInventoryField } = useAdminUpdateInventoryField();
  const { mutateAsync: updateInventoryItemDetailsField } = useAdminUpdateInventoryItemDetailsField();
  const { mutateAsync: updateInventoryLocationLevel } = useAdminUpdateInventoryLocationLevelField();

  const inventorySavers: EditableCellActionsMap = useMemo(() => ({
    // Basic inventory fields
    sku: async ({ value: rawValue, meta, data }) => {
      const result = inventorySchema.sku.safeParse(rawValue);
      if (!result.success) {
        return result.error.errors[0]?.message || 'Invalid SKU';
      }

      const parsedValue = result.data;
      if (isSameValue(parsedValue, data, meta.key)) {
        return null; // No change needed
      }

      await updateInventoryField({
        itemId: data.id as string,
        field: 'sku',
        value: parsedValue,
      });

      return null; // Success
    },

    // Location levels (dynamic fields)
    'location_levels.*': async ({ value: rawValue, meta, data }) => {
      const locationId = meta.key.split('.')[1];
      const result = inventorySchema['location_levels.*'].safeParse({
        stocked_quantity: rawValue,
        location_id: locationId,
      });
      
      if (!result.success) {
        return result.error.errors[0]?.message || 'Invalid quantity';
      }

      const parsedValue = result.data;
      if (isSameValue(parsedValue.stocked_quantity, data, meta.key)) {
        return null;
      }

      await updateInventoryLocationLevel({
        itemId: data.id as string,
        locationId,
        stocked_quantity: parsedValue.stocked_quantity,
      });

      return null;
    },
  }), [updateInventoryField, updateInventoryItemDetailsField, updateInventoryLocationLevel]);

  return useCallback((key: string) => {
    const handler = inventorySavers[key.includes('location_levels.') ? 'location_levels.*' : key];
    if (!handler) return undefined;

    return async (...args) => {
      return await handler(...args).catch((error) => {
        toast.error(`An error occurred while saving ${key}`);
        return `An error occurred while saving ${key}`;
      });
    };
  }, [inventorySavers]);
};
```

### Key Patterns Demonstrated

1. **Dynamic Column Generation**: Stock location columns are generated dynamically based on available locations
2. **Wildcard Field Handling**: `location_levels.*` pattern handles multiple similar fields
3. **Multi-API Integration**: Different fields save to different API endpoints
4. **Error Handling**: Comprehensive error handling with user feedback
5. **Type Safety**: Full TypeScript integration with proper typing
6. **Performance**: Memoization and efficient re-rendering

## Advanced Patterns

### Calculated Values

```tsx
// Badge columns with calculated display values
{
  name: 'Status',
  key: 'status',
  type: 'badge',
  calculateValue: (key, data) => {
    const count = data.items?.length || 0;
    return {
      status: count > 0 ? 'active' : 'inactive',
      title: count > 0 ? `${count} items` : 'No items',
    };
  },
}
```

### Custom Cell Props

```tsx
// Pass custom props to cell components
{
  name: 'Price',
  key: 'price',
  type: 'number',
  cellProps: {
    min: 0,
    max: 999999,
    step: 0.01,
    prefix: '$',
    suffix: 'USD',
  },
}
```

## Future Improvements

### Developer Experience Enhancements

1. **Simplified Handler Creation**
   ```tsx
   // Auto-generate handlers from schema and API functions
   const handlers = createHandlersFromSchema(schema, {
     save: { sku: updateSku, title: updateTitle },
     validate: schema,
   });
   ```

### Accessibility Features

#### Keyboard Navigation

- **Tab**: Navigate between cells [**DONE**]
- **Enter**: Start editing a cell
- **Escape**: Cancel editing

#### Screen Reader Support

- **ARIA Labels**: Proper labeling for all interactive elements
- **Live Regions**: Status updates announced to screen readers
- **Focus Management**: Logical focus flow throughout the table
- **Error Announcements**: Validation errors are announced


### Testing Strategy

#### Unit Tests

```tsx
// Test cell validation
describe('Cell Validation', () => {
  it('should validate required fields', async () => {
    const validator = getValidateHandler('name');
    const result = await validator({ value: '', meta: {}, data: {} });
    expect(result).toBe('Name is required');
  });
});

// Test save operations
describe('Cell Save', () => {
  it('should save valid data', async () => {
    const saver = getSaveHandler('name');
    const result = await saver({ 
      value: 'New Name', 
      meta: { key: 'name' }, 
      data: { id: '1', name: 'Old Name' } 
    });
    expect(result).toBeNull();
  });
});
```

### Feature Enhancements

1. **Advanced Cell Types**
   ```tsx
   // Rich text editor cell
   { type: 'richtext', toolbar: ['bold', 'italic', 'link'] }
   
   // Date picker cell
   { type: 'date', format: 'YYYY-MM-DD', minDate: new Date() }
   
   // File upload cell
   { type: 'file', accept: 'image/*', maxSize: '5MB' }
   ```

2. **Bulk Operations** (Row selection implemented, bulk actions future enhancement)
   ```tsx
   // Row selection is available, bulk actions need implementation
   <EditableTable
     enableRowSelection={true}
     rowSelection={rowSelection}
     onRowSelectionChange={setRowSelection}
     // Future: bulkActions prop for bulk operations
   />
   ```

3. **Advanced Filtering** (Basic filtering available, advanced filters future enhancement)
   ```tsx
   // Basic column filtering is available
   <EditableTable
     enableColumnFilters={true}
     // Future: Advanced filter types
     filterTypes={{
       status: 'select',
       date: 'dateRange',
       price: 'numberRange',
     }}
   />
   ```

4. **Column Tooltips** (✅ Implemented)
   ```tsx
   // Tooltip support for column headers is now available
   <EditableTable
     getTooltipContent={(columnKey, columnName) => {
       return tooltipMap[columnKey] || null;
     }}
   />
   ```

5. **Pagination** (✅ Implemented)
   ```tsx
   // Full pagination system with customizable page sizes
   <EditableTable
     enablePagination={true}
     showPagination={true}
     // Page sizes: [20, 30, 40, 50, 100] by default
   />
   ```

### Code Organization Improvements

1. **Configuration Presets**
   ```tsx
   // Pre-configured table types
   const InventoryTablePreset = createTablePreset({
     validation: inventorySchema,
     saveHandlers: inventorySaveHandlers,
     columns: inventoryColumns,
   });
   
   <InventoryTablePreset data={inventoryData} />
   ```

## Building New Tables: Step-by-Step Guide

When creating a new table similar to `EditableInventoryTable`, follow this structured approach to ensure optimal performance and avoid common pitfalls:

### Step 1: Define Data Types

```tsx
// types.ts
export type MyTableData = {
  id: string;
  name: string;
  quantity: number;
  status: 'active' | 'inactive';
  // Add other fields as needed
};
```

### Step 2: Create Column Definitions Hook

```tsx
// useMyTableColumnsDefinition.tsx
import { useMemo } from 'react';
import type { EditableTableColumnDefinition } from '../EditableTable/types/cells';

export const useMyTableColumnsDefinition = (
  dependencies: any[] // Any data needed for dynamic columns
): EditableTableColumnDefinition<MyTableData>[] => {
  return useMemo(() => {
    const columns: EditableTableColumnDefinition<MyTableData>[] = [
      {
        name: 'Name',
        key: 'name',
        type: 'text',
        placeholder: 'Enter name',
        required: true,
        dependsOn: [],
      },
      {
        name: 'Quantity',
        key: 'quantity',
        type: 'number',
        placeholder: '0',
        cellProps: { min: 0, max: 999999 },
        dependsOn: ['name'],
      },
      // Add more columns as needed
    ];
    
    return columns;
  }, [dependencies]); // ✅ CRITICAL: Memoize with proper dependencies
};
```

### Step 3: Create Validation Schema and Handlers

```tsx
// myTableSchema.ts
import { z } from 'zod';

export const myTableSchema = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  // Add more validation rules
};

// useMyTableValidateHandlers.ts
import { useCallback } from 'react';
import { myTableSchema } from './myTableSchema';

export const useMyTableValidateHandlers = () => {
  return useCallback((key: string) => {
    return async ({ value }) => {
      const schema = myTableSchema[key];
      if (!schema) return null;
      
      const result = schema.safeParse(value);
      return result.success ? null : result.error.errors[0]?.message;
    };
  }, []); // ✅ CRITICAL: Empty dependency array for stable reference
};
```

### Step 4: Create Save Handlers

```tsx
// useMyTableSaveHandlers.ts
import { useCallback } from 'react';
import { useMyTableMutations } from './mutations'; // Your API mutations

export const useMyTableSaveHandlers = () => {
  const { mutateAsync: updateRecord } = useMyTableMutations();
  
  return useCallback((key: string) => {
    return async ({ value, data }) => {
      try {
        // Validate before saving
        const validationError = await validateField(key, value);
        if (validationError) return validationError;
        
        // Check if value actually changed
        if (value === data[key]) return null;
        
        // Perform save operation
        await updateRecord({ id: data.id, [key]: value });
        
        return null; // Success
      } catch (error) {
        return error.message || 'Save failed';
      }
    };
  }, [updateRecord]); // ✅ CRITICAL: Include all dependencies
};
```

### Step 5: Create Options Handlers (for autocomplete columns)

```tsx
// useMyTableOptionsHandlers.ts
import { useCallback } from 'react';

export const useMyTableOptionsHandlers = () => {
  return useCallback((key: string) => {
    return async ({ value }) => {
      const searchTerm = String(value || '').toLowerCase();
      
      // Return options for autocomplete fields
      if (key === 'category') {
        const categories = await fetchCategories(searchTerm);
        return categories
          .filter(cat => cat.name.toLowerCase().includes(searchTerm))
          .map(cat => ({ label: cat.name, value: cat.id }));
      }
      
      if (key === 'supplier') {
        const suppliers = await fetchSuppliers(searchTerm);
        return suppliers.map(s => ({ label: s.name, value: s.id }));
      }
      
      // Return empty array for non-autocomplete fields
      return [];
    };
  }, []); // ✅ CRITICAL: Empty dependency array for stable reference
};
```

### Step 6: Create the Main Table Component

```tsx
// MyTable.tsx
import { useCallback, useMemo, useState } from 'react';
import { EditableTable } from '../EditableTable/components/EditableTable';
import { useMyTableColumnsDefinition } from './useMyTableColumnsDefinition';
import { useMyTableValidateHandlers } from './useMyTableValidateHandlers';
import { useMyTableSaveHandlers } from './useMyTableSaveHandlers';
import { useMyTableOptionsHandlers } from './useMyTableOptionsHandlers';

export const MyTable = () => {
  // Data fetching
  const { data, isLoading } = useMyTableData();
  
  // Memoized data transformation
  const tableData = useMemo(() => 
    transformDataForTable(data), 
    [data]
  );
  
  // Column definitions (memoized inside hook)
  const columns = useMyTableColumnsDefinition([/* dependencies */]);
  
  // Handlers (stable references)
  const getValidateHandler = useMyTableValidateHandlers();
  const getSaveHandler = useMyTableSaveHandlers();
  const getOptionsHandler = useMyTableOptionsHandlers();
  
  // Action handlers
  const handleView = useCallback((item: MyTableData) => {
    navigate(`/my-table/${item.id}`);
  }, [navigate]);
  
  const handleDelete = useCallback((item: MyTableData) => {
    // Delete logic
  }, []);
  
  // Row selection
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const handleRowSelectionChange = useCallback((newSelection: Record<string, boolean>) => {
    setRowSelection(newSelection);
  }, []);
  
  return (
    <EditableTable<MyTableData>
      data={tableData}
      editableColumns={columns}
      loading={isLoading}
      getValidateHandler={getValidateHandler}
      getSaveHandler={getSaveHandler}
      getOptionsHandler={getOptionsHandler}
      enableRowSelection={true}
      rowSelection={rowSelection}
      onRowSelectionChange={handleRowSelectionChange}
      onView={handleView}
      onDelete={handleDelete}
    />
  );
};
```

### Step 7: Performance Checklist

Before deploying your table, verify these performance requirements:

- [ ] **Column definitions are memoized** inside the custom hook
- [ ] **Handler functions use `useCallback`** with proper dependencies
- [ ] **No hooks are called inside other hooks** (Rules of Hooks)
- [ ] **Complex objects are memoized** with `useMemo`
- [ ] **Data transformations are memoized** to prevent unnecessary recalculations
- [ ] **Action handlers are stable** and don't recreate on every render

### Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Status indicators not showing | Cells reset state during saves | Memoize column definitions in custom hook |
| Performance issues | Excessive re-renders | Use `useCallback` for all handler functions |
| Hook violations | React errors in console | Never call hooks inside `useMemo`/`useCallback` |
| Unstable references | Table re-renders unnecessarily | Memoize all complex objects and arrays |

## Migration Guide

### From Basic Table to EditableTable

```tsx
// Before: Basic table
<Table>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Quantity</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {data.map(item => (
      <Table.Row key={item.id}>
        <Table.Cell>{item.name}</Table.Cell>
        <Table.Cell>{item.quantity}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table>

// After: EditableTable
<EditableTable
  data={data}
  editableColumns={[
    { name: 'Name', key: 'name', type: 'text' },
    { name: 'Quantity', key: 'quantity', type: 'number' },
  ]}
  getValidateHandler={getValidateHandler}
  getSaveHandler={getSaveHandler}
/>
```

### Adding Validation

```tsx
// 1. Define schema
const schema = {
  name: z.string().min(1, 'Name is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be positive'),
};

// 2. Create validation handler
const getValidateHandler = (key) => async ({ value }) => {
  const result = schema[key]?.safeParse(value);
  return result?.success ? null : result.error.errors[0]?.message;
};

// 3. Add to table
<EditableTable
  getValidateHandler={getValidateHandler}
  // ... other props
/>
```

### Adding Save Functionality

```tsx
// 1. Create save handler
const getSaveHandler = (key) => async ({ value, data }) => {
  try {
    await updateRecord(data.id, { [key]: value });
    return null; // Success
  } catch (error) {
    return error.message; // Error
  }
};

// 2. Add to table
<EditableTable
  getSaveHandler={getSaveHandler}
  // ... other props
/>
```

## Conclusion

The EditableTable component represents a sophisticated solution for inline data editing in admin interfaces. It successfully combines:

- **Developer Experience**: Type-safe, well-documented API with clear patterns
- **User Experience**: Intuitive editing with immediate feedback and error handling
- **Performance**: Optimized for large datasets with efficient rendering
- **Maintainability**: Clean architecture with separation of concerns
- **Extensibility**: Plugin-ready design for future enhancements

The InventoryTable implementation demonstrates how these patterns can be applied to real-world scenarios, providing a template for future table implementations throughout the Medusa2 admin interface.

**Key Takeaways:**
- Use schema-driven validation for consistency and type safety
- Implement proper error handling and user feedback
- Leverage URL state for better user experience
- Design for performance from the start
- Maintain clear separation between data, validation, and save logic
- **Always memoize column definitions inside custom hooks** to prevent re-render issues
- **Use `useCallback` for all handler functions** to ensure stable references
- **Never call hooks inside other hooks** to avoid React violations
- **Test status indicators** to verify cells maintain state during saves

## Critical Performance Patterns

### The "Status Indicator Test"
Before deploying any EditableTable implementation, perform this test:

1. **Edit a cell** and observe the status indicators
2. **Verify the complete flow**: Editing → Saving → Success/Error
3. **Check for state resets**: Status indicators should not disappear during saves
4. **Test multiple cells**: Only the edited cell should show indicators

If status indicators don't work correctly, the table has re-render issues that need to be fixed using the patterns outlined in this guide.

This component serves as a foundation for efficient data management workflows and can be extended to support additional use cases as the admin interface evolves.
