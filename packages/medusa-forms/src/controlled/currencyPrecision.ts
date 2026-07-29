/** Group separator helper that never coerces through Number (IEEE-754 safe). */
const GROUP_EVERY_THREE_DIGITS = /\B(?=(\d{3})+(?!\d))/g;
const LEADING_ZEROS = /^0+/;
const TRAILING_ZEROS = /0+$/;

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

  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [wholeRaw = '0', fraction = ''] = unsigned.split('.');
  const whole = wholeRaw === '' ? '0' : wholeRaw;
  const normalizedWhole = whole.replace(LEADING_ZEROS, '') || '0';
  const normalizedFraction = fraction.replace(TRAILING_ZEROS, '');
  const normalized = normalizedFraction
    ? `${negative ? '-' : ''}${normalizedWhole}.${normalizedFraction}`
    : `${negative ? '-' : ''}${normalizedWhole}`;
  // Shortest float64 round-trip (ECMAScript ToString); differs only when digits are lost
  const roundTrip = Object.is(numeric, -0) ? '-0' : String(numeric);
  if (normalized !== roundTrip) {
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
