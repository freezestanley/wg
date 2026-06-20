import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const WORKSPACE_ROOT = "/Users/za-stanlexu/.openclaw/agents/webgen/workspace";
const SCRIPT = join(WORKSPACE_ROOT, "scripts/page-design-guard.mjs");

function makeProject(pageSource) {
  const root = mkdtempSync(join(tmpdir(), "webgen-guard-"));
  mkdirSync(join(root, "src", "generated"), { recursive: true });
  writeFileSync(join(root, "src", "generated", "page.js"), pageSource);
  return root;
}

function runGuard(projectRoot) {
  return execFileSync("node", [SCRIPT, projectRoot], {
    cwd: WORKSPACE_ROOT,
    encoding: "utf8"
  });
}

test("fails when page misses proof section and CTA affordance", () => {
  const root = makeProject(`
    export function mountPage({ container }) {
      container.innerHTML = \`
        <section>
          <h1>只剩一个大标题</h1>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article>卡片一</article>
            <article>卡片二</article>
            <article>卡片三</article>
          </div>
        </section>
      \`;
    }
  `);

  try {
    assert.throws(
      () => runGuard(root),
      (error) => {
        assert.equal(error.status, 2);
        assert.match(error.stdout, /proof section missing/);
        assert.match(error.stdout, /cta missing/);
        assert.match(error.stdout, /three-column card grid detected/);
        return true;
      }
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("passes when page has hero, proof section and CTA", () => {
  const root = makeProject(`
    export function mountPage({ container }) {
      container.innerHTML = \`
        <section>
          <header>
            <h1>品牌主张</h1>
            <p>价值说明</p>
            <a href="#cta">立即咨询</a>
          </header>
          <section id="proof">
            <h2>案例证明</h2>
            <p>客户案例与数据说明</p>
          </section>
          <section id="cta">
            <button>开始预约</button>
          </section>
        </section>
      \`;
    }
  `);

  try {
    const output = runGuard(root);
    assert.match(output, /PAGE DESIGN GUARD OK/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails when hero lacks mobile-first value copy and above-the-fold CTA", () => {
  const root = makeProject(`
    export function mountPage({ container }) {
      container.innerHTML = \`
        <section>
          <header>
            <h1>Studio North</h1>
            <div class="hero-image">视觉主图</div>
          </header>
          <section id="proof">
            <h2>案例证明</h2>
            <p>客户案例与数据说明</p>
          </section>
          <section>
            <a href="#cta">立即咨询</a>
          </section>
        </section>
      \`;
    }
  `);

  try {
    assert.throws(
      () => runGuard(root),
      (error) => {
        assert.equal(error.status, 2);
        assert.match(error.stdout, /hero missing value copy or early cta/);
        return true;
      }
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails when CTA copy is generic", () => {
  const root = makeProject(`
    export function mountPage({ container }) {
      container.innerHTML = \`
        <section>
          <header>
            <h1>品牌主张</h1>
            <p>价值说明</p>
            <a href="#cta">了解更多</a>
          </header>
          <section id="proof">
            <h2>案例证明</h2>
            <p>客户案例与数据说明</p>
          </section>
        </section>
      \`;
    }
  `);

  try {
    assert.throws(
      () => runGuard(root),
      (error) => {
        assert.equal(error.status, 2);
        assert.match(error.stdout, /generic cta copy detected/);
        return true;
      }
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("fails when scaffold hello world placeholder is still present", () => {
  const root = makeProject(`
    export function mountPage({ container }) {
      container.innerHTML = \`
        <main class="flex min-h-screen items-center justify-center bg-white px-6 text-center text-black">
          <p class="text-base font-medium tracking-[0.02em]">hello world</p>
        </main>
      \`;
    }
  `);

  try {
    assert.throws(
      () => runGuard(root),
      (error) => {
        assert.equal(error.status, 2);
        assert.match(error.stdout, /scaffold placeholder not replaced/);
        return true;
      }
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
