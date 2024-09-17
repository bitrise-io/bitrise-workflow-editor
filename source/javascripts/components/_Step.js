(function () {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .factory("Step", function ($injector, Variable) {
      var MAINTAINER = {
        VERIFIED: "verified",
        OFFICIAL: "bitrise",
        COMMUNITY: "community",
      };

      var Step = function (cvs, userStepConfig, defaultStepConfig) {
        this.cvs = cvs;
        this.localPath;
        this.gitURL;
        this.libraryURL;
        this.id;
        this.version;
        this.info = {};

        this.userStepConfig = userStepConfig;
        if (!this.userStepConfig) {
          this.userStepConfig = {};
        }

        this.defaultStepConfig = defaultStepConfig;
      };

      Step.prototype.isStepBundle = function () {
        return !!this.cvs && this.cvs.startsWith("bundle::");
      };

      Step.prototype.isWithBlock = function () {
        return this.cvs === "with";
      };

      Step.prototype.displayName = function () {
        if (this.isStepBundle()) {
          return "Step bundle: " + this.cvs.replace("bundle::", "");
        }
        if (this.isWithBlock()) {
          return "With group";
        }
        if (this.title()) {
          return this.title();
        }

        if (this.id) {
          return this.id;
        }

        return diplayNameFromCvs(this.displayCvs());
      };

      Step.prototype.displayCvs = function () {
        return this.cvs.replace(/^(git|path)::/g, "");
      };

      Step.prototype.displayTooltip = function () {
        return this.displayName() + "\n" + this.displayCvs();
      };

      function diplayNameFromCvs(cvs) {
        var lastDelimiter = cvs.lastIndexOf("/");

        if (lastDelimiter != -1) {
          cvs = cvs.substring(lastDelimiter + 1);
        }

        return cvs;
      }

      Step.prototype.title = function (newTitle) {
        return parameterGetterSetter(this, "title", newTitle);
      };

      Step.isValidTitle = function (title) {
        if (title === undefined) {
          return undefined;
        }

        return title && title.length > 0;
      };

      Step.prototype.summary = function (newSummary) {
        return parameterGetterSetter(this, "summary", newSummary);
      };

      Step.prototype.description = function (newDescription) {
        return parameterGetterSetter(this, "description", newDescription);
      };

      Step.prototype.sourceURL = function (newSourceURL) {
        if (this.gitURL !== undefined) {
          if (newSourceURL) {
            this.gitURL = newSourceURL;
          }

          return this.gitURL;
        }

        return parameterGetterSetter(this, "source_code_url", newSourceURL);
      };

      Step.prototype.iconURL = function (newIconURL) {
        if (newIconURL !== undefined) {
          var regexpForIconType = new RegExp("^.*.(svg|png)");
          var iconType;
          var iconTypeKey;

          if (
            regexpForIconType.test(newIconURL) &&
            regexpForIconType.exec(newIconURL)[1]
          ) {
            iconType = regexpForIconType.exec(newIconURL)[1];
            iconTypeKey = "icon." + iconType;
          } else {
            return this.iconURL();
          }

          if (
            this.defaultStepConfig &&
            this.defaultStepConfig.asset_urls[iconTypeKey] &&
            this.defaultStepConfig.asset_urls[iconTypeKey] == newIconURL
          ) {
            if (this.userStepConfig.asset_urls) {
              delete this.userStepConfig.asset_urls[iconTypeKey];

              if (_.isEmpty(this.userStepConfig.asset_urls)) {
                delete this.userStepConfig["asset_urls"];
              }
            }
          } else {
            if (!this.userStepConfig.asset_urls) {
              this.userStepConfig.asset_urls = [];
            }

            this.userStepConfig.asset_urls[iconTypeKey] = newIconURL;
          }
        }

        if (this.userStepConfig.asset_urls) {
          if (this.userStepConfig.asset_urls["icon.svg"]) {
            return this.userStepConfig.asset_urls["icon.svg"];
          }

          if (this.userStepConfig.asset_urls["icon.png"]) {
            return this.userStepConfig.asset_urls["icon.png"];
          }
        }

        if (this.defaultStepConfig && this.defaultStepConfig.asset_urls) {
          if (this.defaultStepConfig.asset_urls["icon.svg"]) {
            return this.defaultStepConfig.asset_urls["icon.svg"];
          }

          return this.defaultStepConfig.asset_urls["icon.png"];
        }

        return undefined;
      };

      Step.prototype.typeTags = function (newTypeTags) {
        return parameterGetterSetter(this, "type_tags", newTypeTags);
      };

      Step.prototype.projectTypeTags = function (newProjectTypeTags) {
        return parameterGetterSetter(
          this,
          "project_type_tags",
          newProjectTypeTags,
        );
      };

      Step.prototype.runIf = function (newRunIf) {
        return parameterGetterSetter(this, "run_if", newRunIf);
      };

      Step.prototype.isAlwaysRun = function (newIsAlwaysRun) {
        return parameterGetterSetter(this, "is_always_run", newIsAlwaysRun);
      };

      Step.prototype.isSkippable = function (newIsSkippable) {
        return parameterGetterSetter(this, "is_skippable", newIsSkippable);
      };

      Step.prototype.assetUrls = function (newAssetUrls) {
        return parameterGetterSetter(this, "asset_urls", newAssetUrls);
      };

      Step.prototype.isConfigured = function () {
        return !!this.defaultStepConfig;
      };

      Step.prototype.isVerified = function () {
        return (
          this.info.maintainer === MAINTAINER.VERIFIED && !this.isDeprecated()
        );
      };

      Step.prototype.isOfficial = function () {
        return (
          this.info.maintainer === MAINTAINER.OFFICIAL && !this.isDeprecated()
        );
      };

      Step.prototype.isDeprecated = function () {
        return parameterGetterSetter(this, "is_deprecated");
      };

      Step.prototype.isLocal = function () {
        return !!this.localPath;
      };

      Step.prototype.isLibraryStep = function () {
        return !!this.libraryURL;
      };

      Step.prototype.isVCSStep = function () {
        return !this.isLocal() && !this.isLibraryStep();
      };

      Step.prototype.requestedVersion = function () {
        if (this.cvs.indexOf("@") == -1) {
          return null;
        }

        return this.version;
      };

      Step.cvsFromWrappedStepConfig = function (wrappedStepConfig) {
        return _.first(
          _.keys(angular.fromJson(angular.toJson(wrappedStepConfig))),
        );
      };

      Step.prototype.wrappedUserStepConfig = function () {
        var wrappedUserStepConfig = {};
        wrappedUserStepConfig[this.cvs] = this.userStepConfig;

        return wrappedUserStepConfig;
      };

      function parameterGetterSetter(step, parameterKey, parameterValue) {
        if (parameterValue === undefined) {
          if (step.userStepConfig[parameterKey] !== undefined) {
            return step.userStepConfig[parameterKey];
          }

          return step.defaultStepConfig
            ? step.defaultStepConfig[parameterKey]
            : undefined;
        }

        if (
          !step.defaultStepConfig ||
          parameterValue != step.defaultStepConfig[parameterKey]
        ) {
          step.userStepConfig[parameterKey] = parameterValue;
        } else if (step.userStepConfig[parameterKey] !== undefined) {
          delete step.userStepConfig[parameterKey];
        }

        return parameterValue;
      }

      return Step;
    });

  angular
    .module("BitriseWorkflowEditor")
    .filter("stepSourceCSSClass", function () {
      return function (step) {
        if (!step) {
          return undefined;
        }

        var sourceURL = step.sourceURL();

        var regexpForGithubStepSourceURL = new RegExp(
          "^(?:https?://)?(?:www.)?github.com/.+",
        );
        if (regexpForGithubStepSourceURL.test(sourceURL)) {
          return "github";
        }

        var regexpForBitbucketStepSourceURL = new RegExp(
          "^(?:https?://)?(?:www.)?bitbucket.(?:com|org)/.+",
        );
        if (regexpForBitbucketStepSourceURL.test(sourceURL)) {
          return "bitbucket";
        }

        var regexpForGitlabStepSourceURL = new RegExp(
          "^(?:https?://)?(?:www.)?gitlab.com/.+",
        );
        if (regexpForGitlabStepSourceURL.test(sourceURL)) {
          return "gitlab";
        }

        return "unknown";
      };
    });
})();
