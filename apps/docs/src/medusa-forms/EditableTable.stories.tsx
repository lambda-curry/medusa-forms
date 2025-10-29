import { EditableTable } from '@lambdacurry/medusa-forms/editable-table';
import type { CellActionsHandlerGetter, EditableTableColumnDefinition } from '@lambdacurry/medusa-forms/editable-table';
import { Toaster, TooltipProvider } from '@medusajs/ui';
import type { Meta } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';

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
- **Real-time Validation**: Immediate feedback with Zod schema validation
- **Auto-save**: Debounced saving with visual status indicators
- **URL State Persistence**: Table state (search, sort, pagination) persists in URL
- **Column Management**: Sorting, filtering, pinning, and resizing
- **Multiple Cell Types**: Text, number, autocomplete, badge
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

// Username regex pattern for Zod validation
const USERNAME_REGEX = /^[a-z0-9_]+$/;

// ============================================================================
// Story 1: Simple Validation Example
// ============================================================================

export const SimpleValidationExample = {
  name: '1. Simple Validation',
  render: () => {
    interface SimpleProduct extends Record<string, unknown> {
      id: string;
      name: string;
      price: number;
      stock: number;
    }

    const [data, setData] = useState<SimpleProduct[]>([
      { id: '1', name: 'Laptop', price: 999, stock: 15 },
      { id: '2', name: 'Mouse', price: 29, stock: 50 },
      { id: '3', name: 'Keyboard', price: 79, stock: 30 },
    ]);

    const columns: EditableTableColumnDefinition<SimpleProduct>[] = useMemo(
      () => [
        { name: 'Product Name', key: 'name', type: 'text', required: true },
        { name: 'Price', key: 'price', type: 'number', cellProps: { min: 0, step: 0.01 } },
        { name: 'Stock', key: 'stock', type: 'number', cellProps: { min: 0 } },
      ],
      [],
    );

    // Simple inline validation
    const getValidateHandler = useCallback((_key: string) => {
      return ({ value }: { value: unknown }) => {
        if (_key === 'name' && (!value || String(value).length < 2)) {
          return Promise.resolve('Name must be at least 2 characters');
        }
        if ((_key === 'price' || _key === 'stock') && (value === null || Number(value) < 0)) {
          return Promise.resolve('Must be a positive number');
        }
        return Promise.resolve(null);
      };
    }, []);

    // Simple inline save
    const getSaveHandler = useCallback((key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData((prev) =>
          prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as SimpleProduct) : item)),
        );
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableSorting={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
The simplest EditableTable implementation with basic inline validation.

**Key Features:**
- Synchronous inline validation functions
- Simple length and numeric checks (name min 2 chars, price/stock positive)
- Direct state updates with 300ms simulated save delay
- No external dependencies (no Zod, no async validation)

**Use this pattern when:**
- You have simple validation rules
- No need for complex schemas or async validation
- Quick prototyping
        `,
      },
    },
  },
};

// ============================================================================
// Story 2: Zod Validation Example
// ============================================================================

export const ZodValidationExample = {
  name: '2. Zod Schema Validation',
  render: () => {
    interface User extends Record<string, unknown> {
      id: string;
      email: string;
      age: number;
      username: string;
    }

    const [data, setData] = useState<User[]>([
      { id: '1', email: 'john@example.com', age: 25, username: 'john_doe' },
      { id: '2', email: 'jane@example.com', age: 30, username: 'jane_smith' },
      { id: '3', email: 'bob@example.com', age: 28, username: 'bob_j' },
    ]);

    const columns: EditableTableColumnDefinition<User>[] = useMemo(
      () => [
        { name: 'Email', key: 'email', type: 'text', required: true },
        { name: 'Username', key: 'username', type: 'text', required: true },
        { name: 'Age', key: 'age', type: 'number', cellProps: { min: 18, max: 120 } },
      ],
      [],
    );

    // Zod validation schemas (memoized)
    const schemas = useMemo(
      () => ({
        email: z.string().email('Invalid email format').min(5, 'Email too short'),
        username: z
          .string()
          .min(3, 'Username must be at least 3 characters')
          .max(20, 'Username too long')
          .regex(USERNAME_REGEX, 'Username can only contain lowercase letters, numbers, and underscores'),
        age: z.coerce.number().int('Age must be a whole number').min(18, 'Must be 18+').max(120, 'Invalid age'),
      }),
      [],
    );

    const getValidateHandler = useCallback(
      (_key: string) => {
        return ({ value }: { value: unknown }) => {
          const schema = schemas[_key as keyof typeof schemas];
          if (!schema) return Promise.resolve(null);

          const result = schema.safeParse(value);
          if (!result.success) {
            return Promise.resolve(result.error.errors[0]?.message || 'Invalid value');
          }
          return Promise.resolve(null);
        };
      },
      [schemas],
    );

    const getSaveHandler: CellActionsHandlerGetter<string | null> = useCallback((key: string) => {
      return async ({ value, data }) => {
        // Note: Validation is called automatically before save - don't call it manually
        await new Promise((resolve) => setTimeout(resolve, 400));
        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as User) : item)));
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableSorting={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Schema-based validation using Zod for robust type-safe validation.

**Features Demonstrated:**
- Synchronous Zod schema validation for each field
- Complex validation rules (email format, username regex patterns)
- Range validation (age 18-120) with type coercion
- Detailed, user-friendly error messages from Zod
- 400ms simulated save delay

**Use this pattern when:**
- You need robust, synchronous validation
- Type safety is important
- Complex validation rules (regex, formats, ranges)
- Reusable validation logic across your app
        `,
      },
    },
  },
};

