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
- Bump `RELEASE_VERSION` in `bitrise.yml`
- Call `bitrise run create-release`
- Update changelog in `CHANGELOG.md`
- If new release requires Bitrise CLI to be updated, in `bitrise-plugin.yml` change `min_version` requirement of the `bitrise` tool to the required CLI version
- Commit changes with message `vX.X.X`, push it
- On GitHub, create new release with title and tag `X.X.X`, description from changelog, starting with *Release Notes*, up to but not including *Release Commits*
- Wait for the `create-release` workflow to finish successfully on Bitrise
- Download the generated artifacts from Bitrise
- In terminal, run `chmod +x <path to generated binary> && <path to generated binary> version --full`
- After finish and double-checking build number and commit hash on Bitrise, run <path to generated binary> to check if binary is working
- On GitHub, attach the binaries, then select *Publish release*
- On discuss.bitrise.io, in *Changelog* category, create a topic called **Workflow Editor vX.X.X released**. Description should include the changelog (with URLs to related GitHub issues) and a link to the installation instructions.
- On GitHub, close the related GitHub issues, and milestones if the issues were assigned to any.
