import enMessages from '../../../messages/en.json';
import koMessages from '../../../messages/ko.json';

function collectKeys(
  value: Record<string, unknown>,
  prefix = '',
): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;

    if (
      nestedValue !== null &&
      typeof nestedValue === 'object' &&
      !Array.isArray(nestedValue)
    ) {
      return collectKeys(nestedValue as Record<string, unknown>, nextKey);
    }

    return [nextKey];
  });
}

describe('i18n message parity', () => {
  it('keeps English and Korean message keys aligned', () => {
    const enKeys = collectKeys(enMessages);
    const koKeys = collectKeys(koMessages);

    expect(koKeys).toEqual(enKeys);
  });
});
