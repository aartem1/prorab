/**
 * The commands, in the order the reference presents them.
 *
 * Ids, invocations and tracks are structure: the anchor has to be the same in every language so a
 * link to `commands.html#refine` survives a language switch, and a command's namespace is not a
 * translator's decision. The prose for each id lives in the `commands` file of each dictionary.
 */
export type CommandId =
  | 'refine'
  | 'build'
  | 'quick'
  | 'revise'
  | 'verify'
  | 'announce'
  | 'ask'
  | 'audit'
  | 'refactor'
  | 'lint-audit'
  | 'lint-fix';

export const PRODUCT_COMMANDS: CommandId[] = [
  'refine',
  'build',
  'quick',
  'revise',
  'verify',
  'announce',
  'ask',
];

export const TECH_COMMANDS: CommandId[] = ['audit', 'refactor', 'lint-audit', 'lint-fix'];

export const ALL_COMMANDS: CommandId[] = [...PRODUCT_COMMANDS, ...TECH_COMMANDS];

/** `refine` → `/prorab:refine`, `audit` → `/prorab-tech:audit`. */
export function invocation(id: CommandId): string {
  return `${TECH_COMMANDS.includes(id) ? '/prorab-tech' : '/prorab'}:${id}`;
}
