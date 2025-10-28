import { EditableTable } from '@lambdacurry/medusa-forms/editable-table';
import type { EditableTableColumnDefinition } from '@lambdacurry/medusa-forms/editable-table';
import { Toaster, TooltipProvider } from '@medusajs/ui';
import type { Meta } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useState } from 'react';

const meta = {
  title: 'Medusa Forms/Editable Table',
  component: EditableTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A powerful, feature-rich table component with inline editing capabilities for tabular data.

## Features
- **Inline Editing**: Edit data directly in table cells
- **Real-time Validation**: Immediate feedback on field changes
- **Auto-save**: Debounced saving with visual status indicators
- **URL State Persistence**: Table state (search, sort, pagination) persists in URL
- **Column Management**: Sorting, filtering, pinning, and resizing
- **Multiple Cell Types**: Text, number, autocomplete, badge, and more
- **Performance Optimized**: Handles large datasets efficiently
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 1000 * 60 * 5,
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

// Regex patterns defined at top level for performance
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{3}-\d{4}$/;

// Mock data types
interface Product extends Record<string, unknown> {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive' | 'draft';
}

interface InventoryItem extends Record<string, unknown> {
  id: string;
  location: string;
  item_name: string;
  quantity: number;
  min_quantity: number;
  supplier: string;
}

// Mock data generators
const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: `Product ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(4, '0')}`,
  price: Math.floor(Math.random() * 500) + 10,
  stock: Math.floor(Math.random() * 200),
  category: ['Electronics', 'Clothing', 'Home & Garden', 'Sports'][Math.floor(Math.random() * 4)] || 'Electronics',
  status: (['active', 'inactive', 'draft'] as const)[Math.floor(Math.random() * 3)] || 'active',
}));

const mockInventory: InventoryItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `inv-${i + 1}`,
  location: `Warehouse ${String.fromCharCode(65 + (i % 5))}`,
  item_name: `Item ${i + 1}`,
  quantity: Math.floor(Math.random() * 500),
  min_quantity: Math.floor(Math.random() * 50),
  supplier: ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D'][Math.floor(Math.random() * 4)] || 'Supplier A',
}));

// Product columns
const productColumns: EditableTableColumnDefinition<Product>[] = [
  {
    name: 'Product Name',
    key: 'name',
    type: 'text',
    required: true,
    enableSorting: true,
    enableFiltering: true,
  },
  {
    name: 'SKU',
    key: 'sku',
    type: 'text',
    required: true,
    enableSorting: true,
    enableFiltering: true,
  },
  {
    name: 'Price',
    key: 'price',
    type: 'number',
    required: true,
    enableSorting: true,
    cellProps: { min: 0, step: 0.01 },
  },
  {
    name: 'Stock',
    key: 'stock',
    type: 'number',
    required: true,
    enableSorting: true,
    cellProps: { min: 0 },
  },
  {
    name: 'Category',
    key: 'category',
    type: 'autocomplete',
    enableFiltering: true,
  },
  {
    name: 'Status',
    key: 'status',
    type: 'badge',
    enableFiltering: true,
    calculateValue: (key, data) => data[key],
  },
];

// Inventory columns
const inventoryColumns: EditableTableColumnDefinition<InventoryItem>[] = [
  {
    name: 'Location',
    key: 'location',
    type: 'autocomplete',
    required: true,
    enableFiltering: true,
  },
  {
    name: 'Item Name',
    key: 'item_name',
    type: 'text',
    required: true,
    enableSorting: true,
    enableFiltering: true,
  },
  {
    name: 'Quantity',
    key: 'quantity',
    type: 'number',
    required: true,
    enableSorting: true,
    cellProps: { min: 0 },
  },
  {
    name: 'Min Quantity',
    key: 'min_quantity',
    type: 'number',
    required: true,
    enableSorting: true,
    cellProps: { min: 0 },
  },
  {
    name: 'Supplier',
    key: 'supplier',
    type: 'autocomplete',
    required: true,
    enableFiltering: true,
  },
];