// ============================================================================
// Story 3: Async Operations Example
// ============================================================================

export const AsyncOperationsExample = {
  name: '3. Async Validation & Save',
  render: () => {
    interface Product extends Record<string, unknown> {
      id: string;
      sku: string;
      name: string;
      category: string;
    }

    const [data, setData] = useState<Product[]>([
      { id: '1', sku: 'LAPTOP-001', name: 'Gaming Laptop', category: 'Electronics' },
      { id: '2', sku: 'MOUSE-002', name: 'Wireless Mouse', category: 'Electronics' },
      { id: '3', sku: 'DESK-003', name: 'Standing Desk', category: 'Furniture' },
    ]);

    const columns: EditableTableColumnDefinition<Product>[] = useMemo(
      () => [
        { name: 'SKU', key: 'sku', type: 'text', required: true },
        { name: 'Product Name', key: 'name', type: 'text', required: true },
        { name: 'Category', key: 'category', type: 'autocomplete', required: true },
      ],
      [],
    );

    // Async validation (simulates API check)
    const getValidateHandler: CellActionsHandlerGetter<string | null> = useCallback((_key: string) => {
      return async ({ value, table }) => {
        if (_key === 'sku') {
          // Simulate API call to check SKU uniqueness
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Use table instance instead of data state to avoid re-renders
          const allRows = table.getCoreRowModel().rows;
          const skuExists = allRows.some((row) => row.original.sku === value);
          if (skuExists && String(value).length > 0) {
            // In real app, check against server data
            return 'SKU validation completed';
          }
        }

        if (!value || String(value).trim() === '') {
          return 'This field is required';
        }

        return null;
      };
    }, []); // No dependencies - use table instance instead

    // Async save (simulates API call)
    const getSaveHandler: CellActionsHandlerGetter<string | null> = useCallback((key: string) => {
      return async ({ value, data }) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Simulate occasional API errors
        if (Math.random() > 0.9) {
          return 'Network error - please retry';
        }

        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as Product) : item)));
        return null;
      };
    }, []);

    // Async options (simulates API fetch)
    const getOptionsHandler: CellActionsHandlerGetter<{ label: string; value: unknown }[]> = useCallback(
      (key: string) => {
        return async ({ value }) => {
          if (key === 'category') {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 300));

            const searchTerm = String(value || '').toLowerCase();
            const categories = ['Electronics', 'Furniture', 'Office Supplies', 'Home & Garden', 'Sports', 'Automotive'];

            return categories
              .filter((cat) => cat.toLowerCase().includes(searchTerm))
              .map((cat) => ({ label: cat, value: cat }));
          }
          return [];
        };
      },
      [],
    );

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates async operations for validation, saving, and fetching options.

**Async Patterns:**
- **Validation**: Simulates API check (SKU uniqueness with 500ms delay)
- **Save**: Simulates API call with error handling (800ms delay)
- **Options**: Simulates fetching categories from server (300ms delay)

**Features:**
- Async validation with loading indicators
- Error simulation for retry testing (10% failure rate)
- Autocomplete with async data fetching
- Loading indicators during operations

