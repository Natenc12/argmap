# argmap

A frontend tool for **mapping and structurally checking arguments**. You lay out claims, connect them with "supports" relations, and the app flags claims you asserted but never argued for.

The wedge: argmap **checks the structure** of an argument (it's graph algorithms under the hood), rather than just drawing a diagram. It never tries to understand what a claim *means* — only the shape of how claims connect.

## Status
**Pre-build.** The v1 design is complete; the engine is the next thing to be written. See [`DESIGN.md`](./DESIGN.md) for the full design and the decisions behind it.

## v1 feature
The **unsupported-assertion check**: every claim must either be marked a premise ("I'm assuming this") or have something supporting it. Anything that's neither gets flagged.

## Architecture
- **Engine** (`src/engine.js`) — pure JavaScript: the graph data model, the mutations, and the check. No DOM, no framework. Exposes a small API (`addClaim`, `connect`, `markPremise`, `check`).
- **View** (`src/view.js`) — a plain list UI that drives the engine through that API. Vanilla for v1; a React UI (with a canvas) is planned for v2. The engine doesn't change when the view does.

## Tech
Vanilla HTML/CSS/JS, no build step. Open `index.html` in a browser to run.

## Run
```
open index.html
```
(No install, no dependencies — yet.)
