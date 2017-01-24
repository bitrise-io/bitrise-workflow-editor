(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("select", function($interpolate) {

	return {
		restrict: "E",
		require: "ngModel",
		link: function(scope, element, attrs) {

			if (attrs.noPlaceholder == "") {
				return;
			}

			scope.placeholderText = attrs.placeholder || "Please select...";

			var placeholderOption = "<option value='' disabled>{{ placeholderText }}</option>";

			element.prepend($interpolate(placeholderOption)(scope));
		}
	};

});

})();
