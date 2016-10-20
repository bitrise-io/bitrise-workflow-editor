(function() {

"use strict";

angular.module("BitriseWorkflowEditor").directive("orderStepsByDrag", function() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			scope.$watch(function() {
				return $(element).children().length;
			}, function() {
				$(document).off("mousedown", mousedownHandler);

				var selectedStepElement;
				var cursorPositionYOnLastStableOrder;
				var isMousemoveInProgress;

				function mousedownHandler(event) {
					for (selectedStepElement = event.target; !_.contains($(element).children(":not(.pseudo-step)"), selectedStepElement); selectedStepElement = selectedStepElement.parentNode);
					$(selectedStepElement).off("mousedown", mousedownHandler);

					cursorPositionYOnLastStableOrder = event.pageY;

					$(document).on("mousemove", mousemoveHandler);
					$(document).on("mouseup", mouseupHandler);
				}

				function mousemoveHandler(event) {
					if (!isMousemoveInProgress) {
						isMousemoveInProgress = true;

						$(selectedStepElement).insertAfter($(selectedStepElement).next());
						$($(selectedStepElement).prev()).insertAfter(selectedStepElement);
					}
					
					var moveOffsetY = event.pageY - cursorPositionYOnLastStableOrder;
					$(selectedStepElement).css("top", moveOffsetY + "px");

					if (moveOffsetY > 0) {
						var nextStepElement = $(selectedStepElement).next(":not(.pseudo-step)");
						if (nextStepElement.length == 0) {
							return;
						}

						var offsetYBetweenSiblings = $(selectedStepElement).offset().top - $(nextStepElement).offset().top;
						if (offsetYBetweenSiblings > 0) {
							var steps = scope.editorCtrl.selectedWorkflow.steps;
							var index = $(selectedStepElement).index() - 1;
							var step = scope.editorCtrl.selectedWorkflow.steps[index];
							scope.editorCtrl.selectedWorkflow.steps.splice(index, 1);
							scope.editorCtrl.selectedWorkflow.steps.splice(index + 1, 0, step);
							$(selectedStepElement).insertAfter(nextStepElement);
							$(selectedStepElement).css("top", offsetYBetweenSiblings + "px");
							cursorPositionYOnLastStableOrder = event.pageY - offsetYBetweenSiblings;
						}
					}
					else {
						var previousStepElement = $(selectedStepElement).prev(":not(.pseudo-step)");
						if (previousStepElement.length == 0) {
							return;
						}
						
						var offsetYBetweenSiblings = $(selectedStepElement).offset().top - $(previousStepElement).offset().top;
						if (offsetYBetweenSiblings < 0) {
							var steps = scope.editorCtrl.selectedWorkflow.steps;
							var index = $(selectedStepElement).index() - 1;
							var step = scope.editorCtrl.selectedWorkflow.steps[index];
							scope.editorCtrl.selectedWorkflow.steps.splice(index, 1);
							scope.editorCtrl.selectedWorkflow.steps.splice(index - 1, 0, step);
							$(selectedStepElement).insertBefore(previousStepElement);
							$(selectedStepElement).css("top", offsetYBetweenSiblings + "px");
							cursorPositionYOnLastStableOrder = event.pageY - offsetYBetweenSiblings;
						}
					}
				}

				function mouseupHandler(event) {
					isMousemoveInProgress = false;
					$(selectedStepElement).css("top", "");

					$(document).off("mousemove", mousemoveHandler);
					$(document).off("mouseup", mouseupHandler);
					$(selectedStepElement).on("mousedown", mousedownHandler);
				}

				_.each($(element).children(":not(.pseudo-step)"), function(aChild) {
					$(aChild).off("mousedown", mousedownHandler).on("mousedown", mousedownHandler);
				});

				scope.$on("destroy", function() {
					element.off("mousedown", mousedownHandler);
				});
			});
		}
	};
});

})();
