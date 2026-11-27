# CLAUDE.md — Upside Down Run

Gravity-flip puzzle platformer (Phaser 3.90 + TypeScript + Vite), 60 solver-proven levels, built for CrazyGames. Owner: Nithin.

- Answer short and direct; be honest.
- Levels are proven by tools/pageSolver.js; after level changes run node tools/verifyFx.mjs (dev server on :5173) and node tools/qa.mjs.
- CrazyGames upload: npm run build && node tools/zipCrazyGames.mjs <out.zip>.
- Push only to branch claude/youthful-wright-wwuz3r; main updates the website.

## Claude Code Game Studios (installed framework)

This repo also carries the Claude Code Game Studios framework (github.com/Donchitos/Claude-Code-Game-Studios, MIT, v1.3.0):
49 studio agents in `.claude/agents/`, its skills in `.claude/skills/` (`/start`, `/next-step`, `/adopt`, `/prototype --from`,
`/cut`, `/project-settings` …), hooks in `.claude/hooks/` (checks on reads, writes, commits, pushes) and settings in `project.yaml`.
Run `/adopt` once to audit this existing project against the framework.

- **This file wins.** Where the framework's rules disagree with the project rules above (or with what the user asks), follow this file and the user.
- Coordination rules: @.claude/docs/coordination-rules.md
- Workflow guide: `docs/WORKFLOW-GUIDE.md`; collaboration principle: `docs/COLLABORATIVE-DESIGN-PRINCIPLE.md`.