**Use this pattern when:**
- Validation requires server checks
- Data must be saved to an API
- Autocomplete options come from server
        `,
      },
    },
  },
};

// ============================================================================
// Story 4: Calculated Values (Badge Columns)
// ============================================================================

export const CalculatedValuesExample = {
  name: '4. Calculated Values & Badges',
  render: () => {
    interface OrderItem extends Record<string, unknown> {
      id: string;
      product: string;
      quantity: number;
      price: number;
      status: 'pending' | 'shipped' | 'delivered';
    }

    const [data, setData] = useState<OrderItem[]>([
      { id: '1', product: 'Laptop', quantity: 2, price: 999, status: 'shipped' },
      { id: '2', product: 'Mouse', quantity: 5, price: 29, status: 'delivered' },
      { id: '3', product: 'Keyboard', quantity: 3, price: 79, status: 'pending' },
    ]);

    const columns: EditableTableColumnDefinition<OrderItem>[] = useMemo(
      () => [
        { name: 'Product', key: 'product', type: 'text', required: true },
        { name: 'Quantity', key: 'quantity', type: 'number', cellProps: { min: 1 } },
        { name: 'Price', key: 'price', type: 'number', cellProps: { min: 0, step: 0.01 } },
        {
          name: 'Total',
          key: 'total',
          type: 'badge',
          calculateValue: (_key, data) => {
            const quantity = Number(data.quantity) || 0;
            const price = Number(data.price) || 0;
            const total = quantity * price;
            return {
              status: 'active',
              title: `$${total.toFixed(2)}`,
            };
          },
        },
        {
          name: 'Status',
          key: 'status',
          type: 'badge',
          calculateValue: (_key, data) => ({
            status: data.status === 'delivered' ? 'inactive' : 'active',
            title: String(data.status),
          }),
        },
      ],
      [],
    );

    const getValidateHandler = useCallback((_key: string) => {
      return ({ value }: { value: unknown }) => {
        if ((_key === 'quantity' || _key === 'price') && Number(value) <= 0) {
          return 'Must be greater than 0';
        }
        if (_key === 'product' && String(value).length < 2) {
          return 'Product name too short';
        }
        return null;
      };
    }, []);

    const getSaveHandler = useCallback((key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as OrderItem) : item)));
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableSorting={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Badge columns with calculated values based on other fields.

**Calculated Fields:**
- **Total**: Automatically calculated from quantity × price (displayed as green badge)
- **Status**: Read-only display of order status (green for pending/shipped, red for delivered)

**Key Concepts:**
- \`calculateValue\` returns \`{ status: 'active' | 'inactive', title: string }\` for badges
- Badge columns are read-only StatusBadge components
- Values update automatically when dependencies change
- Perfect for derived data and status indicators
- 300ms simulated save delay

**Use this pattern when:**
- Display computed values (totals, aggregates)
- Show status indicators with color coding
- Present read-only derived data
        `,
      },
    },
  },
};

// ============================================================================
// Story 5: Cross-Field Validation (Table Instance)
// ============================================================================

