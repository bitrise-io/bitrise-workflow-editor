## Changelog (Current version: 1.2.1)

-----------------

## 1.2.1 (2020 Feb 27)

### Release Notes

* Add Workflows tab specification for Workflow control bar, Step list, Step details, Step Inputs (part of it) (#450)
* Fix steplib issues (#451)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.2.1
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

### Release Commits - 1.2.0 -> 1.2.1

* [7cae6ce] erosdome - Add Workflows tab specification for Workflow control bar, Step list, Step details, Step Inputs (part of it) (#450) (2020 Feb 26)
* [bfa7c87] Simon Márton - Fix steplib issues (#451) (2020 Feb 26)


## 1.2.0 (2020 Feb 21)

### Release Notes

* Port StepLib search service to TS (#447)
* Reference Workflow Editor inside Go path in API dev mode (#444)
* [WEB-3399] Use steplib search service for fuzzy search  (#443)
* Fix unnecessary polling on Code Signing tab
* [WEB-3398] Load selected project type in step selector by default (#441)
* [WEB-3397] Integrate and use StepLib Search NPM package (#437)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.2.0
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

### Release Commits - 1.1.74 -> 1.2.0

* [d488da0] Simon Márton - Port StepLib search service to TS (#447) (2020 Feb 21)
* [655323a] erosdome - Reference Workflow Editor inside Go path in API dev mode (#444) (2020 Feb 20)
* [cb964c1] Simon Márton - [WEB-3399] Use steplib search service for fuzzy search  (#443) (2020 Feb 20)
* [c1cb6de] erosdome - Fix unnecessary polling on Code Signing tab (2020 Feb 20)
* [fcef8a1] Simon Márton - [WEB-3398] Load selected project type in step selector by default (#441) (2020 Feb 18)
* [9a298e1] Simon Márton - [WEB-3397] Integrate and use StepLib Search NPM package (#437) (2020 Feb 18)


## 1.1.74 (2020 Feb 17)

### Release Notes

* Fix flex bug (#439)
* [WEB-3293] Handle null response at YML validation (#440)
* master deploy fixes (#436)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.74
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

### Release Commits - 1.1.73 -> 1.1.74

* [4543173] erosdome - Fix flex bug (#439) (2020 Feb 17)
* [efc4f51] Gergely Békési - [WEB-3293] Handle null response at YML validation (#440) (2020 Feb 17)
* [11ab7a6] Adam Pelle - master deploy fixes (#436) (2020 Feb 14)


## 1.1.73 (2020 Feb 13)

### Release Notes

* [WEB-3426] invalid version handling (#430)
* Fix webpack deploy (#435)
* Revert "version bump (1.1.72 -> 1.1.73) (#433)" (#434)
* remove unnecessary check (#431)
* version bump (1.1.72 -> 1.1.73) (#433)
* godeps update to pull new versions of bitrise and stepman (#432)
* Webpack integration (#429)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.73
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

### Release Commits - 1.1.72 -> 1.1.73

* [f3057e4] Adam Pelle - [WEB-3426] invalid version handling (#430) (2020 Feb 12)
* [cda30bf] Adam Pelle - Fix webpack deploy (#435) (2020 Feb 12)
* [8d6ca14] Krisztián Gödrei - Revert "version bump (1.1.72 -> 1.1.73) (#433)" (#434) (2020 Feb 11)
* [f7bc272] lszucs - remove unnecessary check (#431) (2020 Feb 11)
* [e786e6f] Krisztián Gödrei - version bump (1.1.72 -> 1.1.73) (#433) (2020 Feb 11)
* [e1bdd9c] Krisztián Gödrei - godeps update to pull new versions of bitrise and stepman (#432) (2020 Feb 11)
* [9c9e021] Adam Pelle - Webpack integration (#429) (2020 Feb 07)


## 1.1.72 (2020 Jan 31)

### Release Notes

* Lazy load add step sidebar icons [WEB-2014] (#421)
* Exclude "add step" button from ordering drag area of adjacent step (#422)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.72
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

### Release Commits - 1.1.71 -> 1.1.72

* [825d0aa] erosdome - Lazy load add step sidebar icons [WEB-2014] (#421) (2020 Jan 31)
* [77e2eca] erosdome - Exclude "add step" button from ordering drag area of adjacent step (#422) (2020 Jan 31)


## 1.1.71 (2020 Jan 30)

### Release Notes

* Revert verified & official step badge feature for now (#427)
* Lock Ruby version to 2.5.3 (#426)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.71
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

### Release Commits - 1.1.70 -> 1.1.71

* [1285832] erosdome - Revert verified & official step badge feature for now (#427) (2020 Jan 30)
* [0c76dc4] erosdome - Lock Ruby version to 2.5.3 (#426) (2020 Jan 30)


## 1.1.70 (2020 Jan 30)

### Release Notes

* Skip API disconnection on browser close when running in development mode (#420)
* [WEB-3482] release (#425)
* Revert "[WEB-3334] version strings extraction (#411)"
* Revert "[WEB-3337] disable non wildcard versions in version selector (#416)" (#423)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.70
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

### Release Commits - 1.1.69 -> 1.1.70

* [ad1ddd4] erosdome - Skip API disconnection on browser close when running in development mode (#420) (2020 Jan 29)
* [f6b5ce4] Adam Pelle - [WEB-3482] release (#425) (2020 Jan 29)
* [9b7062c] Adam Pelle - Revert "[WEB-3334] version strings extraction (#411)" (2020 Jan 28)
* [9446551] Adam Pelle - Revert "[WEB-3337] disable non wildcard versions in version selector (#416)" (#423) (2020 Jan 28)


## 1.1.69 (2020 Jan 27)

### Release Notes

* Update notification styling to match new design (#419)
* Fix/Update visibility of machine type selector (#418)
* [WEB-2016] Change PNGs to emojis (#417)
* [WEB-3337] disable non wildcard versions in version selector (#416)
* [WEB-3334] version strings extraction (#411)
* fix: Gemfile & Gemfile.lock to reduce vulnerabilities (#414)
* [WEB-3355] housekeeping (#413)
* [WEB-2963] Update Verified and Official step badges (#410)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.69
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

### Release Commits - 1.1.68 -> 1.1.69

* [f248331] erosdome - Update notification styling to match new design (#419) (2020 Jan 27)
* [cf4a8d3] Norbert Kovach - Fix/Update visibility of machine type selector (#418) (2020 Jan 27)
* [60d76bc] Gergely Békési - [WEB-2016] Change PNGs to emojis (#417) (2020 Jan 23)
* [b146115] Adam Pelle - [WEB-3337] disable non wildcard versions in version selector (#416) (2020 Jan 21)
* [7988bb2] Adam Pelle - [WEB-3334] version strings extraction (#411) (2020 Jan 21)
* [52146d5] Snyk bot - fix: Gemfile & Gemfile.lock to reduce vulnerabilities (#414) (2020 Jan 20)
* [320812a] Adam Pelle - [WEB-3355] housekeeping (#413) (2020 Jan 16)
* [9dda72d] Simon Márton - [WEB-2963] Update Verified and Official step badges (#410) (2020 Jan 15)


## 1.1.68 (2020 Jan 13)

### Release Notes

* Add 'Coming soon' label to EliteXL MacOS machines (#409)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.68
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

### Release Commits - 1.1.67 -> 1.1.68

* [144733d] Norbert Kovach - Add 'Coming soon' label to EliteXL MacOS machines (#409) (2020 Jan 13)


## 1.1.67 (2019 Dec 03)

### Release Notes

* Fix MachineType selector issue caused by changing stack type (#406)
* Disable selection of not available machine types (#405)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.67
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

### Release Commits - 1.1.66 -> 1.1.67

* [0d440e6] Norbert Kovach - Fix MachineType selector issue caused by changing stack type (#406) (2019 Dec 03)
* [d13684c] Norbert Kovach - Disable selection of not available machine types (#405) (2019 Dec 03)


## 1.1.66 (2019 Nov 28)

### Release Notes

* Fix local Workflow Editor (#404)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.66
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

### Release Commits - 1.1.65 -> 1.1.66

* [a6b002a] Norbert Kovach - Fix local Workflow Editor (#404) (2019 Nov 28)


## 1.1.65 (2019 Nov 27)

### Release Notes

* Rename XSRF token (#401)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.65
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

### Release Commits - 1.1.64 -> 1.1.65

* [376756d] Simon Márton - Rename XSRF token (#401) (2019 Nov 27)


## 1.1.64 (2019 Nov 22)

### Release Notes

* Fix issue related to Outside contributor authorization (#400)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.64
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

### Release Commits - 1.1.63 -> 1.1.64

* [3a0330e] Norbert Kovach - Fix issue related to Outside contributor authorization (#400) (2019 Nov 22)


## 1.1.63 (2019 Nov 21)

### Release Notes

* Fix tag (#399)
* Return with promise instead of undefined (#398)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.63
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

### Release Commits - 1.1.62 -> 1.1.63

* [023d9f0] Norbert Kovach - Fix tag (#399) (2019 Nov 21)
* [0851dfd] erosdome - Return with promise instead of undefined (#398) (2019 Nov 21)


## 1.1.62 (2019 Nov 21)

### Release Notes

* Update machine type selector (#396)
* Fix machine type selector visibility (#395)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.62
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

### Release Commits - 1.1.61 -> 1.1.62

* [70ba43f] Norbert Kovach - Update machine type selector (#396) (2019 Nov 21)
* [84df9e0] Norbert Kovach - Fix machine type selector visibility (#395) (2019 Oct 24)


## 1.1.61 (2019 Oct 21)

### Release Notes

* Add changInputFocusWhenFilled functionality (#394)
* Add auto code signing mode to code signing tab (#393)
* Add copy-to-clipboard functionality (#392)
* Add file type menus to code signing tab (#391)
* Add apple developer portal endpoints (#390)
* Add machine type selector (#389)
* Get plan of an organization (for machine type selector) (#388)
* Tool 709 review workflow editor validation (#384)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.61
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

### Release Commits - 1.1.60 -> 1.1.61

* [7000281] Norbert Kovach - Add changInputFocusWhenFilled functionality (#394) (2019 Oct 18)
* [62f1c7b] erosdome - Add auto code signing mode to code signing tab (#393) (2019 Oct 18)
* [b84a5ad] Norbert Kovach - Add copy-to-clipboard functionality (#392) (2019 Oct 18)
* [5337def] erosdome - Add file type menus to code signing tab (#391) (2019 Oct 18)
* [7045c92] Norbert Kovach - Add apple developer portal endpoints (#390) (2019 Oct 17)
* [985de7e] Norbert Kovach - Add machine type selector (#389) (2019 Oct 17)
* [bcd4250] Norbert Kovach - Get plan of an organization (for machine type selector) (#388) (2019 Oct 14)
* [0850828] lszucs - Tool 709 review workflow editor validation (#384) (2019 Oct 02)


## 1.1.60 (2019 Sep 30)

### Release Notes

* Bump nokogiri from 1.8.5 to 1.10.4 (#386)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.60
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

### Release Commits - 1.1.59 -> 1.1.60

* [37d5adf] dependabot[bot] - Bump nokogiri from 1.8.5 to 1.10.4 (#386) (2019 Sep 27)


## 1.1.59 (2019 Jul 01)

### Release Notes

* Update to new Gem versions (#377)
* Fix secret's save button (#383)
* Fix App icon load (#381)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.59
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

### Release Commits - 1.1.58 -> 1.1.59

* [5368e0f] Daniel Serleg - Update to new Gem versions (#377) (2019 Jul 01)
* [a0224b0] Norbert Kovach - Fix secret's save button (#383) (2019 Jul 01)
* [6b0a3ab] Norbert Kovach - Fix App icon load (#381) (2019 Jun 21)


## 1.1.58 (2019 Jun 12)

### Release Notes

* Allow update of protected Secret values (#380)
* (FE) Saving bitrise.yml: display warnings to the user that was given by the CLI #a3k5r (#379)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.58
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

### Release Commits - 1.1.57 -> 1.1.58

* [7608e87] Norbert Kovach - Allow update of protected Secret values (#380) (2019 Jun 12)
* [4f6c792] Daniel Serleg - (FE) Saving bitrise.yml: display warnings to the user that was given by the CLI #a3k5r (#379) (2019 Jun 12)


## 1.1.57 (2019 Jun 04)

### Release Notes

* Open Workflow Editor on separate page in website mode (#376)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.57
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

### Release Commits - 1.1.56 -> 1.1.57

* [29be5be] Norbert Kovach - Open Workflow Editor on separate page in website mode (#376) (2019 Jun 04)


## 1.1.56 (2019 Jun 04)

### Release Notes

* UI always reloads the project file storages when there is an un-processed file #z1ttm (#375)
* v1.1.55
* Add breadcrumbs (with BetaTags) (#374)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.56
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

### Release Commits - 1.1.54 -> 1.1.56

* [14b64d2] Daniel Serleg - UI always reloads the project file storages when there is an un-processed file #z1ttm (#375) (2019 Jun 04)
* [c3db0a1] doomsayer13 - v1.1.55 (2019 May 31)
* [49713ba] Norbert Kovach - Add breadcrumbs (with BetaTags) (#374) (2019 May 31)


## 1.1.55 (2019 May 31)

### Release Notes

* Add breadcrumbs (with BetaTags) (#374)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.55
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

### Release Commits - 1.1.54 -> 1.1.55

* [49713ba] Norbert Kovach - Add breadcrumbs (with BetaTags) (#374) (2019 May 31)


## 1.1.54 (2019 May 21)

### Release Notes

* Saving bitrise.yml: display warnings #a3k79 (#371)
* Remove fastlane project type (#368)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.54
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

### Release Commits - 1.1.53 -> 1.1.54

* [2515b69] Daniel Serleg - Saving bitrise.yml: display warnings #a3k79 (#371) (2019 May 20)
* [a32ae1a] Norbert Kovach - Remove fastlane project type (#368) (2019 Apr 25)


## 1.1.53 (2019 Apr 16)

### Release Notes

* Always allow to expose secrets & code signing files for PRs (#369)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.53
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

### Release Commits - 1.1.52 -> 1.1.53

* [2ae0c00] erosdome - Always allow to expose secrets & code signing files for PRs (#369) (2019 Apr 16)


## 1.1.52 (2019 Apr 04)

### Release Notes

* Fix issue when editing protected secrets (#367)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.52
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

### Release Commits - 1.1.51 -> 1.1.52

* [a04f669] Norbert Kovach - Fix issue when editing protected secrets (#367) (2019 Apr 04)


## 1.1.51 (2019 Mar 18)

### Release Notes

* Revert "v1.1.51"
* v1.1.51
* Implement markdown sanitization into WFE (#365)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.51
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

### Release Commits - 1.1.50 -> 1.1.51

* [bb2f169] Zoltán Nyikos - Revert "v1.1.51" (2019 Mar 18)
* [d1e03a3] Zoltán Nyikos - v1.1.51 (2019 Mar 18)
* [1557ba1] Zoltán Nyikos - Implement markdown sanitization into WFE (#365) (2019 Mar 13)


## 1.1.50 (2019 Mar 08)

### Release Notes

* YML tab can be loaded even if the bitrise.yml is invalid (Offline mode) (#363)
* Improve grammar in warning message (#361)
* restore bitrise.yml


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.50
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

### Release Commits - 1.1.49 -> 1.1.50

* [b3bb948] Norbert Kovach - YML tab can be loaded even if the bitrise.yml is invalid (Offline mode) (#363) (2019 Mar 08)
* [0e5cd24] mikemee - Improve grammar in warning message (#361) (2019 Mar 06)
* [bc15a53] Papik Tamas - restore bitrise.yml (2019 Feb 15)


## 1.1.49 (2019 Feb 15)

### Release Notes

* Dep update, test fix, version update (#362)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.49
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

### Release Commits - 1.1.48 -> 1.1.49

* [f647ae5] Tamas Papik - Dep update, test fix, version update (#362) (2019 Feb 15)


## 1.1.48 (2019 Feb 06)

### Release Notes

* Revert "v1.1.48"
* v1.1.48
* Do not lose edited trigger item data when deleting another one


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.48
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

### Release Commits - 1.1.47 -> 1.1.48

* [91841d2] doomsayer13 - Revert "v1.1.48" (2019 Feb 06)
* [d6b5195] doomsayer13 - v1.1.48 (2019 Feb 06)
* [d6a622a] Norbert Kovach - Do not lose edited trigger item data when deleting another one (2019 Feb 06)


## 1.1.47 (2019 Feb 01)

### Release Notes

* Add autocomplete off for env var key inputs (#357)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.47
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

### Release Commits - 1.1.46 -> 1.1.47

* [03272d9] erosdome - Add autocomplete off for env var key inputs (#357) (2019 Feb 01)


## 1.1.46 (2019 Jan 25)

### Release Notes

* App details fetch fix #5ct3g (#356)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.46
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

### Release Commits - 1.1.45 -> 1.1.46

* [67cbea3] erosdome - App details fetch fix #5ct3g (#356) (2019 Jan 25)


## 1.1.45 (2019 Jan 16)

### Release Notes

* added Flutter selector (#354)
* Fix rename workflow checkmark background (#355)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.45
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

### Release Commits - 1.1.44 -> 1.1.45

* [64f7fa2] Tamas Papik - added Flutter selector (#354) (2019 Jan 16)
* [e9cf45c] Simon Márton - Fix rename workflow checkmark background (#355) (2019 Jan 15)


## 1.1.44 (2018 Dec 12)

### Release Notes

* Re-add GitHub icon (#353)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.44
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

### Release Commits - 1.1.43 -> 1.1.44

* [4d38eca] erosdome - Re-add GitHub icon (#353) (2018 Dec 12)


## 1.1.43 (2018 Dec 12)

### Release Notes

* Updated platform icons & added new ones


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.43
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

### Release Commits - 1.1.42 -> 1.1.43

* [6c7983c] erosdome - Updated platform icons & added new ones (2018 Dec 12)


## 1.1.42 (2018 Dec 01)

### Release Notes

* Fix issue of renaming the selected Workflow then navigating away & back to the tab
* Print Workflow Editor's URL on startup


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.42
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

### Release Commits - 1.1.41 -> 1.1.42

* [3babd62] erosdome - Fix issue of renaming the selected Workflow then navigating away & back to the tab (2018 Dec 01)
* [2a70f11] lszucs - Print Workflow Editor's URL on startup (2018 Dec 01)


## 1.1.41 (2018 Nov 14)

### Release Notes

* Replace colors with corresponding constants (#349)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.41
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

### Release Commits - 1.1.40 -> 1.1.41

* [af5887e] erosdome - Replace colors with corresponding constants (#349) (2018 Nov 14)


## 1.1.40 (2018 Nov 13)

### Release Notes

* Show/hide secret value on edit mode enter/exit (#347)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.40
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

### Release Commits - 1.1.39 -> 1.1.40

* [812c1af] erosdome - Show/hide secret value on edit mode enter/exit (#347) (2018 Nov 13)


## 1.1.39 (2018 Nov 12)

### Release Notes

* Change colors to match new design (#346)
* Revert "Update green backgrounded selectables to purple (#344)" (#345)
* Update green backgrounded selectables to purple (#344)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.39
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

### Release Commits - 1.1.38 -> 1.1.39

* [5032439] erosdome - Change colors to match new design (#346) (2018 Nov 12)
* [b3621ff] erosdome - Revert "Update green backgrounded selectables to purple (#344)" (#345) (2018 Nov 08)
* [73fed5c] erosdome - Update green backgrounded selectables to purple (#344) (2018 Nov 07)


## 1.1.38 (2018 Nov 05)

### Release Notes

* Change Gotham & OpenSans font to TTNorms (#343)
* Extend the version release process in the readme (#342)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.38
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

### Release Commits - 1.1.37 -> 1.1.38

* [d3a4299] erosdome - Change Gotham & OpenSans font to TTNorms (#343) (2018 Nov 05)
* [95b25f9] erosdome - Extend the version release process in the readme (#342) (2018 Oct 16)


## 1.1.37 (2018 Oct 15)

### Release Notes

* Protected secret fix (#341)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.37
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

### Release Commits - 1.1.36 -> 1.1.37

* [8f582c4] erosdome - Protected secret fix (#341) (2018 Oct 15)


## 1.1.36 (2018 Oct 15)

### Release Notes

* Update README.md (#335)
* Update rubyzip gem (#340)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.36
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

### Release Commits - 1.1.35 -> 1.1.36

* [23c8824] Jeffrey Macko - Update README.md (#335) (2018 Oct 15)
* [a55f5ee] Norbert Kovach - Update rubyzip gem (#340) (2018 Oct 15)


## 1.1.35 (2018 Oct 12)

### Release Notes

* Immediate actions for secrets (#336)
* Update CI (#339)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.35
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

### Release Commits - 1.1.34 -> 1.1.35

* [5414324] erosdome - Immediate actions for secrets (#336) (2018 Oct 12)
* [ee28fcf] erosdome - Update CI (#339) (2018 Oct 12)


## 1.1.34 (2018 Oct 10)

### Release Notes

* Add code signing related env vars to insertable variables popup (#338)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.34
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

### Release Commits - 1.1.33 -> 1.1.34

* [b6d17a9] erosdome - Add code signing related env vars to insertable variables popup (#338) (2018 Oct 10)


## 1.1.33 (2018 Sep 28)

### Release Notes

* Add React Native as recognized project type (#333)
* Change quay.io URL (#332)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.33
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

### Release Commits - 1.1.32 -> 1.1.33

* [489e08b] erosdome - Add React Native as recognized project type (#333) (2018 Sep 28)
* [0d81ea0] slapec93 - Change quay.io URL (#332) (2018 Sep 17)


## 1.1.32 (2018 Sep 14)

### Release Notes

* Fix syntax error in GitHub changelor create (#331)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.32
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

### Release Commits - 1.1.31 -> 1.1.32

* [67799ed] erosdome - Fix syntax error in GitHub changelor create (#331) (2018 Sep 14)


## 1.1.31 (2018 Sep 14)

### Release Notes

* Replace selected variable in input fields  (#330)
* Fix a devcenter link (#326)
* Change favicon (#328)
* Update step_info_test.go (#329)
* Skip version bump commit from changelogs (#324)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.31
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

### Release Commits - 1.1.30 -> 1.1.31

* [d61b28a] David Breuer - Replace selected variable in input fields  (#330) (2018 Sep 14)
* [afd4737] Norbert Kovach - Fix a devcenter link (#326) (2018 Sep 13)
* [cec40f2] Norbert Kovach - Change favicon (#328) (2018 Sep 12)
* [04e2cca] Gábor Szakács - Update step_info_test.go (#329) (2018 Sep 12)
* [2bfdb06] slapec93 - Skip version bump commit from changelogs (#324) (2018 Sep 05)


## 1.1.30 (2018 Aug 30)

### Release Notes

* Revert fix (#323)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.30
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

### Release Commits - 1.1.29 -> 1.1.30

* [56d3354] erosdome - Revert fix (#323) (2018 Aug 30)


## 1.1.29 (2018 Aug 30)

### Release Notes

* Fixing mobile Safari scrolling issue (#322)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.29
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

### Release Commits - 1.1.28 -> 1.1.29

* [2fecb70] David Breuer - Fixing mobile Safari scrolling issue (#322) (2018 Aug 30)


## 1.1.28 (2018 Aug 23)

### Release Notes

* Revert "Safari scrolling issue fix (#316)" (#321)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.28
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

### Release Commits - 1.1.27 -> 1.1.28

* [feb077b] David Breuer - Revert "Safari scrolling issue fix (#316)" (#321) (2018 Aug 23)


## 1.1.27 (2018 Aug 23)

### Release Notes

* Add option to remove sensitive input value (#319)
* Mobile tab change progress bar fix (#320)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.27
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

### Release Commits - 1.1.26 -> 1.1.27

* [02f69df] David Breuer - Add option to remove sensitive input value (#319) (2018 Aug 23)
* [cd717a0] David Breuer - Mobile tab change progress bar fix (#320) (2018 Aug 22)


## 1.1.26 (2018 Aug 22)

### Release Notes

* Use minimized spec.json (#317)
* Safari scrolling issue fix (#316)
* Discard button fix for yaml editor (#318)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.26
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

### Release Commits - 1.1.25 -> 1.1.26

* [59deaef] erosdome - Use minimized spec.json (#317) (2018 Aug 22)
* [f375daf] David Breuer - Safari scrolling issue fix (#316) (2018 Aug 22)
* [7e2679f] David Breuer - Discard button fix for yaml editor (#318) (2018 Aug 22)


## 1.1.25 (2018 Aug 16)

### Release Notes

* Switch from ACE editor to Monaco editor


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.25
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

### Release Commits - 1.1.24 -> 1.1.25

* [8d94fee] David Breuer - Switch from ACE editor to Monaco editor (2018 Aug 15)


## 1.1.24 (2018 Jul 31)

### Release Notes

* Automate release (#310)
* Show insert secret variable popup in case of clicking on sensitive input (#309)
* Show progress indicator on tab change event (#311)
* Fixes #297  Yaml Editor by updateing Ace version (#308)
* Use commit messages for release notes (#307)
* Remove AngularJS rails gem, and update AngularJS to version 1.7.2 (#306)


### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.24
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

### Release Commits - 1.1.23 -> 1.1.24

* [11c3dc8] erosdome - Automate release (#310) (2018 Jul 31)
* [185f155] Norbert Kovach - Show insert secret variable popup in case of clicking on sensitive input (#309) (2018 Jul 31)
* [9173309] Norbert Kovach - Show progress indicator on tab change event (#311) (2018 Jul 30)
* [ccfa15e] David Breuer - Fixes #297  Yaml Editor by updateing Ace version (#308) (2018 Jul 27)
* [5abd452] erosdome - Use commit messages for release notes (#307) (2018 Jul 25)
* [8283909] erosdome - Remove AngularJS rails gem, and update AngularJS to version 1.7.2 (#306) (2018 Jul 25)


## 1.1.23 (2018 Jul 24)

### Release Notes

* Secrets tab UI bugfix for when adding a secret after a save
* Code signing tab UI update

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.23
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

### Release Commits - 1.1.22 -> 1.1.23

* [02c4641] David Breuer - Update: Codesign tab generic filestore section #3azrw (#304) (2018 Jul 23)
* [0f66fa2] erosdome - Don’t reference secrets by variable that will eventually become obsolete (#305) (2018 Jul 23)


## 1.1.22 (2018 Jul 18)

### Release Notes

* Fix insert variable popup
* Set minimum CLI version to 1.18.0

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.22
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

### Release Commits - 1.1.21 -> 1.1.22

* [81da1d1] Norbert Kovach - Fix insert variable popup (#303) (2018 Jul 18)
* [587f953] erosdome - Set minimum CLI version to 1.18.0 (#302) (2018 Jul 18)


## 1.1.21 (2018 Jul 13)

### Release Notes

* Remove newline from when copying output key
* Sensitive step inputs that can only reference secrets as values
* YML error - display server provided error message instead of generic error

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.21
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

### Release Commits - 1.1.20 -> 1.1.21

* [78d3b19] erosdome - Only display fallback error message if server does not return any errors (#301) (2018 Jul 13)
* [054d380] Norbert Kovach - Handle sensitive input fields (#300) (2018 Jul 13)
* [b2b17a7] erosdome - Remove newline from when copying output key (#299) (2018 Jul 12)


## 1.1.20 (2018 Jul 04)

### Release Notes

* Fix secrets reveal button
* Update gems

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.20
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

### Release Commits - 1.1.19 -> 1.1.20

* [85b0dc5] Norbert Kovach - Fix secrets reveal button (#296) (2018 Jul 04)
* [1c60478] Norbert Kovach - Update nokogiri and sprockets gems (#294) (2018 Jul 04)
* [b39eabb] Norbert Kovach - Godep update (#295) (2018 Jul 02)
* [8d065ba] David Breuer - v1.1.19 (2018 Jun 29)


## 1.1.19 (2018 Jun 29)

### Release Notes

* Secrets tab fixed aligments and typo

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.19
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

### Release Commits - 1.1.18 -> 1.1.19



## 1.1.18 (2018 Jun 26)

### Release Notes

* UX revision of Input fields of Android keystore file
* Disable "Expose for Pull-requests" toggles in case of Public apps
* Add prominent warnings
* Fix ProvProfile name overlap

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.18
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

### Release Commits - 1.1.17 -> 1.1.18

* [02d5467] Norbert Kovach - Add prominent warnings (#289) (2018 Jun 26)
* [c84386e] Norbert Kovach - Disable the "Expose for Pull-Requests" toggle if the app is public (#288) (2018 Jun 25)
* [2c05cbb] Norbert Kovach - UX revision of android keystore file's input fields (#287) (2018 Jun 22)
* [1cc4316] Norbert Kovach - Fix provprofile overlap (#290) (2018 Jun 22)


## 1.1.18 (2018 Jun 26)

### Release Notes

* __BREAKING__ : change 1
* change 2

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.18
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

### Release Commits - 1.1.17 -> 1.1.18



## 1.1.17 (2018 May 16)

### Release Notes

* Step desctiption (short/long) behaviour updated on the UI
* Issue fix #127

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.17
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

### Release Commits - 1.1.16 -> 1.1.17

* [daabc84] Norbert Kovach - Fix duplicate matches in steplist (#286) (2018 May 11)
* [e8f536e] Norbert Kovach - Update step description and summary behavior (#285) (2018 May 09)


## 1.1.16 (2018 Apr 19)

### Release Notes

* Code signing files' password - UI update

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.16
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

### Release Commits - 1.1.15 -> 1.1.16

* [55af080] erosdome - Update placeholders for hidden states of fields on code signing tab (#282) (2018 Apr 19)


## 1.1.15 (2018 Apr 11)

### Release Notes

* Android Keystore & generic file upload limit handling update
* Creating new workflow - minor UX improvement
* Warning notification boxes' contents updated at several places for clarity

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.15
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

### Release Commits - 1.1.14 -> 1.1.15

* [5e54f5b] erosdome - Don’t show error in Android Keystore section (#280) (2018 Apr 11)
* [ecba52c] erosdome - Message box opening update (#279) (2018 Apr 11)
* [c8c9bd2] erosdome - Handle if in new workflow popup enter is pressed (#278) (2018 Apr 10)
* [dd9356b] erosdome - Increase font size for triggers (#277) (2018 Apr 10)
* [b4fa1c6] erosdome - Stack warning update (#276) (2018 Apr 10)
* [a1ce0be] Norbert Kovach - Update secret info data (#275) (2018 Apr 10)


## 1.1.14 (2018 Mar 28)

### Release Notes

* Code signing tab - showing relevant file upload sections correctly

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.14
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

### Release Commits - 1.1.13 -> 1.1.14

* [479b994] erosdome - Blacklist irrelevant project types for displaying sections instead of whitelisting relevant ones (#274) (2018 Mar 28)


## 1.1.13 (2018 Mar 22)

### Release Notes

* Show all uploaded files on Code Signing page even if the project type is not matching with the file type
* Update content of the notification on Secret page
* Input field for adding/removing DEN tags on Stack page if the selected stack is “Self hosted agent”

* __BREAKING__ : change 1
* change 2

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.13
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

### Release Commits - 1.1.12 -> 1.1.13

* [0218911] erosdome - Password field fix - method #1 (#270) (2018 Mar 22)
* [d712899] Norbert Kovach - Add and show den_tags input field if "self hosted agent" stack is selected (#273) (2018 Mar 22)
* [b19f058] erosdome - Update secrets info notification (#268) (2018 Mar 12)
* [0145f81] erosdome - Show sections if matching project type or if they have uploaded files (#266) (2018 Mar 06)


## 1.1.12 (2018 Feb 26)

### Release Notes

* Stack tab content updates
* When creating secrets & env vars, set "is expand" option to false initially
* More information added to provisioning profiles' matching certificates
* Issue #244 fixed
* Handling state when current stack is invalid for current project type, also presenting warning
* Parameter changes for protected secrets & uploaded files are now disabled

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.12
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

### Release Commits - 1.1.11 -> 1.1.12

* [a65878b] erosdome - Only use namespaced metadata (#262) (2018 Feb 26)
* [7965ce6] erosdome - Hide secret value after save (#263) (2018 Feb 26)
* [4c10b38] erosdome - Disable toggles for secrets & uploaded files after they have been set to protected (#264) (2018 Feb 26)
* [06b1823] erosdome - Ask for confirmation when making secrets protected (#265) (2018 Feb 26)
* [0ee78c6] erosdome - Show image error in console (#260) (2018 Feb 23)
* [d8e1f51] erosdome - Handle if stack is set to a not found one (#261) (2018 Feb 23)
* [f27bfdf] erosdome - Clear cached selection state if last selected workflow is gone. (#259) (2018 Feb 22)
* [911a787] Norbert Kovach - Toggle for codesigndoc info (#257) (2018 Feb 22)
* [23f341b] Norbert Kovach - update matching certificates popup (#250) (2018 Feb 20)
* [fa5c121] erosdome - Make env vars “is expand” false on create, but without changing it being true as the default value (#258) (2018 Feb 19)
* [1157679] Norbert Kovach - Remove supported build prepare types url from stack tab (#256) (2018 Feb 19)
* [cd13067] erosdome - Remove stack name from UI, it is already present in the dropdown above it (#251) (2018 Feb 19)


## 1.1.11 (2018 Feb 09)

### Release Notes

* Fix stack selector if project type is “other”
* Secrets are now required to have unique key and non-empty value
* Secrets’ values are now hidden by default, loading & showing only when “view” is selected
* Secrets and uploaded files can now be “protected”: nor their key, nor their value, nor any of their options are editable if they are protected

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.11
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

### Release Commits - 1.1.10 -> 1.1.11

* [554556a] Norbert Kovach - Encrypted secrets (#253) (2018 Feb 09)
* [f94c3b6] Norbert Kovach - Handle protected state of app files (#255) (2018 Feb 09)
* [86196f9] erosdome - Expect unique secrets (#252) (2018 Feb 01)
* [7f7dccf] Norbert Kovach - fix stack selector - it was empty in case of project type "other" (#249) (2018 Feb 01)


## 1.1.10 (2018 Jan 26)

### Release Notes

* Stack tab more fixes

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.10
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

### Release Commits - 1.1.9 -> 1.1.10

* [65a7ec4] erosdome - Stack tab more fixes (#248) (2018 Jan 26)


## 1.1.9 (2018 Jan 26)

### Release Notes

* Stack tab related minor fixes

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.9
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

### Release Commits - 1.1.8 -> 1.1.9

* [d9b29f8] erosdome - Stack tab related minor fixes (#247) (2018 Jan 26)


## 1.1.8 (2018 Jan 25)

### Release Notes

* Switch to "namespaced" format of metadata: secrets will temporarily use both namespaced (under "bitrise.io" ID) and non-namespaced format of "is expose" flag

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.8
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

### Release Commits - 1.1.7 -> 1.1.8

* [3187f81] erosdome - Use both namespaced and non-namespaced handling for secrets' "is expose" flag - temporarily (#241) (2018 Jan 25)


## 1.1.7 (2018 Jan 25)

### Release Notes

* Stacks tab added

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.7
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

### Release Commits - 1.1.5 -> 1.1.7

* [46322aa] erosdome - Stacks tab added (#235) (2018 Jan 25)
* [7b39fae] erosdome - v1.1.6 (2018 Jan 23)
* [449d00e] erosdome - Add rel=“noreferrer noopener” for target=“_blank” links (#246) (2018 Jan 23)
* [85c0d2d] erosdome - Update Gemfile for security reasons (#245) (2018 Jan 23)
* [6cc26b3] Pedro Maia - Fixes menu zindex while scrolling (#243) (2018 Jan 17)
* [6f5b0e6] erosdome - Update CLI from 1.9.0 to 1.12.0 (#242) (2018 Jan 16)
* [0894679] erosdome - Also include vendor.js in Jasmine testing preparation (#240) (2018 Jan 16)


## 1.1.6 (2018 Jan 23)

### Release Notes

* z-index fix for workflows tab sticky menu - thanks, @pedrommone (#243)
* CLI version update
* Jasmine configuration fix for vendor.js
* Gemfile update for security reasons
* rel="noreferrer noopener" added for external URLs

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.6
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

### Release Commits - 1.1.5 -> 1.1.6

* [449d00e] erosdome - Add rel=“noreferrer noopener” for target=“_blank” links (#246) (2018 Jan 23)
* [85c0d2d] erosdome - Update Gemfile for security reasons (#245) (2018 Jan 23)
* [6cc26b3] Pedro Maia - Fixes menu zindex while scrolling (#243) (2018 Jan 17)
* [6f5b0e6] erosdome - Update CLI from 1.9.0 to 1.12.0 (#242) (2018 Jan 16)
* [0894679] erosdome - Also include vendor.js in Jasmine testing preparation (#240) (2018 Jan 16)


## 1.1.5 (2018 Jan 15)

### Release Notes

* CDN update

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.5
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

### Release Commits - 1.1.4 -> 1.1.5

* [b507ad8] erosdome - new CDN link for jQuery; (#237) (2018 Jan 15)


## 1.1.4 (2018 Jan 09)

### Release Notes

* When saving environment variables, filter the ones without key AND value before validating all the environment variables - the user probably just forgot to cancel creating a new one
* Trigger pattern handling update when using "*" character
* "Delete all" action added for uploaded code signing files

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.4
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

### Release Commits - 1.1.3 -> 1.1.4

* [44801af] Norbert Kovach - delete all functionality for provisioning profile files and certificates (#238) (2018 Jan 09)
* [ebb8761] erosdome - allow * as initial character when entering trigger pattern (#236) (2018 Jan 09)
* [712637e] erosdome - Also strip workflow env vars before validating all variables (#239) (2018 Jan 05)
* [d4101ec] David Breuer - filtered empty key/value env vars and secrets (#234) (2018 Jan 05)


## 1.1.3 (2018 Jan 03)

### Release Notes

* Code signing tab bugfixes
* Certificate expiration badge added
* Issue #232 fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.3
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

### Release Commits - 1.1.2 -> 1.1.3

* [ef68c80] Norbert Kovach - discard button fix on triggers page (#233) (2018 Jan 03)
* [6b23c47] Norbert Kovach - code sign tab - expiry status of identities (ProvProfile popup) (#231) (2018 Jan 03)
* [a16b766] Norbert Kovach - set selectedMenu to null if provProfile popup is closed (#229) (2018 Jan 03)
* [06f7e15] Norbert Kovach - display certificate details button - icon fix (#230) (2018 Jan 03)


## 1.1.2 (2017 Dec 13)

### Release Notes

* Certificate name display fix

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.2
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

### Release Commits - 1.1.1 -> 1.1.2

* [1993ac1] Norbert Kovach - get details route for certificates (#228) (2017 Dec 13)


## 1.1.1 (2017 Dec 12)

### Release Notes

* Provisioning profile validation status indication fix
* Step input - style update, show full description if opened

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.1
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

### Release Commits - 1.1.0 -> 1.1.1

* [4910ce8] Norbert Kovach - Feature/remove job (#222) (2017 Dec 12)
* [086b837] David Breuer - Feature/wfe 2075 (#227) (2017 Dec 12)
* [96d5d9b] Norbert Kovach - noreferrer & noopener for step source urls (#224) (2017 Dec 12)
* [ee759b1] Norbert Kovach - show input description when the input field is expanded (#223) (2017 Dec 11)
* [970cf4a] Norbert Kovach - validation updates and fixes (#225) (2017 Dec 11)
* [28dbe2c] erosdome - changelog update (2017 Dec 05)


## 1.1.0 (2017 Dec 05)

### Release Notes

* Version number fix

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1.0
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

### Release Commits - 1.1 -> 1.1.0



## 1.1 (2017 Dec 05)

### Release Notes

* Provisioning profile & certificate details - now showing identity & device statuses (missing/ok)

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.1
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

### Release Commits - v1.0.23 -> 1.1

* [164a4fb] Norbert Kovach - code signing files - validation (#221) (2017 Dec 05)


## 1.0.23 (2017 Nov 29)

### Release Notes

* Generic file delete bug fixed

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.23
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

### Release Commits - v1.0.22 -> 1.0.23

* [797f4b6] Paul Heasley - Fix issue where you can't delete a generic file (#220) (2017 Nov 29)


## 1.0.22 (2017 Nov 28)

### Release Notes

* Provisioning profile & certificate details showing on the code signing tab

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.22
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

### Release Commits - 1.0.21 -> 1.0.22

* [585f901] Norbert Kovach - Feature/code signing files with details (#219) (2017 Nov 28)


## 1.0.21 (2017 Nov 16)

### Release Notes

* Update for the fix of issue #212

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.21
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

### Release Commits - 1.0.20 -> 1.0.21

* [b8929d8] erosdome - empty step fix update (#218) (2017 Nov 16)


## 1.0.20 (2017 Nov 16)

### Release Notes

* Remember the edited workflow and selected step when switching between tabs
* Issues #207, #212 fixed
* Minor UX updates

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.20
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

### Release Commits - 1.0.19 -> 1.0.20

* [587b068] erosdome - cache selected workflow, edited workflow, selected step between tabs (#217) (2017 Nov 16)
* [1ab7c39] erosdome - empty step handling updated - user step config & user variable config are now empty objects by default (#216) (2017 Nov 16)
* [d6707e8] Norbert Kovach - password eye style fix (#208) (2017 Nov 16)
* [97f546e] Norbert Kovach - popover for is_expose toggle (#202) (2017 Nov 16)
* [ba2ae9f] erosdome - source fix for forked steps (#210) (2017 Nov 16)
* [16087a9] erosdome - testing guide added to readme (#211) (2017 Nov 16)


## 1.0.19 (2017 Nov 14)

### Release Notes

* Reset border-radius to 0 for buttons

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.19
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

### Release Commits - 1.0.18 -> 1.0.19

* [224e52d] erosdome - reset border-radius to 0 for buttons (#209) (2017 Oct 31)


## 1.0.18 (2017 Oct 19)

### Release Notes

* CDN fix for jQuery

### Install or upgrade

To install this version, run the following commands (in a bash shell):

```
bitrise plugin install --source https://github.com/bitrise-io/bitrise-workflow-editor.git --version 1.0.18
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

### Release Commits - 1.0.17 -> 1.0.18

* [abbe2fe] erosdome - don't use jquery slim version (#205) (2017 Oct 16)


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

Updated: 2020 Feb 27