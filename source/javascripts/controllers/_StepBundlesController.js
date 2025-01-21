import { safeDigest } from "@/services/react-compat";

(function () {
  "use strict";

  angular
    .module("BitriseWorkflowEditor")
    .controller("StepBundlesController", function ($rootScope, $scope, appService) {
      var viewModel = this;
      viewModel.yml = null;

      viewModel.init = function () {
        viewModel.yml = appService.appConfig;
      };

      viewModel.onChangeYml = (yml) => {
        appService.appConfig = yml;
        safeDigest($rootScope);
      }

      $scope.$on("$destroy", $rootScope.$on("MainController::changesDiscarded", () => {
        viewModel.yml = {};
        safeDigest($scope);
        viewModel.yml = appService.savedAppConfig;
        safeDigest($scope);
      }));

      $scope.$on("$destroy", $rootScope.$on("MainController::remoteChangesMergedWithSuccess", () => {
        viewModel.yml = {};
        safeDigest($scope);
        viewModel.yml = appService.appConfig;
        safeDigest($scope);
      }));

      viewModel.init();
    });
})();
