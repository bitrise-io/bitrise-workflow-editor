import "monaco-editor/esm/vs/editor/editor.api.js";
import { safeDigest } from "../services/react-compat";

(function () {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .controller("YMLController", function($scope, $rootScope, $timeout, appService, requestService) {
      var viewModel = this;

      viewModel.yml = null;

      viewModel.appService = appService;
      viewModel.appSlug = undefined;
      viewModel.isRepositoryYmlAvailable = true;
      viewModel.ymlString = undefined;
      viewModel.defaultBranch = appService.appDetails?.defaultBranch;

      viewModel.gitRepoSlug = appService.appDetails?.gitRepoSlug;
      viewModel.modularYamlSupported = undefined;
      viewModel.isWebsiteMode = requestService.isWebsiteMode();
      viewModel.isEditorLoading = true;

      viewModel.ymlSettings = {};

      viewModel.init = function () {
        viewModel.yml = appService.appConfig;

        if (requestService.isWebsiteMode()) {
          viewModel.appSlug = requestService.appSlug;

          const fetchPipelineConfig = appService.getPipelineConfig()
            .then(function () {
              viewModel.ymlSettings = {};
              viewModel.ymlSettings.isModularYamlSupported = appService.pipelineConfig.modularYamlSupported;
              viewModel.ymlSettings.isYmlSplit = appService.pipelineConfig.split;
              viewModel.ymlSettings.lastModified = appService.pipelineConfig.lastModified;
              viewModel.ymlSettings.lines = appService.pipelineConfig.lines;
              viewModel.ymlSettings.usesRepositoryYml = appService.pipelineConfig.usesRepositoryYml;
              viewModel.ymlSettings.ymlRootPath = appService.pipelineConfig.ymlRootPath;
            });
        }

        viewModel.onChangeHandler = (value) => {
          appService.appConfigYML = value;
          safeDigest($rootScope);
        };

        var unwatchYMLChange = $scope.$watch(() => {
          return appService.appConfigYML;
        }, (value) => {
          if (value !== undefined) {
            viewModel.ymlString = value;
            viewModel.isEditorLoading = false;
            unwatchYMLChange();
          }
        });

        $scope.$watch(
          function() {
            return appService.appConfigYML;
          },
          function() {
            viewModel.ymlString = appService.appConfigYML;
          }
        );

        $scope.$on(
          "$destroy",
          $rootScope.$on("MainController::changesDiscarded", function () {
            viewModel.ymlString = undefined;
            safeDigest($scope);
            viewModel.ymlString = appService.ymlString;
            safeDigest($scope);
          })
        );
      }

      viewModel.onConfigSourceChangeSaved = function (usesRepositoryYml, ymlRootPath) {
        viewModel.isEditorLoading = true;
        appService.getAppConfigYML(true).then(() => {
          viewModel.ymlString = appService.ymlString;
          viewModel.isEditorLoading = false;
        });

        appService.appConfig = undefined;
        appService.pipelineConfig.usesRepositoryYml = usesRepositoryYml;
        appService.pipelineConfig.ymlRootPath = ymlRootPath;

        $timeout(function () {
          viewModel.ymlSettings.usesRepositoryYml = usesRepositoryYml;
          viewModel.ymlSettings.ymlRootPath = ymlRootPath;
        }, 0);
      };
    });
})();