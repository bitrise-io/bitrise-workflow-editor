(function() {

"use strict";

angular.module("BitriseWorkflowEditor").service("stickyService", function() {

	var scrollDurationInMilliseconds = 300;

	var stickyService = {};

	stickyService.shouldBeSticking = function(targetScrollTop) {
		var stickyHeaderElement = $("[sticky-header]").first();

		if (stickyHeaderElement.length == 0) {
			return undefined;
		}

		if (targetScrollTop === undefined) {
			targetScrollTop = $(window).scrollTop();
		}

		return targetScrollTop > stickyHeaderElement.parent().position().top;
	};

	return stickyService;

});

angular.module("BitriseWorkflowEditor").directive("stickyHeader", function(stickyService) {
	return {
		restrict: "A",
		link: function(scope, element) {

			function scrollHandler() {
				var elementIsAlreadySticking = $(element).hasClass("sticking");

				if (stickyService.shouldBeSticking()) {
					if (!elementIsAlreadySticking) {
						$(element).next().css("padding-top", $(element).outerHeight() + "px");
						$(element).addClass("sticking");
					}
				}
				else {
					if (elementIsAlreadySticking) {
						$(element).next().css("padding-top", "0");
						$(element).removeClass("sticking");
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
