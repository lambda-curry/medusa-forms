/** Group separator helper that never coerces through Number (IEEE-754 safe). */
const GROUP_EVERY_THREE_DIGITS = /\B(?=(\d{3})+(?!\d))/g;

/**
 * True when `Number(value)` cannot preserve the exact decimal digits (IEEE-754 float64).
 * Large magnitudes quietly round (e.g. 12556001111166337.69 → 12556001111166338).
 */
export const isNumberConversionLossy = (value: string): boolean => {
  if (value === '' || value === '-' || value === '.' || value === '-.') {
    return false;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return true;
  }

  const unsigned = value.startsWith('-') ? value.slice(1) : value;
  const [wholeRaw = '0', fraction = ''] = unsigned.split('.');
  const whole = wholeRaw === '' ? '0' : wholeRaw;
  const wholeWithoutLeadingZeros = whole.replace(/^0+/, '') || (fraction ? '' : '0');
  const significant = `${wholeWithoutLeadingZeros}${fraction}`.replace(/^0+/, '') || '0';

  // float64 uniquely represents roughly 15–16 significant decimal digits
  if (significant.length > 15) {
    return true;
  }

  try {
    if (BigInt(whole) !== BigInt(Math.trunc(Math.abs(numeric)))) {
      return true;
    }
  } catch {
    return true;
  }

  return false;
};

/** Format a numeric string with group separators without using Number(). */
export const formatCurrencyGroups = (value: string, enabled: boolean): string => {
  if (!enabled || value === '' || value === '-' || value === '.' || value === '-.') {
    return value;
  }

  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [whole, fraction] = unsigned.split('.');
  const groupedWhole = whole.replace(GROUP_EVERY_THREE_DIGITS, ',');
  const body = fraction != null ? `${groupedWhole}.${fraction}` : groupedWhole;
  return negative ? `-${body}` : body;
};
