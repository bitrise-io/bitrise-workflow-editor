import "monaco-editor/esm/vs/editor/editor.api.js";
import { safeDigest } from "../services/react-compat";

(function () {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .controller("YMLController", function($scope, $rootScope, $timeout, appService, requestService) {
      var viewModel = this;

      viewModel.ciConfigYml = undefined;
      viewModel.isEditorLoading = true;
      viewModel.ymlSettings = {};

      viewModel.init = function () {
        viewModel.isEditorLoading = true;
        if (requestService.isWebsiteMode()) {
          const fetchPipelineConfig = appService.getPipelineConfig()
            .then(function () {
              viewModel.ciConfigYml = appService.appConfigYML;

              viewModel.ymlSettings = appService.pipelineConfig;

              viewModel.ymlSettings.isModularYamlSupported = appService.pipelineConfig.modularYamlSupported;
              viewModel.ymlSettings.isYmlSplit = appService.pipelineConfig.split;
            });
        }

        $scope.$watch(
          function() {
            return appService.appConfigYML;
          },
          function() {
            if (viewModel.isEditorLoading && appService.appConfigYML) {
              viewModel.ciConfigYml = appService.appConfigYML;
              viewModel.isEditorLoading = false;
            }
          }
        );

        $scope.$on(
          "$destroy",
          $rootScope.$on("MainController::changesDiscarded", function () {
            viewModel.ciConfigYml = undefined;
            safeDigest($scope);
            viewModel.ciConfigYml = appService.appConfigYML;
            safeDigest($scope);
          })
        );

        viewModel.onEditorChange = (value) => {
          appService.appConfigYML = value;
          safeDigest($rootScope);
        };  
      }

      viewModel.onConfigSourceChangeSaved = function (usesRepositoryYml, ymlRootPath) {
        viewModel.isEditorLoading = true;
        appService.getAppConfigYML(true).then(() => {
          viewModel.ciConfigYml = appService.ciConfigYml;
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