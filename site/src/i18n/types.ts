/**
 * Shapes for the parts of a dictionary that are more than a string.
 *
 * Anything structural — whether a test passes, which track a command belongs to, how many contexts
 * a tier spends — is deliberately *not* here. Those are facts about the framework, identical in
 * every language, and they live in the views. A dictionary carries only what a translator decides.
 */

/** One line of the hero schematic. `kind` picks the colour; `gap` renders as a blank line. */
export type TermLine = {
  kind: 'cmd' | 'out' | 'ok' | 'bad' | 'file' | 'note' | 'gap';
  text: string;
};

/**
 * One phrase of the ticket, and the decisions it leaves open.
 *
 * A question and the answer an agent would silently pick for it are one object, not two parallel
 * lists — so they cannot drift apart, and a question can never end up without its answer. Every
 * count the widget shows is summed from these, so it cannot claim a number it does not list.
 */
export type AmbGroup = {
  /** How the phrase is named in the list of silent defaults, e.g. `“a CSV”`. */
  label: string;
  /** The phrase as it reads inside the sentence. */
  text: string;
  /** The heading of the panel this phrase opens. */
  title: string;
  decisions: { question: string; assumed: string }[];
};

export type Card = { num: string; title: string; body: string };

/** One hop in the chain of custody, with the one thing it may not accept. */
export type Hop = { name: string; what: string; refuses: string };

/** A command as the interactive pipeline presents it. */
export type PipeNode = { step: string; name: string; cmd: string; what: string; writes: string };

/** The two verdict messages and the paragraph under them, for one state of the implementation. */
export type OracleState = { req: string; snap: string; line: string };

export type Stat = { value: string; label: string };

/** A table whose columns are prose. `rows` must be as wide as `head` — the view does not pad. */
export type Table = { head: string[]; rows: string[][] };

/** An emoji-keyed legend row, as the unclarity map uses. */
export type LegendRow = { mark: string; text: string };

export type CmdLink = { cmd: string; what: string };

/**
 * CLDR plural categories, for counts that appear in the interface.
 *
 * English needs two forms and Russian needs three, so a `n === 1` test in the script would be
 * wrong in one of them. `Intl.PluralRules` picks the category; this supplies the words.
 * A locale only fills the categories it actually uses — `other` is required, the rest are not.
 */
export type Plural = {
  one?: string;
  few?: string;
  many?: string;
  other: string;
};
