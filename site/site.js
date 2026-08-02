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
      ['out',  '   reading reports/ · 6 files · 2 Explore contexts'],
      ['out',  '   ? the filtered view, or every row the query can return'],
      ['ok',   '   ✓ spec-ready — 3 contradictions surfaced, 0 lines of code written'],
      ['file', '   → tasks/ideas/IDEA-csv-export.md   (Code map: 6 files, hashed)'],
      ['gap',  ''],
      ['cmd',  '/clear  ·  /prorab:build'],
      ['out',  '   recon reused: 6/6 hashes fresh · tier M · 6 contexts'],
      ['out',  '   red first … 1 failed · AssertionError · right reason'],
      ['ok',   '   ✓ 4/4 DoD met · reviewer found 2, both fixed'],
      ['file', '   → tasks/IMPL-csv-export.md'],
      ['gap',  ''],
      ['cmd',  '/prorab:verify'],
      ['out',  '   blind prober: no path, no diff, no symbol'],
      ['out',  '   1 284 rows · header matches the requirement, not the output'],
      ['ok',   '   ✓ mutation: break the delimiter → suite goes red'],
      ['file', '   → tasks/verify/VERIFY-csv-export.md'],
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
        line.textContent = kind === 'gap' ? ' ' : text;
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
          line.textContent = ' ';
          await sleep(220);
          continue;
        }
        if (kind === 'cmd') {
          await animate(text.length * 17, (p) => {
            if (mine === token) line.textContent = text.slice(0, Math.ceil(text.length * p));
          });
          if (mine !== token) return;
          await sleep(240);
        } else {
          line.textContent = text;
          await sleep(kind === 'file' ? 360 : 220);
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

  /* ---- interactive pipeline ------------------------------------------ */
  const pipe = $('[data-pipe]');
  if (pipe) {
    const detail = $('.detail', pipe);
    const tracks = $$('.track', pipe);

    const select = (node) => {
      $$('.node', pipe).forEach((n) => n.setAttribute('aria-selected', String(n === node)));
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
      S: [2,  'Two contexts, no Workflow at all. The main loop is the executor: it reads and runs directly. This is the shape of <code>/prorab:quick</code>, and the cheap tier of every other command.'],
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
})();
