/**
 * Locales, routes, and the dictionary lookup.
 *
 * Adding a language is three moves: an entry in `LANGS`, a directory under `src/i18n/`, and four
 * three-line files under `src/pages/<lang>/`. Nothing about a page's structure is copied — the
 * views in `src/views/` are written once and read whichever dictionary the current locale names.
 *
 * This module runs at build time only. Client scripts must not import it: they take the strings
 * they need from the DOM, so a script can never disagree with the page it shipped with.
 */
import { REPO_URL } from '../data/marketplace';
import { en } from './en';
import { ru } from './ru';

export const LANGS = {
  en: { label: 'English', short: 'EN', hreflang: 'en' },
  ru: { label: 'Русский', short: 'RU', hreflang: 'ru' },
} as const;

export type Lang = keyof typeof LANGS;

/** The locale served from the root of the site. Must match `i18n.defaultLocale` in astro.config. */
export const DEFAULT_LANG: Lang = 'en';

export const LANG_CODES = Object.keys(LANGS) as Lang[];

export const PAGES = ['overview', 'walkthrough', 'commands', 'how-it-works'] as const;
export type Page = (typeof PAGES)[number];

/* Links are written out in full rather than left to the server's clean-URL behaviour, and they
   keep the `.html` suffix the site already used, so URLs shared before the rewrite still land. */
const FILES: Record<Page, string> = {
  overview: '',
  walkthrough: 'walkthrough.html',
  commands: 'commands.html',
  'how-it-works': 'how-it-works.html',
};

/** Root-absolute URL of `page` in `lang` — `/commands.html`, `/ru/commands.html`, `/`, `/ru/`. */
export function href(lang: Lang, page: Page): string {
  return (lang === DEFAULT_LANG ? '/' : `/${lang}/`) + FILES[page];
}

/**
 * Expand the link placeholders a dictionary string may contain.
 *
 * Prose sometimes has to link to another page, and the target differs per locale — so the
 * dictionary writes `{commands}` and this resolves it. Translators never handle a URL, and a
 * Russian paragraph cannot accidentally link to the English page.
 */
const PLACEHOLDER = /\{(overview|walkthrough|commands|how-it-works|repo)\}/g;

function expand(text: string, lang: Lang): string {
  return text.replace(PLACEHOLDER, (_, key: string) =>
    key === 'repo' ? REPO_URL : href(lang, key as Page),
  );
}

/** Expand every string in a dictionary once, at build time, so no view can forget to. */
function expandDeep<T>(value: T, lang: Lang): T {
  if (typeof value === 'string') return expand(value, lang) as T;
  if (Array.isArray(value)) return value.map((item) => expandDeep(item, lang)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, expandDeep(item, lang)]),
    ) as T;
  }
  return value;
}

const DICTS = {
  en: expandDeep(en, 'en'),
  ru: expandDeep(ru, 'ru'),
};

/** The dictionary for `lang`. Every view takes its text from here and holds no English of its own. */
export function useTranslations(lang: Lang) {
  return DICTS[lang];
}

/**
 * Narrow whatever Astro reports as the current locale to a `Lang`.
 *
 * `Astro.currentLocale` is `string | undefined`: undefined on a route outside the configured
 * locales. Falling back to the default is right for this site — every page lives under a locale,
 * so the fallback is unreachable in practice and must not be a crash if that ever changes.
 */
export function toLang(value: string | undefined): Lang {
  return LANG_CODES.includes(value as Lang) ? (value as Lang) : DEFAULT_LANG;
}

export type { Dict } from './en';
