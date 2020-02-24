import { cachedFn } from "./services/react-compat";
import semverService from "./services/semver-service";

angular
    .module("BitriseWorkflowEditor")
    .factory("semverService", function() { return semverService; })
    .factory("reactCompatService", function() {
        return { cachedFn: cachedFn };
    });
