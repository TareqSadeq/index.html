/* Coca-Cola HBC Connect — interactions */
(() => {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ── curtain cleanup ─────────────────────── */
  const curtain = $("#curtain");
  if (curtain) setTimeout(() => curtain.remove(), reduced ? 0 : 2000);

  /* ── nav: solid on scroll, hide on scroll-down ── */
  const nav = $("#nav");
  let lastY = 0;
  const onNav = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 40);
    nav.classList.toggle("is-hidden", y > 600 && y > lastY && !mobileOpen);
    lastY = y;
  };
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  /* ── mobile menu ─────────────────────────── */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  let mobileOpen = false;
  const setMenu = (open) => {
    mobileOpen = open;
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) nav.classList.add("is-solid");
  };
  burger.addEventListener("click", () => setMenu(!mobileOpen));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ── hero video: only fade in when playable, drop cleanly when absent ── */
  const vid = $("#heroVideo");
  if (vid) {
    if (reduced) vid.remove();
    else {
      vid.addEventListener("canplay", () => {
        vid.classList.add("is-ready");
        document.querySelector(".hero__img").classList.add("is-static");
      }, { once: true });
      fetch("assets/hero.mp4", { method: "HEAD" })
        .then((r) => { if (!r.ok) vid.remove(); })
        .catch(() => vid.remove());
    }
  }

  /* ── hero bubbles ────────────────────────── */
  const bubbleBox = $(".hero__bubbles");
  if (bubbleBox && !reduced) {
    for (let i = 0; i < 26; i++) {
      const b = document.createElement("i");
      const size = 4 + Math.random() * 14;
      b.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random() * 100}%;
        --sway:${(Math.random() * 80 - 40).toFixed(0)}px;
        animation-duration:${(7 + Math.random() * 10).toFixed(1)}s;
        animation-delay:${(Math.random() * 12).toFixed(1)}s;
        opacity:${(0.25 + Math.random() * 0.5).toFixed(2)};
      `;
      bubbleBox.appendChild(b);
    }
  }

  /* ── parallax layers (rAF) ───────────────── */
  const pLayers = $$("[data-parallax]");
  if (pLayers.length && !reduced) {
    let ticking = false;
    const parallax = () => {
      const vh = window.innerHeight;
      pLayers.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax);
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translateY(${(progress * speed * vh).toFixed(1)}px)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
    parallax();
  }

  /* ── scroll reveals ──────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── animated counters ───────────────────── */
  const fmt = (n, dec) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      counterIO.unobserve(en.target);
      const el = en.target;
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || 0, 10);
      const suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = fmt(target, dec) + suffix; return; }
      const t0 = performance.now(), dur = 1800;
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(target * eased, dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => counterIO.observe(el));

  /* ── marquee speed ───────────────────────── */
  $$(".marquee").forEach((m) => {
    m.querySelector(".marquee__track").style.setProperty("--dur", `${m.dataset.speed || 40}s`);
  });

  /* ── tilt cards ──────────────────────────── */
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        card.style.transition = "transform .12s ease-out";
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
        card.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
      });
    });
  }

  /* ── magnetic buttons ────────────────────── */
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

  /* ── tabs (support) ──────────────────────── */
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      $$(".tabpane").forEach((p) => p.classList.toggle("is-active", p.dataset.pane === tab.dataset.tab));
    });
  });

  /* ── pack finder ─────────────────────────── */
  const BUNDLES = {
    kiosk: [
      { name: "Grab & Go Essentials", items: "24x Coca-Cola cans, 12x Sprite, 12x Fanta", rating: 4.8, orders: 2156, base: 99 },
      { name: "High-Traffic Starter", items: "48x Coca-Cola cans, 24x Powerade, 24x FuzeTea", rating: 4.9, orders: 1243, base: 159 },
      { name: "Cooler Classics", items: "24x Coca-Cola Zero, 12x Schweppes, 12x water", rating: 4.7, orders: 954, base: 89 },
      { name: "Quick Start Bundle", items: "12x Coca-Cola, 12x Fanta, 6x Sprite", rating: 4.6, orders: 641, base: 59 },
    ],
    cafe: [
      { name: "Café Companion", items: "12x Coca-Cola glass bottles, 12x FuzeTea, 12x water", rating: 4.9, orders: 1874, base: 109 },
      { name: "Brunch Favourites", items: "12x Schweppes, 12x Fanta, 12x juices", rating: 4.8, orders: 1102, base: 119 },
      { name: "Terrace Season Pack", items: "24x Coca-Cola glass bottles, 12x Sprite, 12x ice tea", rating: 4.8, orders: 987, base: 139 },
      { name: "Espresso Bar Basics", items: "12x water, 12x Coca-Cola, 6x energy", rating: 4.6, orders: 655, base: 79 },
    ],
    hotel: [
      { name: "Minibar Collection", items: "48x mixed minis: Coca-Cola, Sprite, tonic, water", rating: 4.9, orders: 1436, base: 219 },
      { name: "Banquet & Events", items: "96x Coca-Cola cans, 48x Sprite, 48x water", rating: 4.8, orders: 902, base: 349 },
      { name: "Poolside Refresh", items: "48x FuzeTea, 24x Powerade, 24x Fanta", rating: 4.7, orders: 738, base: 189 },
      { name: "Lobby Bar Mixers", items: "24x Schweppes tonic, 24x soda, 12x ginger ale", rating: 4.8, orders: 611, base: 129 },
    ],
    restaurant: [
      { name: "QSR Essentials", items: "24x Coca-Cola, 24x Sprite, 12x Powerade", rating: 4.8, orders: 2156, base: 129 },
      { name: "High-Volume Starter", items: "48x Coca-Cola cans, 48x Sprite cans, 24x Fanta", rating: 4.9, orders: 1243, base: 189 },
      { name: "Premium Dining Mix", items: "24x Coca-Cola Zero, 24x Sprite, 12x sparkling water", rating: 4.8, orders: 654, base: 169 },
      { name: "Family Table Pack", items: "24x Coca-Cola 1L, 12x Fanta 1L, 12x juices", rating: 4.7, orders: 588, base: 149 },
    ],
  };
  const HOUR_HINT = {
    morning: "juices & coffee-pairing picks",
    lunch: "high-rotation lunch classics",
    afternoon: "ice tea & energy boosters",
    evening: "mixers & glass-bottle serves",
  };

  const state = { biz: "kiosk", size: 2000, cust: 300, budget: 1500, hour: "lunch" };
  const bundlesEl = $("#bundles");

  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

  function scaleFactor() {
    // scale price with size & traffic, clamp into budget
    return 0.75 + (state.size - 500) / 9500 * 0.6 + (state.cust - 50) / 1950 * 0.9;
  }

  function renderBundles() {
    const f = scaleFactor();
    const list = BUNDLES[state.biz]
      .map((b) => ({ ...b, price: Math.min(b.base * f, state.budget) }))
      .sort((a, b) => Math.abs(a.price - state.budget * 0.55) - Math.abs(b.price - state.budget * 0.55));

    bundlesEl.innerHTML = list.map((b, i) => `
      <li class="bundle ${i === 0 ? "is-top" : ""}" style="transition-delay:${i * 40}ms">
        <span class="bundle__flag">Recommended</span>
        <span class="bundle__rank">${i + 1}</span>
        <div>
          <h4>${b.name}</h4>
          <small>${b.items}</small>
          <p class="bundle__meta">★ ${b.rating} · ${b.orders.toLocaleString()} orders · <b>${HOUR_HINT[state.hour]}</b></p>
        </div>
        <div class="bundle__price">${money(b.price)}<br><small>/first order</small></div>
      </li>`).join("");
  }

  function paintRange(input) {
    const p = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.setProperty("--fill", p + "%");
  }

  $$(".biztype").forEach((b) => b.addEventListener("click", () => {
    $$(".biztype").forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-checked", "false"); });
    b.classList.add("is-active");
    b.setAttribute("aria-checked", "true");
    state.biz = b.dataset.biz;
    renderBundles();
  }));

  $$(".chip").forEach((c) => c.addEventListener("click", () => {
    $$(".chip").forEach((x) => x.classList.remove("is-active"));
    c.classList.add("is-active");
    state.hour = c.dataset.hour;
    renderBundles();
  }));

  const bindRange = (id, outId, key, format) => {
    const input = $(id), out = $(outId);
    paintRange(input);
    input.addEventListener("input", () => {
      state[key] = +input.value;
      out.textContent = format(+input.value);
      paintRange(input);
      renderBundles();
    });
  };
  bindRange("#inSize", "#outSize", "size", (v) => v.toLocaleString() + " sq ft");
  bindRange("#inCust", "#outCust", "cust", (v) => v.toLocaleString());
  bindRange("#inBudget", "#outBudget", "budget", (v) => money(v));
  renderBundles();

  /* ── network orbs: disciplined red / ink / light, softly drifting ── */
  const netBox = $(".network__bubbles");
  if (netBox) {
    const fills = [
      "radial-gradient(circle at 34% 28%, #FF3B58, #E4002B 70%)",
      "radial-gradient(circle at 34% 28%, rgba(255,255,255,.9), rgba(255,255,255,.5) 70%)",
      "radial-gradient(circle at 34% 28%, #2A211D, #100B09 70%)",
      "radial-gradient(circle at 34% 28%, #FF3B58, #E4002B 70%)",
    ];
    const spots = [
      [5, 20], [11, 70], [17, 40], [27, 84], [31, 14], [45, 90], [57, 8],
      [67, 86], [75, 22], [83, 66], [90, 42], [95, 80], [21, 56], [61, 46],
    ];
    spots.forEach(([x, y], i) => {
      const s = 26 + ((i * 41) % 62);
      const b = document.createElement("i");
      b.style.cssText = `
        left:${x}%; top:${y}%; width:${s}px; height:${s}px;
        background:${fills[i % fills.length]};
        opacity:${s > 62 ? 0.85 : 0.4};
        box-shadow:0 8px 26px -8px rgba(0,0,0,.5);
        animation:floaty ${(5.5 + (i % 5)).toFixed(1)}s var(--ease, ease) ${((i * 0.6) % 4).toFixed(1)}s infinite;
      `;
      netBox.appendChild(b);
    });
  }

  /* ── testimonials ────────────────────────── */
  const STORIES = [
    { n: "Lena Martinez", r: "Manager, Blue Horizon Café", s: 5, t: "Connect completely revamped our drink offering. Ordering is smooth, deliveries are punctual, and our regulars love the variety." },
    { n: "Anton Petridis", r: "Owner, Kiosk 24 Athens", s: 5, t: "Restocking used to take phone calls and guesswork. Now it's two taps on my phone during the quiet hour. First delivery came next morning." },
    { n: "Maria Kovács", r: "F&B Lead, Hotel Aurora", s: 4, t: "The minibar bundles alone saved us hours a week. Our account manager checks in before every high season — that's rare." },
    { n: "Jakub Nowak", r: "Owner, Nowak Bistro", s: 5, t: "Partner pricing made a real difference to our margins. The recommendation engine actually understands what a small bistro sells." },
    { n: "Elif Demir", r: "Franchisee, FreshMart", s: 5, t: "99.8% on-time is not marketing — in 14 months we've had one late crate, and support called us before we even noticed." },
    { n: "Sofia Rossi", r: "Manager, Trattoria Rossi", s: 4, t: "We switched our whole beverage program in a week. The catalog is huge and the volume deals unlock automatically as you grow." },
    { n: "Nikos Alexiou", r: "Owner, Seaside Canteen", s: 5, t: "Summer traffic triples our orders. Connect scales with us — bigger crates, same 48-hour delivery, zero drama." },
    { n: "Petra Svobodová", r: "Café Petra, Prague", s: 5, t: "Support answered at 2am before a festival weekend. A real person, a real fix, and the truck arrived by noon." },
  ];
  const storyCard = (s) => `
    <article class="story">
      <div class="story__stars" aria-label="${s.s} out of 5 stars">${"★".repeat(s.s)}${"☆".repeat(5 - s.s)}</div>
      <p>“${s.t}”</p>
      <footer>
        <span class="story__avatar">${s.n.split(" ").map((w) => w[0]).join("")}</span>
        <div><b>${s.n}</b><small>${s.r}</small></div>
      </footer>
    </article>`;
  const row1 = $("#storyRow1"), row2 = $("#storyRow2");
  if (row1 && row2) {
    const a = STORIES.slice(0, 4), b = STORIES.slice(4);
    row1.innerHTML = a.map(storyCard).join("") + a.map(storyCard).join("");
    row2.innerHTML = b.map(storyCard).join("") + b.map(storyCard).join("");
  }

  /* ── FAQ: only one open at a time ────────── */
  $$(".qa").forEach((qa) => {
    qa.addEventListener("toggle", () => {
      if (qa.open) $$(".qa").forEach((o) => { if (o !== qa) o.open = false; });
    });
  });
})();
