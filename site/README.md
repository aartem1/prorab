# The documentation site

A four-page static site explaining what Prorab is and how to work with it, in **English and
Russian**. Built with [Astro](https://astro.build); the output is a directory of HTML files with no
server, no adapter and no framework runtime in the browser.

```
site/
├── astro.config.mjs        # locales, routing, canonical origin
├── package.json            # astro + astro check; nothing else
├── public/favicon.svg
└── src/
    ├── pages/              # routes only — three lines each
    │   ├── index.astro          → /                 walkthrough.astro → /walkthrough.html
    │   ├── commands.astro       → /commands.html    how-it-works.astro → /how-it-works.html
    │   └── ru/…                 → /ru/…             the same four, in Russian
    ├── views/              # the page bodies: Overview, Walkthrough, Commands, HowItWorks
    ├── layouts/Base.astro  # head, hreflang, header with the language switcher, rail, footer
    ├── components/         # Terminal, Ambiguity, Oracle, Blind, Pipeline, Budget, and helpers
    ├── i18n/
    │   ├── index.ts        # locales, routes, dictionary lookup
    │   ├── types.ts        # shapes for the parts of a dictionary that are more than a string
    │   ├── en/             # the reference dictionary — `type Dict = typeof en`
    │   └── ru/             # `const ru: Dict = …`
    ├── data/               # facts read from the repository, not prose
    ├── scripts/chrome.ts   # sticky header, reveal, rail, copy buttons, anchor landing
    └── styles/global.css   # one stylesheet
```

## How a page exists in two languages without existing twice

**Structure is written once.** A view under `src/views/` is the whole body of a page; the files
under `src/pages/` are three-line routes that hand it the current locale. Adding a language is four
route stubs, one dictionary directory, and one entry in `LANGS`.

**Text lives in a dictionary, one per language.** `src/i18n/en/` is the reference: it exports
`type Dict = typeof en`, and `src/i18n/ru/index.ts` declares `const ru: Dict`. A missing key, an
extra key or a renamed one is a **compile error** — `npm run build` runs `astro check` first, so a
hole in a translation fails the deploy instead of rendering as a blank on a page nobody opened.

Values may contain inline HTML, because this prose is full of `<code>` and `<strong>` and a
translation needs the same; views render them with `set:html`. Where a paragraph has to link to
another page, it writes `{commands}` and `src/i18n/index.ts` expands it to the right URL for that
locale — a translator never handles a URL, and a Russian paragraph cannot link to the English page.

**What is not translated.** Facts about the framework are not prose and do not live in a
dictionary: plugin versions and the marketplace name are read from
[`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) at build time
(`src/data/marketplace.ts`), the contract matrix and command registry live in `src/data/`, and
which test passes in which state of the oracle demo lives in the component. Only what a translator
decides belongs in `src/i18n/`.

Word order is a translator's decision too. The ticket sentence on the landing page is a template
with a slot per clickable phrase — `“{0} {1} {2} to {3}.”` in English,
`«{0} {2} {1} {3}.»` in Russian — so the phrases keep their meaning while the sentence reads
naturally in each language.

Counts in the interface go through `Intl.PluralRules` with CLDR categories, because English needs
two forms where Russian needs three and an `n === 1` test would be wrong in one of them.

## Running it locally

```sh
npm --prefix site install
npm --prefix site run dev       # → http://localhost:4321
npm --prefix site run build     # astro check && astro build → site/dist
npm --prefix site run preview
```

`node_modules/` and `dist/` are not committed.

## Deploying to Vercel

[`../vercel.json`](../vercel.json) installs and builds inside `site/` and publishes `site/dist`.
Nothing has to be set in the dashboard, and **Framework Preset: Other** is correct — the output is
plain static files.

Nothing about the site is visible to Claude Code: the plugin marketplace reads
`.claude-plugin/marketplace.json` and the `plugins/*` sources, and ignores everything else in the
repository. Adding, changing or removing this directory cannot break `/plugin install`.

## Keeping it honest

The site restates content that lives in [`../README.md`](../README.md) and in the command bodies. It
is a **current-state document** in the sense of the project's own documentation-sync contract: when a
command, a flag, a tier, an artifact path or a version changes, this site changes in the same pass —
**in every language**.

`tests/test_contracts.py` has a `SiteTests` class that enforces the mechanical part: every command
documented in every language, every language routing to every page, every translation typed against
the reference dictionary, versions read from the manifest rather than copied into prose, and nothing
personal from the manifest's `owner` block crossing over. Prose accuracy is still on you.

```sh
python3 -m unittest discover -s tests -v
```

Two layout rules are load-bearing and easy to undo by accident — `SiteTests` checks both:

- **No `overflow-x: hidden` on `<html>` or `<body>`.** A clipped axis makes that element a scroll
  container, and Chrome then applies fragment jumps and `scrollIntoView` to it rather than to the
  page — `commands.html#refine` silently lands at the top. Wide blocks scroll inside their own box
  instead (`pre`, `.tablewrap`, `.pipe .track`).
- **Grid items carry `min-width: 0`.** Otherwise one unbreakable token — a test name, a path —
  widens its track and puts the whole page into a horizontal scroll on a phone.

One interaction rule is worth stating, because it is the reason the interactive sections are built
the way they are. **Everything is rendered server-side, including every panel a click would reveal.**
The scripts add a `js` class to their widget and only then start hiding things. With JavaScript off,
the ambiguity widget is a complete list of all fourteen open decisions and the pipeline is a complete
command reference — rather than an empty box inviting a click that does nothing. Anything a script
needs to say at runtime reaches it through a `data-` attribute or a JSON block rendered into the same
page, never through a second fetch that could disagree with the language it shipped with.
