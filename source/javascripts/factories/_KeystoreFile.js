(function () {
  angular.module('BitriseWorkflowEditor').factory('KeystoreFile', function ($q, requestService) {
    const KeystoreFile = function () {
      this.databaseID = undefined;
      this.file = undefined;
      this.isProcessed = undefined;
      this.uploadFileName = undefined;
      this.password = undefined;
      this.alias = undefined;
      this.privateKeyPassword = undefined;
      this.isExpose = undefined;
      this.isProtected = undefined;
    };

    KeystoreFile.androidKeystorePasswordEnvVarKey = 'BITRISEIO_ANDROID_KEYSTORE_PASSWORD';
    KeystoreFile.androidKeystoreAliasEnvVarKey = 'BITRISEIO_ANDROID_KEYSTORE_ALIAS';
    KeystoreFile.androidKeystorePrivateKeyPasswordEnvVarKey = 'BITRISEIO_ANDROID_KEYSTORE_PRIVATE_KEY_PASSWORD';
    KeystoreFile.downloadURLEnvVarPartialID = 'ANDROID_KEYSTORE';

    KeystoreFile.prototype.displayName = function () {
      if (this.uploadFileName) {
        return this.uploadFileName;
      }

      if (this.file) {
        return this.file.name;
      }

      return 'No name for file';
    };

    KeystoreFile.prototype.updateFile = function (file) {
      this.file = file;
    };

    KeystoreFile.prototype.fileSize = function () {
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

    KeystoreFile.downloadURLEnvVarKey = function () {
      return `BITRISEIO_${KeystoreFile.downloadURLEnvVarPartialID}_URL`;
    };

    KeystoreFile.prototype.upload = function (requestConfig) {
      const self = this;

      return $q(function (resolve, reject) {
        requestService.postKeystoreFileCreate(self.file.name, self.fileSize(), requestConfig).then(
          function (data) {
            const keystoreFileDatabaseID = data.databaseID;
            const { uploadURL } = data;

            requestService.uploadFileToStorage(uploadURL, self.file).then(
              function () {
                requestService
                  .finalizeKeystoreFileUpload(keystoreFileDatabaseID, true, requestConfig)
                  .then(resolve, function (error) {
                    reject(error);
                  });
              },
              function (error) {
                requestService.finalizeKeystoreFileUpload(keystoreFileDatabaseID, false, requestConfig).then(
                  function () {
                    reject(error);
                  },
                  function (finalizeKeystoreFileUploadError) {
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

    KeystoreFile.prototype.protect = function (requestConfig) {
      const self = this;

      return requestService.protectKeystoreFile(this.databaseID, requestConfig).then(function () {
        self.isProtected = true;
      });
    };

    KeystoreFile.prototype.download = function () {
      return requestService.downloadKeystoreFile(this.databaseID);
    };

    KeystoreFile.prototype.saveMetadata = function (requestConfig) {
      return requestService.putKeystoreFileMetadataSave(
        this.databaseID,
        this.password,
        this.alias,
        this.privateKeyPassword,
        requestConfig,
      );
    };

    KeystoreFile.prototype.delete = function (requestConfig) {
      return requestService.deleteKeystoreFile(this.databaseID, requestConfig);
    };

    return KeystoreFile;
  });
})();