export const CrossFieldValidationExample = {
  name: '5. Cross-Field Validation',
  render: () => {
    interface InventoryItem extends Record<string, unknown> {
      id: string;
      sku: string;
      name: string;
      min_stock: number;
      current_stock: number;
    }

    const [data, setData] = useState<InventoryItem[]>([
      { id: '1', sku: 'ITEM-001', name: 'Widget A', min_stock: 10, current_stock: 50 },
      { id: '2', sku: 'ITEM-002', name: 'Widget B', min_stock: 5, current_stock: 20 },
      { id: '3', sku: 'ITEM-003', name: 'Widget C', min_stock: 15, current_stock: 15 },
    ]);

    const columns: EditableTableColumnDefinition<InventoryItem>[] = useMemo(
      () => [
        { name: 'SKU', key: 'sku', type: 'text', required: true },
        { name: 'Product Name', key: 'name', type: 'text', required: true },
        { name: 'Min Stock', key: 'min_stock', type: 'number', cellProps: { min: 0 } },
        { name: 'Current Stock', key: 'current_stock', type: 'number', cellProps: { min: 0 } },
        {
          name: 'Stock Status',
          key: 'stock_status',
          type: 'badge',
          calculateValue: (_key, data) => {
            const current = Number(data.current_stock) || 0;
            const min = Number(data.min_stock) || 0;
            if (current < min) return { status: 'inactive', title: 'Low Stock' };
            if (current < min * 1.5) return { status: 'warning', title: 'Warning' };
            return { status: 'active', title: 'Good' };
          },
        },
      ],
      [],
    );

    // Cross-field validation using table instance
    const getValidateHandler: CellActionsHandlerGetter<string | null> = useCallback((_key: string) => {
      return async ({ value, data, table }) => {
        if (!value || String(value).trim() === '') {
          return 'Required field';
        }

        // Validate SKU uniqueness across all rows
        if (_key === 'sku') {
          const allRows = table.getCoreRowModel().rows;
          const duplicate = allRows.find((row) => row.original.sku === value && row.original.id !== data.id);
          if (duplicate) {
            return 'SKU must be unique';
          }
        }

        // Validate current_stock >= min_stock
        if (_key === 'current_stock') {
          const minStock = Number(data.min_stock) || 0;
          if (Number(value) < minStock) {
            return `Stock cannot be less than minimum (${minStock})`;
          }
        }

        // Validate min_stock <= current_stock
        if (_key === 'min_stock') {
          const currentStock = Number(data.current_stock) || 0;
          if (Number(value) > currentStock) {
            return `Minimum cannot exceed current stock (${currentStock})`;
          }
        }

        return null;
      };
    }, []);

    const getSaveHandler = useCallback((key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setData((prev) =>
          prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as InventoryItem) : item)),
        );
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Cross-field validation using the table instance to access other rows and fields.

**Validation Rules:**
- **SKU uniqueness**: Checks across all rows using table.getCoreRowModel()
- **Stock relationship**: Current stock must be >= minimum stock
- **Bidirectional validation**: Both fields validate against each other

**Badge Column:**
- **Stock Status**: Visual indicator based on stock levels (red = Low Stock, warning = Warning, green = Good)
- Calculated from relationship between current_stock and min_stock
- Returns \`{ status: 'inactive' | 'warning' | 'active', title: string }\`

**Table Instance Usage:**
- Access all rows: \`table.getCoreRowModel().rows\`
- Access current row data: \`data\` parameter
- Check field relationships within same row
- Validate uniqueness across rows
- 400ms simulated save delay

**Use this pattern when:**
- Validate uniqueness constraints
- Check relationships between fields in the same row
- Enforce business rules across rows
        `,
      },
    },
  },
};

// ============================================================================
// Story 6: Dynamic Columns with Custom Hook
// ============================================================================

