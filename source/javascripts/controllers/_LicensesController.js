import {safeDigest} from "@/services/react-compat";

(function() {
	"use strict";

	angular
		.module("BitriseWorkflowEditor")
		.controller("LicensesController", function($rootScope, $scope, appService) {
			var viewModel = this;
			viewModel.yml = null;

			viewModel.init = function () {
				viewModel.yml = appService.appConfig;
			};

			viewModel.onChange = (yml) => {
				appService.appConfig = yml;
				safeDigest($rootScope);
			}

			$scope.$on(
				"$destroy",
				$rootScope.$on("MainController::changesDiscarded", function() {
					safeDigest($scope);
					viewModel.init();
				})
			);

			viewModel.init();
		});
})();