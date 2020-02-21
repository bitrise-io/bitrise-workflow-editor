import semverService from "./services/semverservice";

angular
    .module("BitriseWorkflowEditor")
    .factory("semverService", function() { return semverService; });
