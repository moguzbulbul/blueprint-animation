---
name: blueprint-animation
description: Animated before → after UX redesign. The UI turns into a blueprint, changed parts rebuild step by step, then the new UI is revealed. Use for UX case studies, redesign walkthroughs and social posts.
---

# Blueprint Before/After

One continuous animation of ONE screen. The page never cuts; it is redesigned in N numbered steps. Each step explains a single UX decision.

Reference scene: [`example-scene.jsx`](example-scene.jsx) (a CRM record page redesigned in 5 steps).

## 1. Before you build — gather

- The Before and After screens (source files or screenshots). The After is the source of truth; don't redesign beyond it.
- The list of changes, 3–6 steps. Each step needs: **name** (2–4 words), **problem** (one sentence, ≤ 12 words), **fix** (one sentence).
- The design system for the real UI. Blueprint colours are the only colours outside it.
- Canvas size (default 1600×1200: app 1440×900 at 1:1 on top, a text band below).

If any of these are missing, ask before building.

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