// Basic Product Table
export const BasicProductTable = {
  name: 'Basic Product Table',
  render: () => {
    const [data, setData] = useState(mockProducts);

    const validateProductField = (key: string, value: unknown) => {
      const valueStr = String(value);
      const valueNum = Number(value);

      if (key === 'name' && (!value || valueStr.length < 3)) {
        return 'Product name must be at least 3 characters';
      }
      if (key === 'sku' && (!value || valueStr.length < 4)) {
        return 'SKU must be at least 4 characters';
      }
      if ((key === 'price' || key === 'stock') && (value === null || value === undefined || valueNum < 0)) {
        return 'Value must be greater than or equal to 0';
      }
      return null;
    };

    const getValidateHandler = (key: string) => {
      return async ({ value }: { value: unknown }) => validateProductField(key, value);
    };

    const getSaveHandler = (key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update data
        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as Product) : item)));

        return null; // Success
      };
    };

    const getOptionsHandler = (key: string) => {
      return async ({ value }: { value: unknown }) => {
        await new Promise((resolve) => setTimeout(resolve, 200));

        const searchTerm = String(value || '').toLowerCase();

        if (key === 'category') {
          const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys'];
          return categories
            .filter((cat) => cat.toLowerCase().includes(searchTerm))
            .map((cat) => ({ label: cat, value: cat }));
        }

        return [];
      };
    };

    return (
      <EditableTable
        data={data}
        editableColumns={productColumns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        enablePagination={true}
        showControls={true}
        showPagination={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
A basic product table demonstrating core EditableTable functionality:

**Features Demonstrated:**
- Inline text and number editing
- Real-time validation (min length, non-negative numbers)
- Auto-save with debouncing
- Global search across all columns
- Column sorting
- Column filtering
- Pagination
- Autocomplete for category selection
- Visual status indicators for cell states

**Interactions:**
- Click any cell to edit inline
- Changes are validated and auto-saved after a brief delay
- Use the search bar to filter products globally
- Click column headers to sort
- Use the filter dropdowns to filter by specific columns
- Navigate pages using pagination controls
        `,
      },
    },
  },
};

// Inventory Management Table
export const InventoryManagementTable = {
  name: 'Inventory Management',
  render: () => {
    const [data, setData] = useState(mockInventory);

    const validateInventoryField = (key: string, value: unknown, data: Record<string, unknown>) => {
      const valueNum = Number(value);
      const valueStr = String(value);

      if (!value || valueStr.trim() === '') {
        return 'This field is required';
      }
      if ((key === 'quantity' || key === 'min_quantity') && valueNum < 0) {
        return 'Quantity cannot be negative';
      }
      const minQty = data.min_quantity as number;
      if (key === 'quantity' && minQty && valueNum < minQty) {
        return `Quantity cannot be less than minimum (${minQty})`;
      }
      return null;
    };

    const getValidateHandler = (key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) =>
        validateInventoryField(key, value, data);
    };

    const getSaveHandler = (key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setData((prev) =>
          prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as InventoryItem) : item)),
        );
        return null;
      };
    };

    const getOptionsHandler = (key: string) => {
      return async ({ value }: { value: unknown }) => {
        await new Promise((resolve) => setTimeout(resolve, 150));
        const searchTerm = String(value || '').toLowerCase();

        if (key === 'location') {
          const locations = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D', 'Warehouse E'];
          return locations
            .filter((loc) => loc.toLowerCase().includes(searchTerm))
            .map((loc) => ({ label: loc, value: loc }));
        }

        if (key === 'supplier') {
          const suppliers = [
            'Supplier A',
            'Supplier B',
            'Supplier C',
            'Supplier D',
            'Global Suppliers Inc',
            'Direct Wholesale',
          ];
          return suppliers
            .filter((sup) => sup.toLowerCase().includes(searchTerm))
            .map((sup) => ({ label: sup, value: sup }));
        }

        return [];
      };
    };

    return (
      <EditableTable
        data={data}
        editableColumns={inventoryColumns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        enablePagination={true}
        showControls={true}
        showPagination={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
An inventory management table with complex validation rules:

**Advanced Features:**
- **Cross-field validation**: Quantity must be >= min_quantity
- **Autocomplete fields**: Location and supplier with async search
- **Conditional validation**: Different rules for different field types
- **Required field validation**: All fields must have values

**Business Rules:**
- Quantities cannot be negative
- Current quantity must meet or exceed minimum quantity threshold
- Locations and suppliers are selected from autocomplete dropdowns
- All fields are required
        `,
      },
    },
  },
};

