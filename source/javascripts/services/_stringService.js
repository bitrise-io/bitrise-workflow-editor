(function() {
	"use strict";

	angular.module("BitriseWorkflowEditor").service("stringService", function() {
		var stringService = {};

		var templateRegex = /<([a-zA-Z0-9\-\_\.]+)>/g;

		var defaultTemplateDataFromString = function(string) {
			var match, data = {};
			while (match = templateRegex.exec(string)) {
				data[match[1]] = match[0];
			}
			return data;
		};

		// underscore template settings
		_.templateSettings = {
			interpolate: templateRegex
		};

		stringService.stringReplacedWithParameters = function(string, parameters) {
			var resStr = "";
			var compiled = _.template(string);

			try {
				resStr = compiled(parameters);
			} catch {
				// if we did not specify every params
				var defaultParams = defaultTemplateDataFromString(string);
				resStr = compiled(_.defaults(parameters, defaultParams));
			}

			return resStr;
		};

		stringService.joinedString = function(
			strings,
			separator,
			shouldLeaveSpaceAfterSeparator
		) {
			if (!strings) {
				return strings;
			}

			var joinedString = "";

			if (strings.length == 0) {
				return joinedString;
			}

			if (separator === null || separator === undefined) {
				separator = "";
			}

			if (shouldLeaveSpaceAfterSeparator === undefined) {
				shouldLeaveSpaceAfterSeparator = _.contains([",", ";"], separator);
			}

			_.each(strings, function(aString, index) {
				if (aString === null || aString === undefined) {
					aString = "";
				}

				aString = aString.toString();

				if (index > 0 && aString.length > 0) {
					joinedString += separator;

					if (shouldLeaveSpaceAfterSeparator) {
						joinedString += " ";
					}
				}

				joinedString += aString;
			});

			return joinedString;
		};

		stringService.capitalizedFirstLetter = function(string) {
			if (!string) {
				return string;
			}

			return string[0].toUpperCase() + string.slice(1);
		};

		stringService.isStringMatchingTerm = function(string, term) {
			if (string === undefined || term === undefined) {
				return undefined;
			}

			if (term.length == 0) {
				return true;
			}

			return string.toLowerCase().indexOf(term.toLowerCase()) != -1;
		};

		stringService.errorMessageFromErrors = function(errors) {
			var errorMessages = _.map(errors, function(anError) {
				return anError.message;
			});

			var errorMessage = stringService.joinedString(errorMessages, ",");
			errorMessage = stringService.capitalizedFirstLetter(errorMessage);
			errorMessage += ".";

			return errorMessage;
		};

		stringService.errorMessageFromFormModel = function(
			formModel,
			errorMessagesForInputs,
			defaultErrorMessage
		) {
			if (formModel.$valid) {
				return null;
			}

			var errorMessage = "";
			_.each(formModel.$error, function(invalidInputs, validatorID) {
				_.each(invalidInputs, function(anInvalidInput) {
					var inputErrorMessage;

					try {
						inputErrorMessage =
							errorMessagesForInputs[anInvalidInput.$name][validatorID];
					} catch (error) {}

					if (inputErrorMessage) {
						if (errorMessage.length > 0) {
							errorMessage += ", ";
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
