![Build status](https://app.bitrise.io/app/1686da85b5935fd6.svg?token=7HlnSBadcyLcUnzq0ws4Nw)

# Bitrise Workflow Editor

> **Note: project is going through AngularJS -> React transition.
> Please read more about this in
>
the [wiki section](https://github.com/bitrise-io/bitrise-workflow-editor/wiki/Angular-js-to-React-transition-timeline).
**

## How to install & use the Workflow Editor on your Mac/Linux

1. Install [Go](https://golang.org) `brew install go` (on macOS)
1. Install the latest [Bitrise CLI](https://www.bitrise.io/cli) - it's a single binary command line tool
1. Run `bitrise setup` just to be sure everything's prepared
1. `cd` into a directory where you have your `bitrise.yml`, and run: `bitrise :workflow-editor`

That's all. The Workflow Editor is now part of the Bitrise CLI core plugins, so you don't have to install it manually.

To upgrade to the latest version of the Workflow Editor run:

```
bitrise plugin update workflow-editor
```

_Join the Workflow Editor's discussion
at: [https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39](https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39)_

## Install requirements

Workflow editor uses webpack for static asset compilation and asset bundling. For transformation we need to use some
rails related transformation hence it also uses bundler to install ruby dependencies. In addition it uses karma and
jasmine for frontend tests execution so it needs `node` and `npm` installed to get the dependencies for testing and also
production.

Finally the local executable is written in GO. so you need to have go set up as well and dependencies.

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
npm start          # start both local plugin api and webpack dev server
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
Also make sure that you change the path in the monolith to point to this version of the WFE (instead of the production
version):

- in the monolith open `workflow_controller.rb`
- change `base_url` in method `get_workflow_editor_html_content` to the current version:
  - if you run the monolith directly (using the umbrella repo) use `localhost:4000/{version}` (
    e.g `base_url = 'http://localhost:4000/1.3.135`)
  - if you run the monolith in docker (e.g with the `web-dev-env` repo) use `host.docker.internal:4000/{version}` (
    e.g `base_url = 'http://host.docker.internal:4000/1.3.135'`)

Once the above steps are complete, you should be able to reach the Workflow Editor in the monolith
on `localhost:3000/app/{slug}/workflow_editor`.

### Run client tests

```bash
npm test        # run unit tests on already compiled client
npm run e2e:api # run only the local binary api for e2e tests
```

_NOTE: for e2e testing you could start a service normally with `npm start` (to develop and run tests on it parallel) or
have a binary ready by `bitrise run setup` if you only want to verify the correctness of an already built
feature. And then run the test dashboard with `npm run e2e:dev`_

If you only iterate on tests, you can also use `npm run test` as it skips transpilation and the transpilation and run
the tests on an already transpiled JS.

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

1. Every new feature has to be created in typescript and React (
   see [wiki](https://github.com/bitrise-io/bitrise-workflow-editor/wiki/React-from-angularjs-best-practices) for
   integration guides).
1. If you touch legacy code, consider porting it to new standards or if that's not possible use ES5 syntax! There are no
   transpilation for legacy codes (only minification).
1. For tests you are safe to use whatever standards jsdom executes (ES6 supported).
1. Use CSS for styling (try to use local components style if possible)

## Testing standards

1. Unit tests are required for every new feature
1. Consider writing React Testing library component tests

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
