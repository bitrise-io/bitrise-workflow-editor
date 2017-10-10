Super Simple Dependency Manager
===================

## What you can use it for?

To keep a list of your dependencies, retrieve and update them.

What's the spin? DepMan only allows relative pathes as retrieve target path.

Why? To **keep your dependencies inside** your repository.

The aim is to keep dependency management as simple as possible and to keep full control over your dependencies.
As described [here](http://nathany.com/go-packages/) keeping your dependencies outside of your repository
reduces your control over your dependencies. 

If one of your dependencies break things after an update you have
to manually look up all the dependencies which were updated,
usually by checking the source codes, release notes on their own website / blog.

An important thing about Dependency Managers: **one size doesn't fit all**.
You might find DepMan helpful, especially for more simple projects, or
in case if you have control over most of your dependency repositories (internal tools).

If you find DepMan valuable it's great. If you can't store your dependencies inside your repository
then.. well, DepMan is most likely not for you.

I'm sure you'll find the perfect dependency manager for your project,
DepMan is just one of the many.


## What's the purpose of DepMan?

To:

* be as simple as possible
* control your dependencies by directly storing them in your own repository
* provide you full control over your dependency updates:
    * update exactly when you want to
    * inspect changes of dependencies directly in your VCS
    * you'll know if one of your dependencies got removed or moved to a new URL - you'll still have your stored version in your repository
    * if you can retrieve your repository you got all your dependencies in place, no additional requests required, no surprise maintenances on other servers


## Commands

* init: create a template deplist.json file in the current dir
* update: checks deplist.json and downloads all the dependencies


## Limitations

* Right now it requires the unix 'cp' and 'rm' commands (used for safe directory copy and remove).

## Supported

### VCS

VCS (Version control systems) definition on [Wikipedia](http://en.wikipedia.org/wiki/Revision_control)

* git

### Operating Systems

#### Tested
* OS X
* Ubuntu

#### Other, not tested

* pretty much every Unix where *cp*, *rm*, *rscyn* and *Go* are available (not tested)

## TODO

* `install` command: don't update dependencies, install the exact versions stored in the "lock" file
* `edit` mode : add/init `git` to the dependency so that it can be updated and pushed back into the original
  * there could be a new mode of `depman` too, where it includes `.git` by default, for easy contribution back to the original repo - but this mode would not include the source code in the repository as `git` will ignore subdirs with initialized `.git`, so `depman install` could/should be used for this mode to get the dependencies
  * `depman edit start` would init the `git` dirs for the dependencies (or `depman edit start X` for a specific dep)
  * and `depman edit done` would remove the `.git` dirs
* config file changes:
   * rename the "lock" file - `deplist.json.lock`
   * actually, we could change the whole file: switch to YML (which is compatible with JSON, so it's backward compatible)
   * option to group dependencies (e.g. used only for `development` or for `test`; or by category: `app`, `web`, ...)
   * or rename both: `depman.yml` and `depman.yml.lock`
* remove dependencies which are not listed anymore
* option: copy only specific path(s) from the repository (like copy a single file)

Later:

* VCS versioning, similar to ruby bundler, define the version limits like in Ruby Gemfiles [http://bundler.io/v1.6/gemfile.html](http://bundler.io/v1.6/gemfile.html)
* support Windows ('cp' and 'rm' doesn't work there)
* other VCS systems (mercurial, most likely)
* non VCS dependencies? - like a ZIP file on your server

commands:

* list: just list deps
* add: adds a new dependency