export const DynamicColumnsExample = {
  name: '6. Dynamic Columns (Stock Locations)',
  render: () => {
    interface StockLocationData extends Record<string, unknown> {
      id: string;
      sku: string;
      product: string;
      [key: `location_${string}`]: number;
    }

    // Simulate stock locations from API
    const stockLocations = [
      { id: 'loc-1', name: 'Warehouse A', code: 'WH-A' },
      { id: 'loc-2', name: 'Warehouse B', code: 'WH-B' },
      { id: 'loc-3', name: 'Store NYC', code: 'NYC' },
    ];

    const [data, setData] = useState<StockLocationData[]>([
      { id: '1', sku: 'PROD-001', product: 'Widget', location_loc1: 100, location_loc2: 50, location_loc3: 25 },
      { id: '2', sku: 'PROD-002', product: 'Gadget', location_loc1: 75, location_loc2: 30, location_loc3: 10 },
      { id: '3', sku: 'PROD-003', product: 'Device', location_loc1: 200, location_loc2: 100, location_loc3: 50 },
    ]);

    // Custom hook pattern for column definitions
    const useStockColumnsDefinition = () => {
      return useMemo(() => {
        const baseColumns: EditableTableColumnDefinition<StockLocationData>[] = [
          { name: 'SKU', key: 'sku', type: 'text', required: true },
          { name: 'Product', key: 'product', type: 'text', required: true },
        ];

        // Dynamically generate location columns
        const locationColumns = stockLocations.map((location) => ({
          name: location.name,
          key: `location_${location.id.replace('loc-', 'loc')}`,
          type: 'number' as const,
          placeholder: '0',
          cellProps: { min: 0, max: 999999 },
        })) as EditableTableColumnDefinition<StockLocationData>[];

        // Calculate total column
        const totalColumn: EditableTableColumnDefinition<StockLocationData> = {
          name: 'Total Stock',
          key: 'total',
          type: 'badge',
          calculateValue: (_key, data) => {
            const total = stockLocations.reduce((sum, loc) => {
              const locationKey = `location_${loc.id.replace('loc-', 'loc')}`;
              return sum + (Number(data[locationKey]) || 0);
            }, 0);
            return {
              status: 'active',
              title: `${total} units`,
            };
          },
        };

        return [...baseColumns, ...locationColumns, totalColumn];
      }, []);
    };

    const columns = useStockColumnsDefinition();

    const getValidateHandler = useCallback((_key: string) => {
      return ({ value }: { value: unknown }) => {
        if (_key.startsWith('location_') && Number(value) < 0) {
          return 'Stock cannot be negative';
        }
        if ((_key === 'sku' || _key === 'product') && (!value || String(value).length < 2)) {
          return 'Must be at least 2 characters';
        }
        return null;
      };
    }, []);

    const getSaveHandler = useCallback((key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setData((prev) =>
          prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as StockLocationData) : item)),
        );
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableSorting={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Dynamic column generation based on runtime data (stock locations).

**Dynamic Column Pattern:**
- Custom hook (\`useStockColumnsDefinition\`) generates columns
- Columns created from array of locations (could be from API)
- Calculated badge column sums all location stocks and displays total
- Memoized with \`useMemo\` for performance

**Key Concepts:**
- Base columns (SKU, Product) + dynamically generated location columns
- Column keys generated programmatically from location data
- Badge column aggregates dynamic fields (returns \`{ status: 'active', title: 'X units' }\`)
- Type-safe with generics and proper TypeScript indexing

**Use this pattern when:**
- Columns depend on runtime data
- Number of columns varies (e.g., locations, time periods)
- Calculated columns aggregate dynamic fields

**Implementation Details:**
- 400ms simulated save delay
- Always memoize dynamic columns to prevent re-renders
        `,
      },
    },
  },
};

// ============================================================================
// Story 7: Dynamic Column Filters
// ============================================================================

export const DynamicColumnFiltersExample = {
  name: '7. Dynamic Column Filters',
  render: () => {
    interface RegionalStock extends Record<string, unknown> {
      id: string;
      sku: string;
      product: string;
      region_east: number;
      region_west: number;
      region_north: number;
      region_south: number;
    }

    const [data, setData] = useState<RegionalStock[]>([
      {
        id: '1',
        sku: 'PROD-001',
        product: 'Widget A',
        region_east: 150,
        region_west: 80,
        region_north: 20,
        region_south: 5,
      },
      {
        id: '2',
        sku: 'PROD-002',
        product: 'Widget B',
        region_east: 0,
        region_west: 100,
        region_north: 50,
        region_south: 30,
      },
      {
        id: '3',
        sku: 'PROD-003',
        product: 'Gadget C',
        region_east: 200,
        region_west: 0,
        region_north: 150,
        region_south: 0,
      },
      {
        id: '4',
        sku: 'PROD-004',
        product: 'Device D',
        region_east: 50,
        region_west: 45,
        region_north: 0,
        region_south: 90,
      },
    ]);

    const columns: EditableTableColumnDefinition<RegionalStock>[] = useMemo(
      () => [
        { name: 'SKU', key: 'sku', type: 'text', required: true, enableSorting: true },
        { name: 'Product', key: 'product', type: 'text', required: true, enableSorting: true },
        {
          name: 'East Region',
          key: 'region_east',
          type: 'number',
          cellProps: { min: 0 },
          enableFiltering: true,
          calculateFilterValue: (value) => {
            const qty = Number(value);
            if (qty === 0) return 'Out of Stock';
            if (qty < 50) return 'Low (<50)';
            if (qty < 100) return 'Medium (50-99)';
            return 'High (100+)';
          },
        },
        {
          name: 'West Region',
          key: 'region_west',
          type: 'number',
          cellProps: { min: 0 },
          enableFiltering: true,
          calculateFilterValue: (value) => {
            const qty = Number(value);
            if (qty === 0) return 'Out of Stock';
            if (qty < 50) return 'Low (<50)';
            if (qty < 100) return 'Medium (50-99)';
            return 'High (100+)';
          },
        },
        {
          name: 'North Region',
          key: 'region_north',
          type: 'number',
          cellProps: { min: 0 },
          enableFiltering: true,
          calculateFilterValue: (value) => {
            const qty = Number(value);
            if (qty === 0) return 'Out of Stock';
            if (qty < 50) return 'Low (<50)';
            if (qty < 100) return 'Medium (50-99)';
            return 'High (100+)';
          },
        },
        {
          name: 'South Region',
          key: 'region_south',
          type: 'number',
          cellProps: { min: 0 },
          enableFiltering: true,
          calculateFilterValue: (value) => {
            const qty = Number(value);
            if (qty === 0) return 'Out of Stock';
            if (qty < 50) return 'Low (<50)';
            if (qty < 100) return 'Medium (50-99)';
            return 'High (100+)';
          },
        },
      ],
      [],
    );

    const getValidateHandler = useCallback((_key: string) => {
      return ({ value }: { value: unknown }) => {
        if (_key.startsWith('region_') && Number(value) < 0) {
          return 'Stock cannot be negative';
        }
        return null;
      };
    }, []);

    const getSaveHandler = useCallback((key: string) => {
      return async ({ value, data }: { value: unknown; data: Record<string, unknown> }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData((prev) =>
          prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as RegionalStock) : item)),
        );
        return null;
      };
    }, []);

    const getOptionsHandler = useCallback(() => {
      return async () => [];
    }, []);

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableColumnFilters={true}
        enableSorting={true}
        showControls={true}
        showPagination={false}
        dynamicColumnFilters={['region_*']}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Dynamic column filters for grouping similar columns under a single URL parameter.

