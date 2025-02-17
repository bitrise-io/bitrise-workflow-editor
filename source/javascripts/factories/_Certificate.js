(function () {
  angular.module('BitriseWorkflowEditor').factory('Certificate', function ($q, requestService) {
    const Certificate = function () {
      this.databaseID = undefined;
      this.file = undefined;
      this.isProcessed = undefined;
      this.uploadFileName = undefined;
      this.password = undefined;
      this.isExpose = undefined;
      this.isProtected = undefined;
      this.details = undefined;
    };

    Certificate.certificateURLEnvVarKey = 'BITRISE_CERTIFICATE_URL';
    Certificate.certificatePassphraseEnvVarKey = 'BITRISE_CERTIFICATE_PASSPHRASE';
    Certificate.defaultCertificateURLEnvVarKey = 'BITRISE_DEFAULT_CERTIFICATE_URL';
    Certificate.defaultCertificatePassphraseEnvVarKey = 'BITRISE_DEFAULT_CERTIFICATE_PASSPHRASE';

    Certificate.prototype.displayName = function () {
      if (this.uploadFileName) {
        const nameRegexp = /^(.+)\.(?:p12)$/;

        if (nameRegexp.test(this.uploadFileName) && nameRegexp.exec(this.uploadFileName)[1]) {
          return nameRegexp.exec(this.uploadFileName)[1];
        }
      }

      if (this.file) {
        return this.file.name;
      }

      return 'No name for file';
    };

    Certificate.prototype.fileSize = function () {
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

    Certificate.prototype.validationError = function () {
      if (_.last(this.file.name.split('.')) !== 'p12') {
        return new TypeError('Invalid file type! Select a .p12 file.');
      }
    };

    Certificate.prototype.upload = function (requestConfig) {
      if (this.validationError()) {
        return $q.reject(this.validationError());
      }

      const self = this;

      return $q(function (resolve, reject) {
        requestService.postCertificateCreate(self.file.name, self.fileSize(), requestConfig).then(
          function (data) {
            const certificateDatabaseID = data.databaseID;
            const { uploadURL } = data;

            requestService.uploadFileToStorage(uploadURL, self.file).then(
              function () {
                requestService
                  .finalizeCertificateUpload(certificateDatabaseID, true, requestConfig)
                  .then(resolve, function (error) {
                    reject(error);
                  });
              },
              function (error) {
                requestService.finalizeCertificateUpload(certificateDatabaseID, false, requestConfig).then(
                  function () {
                    reject(error);
                  },
                  function (finalizeCertificateUploadError) {
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

    Certificate.prototype.protect = function (requestConfig) {
      const self = this;

      return requestService.protectCertificate(this.databaseID, requestConfig).then(function () {
        self.isProtected = true;
      });
    };

    Certificate.prototype.getDetails = function (requestConfig) {
      return requestService.getDetailsOfCertificate(this.databaseID, this.password);
    };

    Certificate.prototype.download = function () {
      return requestService.downloadCertificate(this.databaseID);
    };

    Certificate.prototype.savePassword = function (requestConfig) {
      return requestService.putCertificatePasswordSave(this.databaseID, this.password, requestConfig);
    };

    Certificate.prototype.delete = function (requestConfig) {
      return requestService.deleteCertificate(this.databaseID, requestConfig);
    };

    return Certificate;
  });
})();
