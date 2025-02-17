import RuntimeUtils from '@/core/utils/RuntimeUtils';

window.serviceVersion = process.env.WFE_VERSION;
window.datadogApiKey = 'pub3ee8559ad1bc8c3c8cd788bd71fe5995';
window.isAnalyticsOn = process.env.ANALYTICS === 'true';
window.mode = process.env.MODE;

function modeDependantAssetPath(path) {
  const version = window.serviceVersion;

  switch (window.mode) {
    case 'WEBSITE':
      return `${process.env.PUBLIC_URL_ROOT}/${version}/${path}`;
    case 'CLI':
      return `/${version}/${path}`;
    default:
      return path;
  }
}

(function () {
  const BitriseWorkflowEditor = angular.module('BitriseWorkflowEditor', [
    'ngRoute',
    'ngSanitize',
    'ngAnimate',
    'ngCookies',
    'monospaced.elastic',
    'ng-showdown',
  ]);

  BitriseWorkflowEditor.config(function ($compileProvider, $qProvider) {
    $compileProvider.debugInfoEnabled(!RuntimeUtils.isProduction());
    $qProvider.errorOnUnhandledRejections(false);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|itms-services):/);
  });

  BitriseWorkflowEditor.config(function ($animateProvider) {
    $animateProvider.classNameFilter(/angular-animated/);
  });

  BitriseWorkflowEditor.config(function ($routeProvider) {
    $routeProvider.when('/workflows', {
      templateUrl: modeDependantAssetPath('templates/workflows.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/pipelines', {
      templateUrl: modeDependantAssetPath('templates/pipelines.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/step_bundles', {
      templateUrl: modeDependantAssetPath('templates/step_bundles.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/code_signing', {
      templateUrl: modeDependantAssetPath('templates/code_signing.html'),
    });

    $routeProvider.when('/secrets', {
      templateUrl: modeDependantAssetPath('templates/secrets.html'),
    });

    $routeProvider.when('/env_vars', {
      templateUrl: modeDependantAssetPath('templates/env_vars.html'),
    });

    $routeProvider.when('/triggers', {
      templateUrl: modeDependantAssetPath('templates/triggers.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/stack', {
      templateUrl: modeDependantAssetPath('templates/stack.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/licenses', {
      templateUrl: modeDependantAssetPath('templates/licenses.html'),
      reloadOnSearch: false,
    });

    $routeProvider.when('/yml', {
      templateUrl: modeDependantAssetPath('templates/yml.html'),
    });
  });

  BitriseWorkflowEditor.constant('SERVICE_NAME', 'workflow-editor')
    .constant('DATADOG_API_KEY', window.datadogApiKey)
    .constant('IS_ANALYTICS', window.isAnalyticsOn);

  BitriseWorkflowEditor.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.defaults.xsrfCookieName = 'CSRF-TOKEN';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
    },
  ]);

  if (RuntimeUtils.isWebsiteMode()) {
    if (RuntimeUtils.isProduction()) {
      BitriseWorkflowEditor.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
          'self',
          // Prevent CORS issues on staging, when WFE runs under a different host
          'https://app.bitrise.io/**',
          'https://workflow-editor-cdn.bitrise.io/**',
        ]);
      });
    } else {
      BitriseWorkflowEditor.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
          'self',
          // Prevent CORS issues in local dev environment
          'http://localhost:4000/**',
          'https://workflow-editor-cdn.bitrise.io/**',
        ]);
      });
    }
  }
})();
