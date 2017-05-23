(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("callbackOnClickElsewhere", function($document, $parse) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			function executeCallbackOnClickElsewhere(event) {
				if (event.target == element[0]) {
					return;
				}

				if ($.contains(element[0], event.target)) {
					return;
				}

				var elsewhereExceptionsSelector = $parse(attrs.elsewhereExceptionsSelector)(scope);

				if (elsewhereExceptionsSelector) {
					if ($(event.target).is(elsewhereExceptionsSelector)) {
						return;
					}

					if (_.any($(elsewhereExceptionsSelector), function(anElsewhereException) {
						return $.contains(anElsewhereException, event.target);
					})) {
						return;
					}
				}

				$parse(attrs.callbackOnClickElsewhere)(scope);
				scope.$apply();
			}

			$document.bind("click", executeCallbackOnClickElsewhere);

			scope.$on("$destroy", function() {
				$document.unbind("click", executeCallbackOnClickElsewhere);
			});
		}
	}
});

})();
