import { cachedFn } from "./services/react-compat";
import semverService from "./services/semver-service";
import loggerFactory from "./services/logger";
import { workflowSelectionStore, serviceFactory } from "./services/workflows-selection-service";
import * as appService from "./services/app-service";

angular
	.module("BitriseWorkflowEditor")
	.factory("logger", [
		"SERVICE_NAME",
		"DATADOG_API_KEY",
		"IS_ANALYTICS",
		function(serviceName, token, isAnalyticsOn) {
			return loggerFactory({
				name: serviceName,
				isAnalyticsOn: isAnalyticsOn,
				clientToken: token,
				level: "info"
			});
		}
	])
	.factory("semverService", function() {
		return semverService;
	})
	.factory("appServiceUtil", function() {
		return appService;
	})
	.factory("workflowSelectionStore", function() {
		return workflowSelectionStore;
	})
	.factory("workflowSelectionService", [
		"$location",
		function($location) {
			return serviceFactory(workflowSelectionStore, $location);
		}
	])
	.factory("reactCompatService", function() {
		return { cachedFn: cachedFn };
	});
