import { cachedFn } from "./services/react-compat";
import semverService from "./services/semver-service";
import loggerFactory from "./services/logger";
import * as appService from "./services/app-service";

angular.module("BitriseWorkflowEditor")
    .factory("logger", ["SERVICE_NAME", "DATADOG_API_KEY", "IS_PROD", function(serviceName, token, isProd) {
      return loggerFactory({ name: serviceName, isProd: isProd, clientToken: token });
    }])
    .factory("semverService", function() { return semverService; })
    .factory("appServiceUtil", function() { return appService; })
    .factory("reactCompatService", function() {
        return { cachedFn: cachedFn };
    });
