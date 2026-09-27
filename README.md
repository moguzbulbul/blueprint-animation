# Blueprint Before/After

A Claude skill for animated before → after UX redesign walkthroughs. The live UI turns into a blueprint drawing, the changed parts rebuild themselves step by step, then the new UI is revealed.

Use it for UX case studies, redesign walkthroughs and social posts that show why a change was made.

## Files

- `SKILL.md`: the skill. Covers the per-step sequence, blueprint drawing style, text and overlap rules, architecture, performance and QA checklist.
- `example-scene.jsx`: a full reference scene on the animations-v3 engine (a CRM record page redesigned in 5 steps).

## Install

**claude.ai:** zip the folder so the ZIP holds `blueprint-animation/SKILL.md` (not the files at the ZIP root), then upload it under Customize → Skills.

```bash
git clone https://github.com/moguzbulbul/blueprint-animation
```

```bash
zip -r blueprint-animation.zip blueprint-animation -x "blueprint-animation/.git/*"
```

**Claude Code:** clone into your skills folder.

```bash
git clone https://github.com/moguzbulbul/blueprint-animation ~/.claude/skills/blueprint-animation
```
