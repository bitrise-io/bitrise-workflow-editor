(function() {
	"use strict";

	angular
		.module("BitriseWorkflowEditor")
		.controller("TriggersController", function($scope, $rootScope, $location, appService, Progress, Trigger, launchDarklyService, requestService) {
			var viewModel = this;
			viewModel.pipelines = appService.appConfig.pipelines ? Object.keys(appService.appConfig.pipelines) : [];
			viewModel.workflows = Object.keys(appService.appConfig.workflows);
			viewModel.triggerMap = appService.appConfig.trigger_map;
			viewModel.isWebsiteMode = requestService.mode === 'website';
			
			var originalTriggerMap = appService.appConfig.trigger_map;

			$scope.$on(
				"$destroy",
				$rootScope.$on("MainController::changesDiscarded", function() {
					appService.appConfig.trigger_map = originalTriggerMap;
					viewModel.onDiscard();
				})
			);

			viewModel.setDiscard = function(onDiscard) {
				viewModel.onDiscard = onDiscard;
			}

			viewModel.onTriggerMapChange = function(triggerMap) {
				console.log(triggerMap)
				appService.appConfig.trigger_map = triggerMap;
				$scope.$apply();
			};
		});
})();
