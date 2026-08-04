# The documentation site

A static site that explains what Prorab is and how to work with it. Four pages, one stylesheet,
one script — **no build step, no dependencies, no framework**.

```
site/
├── index.html          # the argument: the ambiguity of one ticket, the oracle rule,
│                       #   the daily loop, cost, install, when not to use it
├── walkthrough.html    # one task end to end, with the artifact each step leaves behind
├── commands.html       # reference for all ten commands — takes / writes / refuses
├── how-it-works.html   # DoD form, evidence rules, blind probing, behavior preservation,
│                       #   budget and occupancy, handoffs, doc sync, memory, comparison
├── styles.css
├── site.js             # progressive enhancement only — every page reads fine with JS off
└── favicon.svg
```

The landing page leads with the failure the framework exists for — an ordinary eight-word ticket
containing fourteen undecided questions — and then with the rule that runs through all ten commands:
an expected value comes from the requirement, never from the code. Both are interactive, because
both are easier to believe when you can click them. `walkthrough.html` is the page to present from:
it is one worked example in order, and its panels are labelled as reconstructions rather than
captured output.

## Running it locally

Any static server works, because there is nothing to build:

```sh
python3 -m http.server -d site 8000   # → http://localhost:8000
```

## Deploying to Vercel

The repository root is the Vercel project root; [`../vercel.json`](../vercel.json) points the
deployment at this directory (`outputDirectory: "site"`) with no build or install command.

1. Import `aartem1/prorab` in Vercel and keep **Framework Preset: Other**.
2. Leave Build Command, Install Command and Output Directory empty — `vercel.json` supplies them.
3. Deploy. Pushes to `main` publish automatically.

Nothing about the site is visible to Claude Code: the plugin marketplace reads
`.claude-plugin/marketplace.json` and the `plugins/*` sources, and ignores everything else in the
repository. Adding, changing or removing this directory cannot break `/plugin install`.

## Keeping it honest

The site restates content that lives in [`../README.md`](../README.md) and in the command bodies. It
is a **current-state document** in the sense of the project's own documentation-sync contract: when a
command, a flag, a tier, an artifact path or a version changes, this site changes in the same pass.

`tests/test_contracts.py` has a `SiteTests` class that enforces the mechanical part of that — every
command is listed, the advertised versions match the manifests, the install snippet matches the real
marketplace name, every page can reach every other page from its nav, and no link or in-page anchor
is dead. Prose accuracy is still on you.

Two layout rules are load-bearing and easy to undo by accident:

- **No `overflow-x: hidden` on `<html>` or `<body>`.** A clipped axis makes that element a scroll
  container, and Chrome then applies fragment jumps and `scrollIntoView` to it rather than to the
  page — `commands.html#refine` silently lands at the top. Wide blocks scroll inside their own box
  instead (`pre`, `.tablewrap`, `.pipe .track`).
- **Grid items carry `min-width: 0`.** Otherwise one unbreakable token — a test name, a path —
  widens its track and puts the whole page into a horizontal scroll on a phone.

The ambiguity widget on `index.html` keeps its questions and the silent answers to them on the same
button, as positionally-paired `data-q` / `data-a` lists. Both the panel under the sentence and the
"what an agent fills in silently" block are rendered from that one source, and every count on screen
(`n of 14`, groups still closed) is summed from it — so the widget cannot claim a number it does not
go on to list, and a question can never end up without its answer. Add a question and its answer
together, or not at all.

```sh
python3 -m unittest discover -s tests -v
```
