---
'@lambdacurry/medusa-forms': patch
---

Preserve decimal currency input while typing and editing.

ControlledCurrencyInput kept a draft display value so intermediate decimals like `19.` and values like `19.99` survive `valueAsNumber` / `setValueAs` coercion without truncating or blocking valid input.
