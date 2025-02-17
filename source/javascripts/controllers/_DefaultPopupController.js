import { safeDigest } from '../services/react-compat';

(function () {
  angular.module('BitriseWorkflowEditor').controller('DefaultPopupController', function ($scope, $rootScope, Popup) {
    const viewModel = this;

    const types = [
      {
        id: 'success',
        cssClass: 'success',
      },
      {
        id: 'error',
        cssClass: 'error',
      },
      {
        id: 'notice',
        cssClass: 'notice',
      },
    ];

    viewModel.alertPopup = new Popup({
      type: undefined,
      title: undefined,
      details: undefined,
      okTitle: undefined,
      deferer: undefined,
    });

    viewModel.confirmPopup = new Popup({
      title: undefined,
      details: undefined,
      yesTitle: undefined,
      noTitle: undefined,
      yesSelected: undefined,
      noSelected: undefined,
      deferer: undefined,
    });

    $rootScope.$on(
      'DefaultPopupController::showAlertPopup',
      function (event, typeID, title, details, okTitle, deferer) {
        viewModel.alertPopup.parameters.type = _.find(types, {
          id: typeID || 'error',
        });
        viewModel.alertPopup.parameters.title = title;
        viewModel.alertPopup.parameters.details = typeof details === 'string' ? [details] : details;
        viewModel.alertPopup.parameters.okTitle = okTitle || 'OK';

        if (deferer && deferer.resolve) {
          viewModel.alertPopup.beforeDismissCallback = deferer.resolve;
        }

        viewModel.alertPopup.isVisible = true;
      },
    );

    $rootScope.$on(
      'DefaultPopupController::showConfirmPopup',
      function (event, title, details, yesTitle, noTitle, yesSelected, noSelected, deferer) {
        viewModel.confirmPopup.parameters.title = title;
        viewModel.confirmPopup.parameters.details = typeof details === 'string' ? [details] : details;
        viewModel.confirmPopup.parameters.yesTitle = yesTitle || 'Yes';
        viewModel.confirmPopup.parameters.noTitle = noTitle || 'No';

        viewModel.confirmPopup.parameters.yesSelected = function () {
          if (yesSelected) {
            yesSelected();
          }

          if (deferer && deferer.resolve) {
            deferer.resolve();
          }

          viewModel.confirmPopup.beforeDismissCallback = undefined;
          viewModel.confirmPopup.isVisible = false;
        };

        viewModel.confirmPopup.parameters.noSelected = function () {
          if (noSelected) {
            noSelected();
          }

          if (deferer && deferer.reject) {
            deferer.reject();
          }

          viewModel.confirmPopup.beforeDismissCallback = undefined;
          viewModel.confirmPopup.isVisible = false;
        };

        viewModel.confirmPopup.beforeDismissCallback = function () {
          if (noSelected) {
            noSelected();
          }

          if (deferer && deferer.reject) {
            deferer.reject();
          }
        };

        viewModel.confirmPopup.isVisible = true;

        safeDigest($scope);
      },
    );
  });
})();
