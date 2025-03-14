import { safeDigest } from '@/services/react-compat';

(function () {
  angular.module('BitriseWorkflowEditor').controller('EnvVarsController', function ($scope, $rootScope, appService) {
    const viewModel = this;

    viewModel.yml = appService.appConfig;

    viewModel.onChangeYml = (yml) => {
      appService.appConfig = yml;
      safeDigest($rootScope);
    };

    function replaceAndReloadYml(newYml) {
      viewModel.yml = {};
      safeDigest($scope);
      viewModel.yml = newYml;
      safeDigest($scope);
    }

    $scope.$on(
      '$destroy',
      $rootScope.$on('MainController::discardChanges', () => {
        replaceAndReloadYml(appService.savedAppConfig);
      }),
    );

    $scope.$on(
      '$destroy',
      $rootScope.$on('MainController::saveSuccess', (_event, { forceReload, menu }) => {
        const shouldReload = forceReload || menu !== 'env-vars';

        if (shouldReload) {
          replaceAndReloadYml(appService.appConfig);
        }
      }),
    );
  });
})();
