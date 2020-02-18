(function() {
	"use strict";

	angular
		.module("BitriseWorkflowEditor")
		.directive("callbackOnMousedownElsewhere", function($document, $parse) {
			return {
				restrict: "A",
				link: function(scope, element, attrs) {
					function executeCallbackOnMousedown(event) {
						if (
							event.target == element[0] ||
							$.contains(element[0], event.target)
						) {
							return;
						}

						var targetFilterSelector = $parse(
							attrs.callbackOnMousedownElsewhereTargetFilterSelector
						)(scope);

						if (
							!targetFilterSelector ||
							$(event.target).is(targetFilterSelector)
						) {
							$parse(attrs.callbackOnMousedownElsewhere)(scope);
							scope.$apply();
						}
					}

					$document.bind("mousedown", executeCallbackOnMousedown);

					scope.$on("$destroy", function() {
						$document.unbind("mousedown", executeCallbackOnMousedown);
					});
				}
			};
		});
})();
