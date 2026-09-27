---
name: blueprint-animation
description: Blueprint animation that explains UX decisions step by step. With Before and After, changed parts rebuild. With one screen, each module is annotated with what and why. For case studies and posts.
license: CC BY-NC 4.0, non-commercial use only. See LICENSE.
---

# Blueprint animation

Skill version 1.3.1. Start your first question form or reply with `blueprint-animation 1.3.1 · <Explain or Redesign>`, so the user can see which version and mode is running.

One continuous animation of ONE screen. The page never cuts; it runs in N numbered steps. Each step explains a single UX decision.

Two modes. Pick the mode from what the user gives you (§1); with one screen, Explain is always offered first:
- **Redesign** (Before + After screens): the screen is redesigned step by step. §1–7 describe this mode.
- **Explain** (one screen, no Before): the design never changes. Each step turns one module into a blueprint and draws why it is built that way. See §8. Everything in §1–7 still applies unless §8 says otherwise.

In both modes the design comes from Figma and is reproduced exactly (§0).

Reference scene: [`example-scene.jsx`](example-scene.jsx) (Redesign mode: a CRM record page redesigned in 5 steps).

## 0. Fidelity — the Figma design is exact

The screens the user gives are reproduced 1:1. This rule beats every other rule in this skill, performance included.

- Read every value from the Figma source, not from a screenshot: frame size; each layer's x, y, w, h; fills, strokes, radii, effects; text style (family, size, weight, line height, letter spacing, case). Use the file's colour and text styles as they are.
- If a value can't be read (only a screenshot, a missing font, a hidden layer), list what is missing and ask. Never guess, round or "tidy up" a value.
- Copy all text exactly: wording, capitals, numbers, dates, punctuation.
- Load the file's real fonts. If a font can't be loaded, stop and ask for it: a stand-in font changes every text width and wrap.
- Icons, logos and images: export them from Figma (SVG for vectors) and use them as they are. Never redraw them or swap in a lookalike from an icon set.
- Place every element at its Figma coordinates relative to the frame (`abs(x, y, w, h)`). Don't re-flow the frame into flex or grid if that moves anything by even 1 px.
- Convert Figma units exactly: letter spacing % → em (−2% = −0.02em); line height in px stays px; an inside stroke stays inside the box (`box-sizing: border-box` border or `inset` shadow); drop shadows keep the same x, y, blur, spread and colour.
- The app is the Figma frame's own size at 1:1 (1440×900 only if the frame is). The canvas grows to fit it.
- No restyling, no new spacing, no removed shadows, no "improvements". The only colours outside the design are the blueprint's.
- Redesign mode: a screen you design or derive (because the user picked that option, §1) reuses the given screen's components and changes only what the step list says.

Order of work:
1. Build each given screen as static real-UI components.
2. Render it at 1:1 and compare it with the Figma export of the same frame (50% overlay or pixel diff). Fix every difference before going on.
3. Only then build the blueprint and the motion. At rest (before step 1 and after the last step) the real UI matches the Figma frames exactly.

## 1. Before you build — gather

- **Redesign:** the Before and After screens, as Figma frames (screenshots only when there is no file; see §0). The After is the source of truth; don't redesign beyond it.
  **Explain:** the one screen, as a Figma frame. It is the source of truth and nothing on it changes.
- The list of steps, 3–6.
  **Redesign:** each step needs **name** (2–4 words), **problem** (one sentence, ≤ 12 words), **fix** (one sentence).
  **Explain:** each step is one module and needs **name** (the module, 2–4 words), **what** (one sentence, ≤ 12 words: the decision), **why** (one sentence: the user benefit or principle behind it).
- The design system for the real UI. Blueprint colours are the only colours outside it.
- Canvas size: the app is the Figma frame at 1:1 on top, with a margin and a text band below (a 1440×900 frame gives the default 1600×1200).

Pick the mode:
- **Two screens given → Redesign mode.** No mode question.
- **One screen given →** the first question is the mode. It MUST include this option, listed first, in the user's language:
  **"Continue with this one screen: the design stays as it is; explain what and why, module by module (Explain)"**
  Other options may follow: it is the Before (you design the After), it is the After (you derive the Before), or the user uploads the other screen.
- A one-screen request can always go ahead in Explain mode. Never say you can't start without a second screen.

Then:
- **Explain:** propose 3–6 modules (name · what · why) and get them confirmed. Proposals describe the screen as it is, never changes to it.
- **Redesign:** propose 3–6 changes (name · problem · fix) and get them confirmed.
- Anything else missing (a font, a Figma value, see §0): ask before building.

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
- Each wire uses the exact rect of the element it stands for (§0), so the blueprint lines up with the real UI.
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

## 5. Architecture (animations_v3 starter)

- The engine is Claude Design's `animations_v3` starter, copied into the project as `animations-v3.jsx`. It is not part of this skill; build on it, don't write your own.
- `OM_SCENES` literal in the DC helmet: `Before, <step names…>, After`. The scene is one `.jsx` loaded through `<x-import component-from-global-scope=… from="./animations-v3.jsx ./scene.jsx">`.
- Start the scene from [`example-scene.jsx`](example-scene.jsx). Keep its blueprint kit as it is: `phases`, `tw`/`lerp`/`LR`, `Wire`, `Guide`, `Line`, `Label`, `DimH`, `Num`, `curve`/`ctr`, `Focus`, the clip + scan-line layer and the text band. Rewrite only what belongs to the new screen: the real-UI components, `StaticBP`, the geometry and `STEPS`.
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
- No blurred box-shadows on layers that move, no `text-wrap: pretty`, no nested `<svg>` per wire, no stroked text halos. A shadow that is in the design stays (§0).
- In the engine, persist the playhead to `localStorage` at most every 500 ms (not every frame).
- Measure: a seek loop over the whole timeline (< 7 ms per frame), plus a rAF loop during real playback (no frames > 34 ms).

## 7. QA before handing over

1. Filmstrip with `data-om-seek-to-time-frame` at each step's problem, blueprint-in, mid-construct, reveal and hold.
2. At mid-construct: no text sits on text, and no moving wire crosses a label.
3. Every counter and date on screen matches the data.
4. Fidelity (§0): the real UI at rest matches the Figma exports at 1:1 in an overlay or pixel diff, including text wraps, icon shapes, strokes and shadows.
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
