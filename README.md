# Bitrise Workflow Editor


## Development

### Build a stand-alone binary, with embedded resources

```
bitrise run go-install
```

## New version release

- Bump `RELEASE_VERSION` in `bitrise.yml`
- Commit changes (no push!)
- Call `bitrise run create-release`
- Remove the new tag
- Update & commit changelog in `CHANGELOG.md`
- Squash & push commits since origin's `master` state to `vX.X.X`
- On GitHub, create new release with title and tag `X.X.X`, description from changelog, starting with *Release Notes*, up to but not including *Release Commits*
- Wait for the `create-release` workflow to finish successfully on Bitrise
- Download the generated artifacts from Bitrise
- In terminal, run `chmod +x <path to generated Darwin binary> && <path to generated Darwin binary> version --full`
- After finish and double-checking build number and commit hash on Bitrise, run <path to generated Darwin binary> to check if binary is working
- On GitHub, attach the binaries, then select *Publish release*