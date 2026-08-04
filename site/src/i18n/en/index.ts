import { common } from './common';
import { overview } from './overview';
import { walkthrough } from './walkthrough';
import { commands } from './commands';
import { howItWorks } from './how-it-works';

export const en = { common, overview, walkthrough, commands, howItWorks };

/**
 * The shape every other language must have.
 *
 * `en` is the reference: each file under `src/i18n/ru/` annotates itself with the matching type,
 * so a missing key, an extra key or a renamed one is a build error rather than a blank on a page
 * nobody happened to open. Values are typed `string`, not the literal English text — a translation
 * changes the words, never the structure.
 */
export type Dict = typeof en;
