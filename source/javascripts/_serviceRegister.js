import { cachedFn } from "./services/react-compat";
import semverService from "./services/semver-service";
import loggerFactory from "./services/logger";

angular.module("BitriseWorkflowEditor")
    .factory("logger", ["DATADOG_API_KEY", function(token) { return loggerFactory(token); }])
    .factory("semverService", function() { return semverService; })
    .factory("reactCompatService", function() {
        return { cachedFn: cachedFn };
    });
