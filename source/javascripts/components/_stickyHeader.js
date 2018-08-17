(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("sticky", function($parse) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var parentElement = element.parent();
			var nextSiblingElement = element.next();
			var placeholderElement;
			if ($('#workflow-main').length > 0) {
				$('#workflow-main').scroll(scrollHandler.bind($('#workflow-main')));
			}

			function isSticking() {
				return $("header.sticky [sticking-index='" + attrs.stickingIndex + "']").length > 0;
			}

			function scrollHandler() {
				var workflowEditorMainContent = this;
				var shouldBeSticking = workflowEditorMainContent.scrollTop() > element.parent().position().top && !$parse(attrs.skipStickyness)(scope);

				if (shouldBeSticking) {
					if (!isSticking()) {
						stick();
					}
				}
				else {
					if (isSticking()) {
						unstick();
					}
				}
			}

			function stick() {
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

			function unstick() {
				placeholderElement.remove();
				if (nextSiblingElement.length == 0) {
					parentElement.append(element);
				}
				else {
					element.insertBefore(nextSiblingElement);
				}
			}

			scope.$on("$destroy", function() {
				if (isSticking()) {
					unstick();
				}

				$('#workflow-main').off('scroll', scrollHandler.bind($('#workflow-main')));
			});
		}
	};
});

})();
