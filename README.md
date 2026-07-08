# nitpix-demo 👁

Live demo of [plotly/nitpix](https://github.com/plotly/nitpix) — GitHub-Actions-native
visual diffing (the Percy replacement being rolled into plotly/dash).

A tiny static "dashboard" (`site/`) is screenshotted by Playwright at two
widths (`capture.mjs` → `nitpix-snapshots/*.png`); nitpix does everything
after that. In dash, `dash.testing`'s `percy_snapshot()` plays the role of
`capture.mjs`.

## Walk through the flow

1. **Baselines** — every push to `main` runs `Tests`, and `nitpix.yml`
   promotes its snapshots to `baselines/main/` on the `nitpix` orphan branch.
   (The very first push seeds them.)

2. **Open a PR with a visual change** — edit a CSS variable in
   `site/styles.css`, e.g.:

   ```css
   :root {
     --accent: #4361ee;   /* → try #e07a1f */
   ```

   Push a branch, open the PR, wait for `Tests` → the **nitpix** workflow
   posts a review comment with baseline / new / diff images and sets the
   `nitpix/visual` commit status to ❌.

3. **Push more commits** — the comment updates in place; identical re-runs
   stay whatever state they were in (approvals are content-hash keyed).

4. **Approve** — comment `/nitpix approve` on the PR (write access required).
   The bot reacts 🚀 and flips `nitpix/visual` to ✅ *without re-running the
   test matrix*.

5. **Merge** — the push to `main` re-runs `Tests` and promotes the new
   snapshots to the baselines. Pending images and approvals for closed PRs
   are pruned automatically.

Also try: a PR **adding a page** to `site/` (shows up as 🆕 new snapshot,
green by default), and a PR from a **fork** (the whole flow still works —
that's the point of the `workflow_run` topology).

## Run the capture locally

```bash
npm install
npx playwright install chromium
node capture.mjs        # writes nitpix-snapshots/*.png
```

Note local PNGs will differ slightly from CI's (fonts/rendering) — baselines
only ever come from CI runs, so that's fine.

## Pieces

| file | role |
| --- | --- |
| `.github/workflows/tests.yml` | unprivileged: capture + upload artifact (works for forks/Dependabot) |
| `.github/workflows/nitpix.yml` | privileged (`workflow_run`): diff, PR comment, `nitpix/visual` status; promotes baselines on `main` pushes |
| `.github/workflows/nitpix-approve.yml` | handles `/nitpix approve` comments |
| `nitpix` branch (orphan) | baselines, pending report images, approvals — created automatically |
