/* Prorab site — progressive enhancement only. Every page reads fine with JS off. */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---- sticky header ------------------------------------------------- */
  const header = $('header.site');
  if (header) {
    const onScroll = () => header.classList.toggle('stuck', window.scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- pointer glow -------------------------------------------------- */
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    let raf = 0;
    addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.body.style.setProperty('--mx', `${e.clientX}px`);
        document.body.style.setProperty('--my', `${e.clientY}px`);
      });
    }, { passive: true });
  }

  /* ---- reveal on scroll ---------------------------------------------- */
  const revealed = $$('[data-reveal]');
  if (revealed.length && 'IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add('in'));
  }

  /* ---- headline word reveal ------------------------------------------ */
  $$('[data-words]').forEach((el) => {
    const html = el.innerHTML;
    // split on spaces outside tags; each token keeps its own markup
    el.innerHTML = html
      .split(/\s+/)
      .filter(Boolean)
      .map((word, i) => `<span class="w" style="animation-delay:${60 + i * 55}ms">${word}</span>`)
      .join(' ');
  });

  /* ---- section rail (scroll spy) -------------------------------------- */
  const rail = $('[data-rail]');
  if (rail) {
    const marks = $$('[data-rail-label][id]');
    if (!marks.length) {
      rail.remove();
    } else {
      marks.forEach((mark) => {
        const link = document.createElement('a');
        link.href = `#${mark.id}`;
        link.innerHTML = `<i></i><span>${mark.dataset.railLabel}</span>`;
        rail.appendChild(link);
      });
      const links = $$('a', rail);
      const setCurrent = (id) => links.forEach((a) => {
        a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`));
      });
      setCurrent(marks[0].id);
      if ('IntersectionObserver' in window) {
        const seen = new Map();
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
          let best = null;
          seen.forEach((ratio, id) => {
            if (ratio > 0 && (!best || ratio > best.ratio)) best = { id, ratio };
          });
          if (best) setCurrent(best.id);
        }, { threshold: [0, 0.15, 0.4, 0.75], rootMargin: '-15% 0px -45% 0px' });
        marks.forEach((m) => io.observe(m));
      }
    }
  }

  /* ---- copy buttons on code blocks ----------------------------------- */
  $$('pre').forEach((pre) => {
    const wrap = document.createElement('div');
    wrap.className = 'copyblock';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'copy';
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText.trim());
        button.textContent = 'copied';
      } catch {
        button.textContent = 'select + ⌘C';
      }
      setTimeout(() => { button.textContent = 'copy'; }, 1600);
    });
    wrap.appendChild(button);
  });

  /* ---- hero terminal -------------------------------------------------- */
  const term = $('[data-term]');
  if (term) {
    const SCRIPT = [
      ['cmd',  '/prorab:refine  add a CSV export to the reports page'],
      ['out',  '   read 6 files · 2 Explore contexts'],
      ['out',  '   🟥 "everything the user sees" vs "the current filter" — which one?'],
      ['out',  '   🟧 empty result: header-only file, or a refusal?'],
      ['out',  '   🟨 assumed: UI labels as headers, not field names   [?: confirm]'],
      ['ok',   '   ✓ settled — 14 questions raised, 12 answered, 2 kept as explicit forks'],
      ['file', '   → IDEA-csv-export.md   DoD: 7 checkable items · Code map: 6 files, hashed'],
      ['gap',  ''],
      ['cmd',  '/clear  ·  /prorab:build'],
      ['out',  '   recon reused: 6/6 hashes fresh · tier M · 6 contexts'],
      ['out',  '   DoD #2 → test written before the code'],
      ['bad',  '   ✗ FAILED  AssertionError: expected 47, got 0   ← red for the right reason'],
      ['ok',   '   ✓ green · skeptic: 7/7 items, every expected value traced to the DoD'],
      ['file', '   → IMPL-csv-export.md'],
      ['gap',  ''],
      ['cmd',  '/prorab:verify'],
      ['out',  '   charter: 4 surfaces · prober gets no path, no diff, no symbol'],
      ['out',  '   downloaded the file, parsed it: 47 data rows, header = UI labels'],
      ['ok',   '   ✓ mutation: shift the filter boundary → the suite goes red'],
      ['file', '   → VERIFY-csv-export.md'],
      ['note', '   nothing committed. nothing pushed. that is your call.'],
    ];

    const body = $('.body', term);
    const caret = document.createElement('span');
    caret.className = 'caret';

    const renderAll = () => {
      body.innerHTML = '';
      SCRIPT.forEach(([kind, text]) => {
        const line = document.createElement('span');
        line.className = `l tl-${kind === 'gap' ? 'out' : kind}`;
        line.textContent = kind === 'gap' ? ' ' : text;
        body.appendChild(line);
      });
      body.appendChild(caret);
    };

    let token = 0;

    // Frame-driven, not timer-driven: accurate while the tab is visible, and paused (rather than
    // throttled into a crawl) while it is not. `step` is called with progress 0→1.
    const animate = (ms, step) => new Promise((resolve) => {
      const start = performance.now();
      const frame = (now) => {
        const p = Math.min(1, (now - start) / ms);
        if (step) step(p);
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });
    const sleep = (ms) => animate(ms);

    async function play() {
      const mine = ++token;
      body.innerHTML = '';
      body.appendChild(caret);

      for (const [kind, text] of SCRIPT) {
        if (mine !== token) return;
        const line = document.createElement('span');
        line.className = `l tl-${kind === 'gap' ? 'out' : kind}`;
        body.insertBefore(line, caret);

        if (kind === 'gap') {
          line.textContent = ' ';
          await sleep(200);
          continue;
        }
        if (kind === 'cmd') {
          await animate(text.length * 16, (p) => {
            if (mine === token) line.textContent = text.slice(0, Math.ceil(text.length * p));
          });
          if (mine !== token) return;
          await sleep(230);
        } else {
          line.textContent = text;
          await sleep(kind === 'file' || kind === 'bad' ? 340 : 200);
        }
      }
    }

    if (reduced) {
      renderAll();
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
      }, { threshold: 0.25 });
      io.observe(term);
    } else {
      play();
    }

    const replay = $('[data-replay]', term);
    if (replay) replay.addEventListener('click', () => (reduced ? renderAll() : play()));
  }

  /* ---- annotated sentence: the open decisions inside one ticket -------- */
  const amb = $('[data-amb]');
  if (amb) {
    const spans = $$('.sp', amb);
    const detail = $('.detail', amb);
    const questions = (span) => span.dataset.q.split('|').map((s) => s.trim()).filter(Boolean);

    // The counter is computed from the markup, so it can never drift from what is listed.
    const total = spans.reduce((sum, span) => sum + questions(span).length, 0);
    const counter = $('.count b', amb);
    if (counter) counter.textContent = String(total);

    const select = (span) => {
      spans.forEach((s) => s.setAttribute('aria-expanded', String(s === span)));
      detail.classList.toggle('v', span.classList.contains('ghost'));
      detail.innerHTML = `<h3>${span.dataset.title}</h3><ol>${
        questions(span).map((q) => `<li>${q}</li>`).join('')
      }</ol>`;
      detail.classList.remove('swap');
      void detail.offsetWidth;
      detail.classList.add('swap');
    };

    spans.forEach((span) => span.addEventListener('click', () => select(span)));
    if (spans.length) select(spans[0]);

    const toggle = $('[data-assume]', amb);
    const assumed = $('.assumed', amb);
    if (toggle && assumed) {
      const labels = [toggle.textContent.trim(), 'hide the silent defaults'];
      toggle.addEventListener('click', () => {
        const on = toggle.getAttribute('aria-pressed') !== 'true';
        toggle.setAttribute('aria-pressed', String(on));
        toggle.textContent = labels[on ? 1 : 0];
        assumed.hidden = !on;
        amb.classList.toggle('assuming', on);
      });
    }
  }

  /* ---- where does the expected value come from? ------------------------ */
  const oracle = $('[data-oracle]');
  if (oracle) {
    const req  = $('[data-case="req"]',  oracle);
    const snap = $('[data-case="snap"]', oracle);
    const line = $('.verdictline', oracle);

    // Three states of one implementation, against two tests that differ only in where their
    // expected value came from. DoD #2 fixes the answer at 47 rows.
    const STATES = {
      46: {
        req:  ['fail', 'E   AssertionError: expected 47, got 46', '1 failed'],
        snap: ['pass', '1 passed — the file equals export.golden.csv', '1 passed'],
        line: 'The snapshot did not <em>miss</em> the bug — it <strong>recorded</strong> it. ' +
              'The golden file was produced by running this exact code, so 46 is now the ' +
              'specification, and it will stay green for as long as the bug survives.',
      },
      40: {
        req:  ['fail', 'E   AssertionError: expected 47, got 40', '1 failed'],
        snap: ['fail', 'E   AssertionError: file differs from export.golden.csv', '1 failed'],
        line: 'Both red — but only one of them knows what the right answer is. The snapshot ' +
              'can report that the output changed; it cannot report that the output is wrong.',
      },
      47: {
        req:  ['pass', '1 passed — 47 data rows, header row matches', '1 passed'],
        snap: ['fail', 'E   AssertionError: file differs from export.golden.csv', '1 failed'],
        line: 'Fixing the bug turns the snapshot red, and the reflex is to re-record the golden ' +
              'file. That is the whole failure mode: an expected value taken from the code always ' +
              'ends up agreeing with the code.',
      },
    };

    const paint = (box, [status, message]) => {
      box.classList.remove('pass', 'fail', 'swap');
      box.classList.add(status);
      const pill = $('.pill', box);
      pill.className = `pill ${status === 'pass' ? 'ok' : 'bad'}`;
      pill.textContent = status === 'pass' ? 'passed' : 'failed';
      $('.verdict', box).textContent = message;
      void box.offsetWidth;
      box.classList.add('swap');
    };

    const apply = (key) => {
      const state = STATES[key];
      paint(req, state.req);
      paint(snap, state.snap);
      line.innerHTML = state.line;
      line.classList.remove('swap');
      void line.offsetWidth;
      line.classList.add('swap');
      $$('.seg button', oracle).forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.impl === key));
      });
    };

    $$('.seg button', oracle).forEach((b) => {
      b.addEventListener('click', () => apply(b.dataset.impl));
    });
    apply('46');
  }

  /* ---- blindness: what the prober may and may not see ------------------ */
  $$('[data-blind]').forEach((blind) => {
    const button = $('[data-peek]', blind);
    if (!button) return;
    const labels = [button.textContent.trim(), 'hide it again'];
    button.addEventListener('click', () => {
      const on = blind.dataset.peek !== 'true';
      blind.dataset.peek = String(on);
      button.setAttribute('aria-pressed', String(on));
      button.textContent = labels[on ? 1 : 0];
    });
  });

  /* ---- interactive pipeline ------------------------------------------ */
  const pipe = $('[data-pipe]');
  if (pipe) {
    const detail = $('.detail', pipe);
    const tracks = $$('.track', pipe);

    const select = (node) => {
      $$('.node', pipe).forEach((n) => n.setAttribute('aria-pressed', String(n === node)));
      const violet = node.classList.contains('v');
      detail.classList.toggle('v', violet);
      detail.innerHTML = `
        <h3>${node.dataset.cmd}</h3>
        <p>${node.dataset.what}</p>
        <span class="writes">writes → ${node.dataset.writes}</span>`;
      detail.classList.remove('swap');
      void detail.offsetWidth;
      detail.classList.add('swap');
    };

    $$('.node', pipe).forEach((node) => {
      node.addEventListener('click', () => select(node));
      node.addEventListener('mouseenter', () => select(node));
    });

    $$('.tabs button', pipe).forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.tabs button', pipe).forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
        tracks.forEach((tr) => { tr.hidden = tr.dataset.track !== tab.dataset.track; });
        const first = $(`.track[data-track="${tab.dataset.track}"] .node`, pipe);
        if (first) select(first);
      });
    });

    const first = $('.node', pipe);
    if (first) select(first);
  }

  /* ---- budget dial ---------------------------------------------------- */
  const budget = $('[data-budget]');
  if (budget) {
    const dots = $('.dots', budget);
    const readout = $('.readout b', budget);
    const why = $('.why', budget);

    for (let i = 0; i < 16; i += 1) {
      const dot = document.createElement('i');
      if (i >= 12) dot.classList.add('ceil');
      dots.appendChild(dot);
    }
    const cells = $$('i', dots);

    const TIERS = {
      S: [2,  'Two contexts, no Workflow at all. The main loop is the executor: it reads, edits and runs directly. This is the fixed shape of <code>/prorab:quick</code>, and the cheap tier of every other command.'],
      M: [6,  'The usual shape for a real feature. The orchestrator holds the plan, the DoD table and the ledger; the reading happens in delegated contexts that hand back ~1500-token capsules of claims and pointers.'],
      L: [12, 'Wide blast radius, external contracts, genuine uncertainty. Expandable to the absolute ceiling of 16 — dashed above — and only for confirmed critical risk or an explicit <code>--thorough</code>.'],
    };

    const apply = (tier) => {
      const [n, text] = TIERS[tier];
      cells.forEach((cell, i) => {
        cell.style.transitionDelay = `${i * 26}ms`;
        cell.classList.toggle('on', i < n);
      });
      readout.textContent = n;
      why.innerHTML = text;
      $$('button', budget).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tier === tier)));
    };

    $$('button', budget).forEach((b) => b.addEventListener('click', () => apply(b.dataset.tier)));
    apply('M');
  }

  /* ---- land on the right anchor ---------------------------------------
     A fragment navigation into one of these pages is a smooth scroll (the root sets
     `scroll-behavior: smooth`), and that animation does not survive the DOM work above —
     splitting the headline into words, wrapping every <pre>, filling the dial. The scroll is
     abandoned partway and `commands.html#refine` lands near the top. So re-apply the jump
     once layout has settled, with smooth scrolling switched off for the duration: an
     inline `scroll-behavior: auto` rather than `behavior: 'instant'`, which older engines
     reject outright. `scroll-padding-top` still keeps the target clear of the sticky header. */
  const landOnHash = () => {
    if (!location.hash || location.hash === '#') return;
    let target = null;
    try {
      target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    } catch {
      return; // a malformed escape sequence is not an anchor
    }
    if (!target) return;
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    target.scrollIntoView({ block: 'start' });
    root.style.scrollBehavior = previous;
  };
  requestAnimationFrame(landOnHash);
  addEventListener('load', () => requestAnimationFrame(landOnHash), { once: true });
})();
