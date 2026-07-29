# @lambdacurry/medusa-forms

## 0.3.2

### Patch Changes

- 3564f44: Preserve exact decimal currency digits while typing and editing, without caret jumps or float rounding.

  ControlledCurrencyInput uses a precision-safe currency field (no Number()-based formatting), keeps a focused draft for intermediate decimals like `19.`, disables group separators while editing, and stores high-magnitude values as strings when `valueAsNumber` / `setValueAs` would lose IEEE-754 precision.

## 0.3.1

### Patch Changes

- 4880202: Fix currency input regex to reject malformed numbers and migrate to storybook/test v9

  - Tighten number parsing: strip non-numeric, then clamp to valid format (no more `1.2.3` or `1-2-3`)
  - Migrate `@storybook/test@8` → `storybook/test` (v9), removing compatibility warning
