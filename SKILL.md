---
name: blueprint-animation
description: Blueprint animation that explains UX decisions step by step. With Before and After, changed parts rebuild. With one screen, each module is annotated with what and why. For case studies and posts.
---

# Blueprint Before/After

One continuous animation of ONE screen. The page never cuts; it runs in N numbered steps. Each step explains a single UX decision.

Two modes. Pick the mode from what the user gives you:
- **Redesign** (Before + After screens): the screen is redesigned step by step. §1–7 describe this mode.
- **Explain** (one screen, no Before): the design never changes. Each step turns one module into a blueprint and draws why it is built that way. See §8. Everything in §1–7 still applies unless §8 says otherwise.

Reference scene: [`example-scene.jsx`](example-scene.jsx) (Redesign mode: a CRM record page redesigned in 5 steps).

## 1. Before you build — gather

- **Redesign:** the Before and After screens (source files or screenshots). The After is the source of truth; don't redesign beyond it.
  **Explain:** the one screen. It is the source of truth and nothing on it changes.
- The list of steps, 3–6.
  **Redesign:** each step needs **name** (2–4 words), **problem** (one sentence, ≤ 12 words), **fix** (one sentence).
  **Explain:** each step is one module and needs **name** (the module, 2–4 words), **what** (one sentence, ≤ 12 words: the decision), **why** (one sentence: the user benefit or principle behind it).
- The design system for the real UI. Blueprint colours are the only colours outside it.
- Canvas size (default 1600×1200: app 1440×900 at 1:1 on top, a text band below).

If only one screen is given, use Explain mode; don't ask for a Before. If the user gives the screen but no module list, propose 3–6 modules with what and why, and get them confirmed before building. If anything else is missing, ask before building.

## 2. The per-step sequence (never skip a phase)

Local step time `t` (authored seconds ÷ K, K = 1.4 slow factor). For a 5 s step with construct end `c1 = 3.2`:

| Phase | t | What happens |
|---|---|---|
| Problem | 0 → 0.9 | Everything except the focus rect fades toward white (≈ 78%). A thin grey outline draws around the focus. The text band shows number, name and problem. |
| Blueprint in | 0.95 → 1.75 | A cyan **scan line** sweeps top → bottom. Above it, the WHOLE app is a blueprint drawing; below it, the real old UI. |
| Construct | 1.9 → c1 | Only the changing wires move / resize / merge. The static blueprint behind them dims 0.7 → 0.3. Guides and dimension lines draw. |
| Reveal | c1 + 0.05 → c1 + 0.85 | The scan line sweeps again. Above it, the real NEW UI; below it, the blueprint. |
| Hold | → end | The fix sentence fades in. Then the focus fades out. |

Rules that make it feel smooth:
- Real UI regions swap from old to new **only while fully covered** by the blueprint (the swap is invisible). Never fade old UI out in view: it reads as "the UI disappeared".
- Every opacity keys to the smooth wipe/reveal curves, never to near-instant ramps. No value may change from 0 to 1 in under ~0.3 s unless it is hidden.
- Layout pushes happen BEFORE the elements that land in the freed space (for example, the timeline moves down first, then the tasks rise into the gap).
- Stagger groups of moving wires (0.08–0.12 s apart) so they never cross each other.
- Last 1 s of the piece: fade the app out so the loop seam is soft.

## 3. Blueprint drawing style

- Draw on white, not on a navy background. Line colour is cyan-ink `#0B8FC2`; fill `#2ACCFF14`; guides are dotted `2 4`.
- **Everything on screen** turns into a blueprint in the blueprint phase: rail, breadcrumb, logo (box, mark and outlined wordmark), buttons, rows, tabs, cards, panel. Never convert only part of the screen.
- Wires carry their real text (button labels, row text, tab names). Rounded pills stay rounded, list rows get an icon circle.
- Selection handles (5 px squares) on the 1–3 wires that matter in that step.
- Corner ticks on the focus rect, dotted alignment guides through key edges, one dimension line per step with a short UPPERCASE mono label (for example "CENTERED COLUMN · 760").
- Labels: 11–12 px mono, `letter-spacing .06em`, no stroked halo.

## 4. Text and overlap rules (checked every time)

- **No text on a moving wire.** Wire text fades out when motion starts (q > 0.15) and back in when it settles (q > 0.85).
- Wires that disappear collapse **in place** (height → 0), not across other content.
- Labels live in empty bands (above the focus, between sections). Never on top of a row or a card.
- Only one step's notes are visible at a time, in the bottom band: `[number badge · NAME] [problem] [fix]`.
- No top title bar and no end title unless the user asks for them.

## 5. Architecture (animations-v3 engine)

- `OM_SCENES` literal in the DC helmet: `Before, <step names…>, After`. Build on `animations-v3.jsx`; the scene is one `.jsx` loaded through `<x-import component-from-global-scope=… from="./animations-v3.jsx ./scene.jsx">`.
- `phases(T, start, dur, c1)` returns `{focus, hl, call, bp, wipe, rev, cdim, lines, p, before, after, fix}` for each step. All choreography reads from these.
- Global layout values are derived from step progress: column x/width, header right edge, logo x, timeline y, panel x.
- Layers inside the app, bottom → top:
  1. Real UI regions: each has a `before` and an `after` component with its own opacity.
  2. An SVG with `clipPath` = the scan-line band. Inside it, a white sheet, the **static full-screen blueprint** (memoized `StaticBP`) and each step's `<Focus>` wires.
  3. The scan line.
