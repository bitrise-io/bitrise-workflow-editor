---
name: wfe-pr-storybook-table
description: Build the Storybook before/after table (PR build vs production) for a bitrise-workflow-editor PR description, with story IDs derived by the CSF parser and the nearest story found by walking the import graph. Use whenever writing or updating a PR description for a PR that changes rendered UI in bitrise-workflow-editor — always for bitkit v1 → v2 migration PRs — and when the user asks which stories to check, review or link for a PR ("melyik storykat nézzem", "storybook table", "before/after links").
---

# PR Storybook before/after table (bitrise-workflow-editor)

A migration or refactor PR is a visual regression check. Without paired links the reviewer has to
hunt for the stories and usually doesn't, so nothing gets verified. Every PR that changes rendered UI
gets this table in its description.

## 1. Find the stories

Check out the PR branch first: story IDs come from the story files in the working tree. Then run:

```bash
node .claude/skills/wfe-pr-storybook-table/scripts/find-stories.cjs --pr <N> $(gh pr view <N> --json files -q '.files[].path')
```

For each changed source file, it walks the import graph up to the nearest `*.stories.tsx`, prints
the chain (`Leaf.tsx <- Parent.tsx <- X.stories.tsx`), and lists every story in that file with its
ID and PR/production URLs.

- **Never hand-roll a story ID.** `startCase` runs first (`WithConnectedGitHubApp` →
  `--with-connected-git-hub-app`), and a wrong ID loads an empty Storybook shell without an error.
  The script uses Storybook's own CSF parser.
- **Pick, don't dump.** Keep only the stories where the changed bit is actually visible: the
  read-only/merged variant for a `state="disabled"`/`readOnly` change, the form story for a form
  change. Look at the story's args or yml to decide.
- **Say how to reach the changed bit.** The chain shows how deep it sits. If it's only reachable
  behind a click, a tab, a dialog or a scenario select, the "What to look at" cell says so
  (e.g. "Inputs → Add input").
- **No story found**, or the changed state isn't reachable in any story (merged view, a save
  path)? Write that in one line under the table instead of leaving it out.

## 2. Write the table

Above the table, name the commit SHA the PR build reflects (`gh pr view <N> --json headRefOid`).
Add one sentence on what should change visually and what shouldn't.

| Component            | Story                 | This PR                                                                       | Production                                                                            | What to look at                         |
| -------------------- | --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| `SortableEnvVarItem` | EnvVarsPage › Default | [PR](https://storybook.services.bitrise.dev/projects/wfe/pr-N/?path=/story/…) | [prod](https://storybook.services.bitrise.dev/projects/wfe/production/?path=/story/…) | One line naming exactly what to compare |

- URL bases: PR build `https://storybook.services.bitrise.dev/projects/wfe/pr-<N>/?path=/story/<id>`,
  master `https://storybook.services.bitrise.dev/projects/wfe/production/?path=/story/<id>`. The
  `wfe/` segment is this repo. The bitrise-website repo deploys under a different path on the same
  host, so never copy its URL form.
- Only stories this PR touches. Drop the Story column when every component has exactly one story.

## 3. Check the links

The Storybook host is behind SSO, so `curl`/WebFetch returns the login page. You can't verify the
links yourself. Ask the user to click one multi-word link, and re-check the table after every
further push.

- **`Not found: pr-<N>`** means the deploy never ran. It does not mean the URL is wrong. Run
  `gh pr view <N> --json mergeable,mergeStateStatus` first: Bitrise clones the PR merge ref, so a
  CONFLICTING/DIRTY PR fails git-clone and skips the deploy. Merge master into the branch; a re-push
  alone fails the same way. The bot's "Storybook uploaded to…" comment lands about 6 minutes after
  the push, so compare its `createdAt` to the push time.
- **The story loads but is blank or shows an error.** Usual causes: `argTypes.<prop>.defaultValue`
  (dead since Storybook 7, move it to `args`), a non-story named export in the stories file (list it
  in `excludeStories`), or a missing `msw` handler. Verify a fix with `composeStories` +
  `await Story.run()`; a bare `render(<Story />)` skips the msw loader and passes falsely.
