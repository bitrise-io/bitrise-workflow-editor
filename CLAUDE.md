# CLAUDE.md

@./node_modules/@bitrise/bitkit-v2/AGENTS.md

The editor holds **one YAML document** as an AST in a Zustand store (`BitriseYmlStore`) and edits
it through typed UIs. Pages read the document, services in `core/services` mutate it, and the Go
server validates and saves it. Secrets, stacks, license pools and the step catalog live outside the
document and have their own endpoints.

With `include:` the config is a tree of files, and the document is only the **active file**. Every
service reaches only that far ([why](docs/decisions.md#cross-file-operations-stop-at-the-active-file)).

It ships as a Bitrise CLI plugin (`MODE=CLI`, the default) and inside the Bitrise website
(`MODE=WEBSITE`, an iframe). Branch on mode in `core/api` and components, never in a service.

`docs/decisions.md` explains the parts that look odd on purpose. Read it before "fixing" one.

## Commands

```bash
npm start                # Dev server + local Go API on port 4000
npm run start:website    # Website mode (needs the monolith on :3000)
npm run build            # Vite production build
npm run lint             # ESLint (cached)
npx tsc --noEmit         # The only type check. Not a script, not in CI
npm test                 # Jest
npm test -- --testPathPattern="path/to/file"
npm run test:smoke       # Playwright, post-deploy only (needs SMOKE_TEST_* env vars)
npm run storybook        # Storybook on 6006
go vet ./... && go test ./...
```

The dev server is at `localhost:4000/{version}`, with the version from package.json.

## The rule nothing enforces

**Never read `yml`, edit the plain object, and write it back.** `toJSON` is for reading.
Structured edits go through a service calling `updateBitriseYmlDocument`, and inside the mutator
you touch nodes only through `YmlUtils`. Round-tripping through JSON destroys every comment and
reorders every key in a file the user reviews in a diff.

## Traps

- **Nothing type-checks unless you do it.** CI runs build, lint and tests, and `vite build` strips
  types without checking them. Run `npx tsc --noEmit` before calling a typed change done.
- **`window.env` does not exist under Jest**, so `RuntimeUtils.isProduction()` throws in unit
  tests. Wrap it the way `BitriseYmlStore.warnInDev` does.
- **A store setter called outside `act()` does not flush**, so the test passes falsely. Watch a
  repro fail before you trust it passing.
- **Jest's environment is `node`.** A test that renders needs an `@jest-environment jsdom` docblock.
- **After pulling across a version bump**, restart the Go process (it keeps the old version path,
  so every request 404s) and run `npm install`.
- **Four boundaries are linted**: `core/` may not import React, `.tsx` may not call
  `updateBitriseYmlDocument`, `useShallow` comes from `@/hooks/useShallow`, and raw `useStore` may
  not build a fresh value. A `no-restricted-*` failure means you crossed one.
- **Pathless `<DiffEditor>`s leak their Monaco models on purpose.** Disposing them makes Monaco
  throw on every unmount; that was #1898, reverted after it reached production.

Where a doc and the code disagree, the code wins and the doc is a bug. Change both in one PR.
