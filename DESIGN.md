# argmap — design

> A frontend tool for mapping and structurally checking arguments. Vanilla JS for v1; a React UI is planned for v2.

_Last updated: 2026-06-27_

## What it is
A tool for mapping and pressure-testing arguments. You lay out **claims** and connect them with relations (**supports**; objections come later); the result is a "logical roadmap" — a graph of premises feeding a conclusion.

Field name: **argument mapping** (informal-logic visualization). Prior art: Kialo (pro/con debate trees), Argdown (write-to-render), Rationale (teaching). The wedge vs. those: argmap **checks structure** — it isn't just a drawing tool.

## Scope (v1)
Single user, local. No accounts, no sharing, no multi-user — all cut. The goal is to map an argument and spot bad reasoning.

## The core design decision: checking, not drawing
A checking tool comes in two flavors:
- **Semantic checks** (understand what claims *mean* — validity, non-sequiturs): AI-hard / formal-logic-hard. **Out of scope.**
- **Structural checks** (treat each claim as **opaque text**, check the *shape* of the argument graph): buildable directly, and they're literally **graph algorithms**. **This is the whole approach.**

The app never understands the words "God exists"; it only knows that node has no arrows pointing into it.

## v1 — the smallest meaningful thing
**The unsupported-assertion check.** Every claim must either be marked "I'm assuming this" (premise/axiom) **or** have something supporting it. The app flags claims that are neither.

