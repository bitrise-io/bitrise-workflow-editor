![Build status](https://app.bitrise.io/app/1686da85b5935fd6.svg?token=7HlnSBadcyLcUnzq0ws4Nw)

# Bitrise Workflow Editor

> **Note: project is going through angularjs -> React transition. Please read more about this in the [wiki section](https://github.com/bitrise-io/bitrise-workflow-editor/wiki/Angular-js-to-React-transition-timeline).**


## Before you start
Make sure to **clone this repository into your `GOPATH`**
Location: `/User/your-name/go/src/github.com/bitrise-io/bitrise-workflow-editor`

Otherwise you will face a similar error:
`go install: no install location for directory /Users/your-name/repos/bitrise-workflow-editor outside GOPATH`

If you prefer you can create a smybolic link to your preferred workspace location.
Format: `ln -s source destination`
Example: `ln -s /User/your-name/go/src/github.com/bitrise-io/bitrise-workflow-editor /Users/your-name/repos/bitrise-workflow-editor`


## How to install & use the Workflow Editor on your Mac/Linux

1. Install [Go](https://golang.org) `brew install go`(on macOS)
1. Install the latest [Bitrise CLI](https://www.bitrise.io/cli) - it's a single binary command line tool
1. Run `bitrise setup` just to be sure everything's prepared
1. `cd` into a directory where you have your `bitrise.yml`, and run: `bitrise :workflow-editor`

That's all. The Workflow Editor is now part of the Bitrise CLI core plugins, so you don't have to install it manually.

To upgrade to the latest version of the Workflow Editor run:

```
bitrise plugin update workflow-editor
```

*Join the Workflow Editor's discussion at: [https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39](https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39)*


## Install requirements

Workflow editor uses webpack for static asset compilation and asset bundling. For transformation we need to use some rails related transformation hence it also uses bundler to install ruby dependencies. In addition it uses karma and jasmine for frontend tests execution so it needs `node` and `npm` installed to get the dependencies for testing and also production.

Finally the local executable is written in GO. so you need to have go set up as well and dependencies.

```bash
bitrise run setup-client
```

## Development

### Build a stand-alone binary, with embedded resources

```
bitrise run go-install
```

### Run in development mode

```bash
npm start          # start both local plugin api and webpack dev server
```

1. In your browser, you can reach the Workflow Editor on `localhost:4000/{version}`. Be aware that you usually have to wait a while until dev server starts up (then refresh)
1. By default, the Workflow Editor will open the `test_bitrise.yml` from integration folder (used for integration testing). Please do not commit this file if you have any changes with it (e2e tests would fail).

If you would like to run the Workflow Editor in `website` mode, you have to set the following two environment variables:

```bash
export PUBLIC_URL_ROOT=http://localhost:4000
export MODE=WEBSITE
```

### Run client tests

```bash
npm test        # for single run unit test with code compilation
npm run karma   # for single run unit test without code compilation (using already compiled code)

npm run e2e:api # run only the local binary api for e2e tests
npm run e2e:dev # run e2e test dashboard (cypress dashboard)
npm run e2e:run # run e2e tests itself (cypress)
npm run e2e     # for self contained e2e tests (local binary api + testing logic) e2e:api + e2e:run
```

*NOTE: for e2e testing you could start a service normally (to develop and run tests on it parallel) or have a binary ready by `bitrise run setup-plugin-api` if you only want to verify the correctness of an already built feature.*

Use `npm test` for a single test run.
If you only iterate on tests, you can also use `npm run karma` as it skips transpilation and the transpilation and run the tests on an already transpiled JS. (faster)

### Releasing

Every master commit is gonna released to S3 and Bitrise will integrate it with the website manually (CD is planned when test coverage and confidence is increasing with the editor). If you wanna do a plugin release as well you need to tag the PRs with `#plugin` wherever in the PR title (like: "new feature #plugin".

# Contributing

This project is using squash & merge model, feel free to have as many commits as you like but at the end the work will end up on master as a single commit.

## Tech standards

1. Every new feature has to be created in typescript and React (see [wiki](https://github.com/bitrise-io/bitrise-workflow-editor/wiki/React-from-angularjs-best-practices) for integration guides).
1. If you touch legacy code, consider porting it to new standards or if that's not possible use ES5 syntax! There are no transpilation for legacy codes (only minification).
1. For tests you are safe to use whatever standards jsdom executes (ES6 supported).
1. Use SCSS for styling (try to use local components style if possible)

## Testing standards

1. Unit tests are required for every new feature
1. Consider write E2E tests as well (with cucumber and cypress)

## New version release

Every master commit is released to an S3 bucket and Bitrise will integrate it with the website manually (CD is planned when test coverage and confidence is increasing with the editor). If you wanna do a plugin release as well you need to tag the PRs with `#plugin` wherever in the PR title (like: "new feature #plugin".

If new release requires Bitrise CLI to be updated, in `bitrise-plugin.yml` change `min_version` requirement of the `bitrise` tool to the required CLI version

## Testing if version release works, without actually releasing

- In bitrise.yml, create a workflow e. g. `test-release`
- From the `create-release` workflow, copy-paste the *GitHub release* and *Create Discuss topic* steps.
- In the GitHub release step, remove the `files_to_upload` input, set the `$NEW_RELEASE_VERSION` everywhere to something arbitrary, same for the `body`, and **most importantly set `draft: 'yes'`**
- In the Create Discuss topic step, **change the `DISCUSS_CHANGELOG_CATEGORY_ID` to the ID of one our discuss.bitrise.io's internal channels' ID** (you can find an ID using the Discourse API with a cURL request) so that it is only visible to us; also change the `title` and the `raw` parameter to something arbitrary.
- After the test release process, don't forget to delete the draft release and the internal changelog topic.