// Simple Text Table
export const SimpleTextTable = {
  name: 'Simple Text Table',
  render: () => {
    interface SimpleData extends Record<string, unknown> {
      id: string;
      name: string;
      email: string;
      phone: string;
    }

    const simpleData: SimpleData[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0001' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0002' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0003' },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '555-0004' },
      { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', phone: '555-0005' },
    ];

    const [data, setData] = useState(simpleData);

    const columns: EditableTableColumnDefinition<SimpleData>[] = [
      { name: 'Name', key: 'name', type: 'text', required: true, enableSorting: true },
      { name: 'Email', key: 'email', type: 'text', required: true, enableSorting: true },
      { name: 'Phone', key: 'phone', type: 'text', required: true },
    ];

    const validateContactField = (key: string, value: unknown) => {
      const valueStr = String(value);

      if (!value || valueStr.trim() === '') {
        return 'This field is required';
      }
      if (key === 'email' && !EMAIL_REGEX.test(valueStr)) {
        return 'Invalid email format';
      }
      if (key === 'phone' && !PHONE_REGEX.test(valueStr)) {
        return 'Phone must be in format: XXX-XXXX';
      }
      return null;
    };

    const getValidateHandler = (key: string) => {
      return async ({ value }: { value: unknown }) => validateContactField(key, value);
    };

    const getSaveHandler = (key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as SimpleData) : item)));
        return null;
      };
    };

    const getOptionsHandler = () => {
      return async () => [];
    };

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableSorting={true}
        enablePagination={false}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
A simple contact table demonstrating format validation:

**Validation Rules:**
- **Email**: Must match standard email format
- **Phone**: Must match XXX-XXXX format
- **All fields**: Required

**Simplified Configuration:**
- No pagination (small dataset)
- Text-only fields
- Format-specific validation
- Real-time feedback on validation errors
        `,
      },
    },
  },
};

// Loading State
export const LoadingState = {
  name: 'Loading State',
  render: () => {
    const columns: EditableTableColumnDefinition<Product>[] = [
      { name: 'Name', key: 'name', type: 'text' },
      { name: 'SKU', key: 'sku', type: 'text' },
      { name: 'Price', key: 'price', type: 'number' },
      { name: 'Stock', key: 'stock', type: 'number' },
      { name: 'Category', key: 'category', type: 'text' },
    ];

    return (
      <EditableTable
        data={[]}
        editableColumns={columns}
        getValidateHandler={() => async () => null}
        getSaveHandler={() => async () => null}
        getOptionsHandler={() => async () => []}
        loading={true}
        showControls={true}
        showPagination={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
The loading skeleton state displayed while data is being fetched.

**Features:**
- Animated skeleton rows
- Matches table structure with proper column widths
- Smooth loading animation
- Maintains layout consistency
        `,
      },
    },
  },
};

// Empty State
export const EmptyState = {
  name: 'Empty State',
  render: () => {
    const columns: EditableTableColumnDefinition<Product>[] = [
      { name: 'Name', key: 'name', type: 'text' },
      { name: 'SKU', key: 'sku', type: 'text' },
      { name: 'Price', key: 'price', type: 'number' },
      { name: 'Stock', key: 'stock', type: 'number' },
    ];

    return (
      <EditableTable
        data={[]}
        editableColumns={columns}
        getValidateHandler={() => async () => null}
        getSaveHandler={() => async () => null}
        getOptionsHandler={() => async () => []}
        loading={false}
        showControls={true}
        showPagination={true}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
The empty state displayed when no data is available.

**Use Cases:**
- No data loaded yet
- All items have been deleted
- Search/filter returned no results
        `,
      },
    },
  },
};
