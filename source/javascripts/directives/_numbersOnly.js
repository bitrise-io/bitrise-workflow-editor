(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("numbersOnly", function() {

	return {
		restrict: "A",
		require: "ngModel",
		link: function(scope, input, attrs, inputModel) {
			inputModel.$parsers.push(function(value) {
				if (!value) {
					return;
				}

				var regex = new RegExp(/[^0-9]+/);
				var replaced = value.replace(regex, "");

				if (replaced !== value) {
					value = replaced;
				}
				else if ((attrs.min && Number(value) < Number(attrs.min)) || (attrs.max && Number(value) > Number(attrs.max))) {
					value = inputModel.$modelValue;
				}

				inputModel.$setViewValue(value);
				inputModel.$render();

				return value;
			});
		}
	};

});

})();