(function () {
  angular.module('BitriseWorkflowEditor').service('stringService', function (StringService) {
    const stringService = {};

    stringService.stringReplacedWithParameters = function (string, parameters) {
      return StringService.stringReplacedWithParameters(string, parameters);
    };

    stringService.joinedString = function (strings, separator, shouldLeaveSpaceAfterSeparator) {
      return StringService.joinedString(strings, separator, shouldLeaveSpaceAfterSeparator);
    };

    stringService.capitalizedFirstLetter = function (string) {
      return StringService.capitalizedFirstLetter(string);
    };

    stringService.isStringMatchingTerm = function (string, term) {
      return StringService.isStringMatchingTerm(string, term);
    };

    stringService.errorMessageFromErrors = function (errors) {
      return StringService.errorMessageFromErrors(errors);
    };

    stringService.errorMessageFromFormModel = function (formModel, errorMessagesForInputs, defaultErrorMessage) {
      if (formModel.$valid) {
        return null;
      }

      let errorMessage = '';
      _.each(formModel.$error, function (invalidInputs, validatorID) {
        _.each(invalidInputs, function (anInvalidInput) {
          let inputErrorMessage;

          try {
            inputErrorMessage = errorMessagesForInputs[anInvalidInput.$name][validatorID];
          } catch (error) {
            // noop
          }

          if (inputErrorMessage) {
            if (errorMessage.length > 0) {
              errorMessage += ', ';
            }

            errorMessage += inputErrorMessage;
          }
        });
      });
      errorMessage = stringService.capitalizedFirstLetter(errorMessage);

      return errorMessage.length > 0 ? errorMessage : defaultErrorMessage;
    };

    return stringService;
  });
})();
