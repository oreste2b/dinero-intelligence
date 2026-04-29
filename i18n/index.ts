// Minimal i18n utility — no external dependencies.
// Supports nested dot-notation keys and {{variable}} interpolation.
// Add languages by dropping a new JSON file and extending the `Locale` type.

import da from './da.json';
import es from './es.json';

export type Locale = 'da' | 'es';
export const DEFAULT_LOCALE: Locale = 'da';

const dictionaries: Record<Locale, Record<string, unknown>> = { da, es };

/**
 * Resolve a dot-notation key from a nested object.
 * e.g. get(dict, 'auth.loginWithDinero') → "Log ind med Dinero.dk"
 */
function resolve(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Replace {{variable}} placeholders.
 * e.g. interpolate('Prøv igen om {{seconds}} sekunder.', { seconds: 30 })
 */
function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

/**
 * Translate a key for the given locale.
 *
 * @example
 *   t('da', 'auth.loginWithDinero')          // "Log ind med Dinero.dk"
 *   t('es', 'errors.rateLimited', { seconds: 30 })
 */
export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const value =
    resolve(dict as Record<string, unknown>, key) ??
    resolve(dictionaries[DEFAULT_LOCALE] as Record<string, unknown>, key) ??
    key; // fallback: return the key itself so the UI never breaks

  return interpolate(value, vars);
}

/**
 * Create a translator pre-bound to a locale.
 * Useful in Server Components and Route Handlers where locale is resolved once.
 *
 * @example
 *   const tr = createTranslator('da');
 *   tr('dashboard.resultat') // "Resultat"
 */
export function createTranslator(locale: Locale) {
  return (key: string, vars?: Record<string, string | number>) => t(locale, key, vars);
}

/**
 * Detect locale from the Accept-Language header.
 * Falls back to DEFAULT_LOCALE if no supported locale is found.
 */
export function detectLocale(acceptLanguage?: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const supported: Locale[] = ['da', 'es'];
  const tags = acceptLanguage.split(',').map(s => s.split(';')[0].trim().toLowerCase());
  for (const tag of tags) {
    const lang = tag.slice(0, 2) as Locale;
    if (supported.includes(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}
