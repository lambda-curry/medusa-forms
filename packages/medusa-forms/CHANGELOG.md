# @lambdacurry/medusa-forms

## 0.3.1

### Patch Changes

- 4880202: Fix currency input regex to reject malformed numbers and migrate to storybook/test v9

  - Tighten number parsing: strip non-numeric, then clamp to valid format (no more `1.2.3` or `1-2-3`)
  - Migrate `@storybook/test@8` → `storybook/test` (v9), removing compatibility warning
