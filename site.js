(() => {
  "use strict";

  const root = document.documentElement;
  const KEY = "alrescha-theme";
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* Theme: a stored choice wins; otherwise follow the system. */
  const effectiveTheme = () => root.getAttribute("data-theme") || (darkQuery.matches ? "dark" : "light");
  const toggle = document.querySelector(".theme-toggle");
  const labelToggle = () => {
    if (!toggle) return;
    const next = effectiveTheme() === "dark" ? "밝은 성도로 보기" : "밤하늘로 보기";
    toggle.setAttribute("aria-label", next);
    toggle.title = next;
  };
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {
        /* storage blocked: the choice lasts for this page only */
      }
      labelToggle();
      schedule();
    });
  }
  labelToggle();
  darkQuery.addEventListener("change", () => {
    labelToggle();
    schedule();
  });

  /* Field stars: real stars to magnitude 6.0 around Pisces (d3-celestial,
     Hipparcos-derived), in the hero chart's own coordinates. Drawn once
     after first paint, and again only on resize or theme change. */
  const dataEl = document.getElementById("field-stars");
  let stars = null;
  const loadStars = () => {
    if (stars || !dataEl) return stars;
    try {
      stars = JSON.parse(dataEl.textContent);
    } catch (e) {
      stars = [];
    }
    return stars;
  };

  const hero = document.querySelector(".hero");
  const heroCanvas = hero && hero.querySelector("canvas.field");
  const heroSvg = hero && hero.querySelector(".sky-svg");
  const closing = document.querySelector(".closing");
  const closingCanvas = closing && closing.querySelector("canvas.field");

  function paint(canvas, host, map, hush, dim, withFigure) {
    const list = loadStars();
    if (!canvas || !host || !list) return;
    const rect = host.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const rgb = getComputedStyle(root).getPropertyValue("--star-rgb").trim() || "234, 242, 245";
    const dark = effectiveTheme() === "dark";
    const { s, ox, oy } = map(rect);
    const k = Math.max(0.75, Math.min(1.2, s / 0.72));

    for (let i = 0; i < list.length; i++) {
      const st = list[i];
      if (st[3] && !withFigure) continue;
      const x = ox + st[0] * s;
      const y = oy + st[1] * s;
      if (x < -6 || y < -6 || x > w + 6 || y > h + 6) continue;
      if (hush.some((b) => x > b[0] && x < b[2] && y > b[1] && y < b[3])) continue;
      const mag = st[2] / 10;
      const t = Math.max(0, Math.min(1, (6.1 - mag) / 4.3)); // 0 faint .. 1 bright
      const r = (0.5 + t * t * 2.3) * k;
      let a = (dark ? 0.2 + t * 0.55 : 0.28 + t * 0.62) * dim(x, y);
      if (dark && mag < 2.8) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, `rgba(${rgb}, ${(0.14 * a).toFixed(3)})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(${rgb}, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    canvas.classList.add("is-drawn");
  }

  // Boxes around words and buttons, relative to a host rect.
  const boxes = (host, selector, px = 10, py = 8) => {
    const hr = host.getBoundingClientRect();
    const out = [];
    for (const el of host.querySelectorAll(selector)) {
      for (const r of el.getClientRects()) {
        out.push([r.left - hr.left - px, r.top - hr.top - py, r.right - hr.left + px, r.bottom - hr.top + py]);
      }
    }
    return out;
  };

  // The header floats over the hero: keep its words and controls clear.
  const headerBoxes = (host) => {
    const hr = host.getBoundingClientRect();
    const out = [];
    for (const el of document.querySelectorAll(".site-header .home, .site-header .nav a, .site-header .theme-toggle, .site-header .header-login")) {
      const r = el.getBoundingClientRect();
      if (r.width) out.push([r.left - hr.left - 14, r.top - hr.top - 10, r.right - hr.left + 14, r.bottom - hr.top + 10]);
    }
    return out;
  };

  function drawAll() {
    if (hero && heroSvg) {
      const copy = hero.querySelector(".hero-copy");
      const wide = window.innerWidth > 960;
      paint(
        heroCanvas,
        hero,
        (rect) => {
          // The chart's own screen matrix keeps field and figure aligned.
          const m = heroSvg.getScreenCTM();
          return m ? { s: m.a, ox: m.e - rect.left, oy: m.f - rect.top } : { s: 0.7, ox: 0, oy: 0 };
        },
        // Labels knock out the stars behind them, as on a printed atlas.
        boxes(hero, ".hero-copy .status, .hero-copy h1, .hero-copy .lead, .hero-copy .btn", 22, 10)
          .concat(boxes(hero, ".sky-labels .lb, .knot-caption", 3, 2))
          .concat(headerBoxes(hero)),
        (() => {
          if (!copy || !wide) return () => 1;
          const hr = hero.getBoundingClientRect();
          const cr = copy.getBoundingClientRect();
          const qx = cr.right - hr.left + 24;
          const y0 = cr.top - hr.top - 40;
          const y1 = cr.bottom - hr.top + 40;
          return (x, y) => (x < qx && y > y0 && y < y1 ? 0.45 : 1);
        })(),
      );
    }
    if (closing) {
      paint(
        closingCanvas,
        closing,
        // Pegasus and the western fish, small, to the right of the copy.
        (rect) => ({ s: 0.5, ox: rect.width * 0.72 - 380 * 0.5, oy: rect.height * 0.5 + 60 * 0.5 }),
        boxes(closing, "h2, p, .btn"),
        () => 0.55,
        true,
      );
    }
  }

  let pending = 0;
  function schedule() {
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = 0;
      drawAll();
    });
  }
  // After first paint, not before it.
  requestAnimationFrame(() => setTimeout(drawAll, 0));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(schedule);
    if (hero) ro.observe(hero);
    if (closing) ro.observe(closing);
  } else {
    window.addEventListener("resize", schedule);
  }

  /* The read-flares play once when their figure comes into view. */
  const lit = document.querySelectorAll(".brain, .scene");
  if (calm.matches || !("IntersectionObserver" in window)) {
    lit.forEach((el) => el.classList.add("is-lit"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-lit");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );
    lit.forEach((el) => io.observe(el));
  }
})();
