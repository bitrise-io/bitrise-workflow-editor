## Changelog (Current version: 0.9.3)

-----------------

## 0.9.3 (2017 Feb 06)

### Release Notes

* Deprecated trigger auto-update on start - fixed
* Variable key validation logic updated - only letters, numbers, underscore are allowed, and key cannot start with number
* On tab switch, show save prompt popup if next tab handles different source (e. g. when going from Workflows tab to Secrets tab) and previous tab has unsaved changes
* On page close, show confirm popup if there are unsaved changes

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git
```

To update the already installed plugin to the latest version:

```
bitrise plugin update workflow-editor
```

That's all, you're ready to go!

To run the workflow editor plugin call:

```
bitrise :workflow-editor
```

### Release Commits - 0.9.2 -> 0.9.3

* [8bc8056] erosdome - prepare for 0.9.3 release (2017 Feb 06)
* [ce61800] erosdome - prompt before tab close if there are unsaved changes (2017 Feb 06)
* [e0c0b1f] erosdome - Tab switch update (#44) (2017 Feb 06)
* [e6fd5c6] erosdome - variable key validation updated (2017 Feb 06)
* [105657f] erosdome - update deprecated triggers - fixed (2017 Feb 06)


## 0.9.2 (2017 Feb 03)

### Release Notes

* update plugin definition to use the current binary

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git
```

To update the already installed plugin to the latest version:

```
bitrise plugin update workflow-editor
```

That's all, you're ready to go!

To run the workflow editor plugin call:

```
bitrise :workflow-editor
```

### Release Commits - 0.9.1 -> 0.9.2

* [1da2d1e] Krisztian Godrei - prepare for 0.9.2 (2017 Feb 03)
* [fa4dbfe] Krisztian Godrei - update plugin definition (2017 Feb 03)


## 0.9.1 (2017 Feb 03)

### Release Notes

* CLI package changed from urfave CLI to Cobra CLI
* Multiple step library support added
* App env vars section not displayed if config YML does not contain `app` or `envs` key - fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git
```

To update the already installed plugin to the latest version:

```
bitrise plugin update workflow-editor
```

That's all, you're ready to go!

To run the workflow editor plugin call:

```
bitrise :workflow-editor
```

### Release Commits - 0.9.0 -> 0.9.1

* [6312793] erosdome - prepare for 0.9.1 (2017 Feb 03)
* [23d73cc] erosdome - Multiple step library support added (#37) (2017 Feb 03)
* [e7f30e0] Krisztián Gödrei - Cobra cli (#34) (2017 Jan 31)
* [0c33801] erosdome - app env vars - bug fixed when "app" or "envs" is not specified in app config (2017 Jan 31)
* [3889e3d] erosdome - unneccessary request cancelling removed (2017 Jan 31)


-----------------

Updated: 2017 Feb 06