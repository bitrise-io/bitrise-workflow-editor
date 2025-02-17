(function () {
  angular.module('BitriseWorkflowEditor').factory('ProvProfile', function ($q, requestService) {
    const capabilities = {
      'com.apple.security.application-groups': 'App Groups',
      'com.apple.developer.in-app-payments': 'Apple Pay',
      'com.apple.developer.associated-domains': 'Associated Domains',
      'com.apple.developer.healthkit': 'HealthKit',
      'com.apple.developer.homekit': 'HomeKit',
      'com.apple.developer.networking.HotspotConfiguration': 'Hotspot',
      'com.apple.InAppPurchase': 'In-App Purchase',
      'inter-app-audio': 'Inter-App Audio',
      'com.apple.developer.networking.multipath': 'Multipath',
      'com.apple.developer.networking.networkextension': 'Network Extensions',
      'com.apple.developer.nfc.readersession.formats': 'NFC Tag Reading',
      'com.apple.developer.networking.vpn.api': 'Personal VPN',
      'aps-environment': 'Push Notifications',
      'com.apple.developer.siri': 'SiriKit',
      'com.apple.developer.pass-type-identifiers': 'Wallet',
      'com.apple.external-accessory.wireless-configuration': 'Wireless Accessory Configuration',
      'com.apple.developer.default-data-protection': 'Data Protection',
      'com.apple.developer.ubiquity-kvstore-identifier': 'iCloud',
      'com.apple.developer.icloud-services': 'iCloud',
    };

    const ProvProfile = function () {
      this.databaseID = undefined;
      this.file = undefined;
      this.isProcessed = undefined;
      this.uploadFileName = undefined;
      this.isExpose = undefined;
      this.isProtected = undefined;
      this.uuid = undefined;
      this.expiresAt = undefined;
      this.exportType = undefined;
      this.teamName = undefined;
      this.teamID = undefined;
      this.bundleID = undefined;
      this.developerCertificateIdentities = undefined;
      this.provisionedDevices = undefined;
      this.capabilityKeys = undefined;
    };

    ProvProfile.provisionURLEnvVarKey = 'BITRISE_PROVISION_URL';
    ProvProfile.defaultProvisionURLEnvVarKey = 'BITRISE_DEFAULT_PROVISION_URL';

    ProvProfile.prototype.displayName = function () {
      if (this.uploadFileName) {
        const nameRegexp = /^(.+)\.(?:mobileprovision|provisionprofile)$/;

        if (nameRegexp.test(this.uploadFileName) && nameRegexp.exec(this.uploadFileName)[1]) {
          return nameRegexp.exec(this.uploadFileName)[1];
        }
      }

      if (this.file) {
        return this.file.name;
      }

      return 'No name for file';
    };

    ProvProfile.prototype.fileSize = function () {
      if (!this.file) {
        return undefined;
      }

      if (this.file.size !== undefined) {
        return this.file.size;
      }

      if (this.file.fileSize !== undefined) {
        return this.file.fileSize;
      }
    };

    ProvProfile.prototype.validationError = function () {
      if (!_.contains(['mobileprovision', 'provisionprofile'], _.last(this.file.name.split('.')))) {
        return new TypeError('Invalid file type! Select a .provisionprofile or .mobileprovision file.');
      }
    };

    ProvProfile.prototype.upload = function (requestConfig) {
      if (this.validationError()) {
        return $q.reject(this.validationError());
      }

      const self = this;

      return $q(function (resolve, reject) {
        requestService.postProvProfileCreate(self.file.name, self.fileSize(), requestConfig).then(
          function (data) {
            const provProfileDatabaseID = data.databaseID;
            const { uploadURL } = data;

            requestService.uploadFileToStorage(uploadURL, self.file).then(
              function () {
                requestService
                  .finalizeProvProfileUpload(provProfileDatabaseID, true, requestConfig)
                  .then(resolve, function (error) {
                    reject(error);
                  });
              },
              function (error) {
                requestService.finalizeProvProfileUpload(provProfileDatabaseID, false, requestConfig).then(
                  function () {
                    reject(error);
                  },
                  function (finalizeProvProfileUploadError) {
                    reject(error);
                  },
                );
              },
            );
          },
          function (error) {
            reject(error);
          },
        );
      });
    };

    ProvProfile.prototype.protect = function (requestConfig) {
      const self = this;

      return requestService.protectProvProfile(this.databaseID, requestConfig).then(function () {
        self.isProtected = true;
      });
    };

    ProvProfile.prototype.getDetails = function (requestConfig) {
      const self = this;

      return requestService.getDetailsOfProvProfile(self.databaseID).then(function (data) {
        self.uuid = data.uuid;
        self.expiresAt = data.expiresAt;
        self.exportType = data.exportType;
        self.teamName = data.teamName;
        self.teamID = data.teamID;
        self.bundleID = data.bundleID;
        self.developerCertificateIdentities = _.map(data.developerCertificateIdentities, function (anIdentity) {
          return {
            commonName: anIdentity.commonName,
            startDate: anIdentity.startDate,
            endDate: anIdentity.endDate,
            teamName: anIdentity.teamName,
            teamID: anIdentity.teamID,
            serial: anIdentity.serial,
          };
        });
        self.provisionedDevices = _.map(data.provisionedDevices, function (aProvisionedDevice) {
          return {
            udid: aProvisionedDevice.udid,
          };
        });
        self.capabilityKeys = data.capabilityKeys;
      });
    };

    ProvProfile.prototype.download = function () {
      return requestService.downloadProvProfile(this.databaseID);
    };

    ProvProfile.prototype.delete = function (requestConfig) {
      return requestService.deleteProvProfile(this.databaseID, requestConfig);
    };

    ProvProfile.descriptionForCapabilityKey = function (key) {
      return capabilities[key];
    };

    return ProvProfile;
  });
})();
