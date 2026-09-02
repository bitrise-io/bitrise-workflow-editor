# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

@./node_modules/@bitrise/bitkit-v2/AGENTS.md

## The one idea

The editor holds **one YAML document** as an AST in a Zustand store and lets people edit it
through a dozen typed UIs instead of a text box. Pages read from the document, services mutate
it, the Go server validates and persists it. Secrets, stacks, license pools and the step catalog
live outside that document with their own fetch and save paths, which is the other half of
[docs/domain.md](docs/domain.md).

That "one document" is sometimes a tree of files linked by `include:`, and then it is a binding
to the active file rather than the whole config. Every service still works, and every service
reaches only that far, so a cascade written without knowing this leaves sibling files dangling and
its own safety check reassures you
([why](docs/decisions.md#why-cross-file-operations-are-incomplete)).

It ships two ways: as a Bitrise CLI plugin (`MODE=CLI`, the default) and as a website inside the
Bitrise monolith (`MODE=WEBSITE`).

## Which doc answers your question

| Question | Doc |
|---|---|
| How does X work? | [docs/flows.md](docs/flows.md), seven paths with diagrams |
| What does this word mean, and what is guaranteed? | [docs/domain.md](docs/domain.md) |
| Why is it like this, may I change it, and what does this error mean? | [docs/decisions.md](docs/decisions.md), including a symptom index |
| How do I write code here? | [docs/conventions.md](docs/conventions.md) |

Read `domain.md` before designing anything that adds an entity, a reference between entities, or
a cascade. Read `decisions.md` before changing something that looks odd, because it usually looks
that way on purpose.

Debugging something? `docs/decisions.md` opens with a symptom table, and
`grep -rn '\*\*Trap\.\*\*' docs/` lists every known hazard in the set.

Those four cover what the source cannot tell you: rationale, and hazards that only appear at
runtime. Service surfaces, model fields and file maps are deliberately absent. Read the code, it
is right there and it does not go stale.

## Commands

```bash
npm start                # Dev server + local Go API on port 4000
npm run start:website    # Website mode (needs the monolith on :3000)
npm run build            # Vite production build
npm run lint             # ESLint (cached)
npx tsc --noEmit         # The only type check. Not a script, not in CI
npm test                 # Jest
npm test -- --testPathPattern="path/to/file"
npm run test:smoke       # Playwright, post-deploy only: needs SMOKE_TEST_* env
                         # vars and signs into a real app
npm run storybook        # Storybook on 6006

go vet ./...             # Go
go test ./...
```

Setup is `bitrise run setup`. Husky runs lint-staged pre-commit. The dev server is at
`localhost:4000/{version}`, with the version from package.json.

## The rule nothing enforces

**Never read `yml`, edit the plain object, and write it back.** `toJSON` is for reading.
Structured edits go through a service calling `updateBitriseYmlDocument`, and inside the mutator
you touch nodes only through `YmlUtils`. Round-tripping through JSON destroys every comment and
reorders every key in a file the user reviews in a diff. No lint rule catches this; the failure
shows up as a wrecked pull request.

## Traps that bite agents specifically

- **`window.env` does not exist under Jest**, so `RuntimeUtils.isProduction()` throws in unit
  tests. Wrap the call the way `BitriseYmlStore.warnInDev` does, or keep `RuntimeUtils` out of
  anything a service test reaches.
- **A store setter called outside `act()` does not flush**, so a test written that way reports a
  confident false pass. Watch a repro fail before you trust it passing.
- **After pulling across a version bump**, restart the Go process. Vite serves the new
  `/{version}/` path while `go run main.go` keeps the old compiled constant, and every request
  404s until you do. Run `npm install` too: a stale tree makes `tsc` report
  `Cannot find type definition file for 'node'` and lint report unresolved imports, both of which
  read as code errors and are not.
- **Nothing type-checks unless you do it.** There is no `tsc` script, and CI never type-checks:
  it runs `npm run build`, `npm run lint`, `npm run test` and the Go checks, and `vite build`
  strips types with swc rather than checking them. A typed refactor can pass all of that and still
  not compile, so run `npx tsc --noEmit` before you call one done.
- **Four architectural boundaries are linted.** `npm run lint` failing on `no-restricted-syntax`
  or `no-restricted-imports` means you crossed one, not that you wrote sloppy code. Some take two
  rule ids, so count boundaries rather than rules. See
  [docs/conventions.md](docs/conventions.md#lint).

## Writing docs here

Where a doc and the code disagree, the code wins and the doc is a bug. Change behaviour, change
the doc in the same PR.

**One fact, one home, with three exceptions.** Each doc answers one question, so a fact belongs
in exactly one of them and the others link. Three are restated here on purpose and should not be
"deduplicated", because this file survives context compaction and `docs/` may not: the Jest and
`act()` landmines, the YAML-preservation rule, and the fact that nothing type-checks. If you find
the same sentence in two places and it is not one of those, one of them is a bug.

Add a claim only with the check that backs it. A count is admissible only when every reader
counting the same way gets the same answer, like the four lint rules listed directly beneath the
sentence that counts them. "Nine passes in a function you can open" failed that test three ways:
the function, its diagram and the neighbouring function each yield a different number, and which
one you get depends on whether a nested call counts. Leave out file totals and call-site tallies
entirely.