- The text band sits below the app, outside the SVG.

## 6. Performance (required, or it stutters)

- Every layer stays **mounted** all the time. Hide it with `visibility: hidden` when opacity is 0; never mount/unmount at section boundaries.
- `React.memo` every real-UI component. Pass quantized props (`Math.round(v*2)/2` for positions, 2 decimals for opacity).
- `StaticBP` is memoized with rounded props, so it re-renders once per step, not every frame.
- Build a step's `<Focus>` JSX only while `focus > 0`.
- Move with `transform: translate`, not `left/top`.
- No blurred box-shadows, no `text-wrap: pretty`, no nested `<svg>` per wire, no stroked text halos.
- In the engine, persist the playhead to `localStorage` at most every 500 ms (not every frame).
- Measure: a seek loop over the whole timeline (< 7 ms per frame), plus a rAF loop during real playback (no frames > 34 ms).

## 7. QA before handing over

1. Filmstrip with `data-om-seek-to-time-frame` at each step's problem, blueprint-in, mid-construct, reveal and hold.
2. At mid-construct: no text sits on text, and no moving wire crosses a label.
3. Every counter and date on screen matches the data.
4. Before and After states match the source screens.
5. Performance numbers from §6.

## 8. Explain mode (one screen, no Before)

Same piece, same blueprint, same pacing. Nothing is redesigned: the blueprint is an x-ray that shows the reasoning behind each module.

Per-step sequence (timings as in §2):

| Phase | t | What happens |
|---|---|---|
| Focus | 0 → 0.9 | As Problem in §2. The text band shows number, name and **what**. |
| Blueprint in | 0.95 → 1.75 | As §2. Above the scan line, the WHOLE app is a blueprint drawing. |
| Annotate | 1.9 → c1 | Nothing moves. The module's wires stay in place; the static blueprint behind them dims 0.7 → 0.3. The reasoning draws in, staggered 0.08–0.12 s: handles on the key wires → guides → dimension line → labels. |
| Reveal | c1 + 0.05 → c1 + 0.85 | The scan line sweeps again and brings back the SAME real UI. |
| Hold | → end | The **why** sentence fades in. Then the focus fades out. |

Pick the marks from the reason, 1–3 per step plus one dimension line:

| The reason is about | Draw |
|---|---|
| Hierarchy, the primary action | Handles on the primary wire only; label "1 PRIMARY · 2 SECONDARY" |
| Alignment, grid, column | Dotted guides through the shared edges; dimension "CENTERED COLUMN · 760" |
| Spacing, rhythm | Dimension lines across the gaps: "GAP · 24" |
| Grouping | A dashed rect around the group; label naming it: "DEAL CONTEXT" |
| Reading order, flow | Accent number badges (`Num`) in reading order, joined by one arrowed `Line` |
| Size, hit area | A dimension on the element: "40 × 40" |
| Progressive disclosure | A label on the entry point: "14 EMPTY FIELDS BEHIND THIS" |
| Colour, state | A label naming the rule: "RED ONLY FOR OVERDUE" |

Rules:
- The real UI is identical at the start and end of every step. There is no before/after swap; each region has one component.
- Wires never move or resize, so wire text stays visible the whole time (no `q` fade).
- Marks draw in (`Line` with `pathLength`, opacity ramps ≥ 0.3 s). They never slide across content.
- The number goes in the dimension label, the reason goes in the text band. Labels on the drawing name the rule, not the pixels.
- Text band: `[number badge · NAME] [what] [why]`. The why sits where the fix sits in Redesign mode (cyan).

Architecture changes from §5:
- `OM_SCENES`: `Screen, <module names…>, End`. Where the redesign scene reads `CUES.After`, read `CUES.End`.
- Use the same `phases()`. Ignore `before`, `after` and `p`; drive each mark from a `ph.t` window inside 1.9 → c1 (for example `tw(ph.t, 2.0, 2.6, M.draw)`).
- Global layout values are constants. `StaticBP` takes no step props, so it renders once.
- A step's `<Focus>` children are the module's own wires (with handles) plus its marks.

QA: the §7 filmstrip (Annotate in place of mid-construct), plus: the real UI in the frame before Focus and the frame after Hold is pixel-identical for every step; no mark covers text.

Example: the After screen of the reference scene, explained.

| # | Module | What | Why | Marks |
|---|---|---|---|---|
| 01 | Header actions | One button; the rest sit in ⋯. | You mostly send email, so that is one click. | handles on Compose · "1 ACTION + OVERFLOW" |
| 02 | Facts line | Eight facts on one line. | You read the company at a glance; empty fields stay out of sight. | guide on the baseline · "14 EMPTY FIELDS BEHIND THIS" on All details |
| 03 | Needs you | Open tasks sit above the timeline. | Overdue work is the first thing you see. | dashed group rect · `Num` 1–3 · "1 PRIMARY ACTION" |
| 04 | Timeline | One feed, Relationship view by default. | People and deals matter more than system events. | handles on the Relationship pill · "1 VIEW MENU" |
| 05 | Column | Content in one centred column. | Short lines are easier to scan on a wide screen. | guides at 368 and 1128 · "CENTERED COLUMN · 760" |
