(function() {

"use strict";

angular.module("BitriseWorkflowEditor").factory("Popup", function() {

	var Popup = function(parameters) {
		this.isVisible = false;
		this.parameters = parameters !== undefined ? parameters : {};
		this.beforeAppearCallback = undefined;
		this.afterAppearCallback = undefined;
		this.beforeDismissCallback = undefined;
		this.afterDismissCallback = undefined;
	};

	return Popup;

});

angular.module("BitriseWorkflowEditor").directive("popup", function($animate, $document, $window, $parse) {
	return {
		restrict: "E",
		replace: true,
		template: function(tElement, tAttrs) {
			return "<div class='popup ng-hide angular-animated' ng-show='" + tAttrs.model + ".isVisible'></div>";
		},
		transclude: true,
		link: function(scope, element, attrs, ctrl, transcludeFn) {
			var clickHandler;
			var keyupHandler;
			var closeClickHandler;
			var windowVerticalScrollPositionOnPopupOpen;

			function scrollPreventHandler() {
				angular.element($window).scrollTop(windowVerticalScrollPositionOnPopupOpen);
			};

			function setShouldHandleDismissTriggerEvents(shouldHandleDismissTriggerEvents) {
				if (shouldHandleDismissTriggerEvents) {
					element.bind("click", clickHandler);
					angular.element($document).bind("keyup", keyupHandler);
				}
				else {
					element.unbind("click", clickHandler);
					angular.element($document).unbind("keyup", keyupHandler);
				}
			}

			function setShouldPreventBackgroundScrolling(shouldPreventBackgroundScrolling) {
				if (shouldPreventBackgroundScrolling) {
					angular.element($window).bind("scroll", scrollPreventHandler);
					windowVerticalScrollPositionOnPopupOpen = angular.element($window).scrollTop();
				}
				else {
					angular.element($window).unbind("scroll", scrollPreventHandler);
					windowVerticalScrollPositionOnPopupOpen = undefined;
				}
			}

			scope.$watch(attrs.model, function(popup) {
				var unwatchPopupVisibility;

				if (!popup) {
					if (unwatchPopupVisibility) {
						unwatchPopupVisibility();
					}

					setShouldHandleDismissTriggerEvents(false);
					setShouldPreventBackgroundScrolling(false);

					return;
				}

				clickHandler = function(event) {
					if (!angular.element(event.target).is(element)) {
						return;
					}

					popup.isVisible = false;
					scope.$apply();
				};

				keyupHandler = function(event) {
					if (event.keyCode != 27) {
						return;
					}

					popup.isVisible = false;
					scope.$apply();
				};

				closeClickHandler = function() {
					popup.isVisible = false;
					scope.$apply();
				};

				unwatchPopupVisibility = scope.$watch(function() {
					return popup.isVisible;
				}, function(newIsVisible, oldIsVisible) {
					if (oldIsVisible == newIsVisible) {
						return;
					}

					if (newIsVisible) {
						var initiallyFocusedElement = element.find("[initial-focus]");

						if (initiallyFocusedElement.length > 1) {
							initiallyFocusedElement.each(function() {
								if ($parse($(this).attr("initial-focus"))($(this).scope())) {
									initiallyFocusedElement = this;
								}
							});
						}

						if (initiallyFocusedElement) {
							setTimeout(function() {
								initiallyFocusedElement.focus();
							}, 10);
						}

						if (popup.beforeAppearCallback) {
							popup.beforeAppearCallback();
						}

						if (popup.afterAppearCallback) {
							$animate.on("removeClass", element, function(_element, phase) {
								if (phase == "start") {
									return;
								}

								$animate.off("removeClass");

								popup.afterAppearCallback();
							});
						}
					}
					else {
						if (popup.beforeDismissCallback) {
							popup.beforeDismissCallback();
						}

						if (popup.afterDismissCallback) {
							$animate.on("addClass", element, function(_element, phase) {
								if (phase == "start") {
									return;
								}

								$animate.off("addClass");

								popup.afterDismissCallback();
							});
						}
					}

					setShouldHandleDismissTriggerEvents(newIsVisible);
					setShouldPreventBackgroundScrolling(newIsVisible);
				});
			});

			scope.$on("$destroy", function() {
				setShouldHandleDismissTriggerEvents(false);
				setShouldPreventBackgroundScrolling(false);
			});

			angular.element($document[0].body).append(element);

			transcludeFn(scope, function(clone) {
				element.append(clone);
			});
		}
	};
});

})();
