import "monaco-editor/esm/vs/editor/editor.api.js";
import { safeDigest } from "../services/react-compat";

(function () {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .controller("YMLController", function($scope, $rootScope, $timeout, appService, requestService) {
      var viewModel = this;

      viewModel.usesRepositoryYml = false;
      viewModel.appService = appService;
      viewModel.appSlug = undefined;
      viewModel.repositoryYmlAvailable = true;
      viewModel.appConfigYML = undefined;
      viewModel.defaultBranch = appService.appDetails?.defaultBranch;
      viewModel.gitRepoSlug = appService.appDetails?.gitRepoSlug;
      viewModel.lines = 0;
      viewModel.split = false;
      viewModel.modularYamlSupported = undefined;
      viewModel.lastModified = null;
      viewModel.isWebsiteMode = requestService.isWebsiteMode();
      viewModel.isEditorLoading = true;

      viewModel.downloadAppConfigYMLPath = function () {
        return requestService.isWebsiteMode() && !viewModel.usesRepositoryYml ? requestService.appConfigYMLDownloadPath() : null;
      }

      viewModel.init = function () {
        if (requestService.isWebsiteMode()) {
          viewModel.appSlug = requestService.appSlug;

          const fetchPipelineConfig = appService.getPipelineConfig()
            .then(function () {
              viewModel.usesRepositoryYml = appService.pipelineConfig.usesRepositoryYml;
              viewModel.lines = appService.pipelineConfig.lines;
              viewModel.split = appService.pipelineConfig.split;
              viewModel.modularYamlSupported = appService.pipelineConfig.modularYamlSupported;
              viewModel.lastModified = appService.pipelineConfig.lastModified;
            });

          const fetchOrgPlanData = appService.appDetails && appService.appDetails.ownerData
            ? requestService.getOrgPlanData(appService.appDetails.ownerData.slug)
              .then(function (ownerPlanData) {
                viewModel.repositoryYmlAvailable = ownerPlanData.repositoryYmlAvailable;
              })
            : Promise.resolve();
        }

        viewModel.yml;

        viewModel.onChangeHandler = (value) => {
          appService.appConfigYML = value;
          safeDigest($rootScope);
        };

        var unwatchYMLChange = $scope.$watch(() => {
          return appService.appConfigYML;
        }, (value) => {
          if (value !== undefined) {
            viewModel.yml = value;
            viewModel.isEditorLoading = false;
            unwatchYMLChange();
          }
        });

        $scope.$watch(
          function() {
            return appService.appConfigYML;
          },
          function() {
            viewModel.appConfigYML = appService.appConfigYML;
          }
        );

        $scope.$on(
          "$destroy",
          $rootScope.$on("MainController::changesDiscarded", function () {
            viewModel.yml = undefined;
            safeDigest($scope);
            viewModel.yml = appService.appConfigYML;
            safeDigest($scope);
          })
        );
      }

      viewModel.onUsesRepositoryYmlChangeSaved = function (usesRepositoryYml) {
        viewModel.isEditorLoading = true;
        appService.getAppConfigYML(true).then(() => {
          viewModel.yml = appService.appConfigYML;
          viewModel.isEditorLoading = false;
        });

        appService.appConfig = undefined;
        appService.pipelineConfig.usesRepositoryYml = usesRepositoryYml;

        $timeout(function () {
          viewModel.usesRepositoryYml = usesRepositoryYml;
        }, 0);
      };
    });
})();