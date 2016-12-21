(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("stickyHeader", function() {
	return {
		restrict: "A",
		link: function(scope, element) {

			function scrollHandler() {
				var elementIsAlreadySticking = $(element).hasClass("sticking");

				$(element).removeClass("sticking");

				if ($(window).scrollTop() > $(element).position().top) {
					if (!elementIsAlreadySticking) {
						$(element).next().css("margin-top", $(element).outerHeight() + "px");
					}

					$(element).addClass("sticking");
				}
				else if (elementIsAlreadySticking) {
					$(element).next().css("margin-top", "0");
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
