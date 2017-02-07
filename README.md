# Bitrise Workflow Editor


## Development

### Build a stand-alone binary, with embedded resources

```
bitrise run go-install
```

## New version release

- Ensure clean git
- Bump `RELEASE_VERSION` in `bitrise.yml`
- Push changes
- Call `bitrise run create-release`
- Update & push changelog in `CHANGELOG.md`
- On GitHub, create new release with title and tag `X.X.X`, description from changelog, starting with *Release Notes*, up to but not including *Release Commits*
- Wait for the `create-release` workflow to finish successfully on Bitrise
- Download the generated artifacts from Bitrise
- In terminal, run `chmod +x <path to generated binary> && <path to generated binary> version --full`
- After finish and double-checking build number and commit hash on Bitrise, run <path to generated binary> to check if binary is working
- On GitHub, attach the binaries, then select *Publish release*