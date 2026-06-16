# WebGen Restructure And Template Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Shrink WebGen's governance surface area, rebuild the default `vite-page` template into a production-grade starter, and make the design flow executable instead of aspirational.

**Architecture:** Split the work into two layers. First, collapse the agent workflow to the smallest enforceable set of gates around routing, proposal confirmation, implementation, preview verification, and design review. Second, rebuild the template and docs so the default generated page starts from a real brand-quality landing page rather than a starter note panel.

**Tech Stack:** Shell scripts, Markdown docs, Vite single-page scaffold, plain JavaScript, Tailwind utility classes via CDN/runtime integration.

---

### Task 1: Capture the target architecture

**Files:**
- Create: `docs/plans/2026-06-16-webgen-restructure-design.md`
- Modify: `AGENTS.md`
- Modify: `docs/webgen-sop-and-gates.md`

**Step 1: Write the failing test**

Define a checklist of target simplifications:
- Workflow stages reduced to a minimal operational chain
- Gate set reduced to enforceable hard gates only
- Design pipeline kept, but moved out of speculative governance wording into concrete execution requirements
- Template starter must no longer read like developer-facing placeholder content

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "Blueprint Gate|Audit Gate|Refine Gate|Asset Input Gate" AGENTS.md docs/webgen-sop-and-gates.md
```

Expected: multiple matches proving the current governance model is still over-expanded.

**Step 3: Write minimal implementation**

Create a design doc describing:
- minimal architecture
- retained hard gates
- simplified documentation model
- template quality target

**Step 4: Run test to verify it passes**

Run:

```bash
test -f docs/plans/2026-06-16-webgen-restructure-design.md
```

Expected: command succeeds.

### Task 2: Simplify the agent governance contract

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/webgen-sop-and-gates.md`
- Modify: `docs/webgen-design-cheatsheet.md`
- Modify: `docs/webgen-ops-index.md`

**Step 1: Write the failing test**

Current failure conditions:
- duplicate or non-enforceable workflow concepts dominate the main contract
- stages/gates exceed what the scripts can actually enforce

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "Blueprint Gate|Audit Gate|Refine Gate|Delivery Gate|SO-009|SO-010" AGENTS.md docs/webgen-sop-and-gates.md docs/webgen-design-cheatsheet.md docs/webgen-ops-index.md
```

Expected: extensive matches show the current spec is too broad.

**Step 3: Write minimal implementation**

Refactor docs so they describe:
- three layers: routing/project isolation, delivery workflow, design quality loop
- minimal stage chain
- minimal gate chain
- design review as a mandatory execution loop, not an extra governance tree

**Step 4: Run test to verify it passes**

Run:

```bash
rg -n "Route Gate|Session Gate|Proposal Gate|Implementation Gate|Verification Gate|Design Review Gate" AGENTS.md docs/webgen-sop-and-gates.md
```

Expected: only the reduced gate model remains.

### Task 3: Align workflow scripts to the reduced model

**Files:**
- Modify: `scripts/workflow-init.sh`
- Modify: `scripts/workflow-set-gate.sh`
- Modify: `scripts/workflow-transition.sh`
- Modify: `scripts/workflow-check.sh`
- Modify: `scripts/workflow-record-approval.sh`
- Modify: `scripts/workflow-record-verification.sh`
- Modify: `scripts/workflow-assert-delivery-ready.sh`
- Modify: `scripts/workflow-sync-docs.sh`

**Step 1: Write the failing test**

Define expected behavior:
- workflow state contains only the reduced stages/gates
- scaffolding/session state cannot be auto-marked as fully passed without actual checks
- verification and design review become first-class recorded checks

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "assetInput|scaffold|delivery" scripts/workflow-*.sh
```

Expected: existing scripts still use the broader governance model.

**Step 3: Write minimal implementation**

Update scripts so they:
- initialize the reduced state model
- only mark route/session/scaffold after real checks or documented assumptions
- add design review recording support
- keep docs sync compatible with the new state shape

**Step 4: Run test to verify it passes**

Run:

```bash
rg -n "designReview|verification" scripts/workflow-*.sh
```

Expected: workflow scripts include the new reduced-but-real review path.

### Task 4: Rebuild the default template starter

**Files:**
- Modify: `templates/vite-page/scaffold/src/generated/page.js`
- Modify: `templates/vite-page/TEMPLATE.md`
- Modify: `templates/vite-page/post-init/DISCOVERY.md.tpl`
- Modify: `templates/vite-page/post-init/PROJECT.md.tpl`
- Modify: `templates/vite-page/post-init/HANDOFF.md.tpl`

**Step 1: Write the failing test**

Define the new starter expectations:
- must read like a polished launch-ready landing shell
- must include a coherent visual direction
- must include responsive structure and core states
- must avoid developer-facing placeholder tone

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "Starter Notes|WebGen Starter Page|页面入口|图标刷新" templates/vite-page/scaffold/src/generated/page.js
```

Expected: matches prove the template is still a developer placeholder.

**Step 3: Write minimal implementation**

Replace the page with a real brand-grade single-page shell:
- editorial/brand-forward hero
- modular narrative sections
- loading/empty/error/active feedback examples
- responsive polish and meaningful motion hooks

**Step 4: Run test to verify it passes**

Run:

```bash
! rg -n "Starter Notes|WebGen Starter Page|页面入口|图标刷新" templates/vite-page/scaffold/src/generated/page.js
```

Expected: no matches.

### Task 5: Bring the design loop into executable defaults

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/webgen-design-guide.md`
- Modify: `templates/vite-page/TEMPLATE.md`
- Modify: `templates/vite-page/post-init/DISCOVERY.md.tpl`

**Step 1: Write the failing test**

Expected design loop:
- `Design Read`
- page direction
- real implementation
- preview verification
- CDP/manual design review record

**Step 2: Run test to verify it fails**

Run:

```bash
rg -n "impeccable audit|CDP|Design Read" AGENTS.md docs/webgen-design-guide.md templates/vite-page/TEMPLATE.md templates/vite-page/post-init/DISCOVERY.md.tpl
```

Expected: wording is fragmented and over-specified, not operationally crisp.

**Step 3: Write minimal implementation**

Rewrite the design guidance to:
- keep the mandatory quality bar
- reduce repetition
- express a simple default design execution loop

**Step 4: Run test to verify it passes**

Run:

```bash
rg -n "Design Read|设计复核|CDP|首版页面" AGENTS.md docs/webgen-design-guide.md templates/vite-page/TEMPLATE.md
```

Expected: the simplified design execution path is clearly documented.

### Task 6: Verify and optimize twice

**Files:**
- Verify all touched files
- Optionally modify any touched file for round-2 polish

**Step 1: Write the failing test**

Verification target:
- docs consistent
- shell scripts syntactically valid
- scaffold project builds
- starter page visually stronger than baseline

**Step 2: Run test to verify it fails**

Run:

```bash
npm run build
```

Expected: may fail before dependencies/context are confirmed or before all changes are complete.

**Step 3: Write minimal implementation**

Fix any issues found, then perform two optimization rounds:
- Round 1: structural and wording cleanup
- Round 2: visual polish and state/detail cleanup

**Step 4: Run test to verify it passes**

Run:

```bash
npm run build
```

Expected: build succeeds.
