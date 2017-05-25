(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("sticky", function($parse) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var parentElement = element.parent();
			var nextSiblingElement = element.next();
			var placeholderElement;

			function scrollHandler() {
				var stickingElement = $("header.sticky [sticking-index='" + attrs.stickingIndex + "']");
				var shouldBeSticking = $(window).scrollTop() > element.parent().position().top && !$parse(attrs.skipStickyness)(scope);
				var isAlreadySticking = stickingElement.length > 0;

				if (shouldBeSticking) {
					if (!isAlreadySticking) {
						placeholderElement = angular.element("<div></div>");
						placeholderElement.width(element.outerWidth());
						placeholderElement.height(element.outerHeight());

						$("header.sticky").append(element);

						if (nextSiblingElement.length == 0) {
							parentElement.append(placeholderElement);
						}
						else {
							placeholderElement.insertBefore(nextSiblingElement);
						}
					}
				}
				else {
					if (isAlreadySticking) {
						placeholderElement.remove();
						if (nextSiblingElement.length == 0) {
							parentElement.append(element);
						}
						else {
							element.insertBefore(nextSiblingElement);
						}
					}
				}
			}

			$(window).on("scroll", scrollHandler);

			scope.$on("$destroy", function() {
				$(window).off("scroll", scrollHandler);
			});
		}
	};
});

})();
