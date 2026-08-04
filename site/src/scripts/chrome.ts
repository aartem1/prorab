/**
 * The shared page chrome: sticky header, pointer glow, reveal-on-scroll, the section rail, copy
 * buttons, and landing on the right anchor.
 *
 * Progressive enhancement only — every page reads correctly with this file absent. Nothing here
 * imports a dictionary: the few strings it needs come from `data-` attributes rendered into the
 * page, so a script can never disagree with the language of the page it shipped with.
 */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  root.querySelector<T>(sel);
const $$ = <T extends Element = Element>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

/* ---- sticky header ---------------------------------------------------- */
const header = $('header.site');
if (header) {
  const onScroll = () => header.classList.toggle('stuck', scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
}

/* ---- mobile navigation ------------------------------------------------ */
const mobileMenu = $<HTMLDetailsElement>('[data-mobile-menu]');
if (mobileMenu) {
  document.addEventListener('pointerdown', (event) => {
    if (mobileMenu.open && event.target instanceof Node && !mobileMenu.contains(event.target)) {
      mobileMenu.open = false;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !mobileMenu.open) return;
    mobileMenu.open = false;
    $<HTMLElement>('summary', mobileMenu)?.focus();
  });
  matchMedia('(min-width: 821px)').addEventListener('change', (event) => {
    if (event.matches) mobileMenu.open = false;
  });
}

/* ---- pointer glow ------------------------------------------------------ */
if (!reduced && matchMedia('(pointer: fine)').matches) {
  let raf = 0;
  addEventListener(
    'pointermove',
    (event) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        document.body.style.setProperty('--mx', `${event.clientX}px`);
        document.body.style.setProperty('--my', `${event.clientY}px`);
      });
    },
    { passive: true },
  );
}

/* ---- reveal on scroll -------------------------------------------------- */
const revealed = $$('[data-reveal]');
if (revealed.length && !reduced) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('in'));
}

/* ---- headline word reveal ---------------------------------------------- */
$$('[data-words]').forEach((el) => {
  // split on spaces outside tags; each token keeps its own markup
  el.innerHTML = el.innerHTML
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => `<span class="w" style="animation-delay:${60 + i * 55}ms">${word}</span>`)
    .join(' ');
});

/* ---- section rail (scroll spy) ------------------------------------------ */
const rail = $('[data-rail]');
if (rail) {
  const marks = $$<HTMLElement>('[data-rail-label][id]');
  if (!marks.length) {
    rail.remove();
  } else {
    marks.forEach((mark) => {
      const link = document.createElement('a');
      link.href = `#${mark.id}`;
      const bar = document.createElement('i');
      const label = document.createElement('span');
      label.textContent = mark.dataset.railLabel ?? '';
      link.append(bar, label);
      rail.appendChild(link);
    });
    const links = $$('a', rail);
    const setCurrent = (id: string) =>
      links.forEach((a) => {
        a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`));
      });
    setCurrent(marks[0]!.id);
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => seen.set(entry.target.id, entry.intersectionRatio));
        let best: { id: string; ratio: number } | null = null;
        seen.forEach((ratio, id) => {
          if (ratio > 0 && (!best || ratio > best.ratio)) best = { id, ratio };
        });
        if (best) setCurrent((best as { id: string }).id);
      },
      { threshold: [0, 0.15, 0.4, 0.75], rootMargin: '-15% 0px -45% 0px' },
    );
    marks.forEach((mark) => io.observe(mark));
  }
}

/* ---- copy buttons on code blocks ---------------------------------------- */
const page = $<HTMLElement>('.page');
const LABELS = {
  copy: page?.dataset.copy ?? 'copy',
  copied: page?.dataset.copied ?? 'copied',
  failed: page?.dataset.copyFailed ?? 'select + ⌘C',
};

$$<HTMLElement>('pre').forEach((pre) => {
  const wrap = document.createElement('div');
  wrap.className = 'copyblock';
  pre.parentNode?.insertBefore(wrap, pre);
  wrap.appendChild(pre);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = LABELS.copy;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pre.innerText.trim());
      button.textContent = LABELS.copied;
    } catch {
      button.textContent = LABELS.failed;
    }
    setTimeout(() => {
      button.textContent = LABELS.copy;
    }, 1600);
  });
  wrap.appendChild(button);
});

/* ---- land on the right anchor -------------------------------------------
   A fragment navigation into one of these pages is a smooth scroll (the root sets
   `scroll-behavior: smooth`), and that animation does not survive the DOM work above —
   splitting the headline into words, wrapping every <pre>, filling the dial. The scroll is
   abandoned partway and `commands.html#refine` lands near the top. So re-apply the jump
   once layout has settled, with smooth scrolling switched off for the duration: an
   inline `scroll-behavior: auto` rather than `behavior: 'instant'`, which older engines
   reject outright. `scroll-padding-top` still keeps the target clear of the sticky header. */
const landOnHash = () => {
  if (!location.hash || location.hash === '#') return;
  let target: HTMLElement | null = null;
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
