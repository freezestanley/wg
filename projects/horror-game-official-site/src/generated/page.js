const PAGE_STYLE_ID = "rite-of-embers-styles";

function ensureStyles() {
  if (document.getElementById(PAGE_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = PAGE_STYLE_ID;
  style.textContent = `
    :root {
      --bg: #050505;
      --bg-soft: #120707;
      --panel: rgba(17, 10, 10, 0.72);
      --panel-strong: rgba(28, 14, 14, 0.88);
      --line: rgba(255, 186, 125, 0.16);
      --text: #f2eee9;
      --muted: rgba(242, 238, 233, 0.72);
      --ember: #ff7b2f;
      --ember-soft: #ffb86b;
      --blood: #8b1116;
      --shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
      --glow: 0 0 30px rgba(255, 120, 45, 0.2);
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background:
        radial-gradient(circle at 20% 20%, rgba(139, 17, 22, 0.22), transparent 25%),
        radial-gradient(circle at 80% 0%, rgba(255, 123, 47, 0.14), transparent 20%),
        linear-gradient(180deg, #070707 0%, #050505 100%);
      color: var(--text);
      overflow-x: hidden;
    }

    .roe-page {
      position: relative;
      min-height: 100vh;
      isolation: isolate;
      background:
        radial-gradient(circle at top, rgba(255, 108, 48, 0.08), transparent 24%),
        linear-gradient(180deg, rgba(255,255,255,0.02), transparent 8%),
        var(--bg);
    }

    .roe-noise,
    .roe-vignette,
    .roe-scanlines,
    .roe-embers-canvas {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }

    .roe-embers-canvas { z-index: 0; }
    .roe-noise {
      z-index: 1;
      opacity: 0.16;
      mix-blend-mode: soft-light;
      background-image:
        radial-gradient(circle at 15% 20%, rgba(255,255,255,0.06) 0, transparent 30%),
        radial-gradient(circle at 80% 10%, rgba(255,132,74,0.08) 0, transparent 18%),
        radial-gradient(circle at 70% 80%, rgba(255,255,255,0.04) 0, transparent 24%);
      filter: contrast(160%) saturate(80%);
    }

    .roe-scanlines {
      z-index: 2;
      opacity: 0.08;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,0.16) 0,
        rgba(255,255,255,0.16) 1px,
        transparent 1px,
        transparent 4px
      );
    }

    .roe-vignette {
      z-index: 3;
      box-shadow: inset 0 0 220px rgba(0, 0, 0, 0.88);
    }

    .roe-content {
      position: relative;
      z-index: 4;
    }

    .roe-nav {
      position: sticky;
      top: 0;
      z-index: 20;
      backdrop-filter: blur(18px);
      background: linear-gradient(180deg, rgba(7,7,7,0.88), rgba(7,7,7,0.42));
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .roe-shell {
      width: min(1280px, calc(100vw - 32px));
      margin: 0 auto;
    }

    .roe-nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 76px;
    }

    .roe-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      font-size: 12px;
      color: rgba(255,255,255,0.84);
    }

    .roe-brand-mark {
      width: 38px;
      height: 38px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--ember-soft);
      border: 1px solid rgba(255, 158, 89, 0.28);
      background: radial-gradient(circle, rgba(255,123,47,0.2), rgba(255,123,47,0.04));
      box-shadow: var(--glow);
    }

    .roe-nav-links {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .roe-nav-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      transition: color 180ms ease, opacity 180ms ease;
    }

    .roe-nav-links a:hover,
    .roe-nav-links a:focus-visible {
      color: var(--ember-soft);
      outline: none;
    }

    .roe-nav-tools {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-left: 8px;
    }

    .roe-icon-btn {
      width: 44px;
      height: 44px;
      border-radius: 999px;
      display: inline-grid;
      place-items: center;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.82);
      box-shadow: 0 10px 24px rgba(0,0,0,0.18);
      cursor: pointer;
      transition: transform 220ms ease, border-color 220ms ease, background 220ms ease;
    }

    .roe-icon-btn:hover,
    .roe-icon-btn:focus-visible,
    .roe-icon-btn.is-active {
      transform: translateY(-2px);
      border-color: rgba(255, 169, 97, 0.42);
      background: rgba(255,255,255,0.08);
      outline: none;
    }

    .roe-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 48px;
      padding: 0 20px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.12);
      color: var(--text);
      text-decoration: none;
      background: rgba(255,255,255,0.04);
      transition: transform 220ms ease, border-color 220ms ease, background 220ms ease, box-shadow 220ms ease;
      box-shadow: 0 10px 24px rgba(0,0,0,0.18);
      will-change: transform;
    }

    .roe-btn:hover,
    .roe-btn:focus-visible {
      transform: translateY(-2px);
      border-color: rgba(255, 169, 97, 0.42);
      background: rgba(255,255,255,0.08);
      outline: none;
    }

    .roe-btn--primary {
      background: linear-gradient(135deg, rgba(255, 112, 40, 0.92), rgba(140, 18, 22, 0.92));
      border-color: rgba(255, 176, 120, 0.45);
      box-shadow: 0 18px 40px rgba(123, 20, 13, 0.34);
    }

    .roe-btn--primary:hover,
    .roe-btn--primary:focus-visible {
      box-shadow: 0 22px 48px rgba(123, 20, 13, 0.45), 0 0 22px rgba(255, 141, 72, 0.2);
    }

    .roe-hero {
      position: relative;
      min-height: calc(100vh - 76px);
      display: grid;
      align-items: center;
      padding: 72px 0 56px;
      overflow: clip;
    }

    .roe-hero-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
      gap: 36px;
      align-items: center;
    }

    .roe-kicker {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      min-height: 40px;
      padding: 0 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.74);
      font-size: 12px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }

    .roe-hero-copy {
      position: relative;
      max-width: 760px;
    }

    .roe-title-wrap {
      position: relative;
      margin: 18px 0 24px;
      perspective: 1200px;
    }

    .roe-title-shadow,
    .roe-title-main,
    .roe-title-sub {
      margin: 0;
      text-transform: uppercase;
      line-height: 0.92;
      letter-spacing: 0.08em;
    }

    .roe-title-shadow {
      position: absolute;
      inset: -10px auto auto 0;
      font-size: clamp(4rem, 12vw, 8rem);
      color: rgba(255, 116, 49, 0.07);
      transform: translate3d(18px, 18px, -30px) scale(1.03);
      filter: blur(2px);
      user-select: none;
    }

    .roe-title-main {
      position: relative;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(4rem, 11vw, 7.4rem);
      color: #fbf7f2;
      text-shadow: 0 0 20px rgba(255, 147, 84, 0.12), 0 10px 50px rgba(0,0,0,0.45);
      transform-style: preserve-3d;
    }

    .roe-title-main span {
      display: inline-block;
      position: relative;
    }

    .roe-title-main .roe-glitch::before,
    .roe-title-main .roe-glitch::after {
      content: attr(data-text);
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
      opacity: 0.25;
      animation: roe-glitch 5.6s infinite steps(2, end);
    }

    .roe-title-main .roe-glitch::before {
      color: rgba(255, 80, 58, 0.5);
      transform: translate(2px, 0);
    }

    .roe-title-main .roe-glitch::after {
      color: rgba(255, 200, 112, 0.35);
      transform: translate(-3px, 0);
      animation-delay: 0.16s;
    }

    .roe-title-sub {
      margin-top: 16px;
      font-size: clamp(1rem, 2.2vw, 1.25rem);
      color: rgba(255, 199, 151, 0.82);
      letter-spacing: 0.42em;
    }

    .roe-hero-desc {
      max-width: 680px;
      margin: 0;
      color: var(--muted);
      font-size: clamp(1rem, 2vw, 1.125rem);
      line-height: 1.95;
    }

    .roe-hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 30px;
    }

    .roe-platform-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 22px;
    }

    .roe-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.76);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .roe-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 34px;
    }

    .roe-metric {
      padding: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      box-shadow: var(--shadow);
      backdrop-filter: blur(10px);
    }

    .roe-metric strong {
      display: block;
      font-family: Georgia, serif;
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--ember-soft);
    }

    .roe-metric span {
      display: block;
      margin-top: 6px;
      color: rgba(255,255,255,0.66);
      font-size: 12px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .roe-hero-visual {
      position: relative;
      min-height: 620px;
      perspective: 1500px;
    }

    .roe-altar {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      transform-style: preserve-3d;
    }

    .roe-ring,
    .roe-core,
    .roe-flame,
    .roe-sigil,
    .roe-monolith,
    .roe-fog {
      position: absolute;
      will-change: transform;
    }

    .roe-ring {
      width: min(68vw, 520px);
      aspect-ratio: 1;
      border-radius: 50%;
      border: 1px solid rgba(255, 180, 116, 0.24);
      box-shadow: inset 0 0 46px rgba(255, 113, 39, 0.08), 0 0 80px rgba(255, 113, 39, 0.07);
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px)));
    }

    .roe-ring::before,
    .roe-ring::after {
      content: "";
      position: absolute;
      inset: 8%;
      border-radius: inherit;
      border: 1px dashed rgba(255, 196, 140, 0.14);
      animation: roe-spin 18s linear infinite;
    }

    .roe-ring::after {
      inset: -8%;
      border-style: solid;
      opacity: 0.4;
      animation-direction: reverse;
      animation-duration: 28s;
    }

    .roe-core {
      width: min(44vw, 300px);
      aspect-ratio: 1;
      border-radius: 50%;
      background:
        radial-gradient(circle at 50% 40%, rgba(255, 224, 170, 0.42), rgba(255, 140, 62, 0.18) 30%, transparent 60%),
        radial-gradient(circle at 50% 65%, rgba(148, 14, 14, 0.46), transparent 66%);
      filter: blur(0.2px);
      box-shadow: 0 0 120px rgba(255, 119, 52, 0.26);
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px))) translateZ(60px);
    }

    .roe-flame {
      width: min(36vw, 240px);
      aspect-ratio: 0.74;
      background:
        radial-gradient(circle at 50% 80%, rgba(255, 236, 206, 0.78), rgba(255, 176, 90, 0.6) 18%, transparent 42%),
        radial-gradient(circle at 50% 52%, rgba(255, 118, 45, 0.64), rgba(255, 118, 45, 0.12) 48%, transparent 72%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 18%);
      clip-path: polygon(50% 0%, 68% 18%, 82% 44%, 74% 70%, 56% 100%, 40% 82%, 24% 96%, 28% 60%, 18% 40%, 34% 18%);
      filter: blur(0.3px) drop-shadow(0 0 30px rgba(255, 130, 55, 0.4));
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) - 12px)) translateZ(110px);
      animation: roe-flicker 4s ease-in-out infinite;
      opacity: 0.92;
    }

    .roe-sigil {
      display: grid;
      place-items: center;
      width: min(72vw, 560px);
      aspect-ratio: 1;
      color: rgba(255, 226, 185, 0.6);
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) + 120px)) translateZ(150px) rotateX(76deg);
      filter: drop-shadow(0 0 24px rgba(255, 127, 62, 0.22));
    }

    .roe-sigil svg {
      width: 100%;
      height: 100%;
      opacity: 0.9;
    }

    .roe-monolith {
      width: min(50vw, 340px);
      height: min(68vh, 460px);
      border-radius: 42px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 12%, rgba(255,255,255,0.01) 80%),
        linear-gradient(150deg, rgba(255, 131, 50, 0.1), rgba(63, 10, 10, 0.26) 44%, rgba(0,0,0,0.4));
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: var(--shadow), inset 0 0 0 1px rgba(255,255,255,0.04);
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px))) translateZ(40px) rotateX(12deg) rotateY(-12deg);
      overflow: hidden;
    }

    .roe-monolith::before,
    .roe-monolith::after {
      content: "";
      position: absolute;
      inset: 0;
    }

    .roe-monolith::before {
      background:
        linear-gradient(180deg, rgba(255,255,255,0.08), transparent 22%),
        repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0, rgba(255,255,255,0.04) 2px, transparent 2px, transparent 10px);
      mix-blend-mode: overlay;
    }

    .roe-monolith::after {
      inset: 14px;
      border-radius: 32px;
      border: 1px solid rgba(255, 183, 129, 0.12);
      box-shadow: inset 0 0 30px rgba(255, 118, 45, 0.08);
    }

    .roe-monolith-panel {
      position: absolute;
      inset: auto 24px 24px 24px;
      padding: 18px;
      border-radius: 24px;
      background: rgba(6, 6, 6, 0.44);
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
    }

    .roe-monolith-panel p {
      margin: 0;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      line-height: 1.8;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }

    .roe-monolith-panel strong {
      display: block;
      margin-top: 8px;
      font-size: 22px;
      color: #fff4e8;
      font-family: Georgia, serif;
      letter-spacing: 0.08em;
    }

    .roe-fog {
      inset: auto 0 -40px;
      height: 220px;
      background:
        radial-gradient(circle at 30% 50%, rgba(255, 122, 46, 0.1), transparent 22%),
        radial-gradient(circle at 60% 50%, rgba(255, 255, 255, 0.06), transparent 28%),
        radial-gradient(circle at 75% 60%, rgba(140, 15, 15, 0.18), transparent 26%);
      filter: blur(26px);
      opacity: 0.8;
      transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px))) translateZ(20px);
    }

    .roe-section {
      position: relative;
      padding: 104px 0;
    }

    .roe-section-head {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 20px;
      margin-bottom: 34px;
    }

    .roe-section-head h2 {
      margin: 10px 0 0;
      font-size: clamp(2rem, 4vw, 3rem);
      font-family: Georgia, serif;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .roe-section-head p {
      margin: 0;
      max-width: 560px;
      color: var(--muted);
      line-height: 1.9;
    }

    .roe-eyebrow {
      color: rgba(255, 187, 127, 0.88);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      font-size: 12px;
    }

    .roe-grid-4,
    .roe-grid-3,
    .roe-grid-2 {
      display: grid;
      gap: 18px;
    }

    .roe-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .roe-grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .roe-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

    .roe-card {
      position: relative;
      overflow: hidden;
      min-height: 100%;
      padding: 24px;
      border-radius: 28px;
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow);
      transition: transform 260ms ease, border-color 260ms ease, box-shadow 260ms ease;
      transform-style: preserve-3d;
      transform: perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px));
    }

    .roe-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255, 152, 75, 0.14), transparent 36%);
      opacity: 0;
      transition: opacity 220ms ease;
      pointer-events: none;
    }

    .roe-card:hover,
    .roe-card:focus-within {
      border-color: rgba(255, 179, 123, 0.22);
      box-shadow: 0 28px 60px rgba(0,0,0,0.34), 0 0 28px rgba(255, 122, 46, 0.06);
      --lift: -4px;
    }

    .roe-card:hover::before,
    .roe-card:focus-within::before {
      opacity: 1;
    }

    .roe-card-icon {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      margin-bottom: 18px;
      background: rgba(255, 111, 41, 0.14);
      border: 1px solid rgba(255, 179, 123, 0.16);
      color: var(--ember-soft);
      box-shadow: var(--glow);
    }

    .roe-card h3,
    .roe-monster-name,
    .roe-shot-title {
      margin: 0;
      font-family: Georgia, serif;
      color: #fff6ec;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .roe-card p,
    .roe-monster-copy,
    .roe-shot-copy,
    .roe-world-copy,
    .roe-cta-copy,
    .roe-footer-copy {
      margin: 0;
      color: var(--muted);
      line-height: 1.9;
    }

    .roe-card-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .roe-world {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 22px;
      align-items: stretch;
    }

    .roe-world-panel,
    .roe-world-ritual {
      min-height: 420px;
    }

    .roe-world-panel {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 32px;
      border-radius: 36px;
      background:
        linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
        radial-gradient(circle at 80% 20%, rgba(255, 125, 40, 0.14), transparent 18%),
        var(--panel);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: var(--shadow);
    }

    .roe-world-quote {
      margin: 0;
      font-size: clamp(1.5rem, 3vw, 2.6rem);
      line-height: 1.3;
      font-family: Georgia, serif;
      color: #fff5eb;
    }

    .roe-world-ritual {
      position: relative;
      overflow: hidden;
      padding: 28px;
      border-radius: 36px;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        radial-gradient(circle at 50% 50%, rgba(255, 132, 48, 0.18), transparent 20%),
        linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),
        rgba(12, 7, 7, 0.8);
      box-shadow: var(--shadow);
    }

    .roe-ritual-grid {
      position: absolute;
      inset: 28px;
      border-radius: 26px;
      border: 1px solid rgba(255,255,255,0.06);
      background:
        linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px),
        linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
      background-size: 28px 28px;
      opacity: 0.4;
    }

    .roe-ritual-seal {
      position: absolute;
      inset: 50% auto auto 50%;
      width: 64%;
      aspect-ratio: 1;
      transform: translate(calc(-50% + var(--px, 0px)), calc(-50% + var(--py, 0px) + var(--sy, 0px)));
      opacity: 0.9;
    }

    .roe-ritual-tags {
      position: relative;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      z-index: 1;
    }

    .roe-ritual-tags span {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.74);
      font-size: 12px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .roe-monster-card {
      min-height: 420px;
      padding: 0;
    }

    .roe-monster-top {
      position: relative;
      min-height: 220px;
      overflow: hidden;
      border-radius: 28px 28px 0 0;
      background:
        radial-gradient(circle at 50% 30%, rgba(255, 131, 48, 0.16), transparent 20%),
        linear-gradient(180deg, rgba(255,255,255,0.06), transparent 24%),
        linear-gradient(135deg, rgba(51, 8, 9, 0.94), rgba(14, 7, 7, 0.98));
    }

    .roe-monster-figure {
      position: absolute;
      inset: 18px 18px 0 18px;
      border-radius: 22px 22px 0 0;
      background:
        radial-gradient(circle at 50% 20%, rgba(255,255,255,0.06), transparent 20%),
        linear-gradient(180deg, rgba(255, 129, 44, 0.08), transparent 26%),
        transparent;
    }

    .roe-monster-silhouette {
      position: absolute;
      inset: auto 50% 0;
      transform: translateX(-50%);
      width: 54%;
      height: 82%;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.95));
      filter: drop-shadow(0 0 20px rgba(255, 110, 38, 0.16));
      opacity: 0.95;
    }

    .roe-monster-silhouette[data-shape="priest"] {
      clip-path: polygon(44% 0%, 60% 0%, 69% 12%, 75% 30%, 86% 56%, 78% 100%, 22% 100%, 14% 56%, 25% 28%, 31% 10%);
    }

    .roe-monster-silhouette[data-shape="beast"] {
      clip-path: polygon(18% 18%, 32% 2%, 42% 16%, 58% 8%, 72% 0%, 82% 22%, 100% 34%, 88% 58%, 78% 100%, 20% 100%, 14% 64%, 0% 40%);
    }

    .roe-monster-silhouette[data-shape="saint"] {
      clip-path: polygon(46% 0%, 56% 0%, 64% 14%, 78% 34%, 92% 62%, 82% 100%, 18% 100%, 8% 62%, 22% 34%, 36% 14%);
    }

    .roe-monster-silhouette[data-shape="swarm"] {
      clip-path: polygon(8% 24%, 24% 0%, 44% 18%, 54% 0%, 74% 16%, 92% 8%, 100% 34%, 82% 58%, 94% 80%, 74% 100%, 26% 100%, 4% 72%, 18% 48%, 0% 38%);
    }

    .roe-monster-rune {
      position: absolute;
      inset: 18px auto auto 18px;
      min-height: 34px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.34);
      color: rgba(255, 204, 160, 0.82);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .roe-monster-body {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 22px 24px 24px;
    }

    .roe-monster-taglist {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .roe-monster-taglist span {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.68);
    }

    .roe-media-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr 0.8fr;
      gap: 18px;
    }

    .roe-shot {
      position: relative;
      min-height: 290px;
      padding: 22px;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),
        #0d0a0a;
      box-shadow: var(--shadow);
      cursor: pointer;
    }

    .roe-shot::before,
    .roe-shot::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .roe-shot::before {
      background:
        radial-gradient(circle at 20% 20%, rgba(255, 130, 48, 0.14), transparent 24%),
        linear-gradient(135deg, rgba(255,255,255,0.06), transparent 40%),
        linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.42));
    }

    .roe-shot::after {
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,0.04) 0,
        rgba(255,255,255,0.04) 1px,
        transparent 1px,
        transparent 5px
      );
      opacity: 0.45;
      mix-blend-mode: overlay;
    }

    .roe-shot-bg {
      position: absolute;
      inset: 0;
      opacity: 0.9;
      background-size: cover;
      background-position: center;
      filter: saturate(0.9) contrast(1.08);
      transform: scale(1.02);
    }

    .roe-shot[data-scene="cathedral"] .roe-shot-bg {
      background:
        linear-gradient(180deg, rgba(5,5,5,0.18), rgba(5,5,5,0.72)),
        radial-gradient(circle at 50% 16%, rgba(255, 167, 95, 0.3), transparent 20%),
        linear-gradient(90deg, rgba(255,255,255,0.08) 0 2%, transparent 2% 18%, rgba(255,255,255,0.06) 18% 20%, transparent 20% 80%, rgba(255,255,255,0.06) 80% 82%, transparent 82% 98%, rgba(255,255,255,0.08) 98% 100%),
        linear-gradient(180deg, #1d0a09, #090808 66%);
    }

    .roe-shot[data-scene="forest"] .roe-shot-bg {
      background:
        linear-gradient(180deg, rgba(8,8,8,0.1), rgba(8,8,8,0.8)),
        radial-gradient(circle at 60% 24%, rgba(255, 143, 55, 0.22), transparent 16%),
        repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0 6%, transparent 6% 12%),
        linear-gradient(180deg, #1a100d, #070707 72%);
    }

    .roe-shot[data-scene="pit"] .roe-shot-bg {
      background:
        linear-gradient(180deg, rgba(8,8,8,0.12), rgba(8,8,8,0.84)),
        radial-gradient(circle at 50% 64%, rgba(255, 115, 38, 0.32), transparent 16%),
        radial-gradient(circle at 30% 22%, rgba(255,255,255,0.05), transparent 14%),
        linear-gradient(180deg, #260f0c, #080707 70%);
    }

    .roe-shot[data-scene="lab"] .roe-shot-bg {
      background:
        linear-gradient(180deg, rgba(8,8,8,0.14), rgba(8,8,8,0.82)),
        radial-gradient(circle at 50% 20%, rgba(255, 184, 101, 0.18), transparent 14%),
        linear-gradient(90deg, rgba(255,255,255,0.03) 0 10%, transparent 10% 20%),
        linear-gradient(180deg, #1a0f11, #080707 70%);
    }

    .roe-shot-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: end;
      min-height: 100%;
      gap: 10px;
    }

    .roe-shot-badge {
      width: fit-content;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(0,0,0,0.32);
      color: rgba(255, 207, 170, 0.82);
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .roe-timeline {
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
      gap: 20px;
      align-items: start;
    }

    .roe-timeline-list {
      display: grid;
      gap: 14px;
    }

    .roe-timeline-item {
      position: relative;
      padding: 22px 22px 22px 76px;
      border-radius: 28px;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
        rgba(14, 8, 8, 0.82);
      box-shadow: var(--shadow);
    }

    .roe-timeline-item::before {
      content: "";
      position: absolute;
      left: 34px;
      top: 26px;
      bottom: -26px;
      width: 1px;
      background: linear-gradient(180deg, rgba(255, 152, 89, 0.5), rgba(255,255,255,0.06));
    }

    .roe-timeline-item:last-child::before {
      display: none;
    }

    .roe-timeline-dot {
      position: absolute;
      left: 20px;
      top: 20px;
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      color: var(--ember-soft);
      background: radial-gradient(circle, rgba(255,123,47,0.26), rgba(255,123,47,0.06));
      border: 1px solid rgba(255, 169, 97, 0.28);
      box-shadow: 0 0 20px rgba(255, 120, 45, 0.12);
    }

    .roe-timeline-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .roe-timeline-phase {
      color: rgba(255, 208, 176, 0.82);
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .roe-timeline-date {
      min-height: 30px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.68);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .roe-timeline-item h3 {
      margin: 0 0 8px;
      font-size: 22px;
      letter-spacing: 0.02em;
    }

    .roe-timeline-item p {
      margin: 0;
      color: rgba(255,255,255,0.74);
      line-height: 1.7;
    }

    .roe-release-panel {
      position: sticky;
      top: 102px;
      padding: 28px;
      border-radius: 32px;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        radial-gradient(circle at top, rgba(255, 117, 42, 0.16), transparent 24%),
        linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),
        rgba(12, 7, 7, 0.86);
      box-shadow: var(--shadow);
      display: grid;
      gap: 18px;
    }

    .roe-release-statlist {
      display: grid;
      gap: 10px;
    }

    .roe-release-stat {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      min-height: 52px;
      padding: 0 14px;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
    }

    .roe-release-stat span {
      color: rgba(255,255,255,0.62);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .roe-release-stat strong {
      color: rgba(255,255,255,0.92);
      font-size: 14px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      text-align: right;
    }

    .roe-release-note {
      color: rgba(255,255,255,0.72);
      line-height: 1.7;
      font-size: 14px;
    }

    .roe-cta-panel {
      position: relative;
      overflow: hidden;
      padding: 36px;
      border-radius: 36px;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        radial-gradient(circle at 10% 20%, rgba(255, 120, 45, 0.16), transparent 18%),
        radial-gradient(circle at 85% 0%, rgba(255, 255, 255, 0.06), transparent 18%),
        linear-gradient(140deg, rgba(25, 10, 10, 0.96), rgba(8, 8, 8, 0.96));
      box-shadow: var(--shadow);
    }

    .roe-cta-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: center;
    }

    .roe-cta-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: flex-end;
    }

    .roe-footer {
      padding: 0 0 52px;
    }

    .roe-footer-inner {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      align-items: center;
      justify-content: space-between;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }

    .roe-footer-links {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }

    .roe-footer-links a {
      color: rgba(255,255,255,0.62);
      text-decoration: none;
      font-size: 13px;
    }

    .roe-modal[hidden] {
      display: none;
    }

    .roe-modal {
      position: fixed;
      inset: 0;
      z-index: 60;
      display: grid;
      place-items: center;
      padding: 20px;
    }

    .roe-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.72);
      backdrop-filter: blur(14px);
    }

    .roe-modal-panel {
      position: relative;
      z-index: 1;
      width: min(960px, 100%);
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(180deg, rgba(26,12,12,0.98), rgba(8,8,8,0.98));
      box-shadow: 0 40px 120px rgba(0,0,0,0.55);
    }

    .roe-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }

    .roe-modal-head h3 {
      margin: 0;
      font-size: 16px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    .roe-modal-close {
      width: 44px;
      height: 44px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.8);
      cursor: pointer;
    }

    .roe-trailer-stage {
      position: relative;
      aspect-ratio: 16 / 9;
      background:
        radial-gradient(circle at 50% 30%, rgba(255, 116, 49, 0.24), transparent 20%),
        linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
        #090808;
      overflow: hidden;
    }

    .roe-trailer-stage::before {
      content: "";
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px);
      opacity: 0.3;
      pointer-events: none;
    }

    .roe-trailer-copy {
      position: absolute;
      inset: auto 0 0 0;
      padding: 28px;
      background: linear-gradient(180deg, transparent, rgba(0,0,0,0.82));
      display: grid;
      gap: 10px;
    }

    .roe-trailer-kicker,
    .roe-modal-eyebrow {
      color: rgba(255, 205, 166, 0.78);
      font-size: 12px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .roe-trailer-copy h4,
    .roe-modal-body h4 {
      margin: 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(1.8rem, 3vw, 2.8rem);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .roe-trailer-copy p,
    .roe-modal-body p {
      margin: 0;
      color: rgba(255,255,255,0.76);
      line-height: 1.7;
    }

    .roe-trailer-play {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
    }

    .roe-trailer-play button {
      width: 92px;
      height: 92px;
      border-radius: 999px;
      border: 1px solid rgba(255, 183, 123, 0.38);
      background: radial-gradient(circle, rgba(255,123,47,0.9), rgba(139,17,22,0.9));
      color: white;
      box-shadow: 0 18px 50px rgba(128, 25, 18, 0.4);
      cursor: pointer;
    }

    .roe-modal-body {
      padding: 22px;
      display: grid;
      gap: 18px;
    }

    .roe-modal-image {
      min-height: 420px;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,0.08);
      background:
        linear-gradient(180deg, rgba(8,8,8,0.16), rgba(8,8,8,0.72)),
        radial-gradient(circle at 50% 30%, rgba(255, 141, 72, 0.24), transparent 18%),
        linear-gradient(135deg, rgba(255,255,255,0.06), transparent 36%),
        #130b0a;
      box-shadow: inset 0 0 80px rgba(0,0,0,0.3);
    }

    .roe-modal-meta {
      display: grid;
      gap: 10px;
    }

    .roe-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 700ms ease, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .roe-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .roe-status {
      margin-top: 16px;
      color: rgba(255,255,255,0.52);
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    @keyframes roe-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes roe-flicker {
      0%, 100% { transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) - 10px)) translateZ(110px) scale(1); opacity: 0.92; }
      25% { transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) - 4px)) translateZ(110px) scale(1.04, 1.06); opacity: 0.98; }
      50% { transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) - 14px)) translateZ(110px) scale(0.98, 1.08); opacity: 0.88; }
      75% { transform: translate(var(--px, 0px), calc(var(--py, 0px) + var(--sy, 0px) - 6px)) translateZ(110px) scale(1.02, 1.03); opacity: 0.95; }
    }

    @keyframes roe-glitch {
      0%, 93%, 100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }
      94% { clip-path: inset(0 0 56% 0); transform: translate(2px, -1px); }
      95% { clip-path: inset(62% 0 0 0); transform: translate(-2px, 2px); }
      96% { clip-path: inset(24% 0 46% 0); transform: translate(1px, 0); }
      97% { clip-path: inset(72% 0 0 0); transform: translate(-1px, 1px); }
    }

    @media (max-width: 1279px) {
      .roe-shell { width: min(1120px, calc(100vw - 28px)); }
      .roe-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .roe-grid-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .roe-media-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .roe-shot:first-child { grid-column: span 2; }
      .roe-hero-visual { min-height: 560px; }
      .roe-hero-grid,
      .roe-world,
      .roe-timeline,
      .roe-cta-grid { grid-template-columns: 1fr; }
      .roe-release-panel { position: static; }
      .roe-cta-actions { justify-content: flex-start; }
    }

    @media (max-width: 767px) {
      .roe-shell { width: min(100vw - 20px, 720px); }
      .roe-nav-inner { min-height: 68px; align-items: flex-start; padding: 14px 0; }
      .roe-nav-links { gap: 12px; }
      .roe-nav-tools { margin-left: 0; }
      .roe-nav-links a { font-size: 11px; letter-spacing: 0.12em; }
      .roe-hero { min-height: auto; padding: 48px 0 34px; }
      .roe-hero-grid { gap: 24px; }
      .roe-hero-actions,
      .roe-platform-row,
      .roe-nav-links,
      .roe-cta-actions { width: 100%; }
      .roe-btn { flex: 1 1 100%; }
      .roe-metrics,
      .roe-grid-4,
      .roe-grid-3,
      .roe-grid-2,
      .roe-media-grid { grid-template-columns: 1fr; }
      .roe-shot:first-child { grid-column: auto; }
      .roe-section { padding: 72px 0; }
      .roe-section-head { align-items: start; flex-direction: column; margin-bottom: 24px; }
      .roe-world-panel,
      .roe-world-ritual,
      .roe-monster-card,
      .roe-shot,
      .roe-hero-visual { min-height: auto; }
      .roe-hero-visual { height: 420px; }
      .roe-ring { width: min(88vw, 400px); }
      .roe-monolith { width: min(74vw, 300px); height: 360px; }
      .roe-footer-inner { flex-direction: column; align-items: flex-start; }
      .roe-modal-body { padding: 16px; }
      .roe-modal-image { min-height: 280px; }
      .roe-trailer-copy { padding: 18px; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .roe-reveal,
      .roe-card,
      .roe-btn,
      .roe-flame,
      .roe-ring::before,
      .roe-ring::after,
      .roe-title-main .roe-glitch::before,
      .roe-title-main .roe-glitch::after {
        animation: none !important;
        transition: none !important;
      }
    }
  `;

  document.head.appendChild(style);
}

function createSigilMarkup() {
  return `
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="100" cy="100" r="82" stroke="currentColor" stroke-width="1.2" opacity="0.75" />
      <circle cx="100" cy="100" r="58" stroke="currentColor" stroke-width="1" opacity="0.5" stroke-dasharray="5 7" />
      <path d="M100 20L114 72L168 72L124 104L140 160L100 126L60 160L76 104L32 72L86 72L100 20Z" stroke="currentColor" stroke-width="1.1" opacity="0.75" />
      <path d="M100 42L126 100L100 158L74 100L100 42Z" stroke="currentColor" stroke-width="1" opacity="0.62" />
      <path d="M52 52L148 148M148 52L52 148" stroke="currentColor" stroke-width="0.8" opacity="0.42" />
      <path d="M100 20V180M20 100H180" stroke="currentColor" stroke-width="0.8" opacity="0.3" />
    </svg>
  `;
}

function mountMarkup(container) {
  container.innerHTML = `
    <div class="roe-page">
      <canvas class="roe-embers-canvas" aria-hidden="true"></canvas>
      <div class="roe-noise" aria-hidden="true"></div>
      <div class="roe-scanlines" aria-hidden="true"></div>
      <div class="roe-vignette" aria-hidden="true"></div>

      <div class="roe-content">
        <header class="roe-nav">
          <div class="roe-shell roe-nav-inner">
            <a class="roe-brand" href="#top" aria-label="RITE OF EMBERS 首页">
              <span class="roe-brand-mark"><i data-lucide="flame" class="h-4 w-4"></i></span>
              <span>RITE OF EMBERS</span>
            </a>

            <nav class="roe-nav-links" aria-label="站点导航">
              <a href="#features">Features</a>
              <a href="#world">Lore</a>
              <a href="#factions">Factions</a>
              <a href="#media">Media</a>
              <a href="#wishlist">Wishlist</a>
              <div class="roe-nav-tools">
                <button class="roe-icon-btn" type="button" data-sound-toggle aria-pressed="false" aria-label="切换氛围音效占位">
                  <i data-lucide="volume-2" class="h-4 w-4"></i>
                </button>
              </div>
            </nav>
          </div>
        </header>

        <main id="top">
          <section class="roe-hero">
            <div class="roe-shell roe-hero-grid">
              <article class="roe-hero-copy roe-reveal" data-reveal>
                <div class="roe-kicker">
                  <i data-lucide="sparkles" class="h-4 w-4"></i>
                  <span>AAA Horror Experience · 2026</span>
                </div>

                <div class="roe-title-wrap" data-parallax-scene>
                  <p class="roe-title-shadow">Rite of Embers</p>
                  <h1 class="roe-title-main">
                    <span class="roe-glitch" data-text="RITE">RITE</span><br />
                    <span>OF</span>
                    <span class="roe-glitch" data-text="EMBERS"> EMBERS</span>
                  </h1>
                  <p class="roe-title-sub">BURN THE SIN. KEEP THE WHISPER.</p>
                </div>

                <p class="roe-hero-desc">
                  当圣火不再净化罪孽，而是把每一次忏悔都变成召唤仪式，整座禁城开始在灰烬下呼吸。你将潜入被焚毁的修道城，面对会模仿祈祷、记住恐惧、并从火中再度诞生的古老意志。
                </p>

                <div class="roe-hero-actions">
                  <a class="roe-btn roe-btn--primary" href="#wishlist">
                    <i data-lucide="heart" class="h-4 w-4"></i>
                    <span>Add to Wishlist</span>
                  </a>
                  <button class="roe-btn" type="button" data-open-trailer>
                    <i data-lucide="play" class="h-4 w-4"></i>
                    <span>Watch Ritual Trailer</span>
                  </button>
                </div>

                <div class="roe-platform-row" aria-label="发售平台">
                  <span class="roe-chip"><i data-lucide="monitor-play" class="h-4 w-4"></i> Steam</span>
                  <span class="roe-chip"><i data-lucide="gamepad-2" class="h-4 w-4"></i> PlayStation 5</span>
                  <span class="roe-chip"><i data-lucide="cpu" class="h-4 w-4"></i> Xbox Series</span>
                  <span class="roe-chip"><i data-lucide="gallery-vertical-end" class="h-4 w-4"></i> Epic Games</span>
                </div>

                <div class="roe-metrics">
                  <div class="roe-metric">
                    <strong>17h</strong>
                    <span>电影化主线压迫流程</span>
                  </div>
                  <div class="roe-metric">
                    <strong>4</strong>
                    <span>敌对阵营与异化生态</span>
                  </div>
                  <div class="roe-metric">
                    <strong>100%</strong>
                    <span>动态火焰与沉浸视差</span>
                  </div>
                </div>
              </article>

              <aside class="roe-hero-visual roe-reveal" data-reveal data-parallax-scene>
                <div class="roe-altar">
                  <div class="roe-fog" data-depth="10"></div>
                  <div class="roe-ring" data-depth="12"></div>
                  <div class="roe-core" data-depth="20"></div>
                  <div class="roe-sigil" data-depth="28">${createSigilMarkup()}</div>
                  <div class="roe-monolith" data-depth="18">
                    <div class="roe-monolith-panel">
                      <p>Ritual Status</p>
                      <strong>Third Ember Awakened</strong>
                    </div>
                  </div>
                  <div class="roe-flame" data-depth="34"></div>
                </div>
              </aside>
            </div>
          </section>

          <section class="roe-section" id="features">
            <div class="roe-shell">
              <div class="roe-section-head roe-reveal" data-reveal>
                <div>
                  <p class="roe-eyebrow">Core Features</p>
                  <h2>被火焰驱动的生存恐惧</h2>
                </div>
                <p>不是单纯跳脸惊吓，而是让火焰、声音、信仰与空间结构共同制造持续压迫。每一次推进，都是一次与环境、与怪物、与自己记忆的拉扯。</p>
              </div>

              <div class="roe-grid-4">
                <article class="roe-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-card-icon"><i data-lucide="flame-kindling" class="h-5 w-5"></i></div>
                  <div class="roe-card-stack">
                    <h3>圣火会吞噬光源</h3>
                    <p>火把不是安全区。火焰越盛，阴影里的异形越会觉醒，照明本身就是冒险决策。</p>
                  </div>
                </article>

                <article class="roe-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-card-icon"><i data-lucide="brain-circuit" class="h-5 w-5"></i></div>
                  <div class="roe-card-stack">
                    <h3>敌人会学习你的恐惧</h3>
                    <p>动态 AI 会记住你的逃生路线、躲藏习惯与高压反应，第二次遭遇永远比第一次更危险。</p>
                  </div>
                </article>

                <article class="roe-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-card-icon"><i data-lucide="orbit" class="h-5 w-5"></i></div>
                  <div class="roe-card-stack">
                    <h3>仪式解谜层层嵌套</h3>
                    <p>符号、圣歌、尸蜡与焦痕会形成多层谜题，你需要在时间压力下拼出正确的净化顺序。</p>
                  </div>
                </article>

                <article class="roe-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-card-icon"><i data-lucide="users-round" class="h-5 w-5"></i></div>
                  <div class="roe-card-stack">
                    <h3>单人叙事 / 双人噩梦</h3>
                    <p>支持单人沉浸式剧情，也支持双人协作模式；在合作中，彼此的视野甚至会被恶意扭曲。</p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="roe-section" id="world">
            <div class="roe-shell">
              <div class="roe-section-head roe-reveal" data-reveal>
                <div>
                  <p class="roe-eyebrow">Lore</p>
                  <h2>灰烬之城的最后一次弥撒</h2>
                </div>
                <p>三十年前，大火吞没了修道圣城 Vesper Vale。官方记录称那只是失控的净化仪式，但废墟深处仍然回荡着祷告——像某种从未真正熄灭的胃口。</p>
              </div>

              <div class="roe-world">
                <article class="roe-world-panel roe-reveal" data-reveal>
                  <div class="roe-card-stack">
                    <p class="roe-eyebrow">Worldline 03</p>
                    <p class="roe-world-quote">“罪不会被焚尽。它只会在火中学会新的名字。”</p>
                    <p class="roe-world-copy">你扮演前驱魔调查员 Elian Voss，在收到一卷来自死城的录音带后重返禁区。每一座祭坛、每一段唱诗、每一具蜡封尸体都在暗示：当年被封印的并不是恶魔，而是某种借人类信仰孵化出的共生神经体。</p>
                  </div>
                  <div class="roe-grid-2">
                    <div class="roe-card">
                      <h3>叙事节奏</h3>
                      <p>电影化镜头切换 + 玩家主动探索，推进过程中持续穿插伪纪录、祷文碎片和审判回放。</p>
                    </div>
                    <div class="roe-card">
                      <h3>情绪目标</h3>
                      <p>让玩家始终处于“看见太多”和“还没看见真相”之间的焦虑缝隙里。</p>
                    </div>
                  </div>
                </article>

                <aside class="roe-world-ritual roe-reveal" data-reveal data-parallax-scene>
                  <div class="roe-ritual-grid" aria-hidden="true"></div>
                  <div class="roe-ritual-seal" data-depth="20">${createSigilMarkup()}</div>
                  <div class="roe-ritual-tags">
                    <span>Burned Choir</span>
                    <span>Living Ash</span>
                    <span>False Saint</span>
                    <span>Memory Parasite</span>
                    <span>Cathedral Maw</span>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section class="roe-section" id="factions">
            <div class="roe-shell">
              <div class="roe-section-head roe-reveal" data-reveal>
                <div>
                  <p class="roe-eyebrow">Factions & Monsters</p>
                  <h2>你不会只面对一种恶意</h2>
                </div>
                <p>每个阵营都有自己的崇拜逻辑、移动方式与追猎规则。它们不是随机素材，而是世界观中真正推动恐惧机制的活体系统。</p>
              </div>

              <div class="roe-grid-3">
                <article class="roe-card roe-monster-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-monster-top">
                    <div class="roe-monster-figure"></div>
                    <div class="roe-monster-rune">The Ash Priest</div>
                    <div class="roe-monster-silhouette" data-shape="priest"></div>
                  </div>
                  <div class="roe-monster-body">
                    <h3 class="roe-monster-name">灰烬祭司</h3>
                    <p class="roe-monster-copy">会伪装成人类祷告姿态，利用回声定位玩家。你听到的每一句赦罪，可能都是追杀倒计时。</p>
                    <div class="roe-monster-taglist"><span>Echo Hunt</span><span>Prayer Mimic</span><span>Boss Stalker</span></div>
                  </div>
                </article>

                <article class="roe-card roe-monster-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-monster-top">
                    <div class="roe-monster-figure"></div>
                    <div class="roe-monster-rune">The Choir Beast</div>
                    <div class="roe-monster-silhouette" data-shape="beast"></div>
                  </div>
                  <div class="roe-monster-body">
                    <h3 class="roe-monster-name">唱诗兽群</h3>
                    <p class="roe-monster-copy">由多具焚焦遗体融合而成。它们在移动时会发出层叠合唱，音高越纯净，距离你越近。</p>
                    <div class="roe-monster-taglist"><span>Pack Threat</span><span>Sound Pressure</span><span>Unstable Swarm</span></div>
                  </div>
                </article>

                <article class="roe-card roe-monster-card roe-reveal" data-reveal data-tilt>
                  <div class="roe-monster-top">
                    <div class="roe-monster-figure"></div>
                    <div class="roe-monster-rune">False Saint</div>
                    <div class="roe-monster-silhouette" data-shape="saint"></div>
                  </div>
                  <div class="roe-monster-body">
                    <h3 class="roe-monster-name">伪圣像</h3>
                    <p class="roe-monster-copy">不主动奔跑，只在你移开视线时改变位置。它最危险的攻击不是扑杀，而是偷走你的方向感。</p>
                    <div class="roe-monster-taglist"><span>Perception Trap</span><span>Slow Horror</span><span>Gaze Trigger</span></div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="roe-section" id="media">
            <div class="roe-shell">
              <div class="roe-section-head roe-reveal" data-reveal>
                <div>
                  <p class="roe-eyebrow">Media Preview</p>
                  <h2>宣传画面与压迫式场景</h2>
                </div>
                <p>当前使用纯前端占位视觉模拟宣传截图风格，后续可以直接替换为真实游戏截图或预告片封面，不影响版式结构。</p>
              </div>

              <div class="roe-media-grid">
                <article class="roe-shot roe-reveal" data-reveal data-tilt data-scene="cathedral" data-shot-title="焚毁中殿" data-shot-kicker="Cathedral Depth" data-shot-copy="巨型拱顶下仍悬挂着尚未冷却的钟摆香炉，火光会照出不该存在的第二层影子。">
                  <div class="roe-shot-bg"></div>
                  <div class="roe-shot-content">
                    <span class="roe-shot-badge">Cathedral Depth</span>
                    <h3 class="roe-shot-title">焚毁中殿</h3>
                    <p class="roe-shot-copy">巨型拱顶下仍悬挂着尚未冷却的钟摆香炉，火光会照出不该存在的第二层影子。</p>
                  </div>
                </article>

                <article class="roe-shot roe-reveal" data-reveal data-tilt data-scene="forest" data-shot-title="焦林小径" data-shot-kicker="Whisper Path" data-shot-copy="树干被经文刻满，风一吹就像成千上万张嘴同时贴近耳边。">
                  <div class="roe-shot-bg"></div>
                  <div class="roe-shot-content">
                    <span class="roe-shot-badge">Whisper Path</span>
                    <h3 class="roe-shot-title">焦林小径</h3>
                    <p class="roe-shot-copy">树干被经文刻满，风一吹就像成千上万张嘴同时贴近耳边。</p>
                  </div>
                </article>

                <article class="roe-shot roe-reveal" data-reveal data-tilt data-scene="pit" data-shot-title="献祭深井" data-shot-kicker="Inferno Pit" data-shot-copy="井壁不停渗出温热灰浆，脚步声会被地下回廊复制成追逐回声。">
                  <div class="roe-shot-bg"></div>
                  <div class="roe-shot-content">
                    <span class="roe-shot-badge">Inferno Pit</span>
                    <h3 class="roe-shot-title">献祭深井</h3>
                    <p class="roe-shot-copy">井壁不停渗出温热灰浆，脚步声会被地下回廊复制成追逐回声。</p>
                  </div>
                </article>

                <article class="roe-shot roe-reveal" data-reveal data-tilt data-scene="lab" data-shot-title="禁忌研究室" data-shot-kicker="Relic Lab" data-shot-copy="你会发现所谓圣物，其实是被精心保存的异化神经组织样本。">
                  <div class="roe-shot-bg"></div>
                  <div class="roe-shot-content">
                    <span class="roe-shot-badge">Relic Lab</span>
                    <h3 class="roe-shot-title">禁忌研究室</h3>
                    <p class="roe-shot-copy">你会发现所谓圣物，其实是被精心保存的异化神经组织样本。</p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="roe-section" id="timeline">
            <div class="roe-shell">
              <div class="roe-section-head roe-reveal" data-reveal>
                <div>
                  <p class="roe-eyebrow">Story Timeline</p>
                  <h2>从幸存者调查到审判之夜</h2>
                </div>
                <p>把官网从纯氛围页再往前推一步：给玩家明确的剧情推进钩子、版本节奏和发售窗口，让“想加愿望单”的动作更有理由。</p>
              </div>

              <div class="roe-timeline">
                <div class="roe-timeline-list">
                  <article class="roe-timeline-item roe-reveal" data-reveal>
                    <div class="roe-timeline-dot"><i data-lucide="radio" class="h-4 w-4"></i></div>
                    <div class="roe-timeline-meta">
                      <span class="roe-timeline-phase">Phase 01</span>
                      <span class="roe-timeline-date">Prologue</span>
                    </div>
                    <h3>失真的录音带</h3>
                    <p>Elian Voss 收到一卷来自 Vesper Vale 的审判录音。祷文在中途突然变成陌生童声，反复念出一串尚未发生的死亡名单。</p>
                  </article>

                  <article class="roe-timeline-item roe-reveal" data-reveal>
                    <div class="roe-timeline-dot"><i data-lucide="landmark" class="h-4 w-4"></i></div>
                    <div class="roe-timeline-meta">
                      <span class="roe-timeline-phase">Phase 02</span>
                      <span class="roe-timeline-date">Act I</span>
                    </div>
                    <h3>重返焚城圣区</h3>
                    <p>玩家穿过焦林、塌毁修道院与封闭中殿，逐步发现三十年前的净化仪式并非失败，而是被某种东西“成功回应”。</p>
                  </article>

                  <article class="roe-timeline-item roe-reveal" data-reveal>
                    <div class="roe-timeline-dot"><i data-lucide="brain" class="h-4 w-4"></i></div>
                    <div class="roe-timeline-meta">
                      <span class="roe-timeline-phase">Phase 03</span>
                      <span class="roe-timeline-date">Act II</span>
                    </div>
                    <h3>记忆开始反咬</h3>
                    <p>敌人不再只追踪脚步，而会重组你的回忆。你看到的地图、同伴、祷词，都会在高压时刻失去可信度。</p>
                  </article>

                  <article class="roe-timeline-item roe-reveal" data-reveal>
                    <div class="roe-timeline-dot"><i data-lucide="flame" class="h-4 w-4"></i></div>
                    <div class="roe-timeline-meta">
                      <span class="roe-timeline-phase">Phase 04</span>
                      <span class="roe-timeline-date">Final Rite</span>
                    </div>
                    <h3>第三余烬被唤醒</h3>
                    <p>所有线索最终汇入最后一次弥撒。你要决定焚毁真相、继承火种，还是让整座圣城彻底坠入会呼吸的灰烬里。</p>
                  </article>
                </div>

                <aside class="roe-release-panel roe-reveal" data-reveal>
                  <div>
                    <p class="roe-eyebrow">Release Intel</p>
                    <h2 style="margin:8px 0 0;font-family:Georgia,serif;text-transform:uppercase;letter-spacing:.08em;font-size:clamp(2rem,4vw,2.8rem);">2026 Q4</h2>
                  </div>
                  <p class="roe-release-note">当前官网版本把“发售感”补完整：不仅展示氛围，也明确项目阶段、目标平台与内容承诺，适合继续往商店页或宣发页推进。</p>
                  <div class="roe-release-statlist">
                    <div class="roe-release-stat"><span>Game Mode</span><strong>Single / Co-op</strong></div>
                    <div class="roe-release-stat"><span>Platforms</span><strong>PC · PS5 · Xbox</strong></div>
                    <div class="roe-release-stat"><span>Campaign</span><strong>~17 Hours</strong></div>
                    <div class="roe-release-stat"><span>Current State</span><strong>Vertical Slice Ready</strong></div>
                  </div>
                  <a class="roe-btn roe-btn--primary" href="#wishlist">
                    <i data-lucide="badge-plus" class="h-4 w-4"></i>
                    <span>Unlock Launch Updates</span>
                  </a>
                </aside>
              </div>
            </div>
          </section>

          <section class="roe-section" id="wishlist">
            <div class="roe-shell">
              <div class="roe-cta-panel roe-reveal" data-reveal>
                <div class="roe-cta-grid">
                  <div class="roe-card-stack">
                    <p class="roe-eyebrow">Launch Platforms</p>
                    <h2 style="margin:0;font-family:Georgia,serif;text-transform:uppercase;letter-spacing:.08em;font-size:clamp(2rem,4vw,3rem);">点燃你的愿望单</h2>
                    <p class="roe-cta-copy">预计 2026 Q4 发售。支持 PC / PlayStation 5 / Xbox Series。现在加入愿望单，解锁幕后设定手册、怪物档案与首发前独家“审判录音”资料包。</p>
                    <div class="roe-status">Current Build Status · Vertical Slice Ready · Wishlist Page Placeholder</div>
                  </div>

                  <div class="roe-cta-actions">
                    <a class="roe-btn roe-btn--primary" href="#top">
                      <i data-lucide="flame" class="h-4 w-4"></i>
                      <span>Pre-Order Alert</span>
                    </a>
                    <a class="roe-btn" href="#media">
                      <i data-lucide="images" class="h-4 w-4"></i>
                      <span>View Screens</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer class="roe-footer">
          <div class="roe-shell roe-footer-inner">
            <div>
              <div class="roe-brand" style="letter-spacing:.18em;">
                <span class="roe-brand-mark"><i data-lucide="shield-alert" class="h-4 w-4"></i></span>
                <span>RITE OF EMBERS</span>
              </div>
              <p class="roe-footer-copy" style="margin-top:12px;max-width:560px;">A fictional horror game landing page concept crafted for preview and presentation. All names, lore, visuals and platform mentions are demo placeholders.</p>
            </div>
            <div class="roe-footer-links">
              <a href="#features">Features</a>
              <a href="#world">Lore</a>
              <a href="#factions">Factions</a>
              <a href="#media">Media</a>
            </div>
          </div>
        </footer>

        <div class="roe-modal" data-modal="trailer" hidden>
          <div class="roe-modal-backdrop" data-close-modal></div>
          <div class="roe-modal-panel" role="dialog" aria-modal="true" aria-labelledby="roe-trailer-title">
            <div class="roe-modal-head">
              <h3 id="roe-trailer-title">Ritual Trailer</h3>
              <button class="roe-modal-close" type="button" data-close-modal aria-label="关闭预告弹层">✕</button>
            </div>
            <div class="roe-trailer-stage">
              <div class="roe-trailer-play">
                <button type="button" data-fake-play aria-label="播放预告占位动画">
                  <i data-lucide="play" class="h-6 w-6"></i>
                </button>
              </div>
              <div class="roe-trailer-copy">
                <span class="roe-trailer-kicker">Teaser Capture · Placeholder Sequence</span>
                <h4>When the prayer answers back.</h4>
                <p>这里先用高氛围占位弹层模拟预告入口，后续可直接替换成 YouTube、Bilibili、MP4 或本地压缩视频资源。</p>
              </div>
            </div>
          </div>
        </div>

        <div class="roe-modal" data-modal="shot" hidden>
          <div class="roe-modal-backdrop" data-close-modal></div>
          <div class="roe-modal-panel" role="dialog" aria-modal="true" aria-labelledby="roe-shot-title">
            <div class="roe-modal-head">
              <h3 id="roe-shot-title">Scene Focus</h3>
              <button class="roe-modal-close" type="button" data-close-modal aria-label="关闭截图弹层">✕</button>
            </div>
            <div class="roe-modal-body">
              <div class="roe-modal-image" data-modal-image></div>
              <div class="roe-modal-meta">
                <span class="roe-modal-eyebrow" data-modal-kicker></span>
                <h4 data-modal-title></h4>
                <p data-modal-copy></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupModal() {
  const trailerModal = document.querySelector('[data-modal="trailer"]');
  const shotModal = document.querySelector('[data-modal="shot"]');
  const openTrailer = document.querySelector('[data-open-trailer]');
  const fakePlay = trailerModal?.querySelector('[data-fake-play]');
  const shotNodes = [...document.querySelectorAll('.roe-shot')];
  const shotImage = shotModal?.querySelector('[data-modal-image]');
  const shotKicker = shotModal?.querySelector('[data-modal-kicker]');
  const shotTitle = shotModal?.querySelector('[data-modal-title]');
  const shotCopy = shotModal?.querySelector('[data-modal-copy]');

  const closeModal = (modal) => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  const openModal = (modal) => {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  document.querySelectorAll('[data-close-modal]').forEach((node) => {
    node.addEventListener('click', () => closeModal(node.closest('.roe-modal')));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeModal(trailerModal);
    closeModal(shotModal);
  });

  openTrailer?.addEventListener('click', () => openModal(trailerModal));

  fakePlay?.addEventListener('click', () => {
    const copy = trailerModal?.querySelector('.roe-trailer-copy p');
    if (copy) {
      copy.textContent = '预告资源位已激活：后续可接真实视频地址、封面图、字幕与播放统计埋点。';
    }
  });

  shotNodes.forEach((node) => {
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `查看场景：${node.dataset.shotTitle || ''}`);

    const showShot = () => {
      if (!shotModal || !shotImage || !shotKicker || !shotTitle || !shotCopy) return;
      shotImage.style.background = getComputedStyle(node.querySelector('.roe-shot-bg')).background;
      shotKicker.textContent = node.dataset.shotKicker || '';
      shotTitle.textContent = node.dataset.shotTitle || '';
      shotCopy.textContent = node.dataset.shotCopy || '';
      openModal(shotModal);
    };

    node.addEventListener('click', showShot);
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        showShot();
      }
    });
  });
}

function setupSoundToggle(runtime) {
  const button = document.querySelector('[data-sound-toggle]');
  if (!button) return;

  let enabled = false;
  button.addEventListener('click', () => {
    enabled = !enabled;
    button.classList.toggle('is-active', enabled);
    button.setAttribute('aria-pressed', String(enabled));
    const icon = button.querySelector('i');
    if (icon) icon.setAttribute('data-lucide', enabled ? 'volume-x' : 'volume-2');
    runtime.refreshIcons();
    button.title = enabled ? '氛围音效占位：关闭' : '氛围音效占位：开启';
  });
}

function setupReveal() {
  const items = [...document.querySelectorAll("[data-reveal]")];
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

function setupTilt() {
  const nodes = [...document.querySelectorAll("[data-tilt]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  nodes.forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 8;
      node.style.setProperty("--rx", `${rotateX}deg`);
      node.style.setProperty("--ry", `${rotateY}deg`);
      node.style.setProperty("--lift", `-4px`);
      node.style.setProperty("--mx", `${px * 100}%`);
      node.style.setProperty("--my", `${py * 100}%`);
    });

    node.addEventListener("pointerleave", () => {
      node.style.removeProperty("--rx");
      node.style.removeProperty("--ry");
      node.style.removeProperty("--lift");
    });
  });
}

function setupParallax() {
  const scenes = [...document.querySelectorAll("[data-parallax-scene]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !scenes.length) return;

  scenes.forEach((scene) => {
    const layers = [...scene.querySelectorAll("[data-depth]")];
    if (!layers.length) return;

    const updateScene = (clientX, clientY) => {
      const rect = scene.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((clientY - rect.top) / rect.height - 0.5) * 2;
      layers.forEach((layer) => {
        const depth = Number(layer.getAttribute("data-depth") || 10);
        const tx = nx * depth;
        const ty = ny * depth * -0.7;
        layer.style.setProperty("--px", `${tx}px`);
        layer.style.setProperty("--py", `${ty}px`);
      });
    };

    scene.addEventListener("pointermove", (event) => updateScene(event.clientX, event.clientY));
    scene.addEventListener("pointerleave", () => {
      layers.forEach((layer) => {
        layer.style.setProperty("--px", "0px");
        layer.style.setProperty("--py", "0px");
      });
    });
  });
}

function setupHeroDrift() {
  const visual = document.querySelector(".roe-hero-visual");
  if (!visual) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let rafId = 0;
  const layers = [...visual.querySelectorAll("[data-depth]")];

  const render = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    layers.forEach((layer) => {
      const depth = Number(layer.getAttribute("data-depth") || 10);
      const drift = Math.min(scrollY * 0.04 * (depth / 24), depth * 1.2);
      layer.style.setProperty("--sy", `${drift}px`);
    });
    rafId = 0;
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(render);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  render();
}

function setupParticles() {
  const canvas = document.querySelector(".roe-embers-canvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const particles = [];
  const particleCount = reduceMotion ? 18 : (window.innerWidth < 768 ? 32 : 64);
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawnParticle = () => ({
    x: Math.random() * width,
    y: height + Math.random() * height * 0.4,
    radius: Math.random() * 2.8 + 0.8,
    alpha: Math.random() * 0.5 + 0.16,
    speedY: Math.random() * 0.8 + 0.25,
    speedX: (Math.random() - 0.5) * 0.5,
    flicker: Math.random() * Math.PI * 2,
    hue: 18 + Math.random() * 22
  });

  const refill = () => {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push(spawnParticle());
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, height * 0.55, 0, height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(255,92,22,0.06)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.y -= particle.speedY;
      particle.x += particle.speedX + Math.sin(particle.flicker) * 0.12;
      particle.flicker += 0.04;

      if (particle.y < -20 || particle.x < -20 || particle.x > width + 20) {
        Object.assign(particle, spawnParticle(), { y: height + Math.random() * 60 });
      }

      const alpha = particle.alpha * (0.72 + Math.sin(particle.flicker * 2) * 0.18);
      context.beginPath();
      context.fillStyle = `hsla(${particle.hue}, 100%, 62%, ${alpha})`;
      context.shadowBlur = 18;
      context.shadowColor = `hsla(${particle.hue}, 100%, 62%, ${Math.max(alpha, 0.18)})`;
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    animationFrame = window.requestAnimationFrame(draw);
  };

  resize();
  refill();
  draw();

  window.addEventListener("resize", () => {
    resize();
    refill();
  });

  return () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  };
}

export function mountPage({ container, runtime }) {
  ensureStyles();
  mountMarkup(container);
  runtime.refreshIcons();
  setupModal();
  setupSoundToggle(runtime);
  setupReveal();
  setupTilt();
  setupParallax();
  setupHeroDrift();
  setupParticles();
}
