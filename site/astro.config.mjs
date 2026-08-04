// @ts-check
import { defineConfig } from 'astro/config';

/* The canonical origin, used for `hreflang` and Open Graph URLs. Google requires those to be
   fully qualified, and hard-coding a domain here would go stale the moment one is attached — so
   take it from the deployment. Vercel exports the production domain as
   VERCEL_PROJECT_PRODUCTION_URL; SITE_URL overrides it for anyone deploying elsewhere. */
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:4321';

export default defineConfig({
  site,

  /* `preserve` mirrors the pages directory exactly: `commands.astro` → `/commands.html`, keeping
     the URLs this site already had so links shared before this rewrite still resolve, and
     `ru/index.astro` → `/ru/index.html`, so the locale root is a directory index. Plain `file`
     would flatten that second one to `/ru.html` and break every link to the Russian home page.
     Every internal link is written out in full by `src/i18n/index.ts`; nothing depends on the
     server's clean-URL behaviour. */
  build: { format: 'preserve' },

  /* English stays at the root, Russian lives under /ru/. No `fallback` locale is configured: a
     page that exists in one language and not the other should be a build-visible omission, not a
     route that silently serves English from a Russian URL. Completeness is enforced twice over —
     the dictionary is type-checked against the English one, and `tests/test_contracts.py` checks
     that both locales route to all four pages. */
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

  /* The site ships no framework runtime. What little JavaScript there is enhances markup that
     already reads correctly without it, so there is nothing to prefetch or hydrate. */
  prefetch: false,
  devToolbar: { enabled: false },
});
