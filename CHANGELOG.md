## Changelog (Current version: 1.0.17)

-----------------

## 1.0.17 (2017 Oct 10)

### Release Notes

* few external javascripts referenced from CDN
* popover z-index fix - mobile view
* manage go dependencies with dep
* go dependencies update

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.17
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

### Release Commits - 1.0.16 -> 1.0.17

* [678e719] Krisztián Gödrei - prepare for 1.0.17 (2017 Oct 10)
* [d726ca1] Krisztián Gödrei - Dep update (#204) (2017 Oct 10)
* [1d40ecb] erosdome - few external javascripts referenced from CDN (#197) (2017 Oct 06)
* [5211613] Norbert Kovach - popover z-index fix - mobile view (#203) (2017 Oct 06)


## 1.0.16 (2017 Oct 05)

### Release Notes

* Fixed minimum required CLI version.

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.16
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

### Release Commits - 1.0.15 -> 1.0.16

* [763b2b6] Norbert Kovach - cli update (#198) (2017 Oct 05)
* [ddfe9e8] erosdome - readme updated (#200) (2017 Oct 05)
* [de33000] Norbert Kovach - deps-update (#201) (2017 Oct 05)
* [19e2757] erosdome - min version updated 1.9.0 (#199) (2017 Oct 05)
* [f08f918] erosdome - readme update (2017 Oct 02)


## 1.0.15 (2017 Sep 29)

### Release Notes

* Issue fixes (#190, #194)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.15
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

### Release Commits - 1.0.14 -> 1.0.15

* [305eee6] erosdome - in website mode, indicate if back button is pressed on initial workflow editor page (2017 Sep 26)
* [a093426] erosdome - readme update (2017 Sep 26)
* [d378fde] Norbert Kovach - User should confirm workflow deletion (#195) (2017 Sep 26)
* [bb59af0] Norbert Kovach - password toggle fix (#193) (2017 Sep 21)
* [45c0467] erosdome - development info (2017 Sep 21)


## 1.0.14 (2017 Sep 21)

### Release Notes

* "Is expose" option added for app secrets and files. It toggles whether the secret or file is accessible in pull requests. By default, for secrets it is turned off, for files it is turned on.

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.14
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

### Release Commits - 1.0.13 -> 1.0.14

* [a249a55] erosdome - secret normalize after load (2017 Sep 21)
* [9a6f69d] Norbert Kovach - is exposed for files and secrets (#183) (2017 Sep 21)
* [82ab567] Norbert Kovach - Feature/new project type logo (#189) (2017 Sep 19)


## 1.0.13 (2017 Aug 07)

### Release Notes

* print bitrise.yml path

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.13
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

### Release Commits - 1.0.12 -> 1.0.13

* [4c8b24e] Krisztián Gödrei - print bitrise.yml path (#184) (2017 Aug 07)


## 1.0.12 (2017 Jul 13)

### Release Notes

* Issue #181 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.12
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

### Release Commits - 1.0.11 -> 1.0.12

* [a7841c2] Krisztián Gödrei - Check bitrise config (#182) (2017 Jul 13)


## 1.0.11 (2017 Jul 10)

### Release Notes

* Prevent removing `project_type` from bitrise.yml (issue #170)
* Error on start if no bitrise.yml in directory (#166)
* Issues #174, #175 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.11
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

### Release Commits - 1.0.10 -> 1.0.11

* [6fcf1b4] erosdome - v1.0.11 (2017 Jul 10)
* [6da88cd] erosdome - handle empty step list defined for workflows in app config (2017 Jul 10)
* [b03518b] erosdome - expiring URL - only generate on download (2017 Jul 10)
* [1e5104d] Krisztián Gödrei - check if bitrise.yml exist in the current directory (#178) (2017 Jul 06)
* [3e87a9c] Krisztián Gödrei - Bitrise models update (#177) (2017 Jul 06)
* [247f2e1] erosdome - handle if input category is not empty string, but undefined (2017 Jul 03)


## 1.0.10 (2017 Jun 29)

### Release Notes

* YML mode available even if app config load fails (#112)
* UI for git URL specified steps now also available in website mode (for now, GitHub only) - #164
* Preventin asset caching (#96)
* Issues #157, #167 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.10
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

### Release Commits - 1.0.9 -> 1.0.10

* [3a74f93] erosdome - v1.0.10 (2017 Jun 29)
* [c94a596] Krisztián Gödrei - versioned api base url (#163) (2017 Jun 29)
* [0c138bf] erosdome - hide version if null (2017 Jun 29)
* [22c4cc5] erosdome - if no version in git url specified step, use master (2017 Jun 29)
* [abe2cf8] erosdome - support git URL specified steps (only GitHub for now) in website mode (2017 Jun 29)
* [60f6b4b] erosdome - release version instead of timestamp (2017 Jun 29)
* [bdc68d0] erosdome - allow YML mode even if load error occurs (2017 Jun 28)
* [0f31b25] erosdome - is latest step version - fixed for local steps (2017 Jun 28)
* [6a3a2d5] erosdome - css fix (2017 Jun 27)
* [9e8c0f2] erosdome - input value options - UI displays value not specified in the defaults (e. g. if user specifies value in an environment variable) (2017 Jun 27)
* [f4fa865] erosdome - on file download, get new expiring URLs (2017 Jun 27)
* [be26ffb] erosdome - select primary workflow if it exists (2017 Jun 13)
* [f56565c] erosdome - "always latest" + version text in steps list rearranged (2017 Jun 13)
* [05f54c2] erosdome - display step ID or cvs even if step's title is defined but as empty string (2017 Jun 13)


## 1.0.9 (2017 Jun 12)

### Release Notes

* Also showing "always latest" in step list (#152)
* Issues #98, #155, #156, #160, #161 fixed
* On startup, "workflows" is always the initially selected tab, push is the initially selected trigger type (unless specified otherwise in the URL)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.9
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

### Release Commits - 1.0.8 -> 1.0.9

* [4c7af15] erosdome - v1.0.9 (2017 Jun 12)
* [370a052] erosdome - last visited menu-workflow-trigger cookies removed (2017 Jun 12)
* [bcf59c1] erosdome - sticky header console error fix (2017 Jun 09)
* [fc6a61d] erosdome - inputs - reload between step version changes (2017 Jun 09)
* [fcc8b0e] erosdome - step title validator updated (2017 Jun 09)
* [9d65116] erosdome - prevent trimming of textareas (2017 Jun 09)
* [18df395] erosdome - display "always latest" in steps list (2017 Jun 09)


## 1.0.8 (2017 Jun 02)

### Release Notes

* Issues #158, #154, #150 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.8
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

### Release Commits - 1.0.7 -> 1.0.8

* [52a49d4] erosdome - v1.0.8 (2017 Jun 02)
* [be24e67] erosdome - input categories - sorted by order of definition (2017 Jun 02)
* [e08c421] erosdome - callback elsewhere updated (2017 Jun 02)
* [9e34c28] Norbert Kovach - ionic project type (#151) (2017 Jun 02)
* [b8389c8] erosdome - fastlane project type icon added (2017 May 31)


## 1.0.7 (2017 May 30)

### Release Notes

* Issues #145, #146, #148, #149 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.7
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

### Release Commits - 1.0.6 -> 1.0.7

* [897d184] erosdome - v1.0.7 (2017 May 30)
* [c6e5b21] erosdome - sticky header fix (2017 May 30)
* [6a98a7f] Viktor Benei - Environment Variables will be replaced in input... - clarification (#147) (2017 May 30)
* [3df16da] erosdome - workflow name validation on create (2017 May 30)
* [5e4c188] erosdome - step rename fixed (2017 May 30)


## 1.0.6 (2017 May 25)

### Release Notes

* Input categories added
* Workflow description added
* UX update - top menu now sticks to the top of the screen when scrolling
* Issue #123 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.6
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

### Release Commits - 1.0.5 -> 1.0.6

* [a614ce0] erosdome - v1.0.6 (2017 May 25)
* [0308bc3] erosdome - Make top menu sticky when scrolling (#143) (2017 May 25)
* [2127f2f] erosdome - iframe message updated (2017 May 25)
* [6893e14] erosdome - add step - expanded state removed (2017 May 24)
* [50f57bd] erosdome - typo fix (2017 May 24)
* [8b322e9] erosdome - add step sidebar - load step icons when loading step data (2017 May 24)
* [39b6003] erosdome - environment variable replace/no replace added (2017 May 24)
* [aeac161] erosdome - Workflow description added (#142) (2017 May 24)
* [70eff20] erosdome - middleman svg helper method fix (2017 May 23)
* [bc207d9] erosdome - input categories added (2017 May 23)
* [256f56e] erosdome - docker configuration updated - fix port for development mode (2017 May 22)
* [f231127] erosdome - triggers - normalize method should order them by type (2017 May 22)


## 1.0.5 (2017 May 19)

### Release Notes

* Multiple workflow editors can run parallel (#64)
* Browser tab close disconnects API server (#48)
* Workflow rename fixed (issue #134)
* Step rename fixed (issue #133)
* Env var key specification updated (#135)
* Source code icon - hidden if not available (issue #132)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.5
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

### Release Commits - 1.0.4 -> 1.0.5

* [f9d93ce] erosdome - v1.0.5 (2017 May 19)
* [80f48c5] erosdome - API uses arbitrary free port, multiple editors can be opened (#137) (2017 May 19)
* [3cd902e] erosdome - Disconnect API fix - not disconnecting on page reload anymore (#138) (2017 May 19)
* [f7c7d80] erosdome - Close API connection on workflow editor tab close (#136) (2017 May 19)
* [40d78d2] erosdome - hide source code link if not specified (2017 May 19)
* [48f59e8] erosdome - step rename fix (2017 May 19)
* [df79eb5] erosdome - spec updates (2017 May 19)
* [e5845b9] erosdome - workflow rename fix (2017 May 19)
* [df0da3c] erosdome - env var key specification updated (2017 May 19)


## 1.0.4 (2017 May 18)

### Release Notes

* Replace variables in input toggle removed (#123)
* Version added to footer (#54)
* Step rename UX update (issue #130)
* Add step type tag filters - only listing filters which have matching steps (#111)
* Links in markdowns now open in new tab (#106)
* Add step list duplication issue (#127) fixed
* Add step index issue (#131) fixed
* Text change (issue #73)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.4
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

### Release Commits - 1.0.3 -> 1.0.4

* [52e9734] erosdome - v1.0.4 (2017 May 18)
* [023276c] erosdome - version added to footer (2017 May 18)
* [378d05c] erosdome - url & text updates (2017 May 18)
* [6f6e15a] erosdome - links in markdown - open in new tab (2017 May 18)
* [7597994] erosdome - step type filters - only show filters which has matching steps (2017 May 18)
* [b10c55b] erosdome - "replace variables in input" toggle removed from step inputs (2017 May 18)
* [be3a00c] erosdome - step list indexing issue fixed (2017 May 18)
* [480e499] erosdome - add step sidebar step listing fixed (2017 May 18)
* [990c8dd] erosdome - font smoothing updated (2017 May 18)
* [4dc1dba] erosdome - step rename UX update (2017 May 18)
* [21fbd4f] Viktor Benei - Update README.md (#126) (2017 May 16)
* [465e3ae] erosdome - changelog update (2017 May 16)


## 1.0.3 (2017 May 16)

### Release Notes

* Prevent asset caching added (issue #96) for website mode
* UX updates (issue #124)
* Issue #121 fixed
* Issue #116 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.3
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

### Release Commits - 1.0.2 -> 1.0.3

* [b1697a0] erosdome - v1.0.3 (2017 May 16)
* [4b5761f] erosdome - triggers - switch type during add - fixed (2017 May 16)
* [5272f68] erosdome - not allowed cursor for not recommended to be changed inputs (2017 May 16)
* [c6a36a0] erosdome - clone, source code - popovers added with info (2017 May 16)
* [0c45979] erosdome - rename workflow fixed (2017 May 16)
* [6fb827d] erosdome - cache blocking added for website mode (2017 May 16)
* [748071a] erosdome - version ordering fix (2017 May 16)


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

Updated: 2017 Oct 10