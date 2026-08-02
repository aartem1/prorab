# The documentation site

A static site that explains what Prorab is and how to work with it. Three pages, one stylesheet,
one script — **no build step, no dependencies, no framework**.

```
site/
├── index.html          # landing: why, the animated terminal, budget dial, interactive pipeline, install
├── commands.html       # reference for all ten commands
├── how-it-works.html   # tiers, occupancy limits, hashed handoffs, memory, doc sync, comparison
├── styles.css
├── site.js             # progressive enhancement only — every page reads fine with JS off
└── favicon.svg
```

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
marketplace name, and no page references a plugin file that does not exist. Prose accuracy is still
on you.

```sh
python3 -m unittest discover -s tests -v
```
