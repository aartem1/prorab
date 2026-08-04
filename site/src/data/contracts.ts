/**
 * Which shared contract each command loads.
 *
 * This is a fact about the framework, not prose: it reads the same in every language, so it lives
 * here rather than in a dictionary where a translator could quietly change what a command does.
 * Only the column headings and the "if browser" label are translated.
 *
 * `true` — always loaded · `false` — never · `'browser'` — only when the change has a web surface.
 */
export type ContractCell = boolean | 'browser';

export const CONTRACTS = ['project-knowledge', 'execution', 'documentation-sync', 'web-probing'];

export const CONTRACT_MATRIX: { command: string; cells: ContractCell[] }[] = [
  { command: 'refine', cells: [true, false, false, false] },
  { command: 'build', cells: [true, true, true, 'browser'] },
  { command: 'quick', cells: [true, true, true, 'browser'] },
  { command: 'verify', cells: [true, true, false, 'browser'] },
  { command: 'announce', cells: [true, false, false, false] },
  { command: 'ask', cells: [true, false, false, false] },
  { command: 'audit', cells: [true, true, false, false] },
  { command: 'refactor', cells: [true, true, true, false] },
  { command: 'lint-audit', cells: [true, true, false, false] },
  { command: 'lint-fix', cells: [true, true, true, false] },
];
