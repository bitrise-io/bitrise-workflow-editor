## Changelog (Current version: 1.0.2)

-----------------

## 1.0.2 (2017 May 16)

### Release Notes

* Issue #109 fix: empty workflows handled
* Devcenter URL fix (issue #115)
* Issue #119 fix: pull request triggers only need source or target branch pattern
* Issue #122 fix: inputs-outputs fix for steps without inputs or outputs

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.2
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

### Release Commits - 1.0.1 -> 1.0.2

* [b00ba6f] erosdome - v1.0.2 (2017 May 16)
* [5671eb8] erosdome - quickfixes (#117) (2017 May 16)


## 1.0.1 (2017 May 12)

### Release Notes

* Issues #99, #102, #104 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.1
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

### Release Commits - 1.0.0 -> 1.0.1

* [1c0d173] erosdome - v1.0.1 (2017 May 12)
* [d817958] erosdome - tag trigger fix (2017 May 12)
* [2dff3a1] erosdome - css fixes (2017 May 12)
* [b58c500] erosdome - Source Code Pro font added (2017 May 12)
* [7b02566] erosdome - input fonts updated (2017 May 12)
* [99a23b0] erosdome - font weight update; input alignment updates (2017 May 12)
* [90f7827] erosdome - markdown styling fix (2017 May 12)
* [a1aa753] erosdome - required empty inputs css fix (2017 May 12)


## 1.0.0 (2017 May 12)

### Release Notes

* Prepared for website integration
* Issues #1, #51, #87, #97 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.0
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

### Release Commits - 0.9.10 -> 1.0.0

* [38a717a] erosdome - v1.0.0 (2017 May 12)
* [e72f3de] erosdome - code signing hints - don't show if once dismissed (2017 May 12)
* [4af5b69] erosdome - outputs - can open/close description (2017 May 12)
* [11c2732] erosdome - inputs - show description (2017 May 12)
* [855db0d] erosdome - minimize app config - updated (2017 May 12)
* [e181672] erosdome - env vars - validate during type (2017 May 12)
* [a2d4dd4] erosdome - ignore save error if already handled (2017 May 12)
* [a1ccb66] erosdome - generic files - handle maximum count (2017 May 11)
* [d153d45] erosdome - certificates - handle maximum count (2017 May 11)
* [e5d98fc] erosdome - prov profiles - handle maximum count (2017 May 11)


## 0.9.10 (2017 May 11)

### Release Notes

* Issues #83, #84, #88, #90, #92, #93, #94 fixed
* Footer added
* Deprecated badge added for deprecated steps

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.10
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

### Release Commits - 0.9.9 -> 0.9.10

* [a6a89fe] erosdome - v0.9.10 (2017 May 11)
* [2dc2e76] erosdome - workflows tab revision (#95) (2017 May 11)
* [bf0cf5f] erosdome - unsaved changes check - moved to separate methods (2017 May 11)
* [7c9fec8] erosdome - block saving with key if not enabled (2017 May 10)
* [c93a89e] erosdome - Safari css fixes added (2017 May 09)
* [4c6a039] erosdome - code signin tab - style updated (2017 May 09)
* [3139729] erosdome - file upload - popups updated (2017 May 09)
* [2a4372b] erosdome - provisioning profiles, certificates - multiple upload added (2017 May 09)
* [5a459a4] erosdome - add trigger button css update (2017 May 09)
* [ebccf6b] erosdome - add step sidebar - window resize handled; hide verified/community created badge if deprecated (2017 May 09)
* [b78b821] erosdome - deprecated steps - badge added (2017 May 09)
* [ca8fc6e] erosdome - footer added; css updates (2017 May 09)
* [36a1aa3] erosdome - project type filtering added (#89) (2017 May 08)
* [fe49f6a] erosdome - request service - mode configuration updated (2017 May 08)
* [ba44c35] erosdome - mode configuration updated (2017 May 05)
* [7045ab6] erosdome - only load secrets the first time, or when forced (2017 May 04)
* [4fc16cb] erosdome - insert variable popup fix (issue #84) (2017 May 04)
* [bb69490] erosdome - add step sidebar - load steps if not loaded yet (if no workflow uses step from default steplib) (2017 May 04)
* [045ba24] erosdome - insert variable error fixed (issue #83) (2017 May 04)


## 0.9.9 (2017 May 03)

### Release Notes

* Add step sidebar added
* Required inputs marked on UI if their value is not filled
* Step version update available badge added
* Step verified / user contributed badge added
* Issues #68, #79, #81

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.9
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

### Release Commits - 0.9.8 -> 0.9.9

* [923f89a] erosdome - v0.9.9 (2017 May 03)
* [7fce431] erosdome - add step sidebar (#86) (2017 May 03)
* [e973ab4] erosdome - tab animation removed (2017 Apr 28)
* [5a7ffde] erosdome - minor requested updates: (#82) (2017 Apr 27)
* [dfa43f4] erosdome - development now available in docker (#85) (2017 Apr 27)
* [dcfecdc] Viktor Benei - Tab rename: App Env Vars -> Env Vars (2017 Apr 26)
* [8f29727] erosdome - env var tab - delete button css fix (2017 Apr 06)
* [479ab61] erosdome - routes & request service methods cleanup (2017 Apr 06)
* [d6390eb] erosdome - app config yml download url fixed (2017 Apr 03)


## 0.9.8 (2017 Apr 03)

### Release Notes

* Issue fixed when bitrise.yml has step defined as `step-id:` instead of `step-id: {}`
* Confirm popup dismissed via escape key - handled as confirm popup's "no" button
* Inputs that are not recommended to be changed - changing disabled on the UI

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 0.9.8
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

### Release Commits - 0.9.7 -> 0.9.8

* [72ec8d0] erosdome - v0.9.8 (2017 Apr 03)
* [dabfb34] erosdome - don't change inputs - disable editing on UI (2017 Apr 03)
* [2d57c85] erosdome - confirm popup dismiss behaviour bugfix (2017 Apr 03)
* [3e041f6] erosdome - icon position update (2017 Apr 03)
* [bd50784] erosdome - handle if empty step is defined in YML without empty brackets (2017 Apr 03)
* [f254084] erosdome - website mode added (#77) (2017 Apr 03)


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

Updated: 2017 May 16