Why this one: real value (forces naming your axioms vs. what you've actually argued), and building it forces construction of the **graph data structure** everything else hangs off of.

## Roadmap (post-v1)
- **Circular-reasoning detection.** A supports B supports A. Cycle detection = DFS in a graph. The natural next step once the graph exists.
- Dangling-claim check (supports nothing, isn't the conclusion).
- Objection edges, richer relation types.
- Semantic checks. Multi-user. A 2D canvas UI.

## Data model — SETTLED
```
Claim:  { id, text, isPremise }
Edge:   { from, to }                             // "from supports to"; supported = has an incoming edge
Graph:  { claims: [...], edges: [...], nextId }  // two lists + the id counter; visual map is RENDERED, not stored
```
- **`id` is separate from `text`** — text is human-facing content, id is the machine handle edges point at. Lets you edit wording without orphaning edges; distinguishes duplicate-text claims; cheap exact lookups.
- **`isPremise` is a STORED flag, not derived.** The graph's shape can't tell an honest premise (deliberate starting point) from a smuggled assertion — both have zero incoming edges. Only the author's declaration carries that bit, so it must be stored.
- **Edge direction is frozen:** store "A supports B" as `{from:A, to:B}`. This commits us to **supported = has an incoming edge** (`to === claim.id`). Must stay consistent or the check reads the wrong field.
- **No `type` field in v1 (YAGNI).** Every edge *means* "supports" implicitly. `type` returns with objections — and only together with teaching the check to respect it (a `type` field the check ignores is a latent bug: objection edges would get miscounted as support).
- **ids = a counter** (`1, 2, 3…`). Readable for debugging. Rule: **never reuse a number**, even after deleting a claim. *Why:* a never-reused id makes a stale reference **fail loud** (points at nothing — detectable, cleanable) instead of **fail silent** (a reused id silently re-links an old edge to a new, unrelated claim → the check reads false support, no error). An id permanently means one claim, forever.
- **The counter (`nextId`) lives INSIDE the graph object**, not as a separate variable. *Why:* the counter must be structurally impossible to desync from the claims. If it lived outside, undo / save-load / React-state-restore would restore the claims but not the counter → it hands out a colliding id → the silent-corruption bug above. Inside the graph, every snapshot/undo/save carries it along automatically. One source of truth beats discipline.

## v1 check, stated in graph terms
> For each claim: if it has **no incoming edge** AND `isPremise` is false → **flag it.**

The check fell straight out of the data model — no separate "flagging feature" needed. It is **read-only**: inspects the two lists, changes nothing.

## Engine architecture — SETTLED
**Engine / view split.** A pure-JS **engine** (the graph data + mutations + check, no DOM, no framework) sits behind an **API** — a small set of functions the view calls. The **view** (vanilla list for v1) drives the engine *only* through that API; it never reaches into the lists directly. This boundary is the real architecture: it makes the framework a swappable detail (vanilla now → React at v2) and lets the v1 view be disposable.
- **Rule against leakage:** the engine never touches the DOM; the view never decides what the check *means*. Keep that wall clean and the whole thing stays swappable.
- The **state machine** (Viewing/Selected/Supporting) is *view* state, not engine — it gets re-expressed in React's own state tools at v2. Test for "is this engine?": *would it survive swapping vanilla→React unchanged?* (graph+check: yes; state machine: no.)

**Mutate vs. return-fresh: RETURN-FRESH.** Engine functions return a *new* graph rather than changing the one handed in. *Why:* (1) React detects change by reference (`old !== new`); mutating in place keeps the same reference → React skips the re-render → stale UI. Return-fresh is React-ready by construction. (2) Functions that don't modify their input are easier to reason about and test — matches the already-read-only `check`.

**The API (function list):**
```
addClaim(graph, text)     → returns a new graph: claim {id: graph.nextId, text, isPremise:false} added, nextId bumped
connect(graph, from, to)  → returns a new graph with edge {from, to} added (block self-connect from === to)
markPremise(graph, id)    → returns a new graph with that claim's isPremise = true
check(graph)              → read-only; returns the flagged claims (no incoming edge AND isPremise false)
```

## Minimal UI — SETTLED
**List, not canvas.** v1 renders the graph as a plain numbered list of claims; edges shown as text; flagged claims light up after a check. A 2D canvas (boxes + drawn arrows + dragging) is all drawing-tool plumbing that teaches nothing about the graph or the check — **deferred to v2.**

**The UI is a 3-state machine.** "Click a row" means different things in different states; the state *is* what disambiguates it (this dissolves the click-ambiguity problem).

- **Viewing** — default. Nothing selected, no buttons, zero clutter. Reachable from any state via a top "View/Done" button.
- **Selected** — click a row to enter. That row shows `[premise]` + `[supports…]`. Clicking a different row just re-selects (moves the selection).
- **Supporting** — entered via `[supports…]`. The source row is **visually marked and greyed (un-targetable)**. Click any *other* row → edge `{from:source, to:target}` created, and you **stay in Supporting** so one claim can support many things (chaining). Exit → back to Selected.

Transitions: Viewing→Selected (click row); Selected→Selected (click other row = re-select); Selected→Supporting (`[supports…]`); Supporting→*(edge created, stay in Supporting)* (click target); Supporting→Selected (Exit); Any→Viewing (top button).

**Why these choices:**
- **Direction is unscrewable-up.** The `[supports…]` button lives *on the source row*, so the frozen edge direction (`from supports to`) is encoded by *where you clicked* — can't be reversed by accident. (Ruled out: typing ids = clunky; select-two-then-connect = direction rides on invisible selection order, reintroduces the ambiguity the data model froze out.)
- **Contextual buttons (appear on select), not per-row buttons** — kills visual clutter, which serves the actual goal: clearly mapping the argument.
- **Self-connect (3 supports 3) is blocked** by greying the source — a self-loop is a meaningless degenerate cycle (would also confuse the later cycle-check). Block (communicated) chosen over Ignore (silent) for clarity; the source is already visually marked, so blocking is nearly free.

**The 4 actions, mapped to UI:**
```
add claim     → text box + Add button; new row appears at bottom with its id
mark premise  → [premise] button on the selected row
connect A→B   → Selected → [supports…] → click target row
run check     → top-level Check button; flagged rows light up in place
```

**Extends cleanly later:** objection edges just add an `[objects to…]` button in Selected and a mirror "Objecting" state — no redesign.

## Status
v1 design is complete (data model, actions, check, engine architecture, UI all settled). Next: build the engine (data model + check) in code.

## Design principles
- Core idea first; features and refactors come later.
- Design before build.
