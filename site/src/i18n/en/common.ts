/**
 * Text that every page shares: the chrome around the content, and the strings the small amount of
 * JavaScript needs at runtime.
 *
 * Values may contain inline HTML — the prose on this site is full of `<code>`, `<strong>` and
 * `<em>`, and a translation needs the same. Views render them with `set:html`. Nothing here comes
 * from user input; it is all authored in this repository.
 */
export const common = {
  skip: 'Skip to content',

  nav: {
    label: 'Primary',
    sections: 'Sections',
    overview: 'Overview',
    walkthrough: 'Walkthrough',
    commands: 'Commands',
    'how-it-works': 'How it works',
    github: 'GitHub',
  },

  lang: {
    /** Labels the language switcher for a screen reader, which cannot see the EN / RU pair. */
    label: 'Language',
    /** Announces where a switcher link goes, e.g. "Read this page in Russian". */
    to: 'Read this page in Russian',
  },

  footer: {
    tagline: 'Prorab — a structured development workflow for Claude Code.',
    github: 'GitHub',
    changelog: 'Changelog',
  },

  /* Strings the runtime needs. They reach the browser through the DOM — a data attribute, or a
     JSON block a component emits — never through a second fetch that could disagree with the page
     it belongs to. */
  ui: {
    copy: 'copy',
    copied: 'copied',
    copyFailed: 'select + ⌘C',
  },
};

export type Common = typeof common;
