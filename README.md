# Bitrise Workflow Editor

## How to install & use the Workflow Editor on your Mac/Linux

1. Install the latest [Bitrise CLI](https://www.bitrise.io/cli) - it's a single binary command line tool
1. Run `bitrise setup` just to be sure everything's prepared
1. `cd` into a directory where you have your `bitrise.yml`, and run: `bitrise :workflow-editor`

That's all. The Workflow Editor is now part of the Bitrise CLI core plugins, so you don't have to install it manually.

To upgrade to the latest version of the Workflow Editor run:

```
bitrise plugin update workflow-editor
```

*Join the Workflow Editor's discussion at: [https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39](https://discuss.bitrise.io/t/workflow-editor-v2-offline-workflow-editor/39)*


## Development

### Build a stand-alone binary, with embedded resources

```
bitrise run go-install
```

### Run in development mode

1. In the Workflow Editor's directory, run `docker-compose up`.
1. In your browser, you can reach the Workflow Editor on `localhost:1234`. Be aware that you usually have to wait a while.
1. By default, the Workflow Editor will open the bitrise.yml and .bitrise.secrets.yml found in this folder. For testing purposes, you probably want to be able to edit custom files. This can be achieved by setting the `TEST_BITRISE_CONFIG_PATH` and `TEST_BITRISE_SECRETS_PATH` environment variables with the path pointing to the custom files' paths.

### Run tests

1. In the Workflow Editor's directory, run `up-middleman-jasmine`.
1. In your browser, you can reach the tests on `localhost:4567/jasmine`.
1. Every time you make a change to the code, you have to exit the running workflow and start it up again. You can make changes to the specs without having to do this.

## New version release

- Ensure clean git
- If new release requires Bitrise CLI to be updated, in `bitrise-plugin.yml` change `min_version` requirement of the `bitrise` tool to the required CLI version
- Optional: set the following secrets: $GITHUB_RELEASE_API_TOKEN, $GITHUB_USERNAME, $DISCUSS_API_KEY, $DISCUSS_USERNAME
- Call `bitrise run create-release`
- During the build you will need to specify a new version number, and if you did not specify any of the secrets above, you will need to specify those as well.
- After the build has finished, close the related GitHub issues, and milestones if the issues were assigned to any.
