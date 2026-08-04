import type { Dict } from '../en';
import { common } from './common';
import { overview } from './overview';
import { walkthrough } from './walkthrough';
import { commands } from './commands';
import { howItWorks } from './how-it-works';

/**
 * The Russian dictionary.
 *
 * Typed as `Dict` — the shape of the English one — so a missing key, an extra key or a renamed one
 * fails the build. Command names, file paths, code identifiers and flags stay in English because
 * that is what you actually type; everything a person reads is translated, including the simulated
 * command output, which a Russian-speaking user would genuinely see in Russian.
 */
export const ru: Dict = { common, overview, walkthrough, commands, howItWorks };
