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

			viewModel.originalTriggerMap = appService.appConfig.trigger_map;
			viewModel.integrationsUrl = appService.appDetails ? '/app/' + appService.appDetails.slug + '/settings/integrations?tab=webhooks' : '';

			$scope.$on(
				"$destroy",
				$rootScope.$on("MainController::changesDiscarded", function() {
					appService.appConfig.trigger_map = viewModel.originalTriggerMap;
					viewModel.onDiscard(viewModel.originalTriggerMap);
				})
			);

			$scope.$on(
				"$destroy",
				$rootScope.$on("MainController::savedFinishedWithSuccess", function() {
					viewModel.originalTriggerMap = appService.appConfig.trigger_map;
				})
			);

			viewModel.setDiscard = function(onDiscard) {
				viewModel.onDiscard = onDiscard;
			}

			viewModel.onTriggerMapChange = function(triggerMap) {
				appService.appConfig.trigger_map = triggerMap;
				$scope.$apply();
			};
		});
})();
