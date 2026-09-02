![Build status](https://app.bitrise.io/app/1686da85b5935fd6.svg?token=7HlnSBadcyLcUnzq0ws4Nw)

# Bitrise Workflow Editor

## How to install & use the Workflow Editor on your Mac/Linux

1. Install [Go](https://golang.org) `brew install go` (on macOS)
1. Install the latest [Bitrise CLI](https://bitrise.io/cli) - it's a single binary command line tool
1. Run `bitrise setup` just to be sure everything's prepared
1. `cd` into a directory where you have your `bitrise.yml`, and run: `bitrise :workflow-editor`

That's all. The Workflow Editor is now part of the Bitrise CLI core plugins, so you don't have to install it manually.

To upgrade to the latest version of the Workflow Editor run:

```
bitrise plugin update workflow-editor
```

_Join the Workflow Editor's discussion
at: [https://discuss.bitrise.io/t/workflow-editor-v2-open-source-offline-workflow-editor/39](https://discuss.bitrise.io/t/workflow-editor-v2-open-source-offline-workflow-editor/39)_

## Install requirements

The client is a Vite build and needs `node` and `npm`. The local executable is written in Go, so you need a Go
toolchain too. One command installs both sides' dependencies and builds them:

```bash
bitrise run setup
```

## Development

### Build a stand-alone binary, with embedded resources

```
go install
```

### Run in development mode

```bash
npm start          # start both the local plugin api and the Vite dev server
```

1. In your browser, you can reach the Workflow Editor on `localhost:4000/{version}`. Be aware that you usually have to
   wait a while until dev server starts up (then refresh)
1. By default, the Workflow Editor will open the `test_bitrise.yml` from integration folder (used for integration
   testing). Please do not commit this file if you have any changes with it (e2e tests would fail).

If you would like to run the Workflow Editor in `website` mode, you have to run the dedicated npm command:

```bash
npm run start:website   # starts WFE in website mode
```

You also have to make sure that the Monolith is already running before you try to execute the command above (otherwise
every request to `http://localhost:3000` will be handled by the WFE).

`start:website` defaults to `PUBLIC_URL_ROOT=/workflow_editor`, so the HTML emits asset URLs that route through the
monolith's `/workflow_editor/*` asset proxy. Point the monolith at your local WFE by setting the env var below (no
controller-source edits needed):

- if you run the monolith directly (umbrella repo): `BITRISE_WORKFLOW_EDITOR_URL=http://localhost:4000/workflow_editor`
- if you run the monolith in docker (`web-dev-env`): `BITRISE_WORKFLOW_EDITOR_URL=http://host.docker.internal:4000/workflow_editor`
  (or `http://workflow-editor:4000/workflow_editor` when both run on the same compose network)

Once the above is set, the Workflow Editor is reachable in the monolith
on `localhost:3000/app/{slug}/workflow_editor`.

If you want the browser to fetch assets directly from the WFE dev server (skipping the monolith proxy — faster, but
only works when the browser is on the same host as Vite, so not for remote dev boxes), override the prefix:

```bash
PUBLIC_URL_ROOT=http://localhost:4000 npm run start:website
```

In that case set `BITRISE_WORKFLOW_EDITOR_URL=http://localhost:4000` (no trailing path) in the monolith.

#### Restart after a version bump

If you pull/rebase across a release commit (one that bumps the version in both `package.json` and
`version/version.go`), restart the WFE — don't just rely on Vite's hot-reload. Vite picks up the new version from
`package.json` and starts serving at the new `/{version}/` path, but `go run main.go` keeps running its already-compiled
binary with the old `version.VERSION` constant. The two then disagree on the route prefix and requests 404 (which
surfaces in the monolith as `OpenURI::HTTPError 404` from `WorkflowController#content`).

### Run client tests

```bash
npm test                                  # Jest unit tests
npm test -- --testPathPattern="path/to"   # a subset
npm run storybook                         # component workshop on :6006
npx tsc --noEmit                          # nothing else type-checks, including CI
```

Jest runs in the `node` environment by default; a test that renders a hook or a component needs an
`@jest-environment jsdom` docblock at the top of the file.

`npm run test:smoke` is a post-deploy Playwright check, not a local one. It signs into a deployed app and needs
`SMOKE_TEST_APP_ID`, `SMOKE_TEST_USER_NAME`, `SMOKE_TEST_USER_PASSWORD` and `NPM_PACKAGE_VERSION`.

### Override LaunchDarkly flags

You can create an `ld.local.json` file in the project root to override the LaunchDarkly flags.

Example `ld.local.json` content:

```json
{
  "enable-nice-feature": true,
  "key-of-the-feature-flag": "local value of the feature flag"
}
```

# Contributing

This project is using squash & merge model, feel free to have as many commits as you like but at the end the work will
end up on master as a single commit.

## Tech standards

1. TypeScript and React throughout. The AngularJS migration finished in May 2025 and there is no legacy tier left.
1. New UI work uses `@bitrise/bitkit-v2` (Chakra v3). `@bitrise/bitkit` (Chakra v2) is legacy — port v1 components to
   v2 in any file you already touch.
1. Nothing type-checks unless you run `npx tsc --noEmit`, so run it before calling a typed change done.
1. Four ESLint rules encode architectural boundaries rather than style. If `npm run lint` fails on
   `no-restricted-syntax` or `no-restricted-imports`, you crossed a boundary — see
   [docs/conventions.md](docs/conventions.md#lint).

Working on this codebase with an AI agent? [CLAUDE.md](CLAUDE.md) is the entry point, and `docs/` holds the
architecture, domain vocabulary and the reasoning behind the odd-looking parts.

## Testing standards

1. Unit tests are required for every new feature
1. Consider writing React Testing Library component tests
1. Services get a YAML round-trip test: seed the store, call the service, compare the emitted YAML. See
   [docs/conventions.md](docs/conventions.md#testing)

## New version release

Every master commit is released to an S3 bucket and Bitrise will integrate it with the website manually (CD is planned
when test coverage and confidence is increasing with the editor). If you wanna do a plugin release as well you need to
tag the PRs with `#plugin` wherever in the PR title (like: "new feature #plugin").

If new release requires Bitrise CLI to be updated, in `bitrise-plugin.yml` change `min_version` requirement of
the `bitrise` tool to the required CLI version.

## Testing if version release works, without actually releasing

- In bitrise.yml, create a workflow e. g. `test-release`
- From the `create-release` workflow, copy-paste the _GitHub release_ and _Create Discuss topic_ steps.
- In the GitHub release step, remove the `files_to_upload` input, set the `$NEW_RELEASE_VERSION` everywhere to something
  arbitrary, same for the `body`, and **most importantly set `draft: 'yes'`**
- In the Create Discuss topic step, **change the `DISCUSS_CHANGELOG_CATEGORY_ID` to the ID of one our
  discuss.bitrise.io's internal channels' ID** (you can find an ID using the Discourse API with a cURL request) so that
  it is only visible to us; also change the `title` and the `raw` parameter to something arbitrary.
- After the test release process, don't forget to delete the draft release and the internal changelog topic.
