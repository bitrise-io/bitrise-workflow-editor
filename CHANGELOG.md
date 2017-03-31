## Changelog (Current version: 0.9.7)

-----------------

## 0.9.7 (2017 Mar 31)

### Release Notes

* Git step handling added
* Local step handling added
* On step version change, warning added about inputs not available in the new version
* Minor UX bugfixes (fixing issue #63)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.7
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

### Release Commits - 0.9.6 -> 0.9.7

* [ee8f1f9] erosdome - v0.9.7 (2017 Mar 31)
* [f0396dd] erosdome - Workflows tab bugfix (#72) (2017 Mar 31)
* [5db9cbb] erosdome - local steps, git steps - version handling, caching updated (2017 Mar 30)
* [088b389] erosdome - steps specified by git URL - implemented; (#71) (2017 Mar 30)
* [869f8fb] Krisztián Gödrei - step-info api endpoint (#70) (2017 Mar 30)
* [c1d6a3d] Krisztián Gödrei - api server test fix (#69) (2017 Mar 29)
* [1d665ac] erosdome - Enhancements (#67) (2017 Mar 24)


## 0.9.6 (2017 Feb 20)

### Release Notes

* Open Sans set as default font for editor
* Change added step bug fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.6
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

### Release Commits - 0.9.5 -> 0.9.6

* [5da44e9] erosdome - v0.9.6. (2017 Feb 20)
* [cac4e12] erosdome - bug when immediately editin step after adding it - fixed (2017 Feb 20)
* [2ac992b] erosdome - font set to open sans (2017 Feb 20)
* [e91b8dc] erosdome - readme updated (2017 Feb 16)


## 0.9.5 (2017 Feb 16)

### Release Notes

* Selected workflow, selected trigger type stored in URL
* Last selected tab, workflow, trigger type stored in cookie
* Ctrl+S key command now working on Linux
* Bug when leaving triggers tab and save prompt showing incorrectly fixed
* Step ordering bug fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.5
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

### Release Commits - 0.9.4 -> 0.9.5

* [ce2d4ba] erosdome - v0.9.5. (2017 Feb 16)
* [5022822] erosdome - Improved ui reload (#61) (2017 Feb 16)
* [32904fe] erosdome - save key combination fix try #1 (2017 Feb 16)
* [01f19ac] erosdome - inactive workflow step ordering fixed (2017 Feb 15)
* [79b358b] erosdome - triggers tab change bug fixed (2017 Feb 15)


## 0.9.4 (2017 Feb 15)

### Release Notes

* Step delete bug fixed
* Ctrl+S key command for save added
* Workflow selector dropdown scroll issue fixed
* Step versions are now in descending order

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.4
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

### Release Commits - 0.9.3 -> 0.9.4

* [b465db5] erosdome - v0.9.4 (2017 Feb 15)
* [65077cb] erosdome - delete step bug fixed (2017 Feb 14)
* [c4465ab] erosdome - versions - in descending order (2017 Feb 13)
* [13f06de] erosdome - sticky header should not stick if workflow selector dropdown is open (2017 Feb 13)
* [3ba38b3] erosdome - if no step title, start rename from step's cvs (2017 Feb 13)
* [f4a9d07] erosdome - ctrl+s triggers save (2017 Feb 09)
* [e0de53d] erosdome - only start library fetch request if there are any libraries not already loaded (2017 Feb 08)
* [11618bb] erosdome - top tabmenu css fix (2017 Feb 08)
* [0b2bf22] erosdome - unneccessary js files excluded from rendered page (2017 Feb 08)
* [c2639ce] erosdome - readme updated (2017 Feb 07)
* [dd11e5c] erosdome - communication between tabs simplified (2017 Feb 07)


## 0.9.3 (2017 Feb 07)

### Release Notes

* Deprecated trigger auto-update on start - fixed
* Variable key validation logic updated - only letters, numbers, underscore are allowed, and key cannot start with number
* On tab switch, show save prompt popup if next tab handles different source (e. g. when going from Workflows tab to Secrets tab) and previous tab has unsaved changes
* On page close, show confirm popup if there are unsaved changes

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.3
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

* [2c3c82a] Krisztián Gödrei - Release automation (#47) (2017 Feb 07)
* [fe76f91] erosdome - v0.9.3 (2017 Feb 06)
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

Updated: 2017 Mar 31