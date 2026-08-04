/**
 * Facts about the plugins, read from the real manifest at build time.
 *
 * Version numbers and the marketplace name are not prose and do not belong in a dictionary: a
 * translated copy of `0.15.0` is just a second place for it to go stale. Reading
 * `.claude-plugin/marketplace.json` directly means the site cannot advertise a version the
 * marketplace does not ship.
 *
 * Only the fields listed here cross over. The manifest also carries an `owner` block with a name
 * and an email address; nothing on this site may expose it, so it is never read.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/* Walk up from wherever the build was started rather than resolving against `import.meta.url`:
   this module is bundled before it runs, so at run time that URL points at a chunk in `dist/`
   and not at this file. The walk is also indifferent to whether the build was invoked from
   `site/` or from the repository root. */
function findManifest(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(dir, '.claude-plugin', 'marketplace.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Could not find .claude-plugin/marketplace.json above ' +
      `${process.cwd()} — the site reads plugin versions from the real manifest.`,
  );
}

type Manifest = {
  name: string;
  plugins: { name: string; version: string; source: string }[];
};

const manifest = JSON.parse(readFileSync(findManifest(), 'utf8')) as Manifest;

/** The marketplace name, as `/plugin marketplace add` resolves it. */
export const MARKETPLACE = manifest.name;

/** The GitHub repository the marketplace is installed from. */
export const REPO = 'aartem1/prorab';
export const REPO_URL = `https://github.com/${REPO}`;
export const CHANGELOG_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;

/** Every plugin, in manifest order: the name to install and the version currently published. */
export const PLUGINS = manifest.plugins.map(({ name, version }) => ({ name, version }));

/** `/plugin` lines for the install section, generated so they cannot drift from the manifest. */
export const INSTALL_LINES = [
  `marketplace add ${REPO}`,
  ...PLUGINS.map((plugin) => `install ${plugin.name}@${MARKETPLACE}`),
];
