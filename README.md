# Blueprint Before/After

A **Claude Design** skill that turns a UX redesign into one continuous, step-by-step animation. The live UI turns into a blueprint drawing, the parts that change rebuild themselves, then the new UI is revealed.

Created by **Oğuz** · [@moguzbulbul](https://x.com/moguzbulbul) · [oguz.design](https://oguz.design)
Inspired by [Arjun Mahesh](https://x.com/arjmahesh).

[![Blueprint Before/After example](media/preview.gif)](media/example.mp4)

[Watch the full-quality video (MP4)](media/example.mp4)

## What it does

Show *why* a redesign works, not only what changed. The skill animates one screen that never cuts. It is redesigned in 3–6 numbered steps, and each step explains one UX decision:

1. **Problem:** the rest of the screen fades back, the area in question is outlined, and the problem sentence appears.
2. **Blueprint in:** a scan line sweeps down and turns the whole screen into a cyan blueprint drawing.
3. **Construct:** only the parts that change move, resize or merge, with guides, handles and dimension lines.
4. **Reveal:** the scan line sweeps again and the real new UI appears.
5. **Hold:** the fix sentence fades in, then the next step starts.

The skill also carries the rules that keep it clean: no text over moving parts, invisible old → new swaps, staggered motion, smooth performance, and a QA checklist before hand-off.

Use it for UX case studies, redesign walkthroughs and social posts.

## What you give it

- The Before and After screens (the After is the source of truth)
- 3–6 changes, each with a name, a one-line problem and a one-line fix
- Your design system

## Example

The video above is a CRM company page redesigned in 5 steps: *One primary action*, *Hide absence*, *Open work first*, *One timeline*, *Act in context*. Its full scene code is in [`example-scene.jsx`](example-scene.jsx).

## Install in Claude Design

1. Download [`blueprint-animation.zip`](https://github.com/moguzbulbul/blueprint-animation/releases/latest/download/blueprint-animation.zip) from the latest release.
2. On claude.ai, open **Customize → Skills → + → Create skill → Upload a skill** and choose the ZIP.
3. In Claude Design, share your Before/After screens and your list of changes, and ask for a blueprint before/after animation.

Building the ZIP yourself? It must hold `blueprint-animation/SKILL.md` (not the files at its root). Leave out `media`, which is only for this page:

```bash
zip -r blueprint-animation.zip blueprint-animation -x "blueprint-animation/.git/*" "blueprint-animation/media/*"
```
