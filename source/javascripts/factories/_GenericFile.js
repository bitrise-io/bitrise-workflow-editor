(function () {
  angular.module('BitriseWorkflowEditor').factory('GenericFile', function ($q, $injector, requestService) {
    const GenericFile = function (envVarPartialID) {
      this.databaseID = undefined;
      this.file = undefined;
      this.envVarPartialID = envVarPartialID;
      this.isProcessed = undefined;
      this.uploadFileName = undefined;
      this.isExpose = undefined;
      this.isProtected = undefined;
    };

    GenericFile.prototype.displayName = function () {
      if (this.uploadFileName) {
        return this.uploadFileName;
      }

      if (this.file) {
        return this.file.name;
      }

      return 'No name for file';
    };

    GenericFile.prototype.updateFile = function (file) {
      this.file = file;
    };

    GenericFile.prototype.fileSize = function () {
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

    GenericFile.prototype.validationError = function () {
      if (this.envVarPartialID.length === 0) {
        return new Error('ID not specified. Enter a unique ID.');
      }

      const validCharactersRegexp = /^([a-zA-Z0-9_]+)$/;
      if (!validCharactersRegexp.test(this.envVarPartialID)) {
        return new Error("Invalid ID. Only 'a-z', 'A-Z', '0-9' and '_' characters are allowed.");
      }

      const KeystoreFile = $injector.get('KeystoreFile');
      if (this.envVarPartialID === KeystoreFile.downloadURLEnvVarPartialID) {
        return new Error('This ID is reserved for the Android Keystore file upload.');
      }

      return null;
    };

    GenericFile.prototype.downloadURLEnvVarKey = function () {
      if (this.envVarPartialID.length === 0) {
        return null;
      }

      return `BITRISEIO_${this.envVarPartialID}_URL`;
    };

    GenericFile.prototype.protect = function (requestConfig) {
      const self = this;

      return requestService.protectGenericFile(this.databaseID, requestConfig).then(function () {
        self.isProtected = true;
      });
    };

    GenericFile.prototype.upload = function (requestConfig) {
      if (this.validationError()) {
        return $q.reject(this.validationError());
      }

      const self = this;

      return $q(function (resolve, reject) {
        requestService.postGenericFileCreate(self.envVarPartialID, self.file.name, self.fileSize(), requestConfig).then(
          function (data) {
            const genericFileDatabaseID = data.databaseID;
            const { uploadURL } = data;

            requestService.uploadFileToStorage(uploadURL, self.file).then(
              function () {
                requestService
                  .finalizeGenericFileUpload(genericFileDatabaseID, true, requestConfig)
                  .then(resolve, function (error) {
                    reject(error);
                  });
              },
              function (error) {
                requestService.finalizeGenericFileUpload(genericFileDatabaseID, false, requestConfig).then(
                  function () {
                    reject(error);
                  },
                  function (finalizeGenericFileUploadError) {
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

    GenericFile.prototype.download = function () {
      return requestService.downloadGenericFile(this.databaseID);
    };

    GenericFile.prototype.delete = function (requestConfig) {
      return requestService.deleteGenericFile(this.databaseID, requestConfig);
    };

    return GenericFile;
  });
})();
