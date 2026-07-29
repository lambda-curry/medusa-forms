---
'@lambdacurry/medusa-forms': patch
---

Preserve exact decimal currency digits while typing and editing, without caret jumps or float rounding.

ControlledCurrencyInput uses a precision-safe currency field (no Number()-based formatting), keeps a focused draft for intermediate decimals like `19.`, disables group separators while editing, and stores high-magnitude values as strings when `valueAsNumber` / `setValueAs` would lose IEEE-754 precision.
