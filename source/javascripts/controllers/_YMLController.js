import RuntimeUtils from '@/core/utils/RuntimeUtils';
import { safeDigest } from '@/services/react-compat';

(function () {
  angular
    .module('BitriseWorkflowEditor')
    .controller('YMLController', function ($scope, $rootScope, $timeout, appService, requestService) {
      const viewModel = this;

      viewModel.ciConfigYml = undefined;
      viewModel.isEditorLoading = true;
      viewModel.ymlSettings = {};

      viewModel.init = function () {
        viewModel.isEditorLoading = true;
        if (RuntimeUtils.isWebsiteMode()) {
          const fetchPipelineConfig = appService.getPipelineConfig().then(function () {
            viewModel.ciConfigYml = appService.appConfigYML;

            viewModel.ymlSettings = appService.pipelineConfig;

            viewModel.ymlSettings.isModularYamlSupported = appService.pipelineConfig.modularYamlSupported;
            viewModel.ymlSettings.isYmlSplit = appService.pipelineConfig.split;
          });
        }

        $scope.$watch(
          function () {
            return appService.appConfigYML;
          },
          function () {
            if (viewModel.isEditorLoading && appService.appConfigYML) {
              viewModel.ciConfigYml = appService.appConfigYML;
              viewModel.isEditorLoading = false;
            }
          },
        );

        function replaceAndReloadYml(newYml) {
          viewModel.ciConfigYml = {};
          safeDigest($scope);
          viewModel.ciConfigYml = newYml;
          safeDigest($scope);
        }

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::discardChanges', () => {
            replaceAndReloadYml(appService.savedAppConfigYML);
          }),
        );

        $scope.$on(
          '$destroy',
          $rootScope.$on('MainController::saveSuccess', (_event, { forceReload, menu }) => {
            const shouldReload = forceReload || menu !== 'yml';

            if (shouldReload) {
              replaceAndReloadYml(appService.appConfigYML);
            }
          }),
        );

        viewModel.onEditorChange = (value) => {
          appService.appConfigYML = value;
          safeDigest($rootScope);
        };
      };

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