**Filter Categories:**
- Out of Stock (0 units)
- Low (<50 units)
- Medium (50-99 units)
- High (100+ units)

**Key Features:**
- \`calculateFilterValue\` converts numeric values to filterable categories
- \`dynamicColumnFilters\` groups region columns: ['region_*']
- Clean URL format: \`?cf_region=region_east:Low,region_west:High\`
- Works with async-loaded columns
- 300ms simulated save delay

**Use this pattern when:**
- Multiple similar columns need filtering
- Columns are created from API data
- Want readable filter categories instead of raw values
- Need clean URL state management

**Benefits:**
- Single multi-parser handles all matching columns
- Better performance than individual parsers per column
- Clean, readable URLs with grouped filters
        `,
      },
    },
  },
};

// ============================================================================
// Story 8: Table Instance - Dynamic Options
// ============================================================================

export const TableInstanceOptionsExample = {
  name: '8. Table Instance in Options',
  render: () => {
    interface TeamMember extends Record<string, unknown> {
      id: string;
      name: string;
      role: string;
      department: string;
      manager: string;
    }

    const [data, setData] = useState<TeamMember[]>([
      { id: '1', name: 'Alice Johnson', role: 'Developer', department: 'Engineering', manager: '' },
      { id: '2', name: 'Bob Smith', role: 'Designer', department: 'Design', manager: 'Alice Johnson' },
      { id: '3', name: 'Charlie Brown', role: 'Developer', department: 'Engineering', manager: 'Alice Johnson' },
      { id: '4', name: 'Diana Prince', role: 'Manager', department: 'Engineering', manager: '' },
      { id: '5', name: 'Eve Davis', role: 'Developer', department: 'Engineering', manager: 'Diana Prince' },
    ]);

    const columns: EditableTableColumnDefinition<TeamMember>[] = useMemo(
      () => [
        { name: 'Name', key: 'name', type: 'text', required: true },
        { name: 'Role', key: 'role', type: 'autocomplete', required: true },
        { name: 'Department', key: 'department', type: 'autocomplete', required: true },
        { name: 'Manager', key: 'manager', type: 'autocomplete', required: false },
      ],
      [],
    );

    const getValidateHandler: CellActionsHandlerGetter<string | null> = useCallback((_key: string) => {
      return async ({ value, data }) => {
        await Promise.resolve();
        if ((_key === 'name' || _key === 'role' || _key === 'department') && !value) {
          return 'Required field';
        }

        // Can't be your own manager
        if (_key === 'manager' && value === data.name) {
          return 'Cannot be your own manager';
        }

        return null;
      };
    }, []);

    const getSaveHandler: CellActionsHandlerGetter<string | null> = useCallback((key: string) => {
      return async ({ value, data }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setData((prev) => prev.map((item) => (item.id === data.id ? ({ ...item, [key]: value } as TeamMember) : item)));
        return null;
      };
    }, []);

    // Use table instance to provide context-aware options
    const getOptionsHandler: CellActionsHandlerGetter<{ label: string; value: unknown }[]> = useCallback(
      (_key: string) => {
        return async ({ value, data, table }) => {
          const searchTerm = String(value || '').toLowerCase();

          if (_key === 'role') {
            const allRows = table.getCoreRowModel().rows;
            const uniqueRoles = new Set(allRows.map((row) => row.original.role).filter(Boolean));

            return Array.from(uniqueRoles)
              .filter((role) => String(role).toLowerCase().includes(searchTerm))
              .sort()
              .map((role) => ({ label: String(role), value: role }));
          }

          if (_key === 'department') {
            const allRows = table.getCoreRowModel().rows;
            const uniqueDepts = new Set(allRows.map((row) => row.original.department).filter(Boolean));

            return Array.from(uniqueDepts)
              .filter((dept) => String(dept).toLowerCase().includes(searchTerm))
              .sort()
              .map((dept) => ({ label: String(dept), value: dept }));
          }

          if (_key === 'manager') {
            const allRows = table.getCoreRowModel().rows;
            // Get all potential managers (excluding self)
            const potentialManagers = allRows
              .map((row) => row.original.name)
              .filter((name) => name !== data.name && String(name).toLowerCase().includes(searchTerm));

            return potentialManagers.sort().map((name) => ({ label: String(name), value: name }));
          }

          return [];
        };
      },
      [],
    );

    return (
      <EditableTable
        data={data}
        editableColumns={columns}
        getValidateHandler={getValidateHandler}
        getSaveHandler={getSaveHandler}
        getOptionsHandler={getOptionsHandler}
        enableGlobalFilter={true}
        enableSorting={true}
        showControls={true}
        showPagination={false}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Using table instance in getOptionsHandler to provide context-aware autocomplete options.

**Dynamic Options from Table Data:**
- **Role**: Unique roles from all existing team members
- **Department**: Unique departments from table data
- **Manager**: All team members except the current person

**Table Instance Methods:**
- \`table.getCoreRowModel().rows\` - Access all rows
- \`table.getFilteredRowModel().rows\` - Access filtered rows
- \`row.original\` - Access row data

**Benefits:**
- Options automatically update as data changes
- No need for separate state management
- Context-aware suggestions (e.g., exclude self from manager options)
- Prevents invalid selections
- 300ms simulated save delay

**Use this pattern when:**
- Options come from existing table data
- Need to filter options based on current row
- Want to ensure data consistency
- Autocomplete from user-entered values
        `,
      },
    },
  },
};

