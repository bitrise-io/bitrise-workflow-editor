(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("stickyHeader", function() {
	return {
		restrict: "A",
		link: function(scope, element) {

			function scrollHandler() {
				var elementIsAlreadySticking = $(element).hasClass("sticking");

				if ($(window).scrollTop() > $(element).parent().position().top) {
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
