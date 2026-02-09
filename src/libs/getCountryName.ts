/**
 * Convert ISO 3166-1 alpha-2 country code to full country name
 * Uses browser's built-in Intl.DisplayNames API
 *
 * @param countryCode - Two-letter country code (e.g., 'KR', 'US', 'JP')
 * @param locale - Locale for the country name (default: 'en')
 * @returns Full country name or original code if conversion fails
 *
 * @example
 * getCountryName('KR') // 'South Korea'
 * getCountryName('US') // 'United States'
 * getCountryName('--') // '--' (unchanged)
 */
export function getCountryName(
  countryCode: string,
  locale: string = 'en',
): string {
  if (
    countryCode === '--' ||
    countryCode === 'etc' ||
    countryCode.length !== 2
  ) {
    return countryCode;
  }

  try {
    const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
    return regionNames.of(countryCode.toUpperCase()) || countryCode;
  } catch {
    return countryCode;
  }
}