// ============================================================================
// Story 9: Loading State
// ============================================================================

export const LoadingState = {
  name: '9. Loading State',
  render: () => {
    interface Product extends Record<string, unknown> {
      id: string;
      name: string;
      sku: string;
      price: number;
      stock: number;
    }

    const columns: EditableTableColumnDefinition<Product>[] = useMemo(
      () => [
        { name: 'Product Name', key: 'name', type: 'text' },
        { name: 'SKU', key: 'sku', type: 'text' },
        { name: 'Price', key: 'price', type: 'number' },
        { name: 'Stock', key: 'stock', type: 'number' },
        { name: 'Category', key: 'category', type: 'text' },
      ],
      [],
    );

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
Loading skeleton state displayed while data is being fetched.

**Features:**
- Animated skeleton rows (shimmer effect)
- Matches table structure with proper column count
- Smooth loading animation
- Maintains layout consistency

**Use case:**
Show this state while fetching data from API.
        `,
      },
    },
  },
};

// ============================================================================
// Story 10: Empty State
// ============================================================================

export const EmptyState = {
  name: '10. Empty State',
  render: () => {
    interface Product extends Record<string, unknown> {
      id: string;
      name: string;
      sku: string;
      price: number;
      stock: number;
    }

    const columns: EditableTableColumnDefinition<Product>[] = useMemo(
      () => [
        { name: 'Product Name', key: 'name', type: 'text' },
        { name: 'SKU', key: 'sku', type: 'text' },
        { name: 'Price', key: 'price', type: 'number' },
        { name: 'Stock', key: 'stock', type: 'number' },
      ],
      [],
    );

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
Empty state displayed when no data is available.

**Use Cases:**
- No data loaded yet
- All items have been deleted
- Search/filter returned no results
- Fresh table with no entries
        `,
      },
    },
  },
};
