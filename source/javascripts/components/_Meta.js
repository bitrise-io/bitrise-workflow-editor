(function () {
  angular.module('BitriseWorkflowEditor').factory('Meta', function () {
    const Meta = function (userMetaConfig, defaultMetaConfig) {
      this.userMetaConfig = userMetaConfig;
      if (!this.userMetaConfig) {
        this.userMetaConfig = {};
      }

      this.defaultMetaConfig = defaultMetaConfig;
    };

    Meta.prototype.valueGetterSetter = function (bundleID, key, value) {
      if (value !== undefined) {
        if (!this.userMetaConfig[bundleID]) {
          this.userMetaConfig[bundleID] = {};
        }
        this.userMetaConfig[bundleID][key] = value;

        if (
          value === null ||
          (this.defaultMetaConfig &&
            this.defaultMetaConfig[bundleID] &&
            this.defaultMetaConfig[bundleID][key] !== undefined &&
            angular.equals(this.defaultMetaConfig[bundleID][key], value))
        ) {
          delete this.userMetaConfig[bundleID][key];
        }

        if (angular.equals(this.userMetaConfig[bundleID], {})) {
          delete this.userMetaConfig[bundleID];
        }
      }

      if (this.userMetaConfig && this.userMetaConfig[bundleID] && this.userMetaConfig[bundleID][key] !== undefined) {
        return this.userMetaConfig[bundleID][key];
      }

      if (
        this.defaultMetaConfig &&
        this.defaultMetaConfig[bundleID] &&
        this.defaultMetaConfig[bundleID][key] !== undefined
      ) {
        return this.defaultMetaConfig[bundleID][key];
      }

      return null;
    };

    return Meta;
  });
})();
