(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("btfMarkdown", function() {

	return {
		restrict: "A",
		link: function(scope, element) {
			scope.$watch(function() {
				return element.html();
			}, function() {
				element.find("a").attr("target", "_blank");
			});
		}
	};

});

})();
