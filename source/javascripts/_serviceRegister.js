import { cachedFn } from "./services/react-compat";
import semverService from "./services/semver-service";
import loggerFactory from "./services/logger";

angular.module("BitriseWorkflowEditor")
    .factory("logger", ["DATADOG_API_KEY", "IS_PROD", function(token, isProd) {
      return loggerFactory({ name: "workflow_editor_logger", isProd: isProd, clientToken: token });
    }])
    .factory("semverService", function() { return semverService; })
    .factory("reactCompatService", function() {
        return { cachedFn: cachedFn };
    });
