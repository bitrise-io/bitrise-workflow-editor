import WindowUtils from '@/core/utils/WindowUtils';

(function () {
  const CLIENT_SIDE_ID =
    window.parent.location.host === 'app.bitrise.io' ? '5e70774c8a726707851d2fff' : '5e70774c8a726707851d2ffe';

  angular.module('BitriseWorkflowEditor').service('launchDarklyService', function (requestService) {
    const launchDarklyService = {};
    let client;

    launchDarklyService.initialize = async () => {
      if (!requestService.isWebsiteMode()) {
        return;
      }

      if (!client) {
        const [LDClient] = await Promise.all([import('launchdarkly-js-client-sdk')]);
        const key = `org-${WindowUtils.globalProps()?.account?.slug}`;
        client = LDClient.initialize(CLIENT_SIDE_ID, { key });
      }

      await client.waitUntilReady();
    };

    launchDarklyService.variation = (featureFlagKey, defaultValue = false) => {
      if (window.localFeatureFlags[featureFlagKey] !== undefined) {
        return window.localFeatureFlags[featureFlagKey];
      }

      if (!requestService.isWebsiteMode()) {
        return defaultValue;
      }

      return client.variation(featureFlagKey, defaultValue);
    };

    return launchDarklyService;
  });
})();
